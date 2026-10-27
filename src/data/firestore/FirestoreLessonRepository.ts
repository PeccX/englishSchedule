import {
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  query,
  runTransaction,
  setDoc,
  where,
} from 'firebase/firestore';
import {
  BookingOutcome,
  CollisionDecider,
  Id,
  InvalidStateError,
  Lesson,
  LessonDraft,
  LessonRepository,
  LessonStatus,
  NotFoundError,
  SlotLock,
  SlotRepository,
  slotId,
  slotKey,
} from '@/domain';
import { COL, Db, guard, lessonData, lessonFromDoc, lockData, lockFromDoc } from './support';

/** Gancho que corre justo antes de la transacción (lo usa la demostración de carrera). */
export type BeforeBook = (draft: LessonDraft) => Promise<void>;

export class FirestoreLessonRepository implements LessonRepository {
  constructor(
    private readonly db: Db,
    private readonly beforeBook?: BeforeBook,
    private readonly now: () => Date = () => new Date(),
  ) {}

  get(id: Id): Promise<Lesson | null> {
    return guard(async () => {
      const snap = await getDoc(doc(this.db, COL.lessons, id));
      return snap.exists() ? lessonFromDoc(snap) : null;
    });
  }

  listByStudent(studentId: Id): Promise<Lesson[]> {
    return guard(async () => {
      const snap = await getDocs(query(collection(this.db, COL.lessons), where('studentId', '==', studentId)));
      return snap.docs.map(lessonFromDoc).sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
    });
  }

  /** La transacción de Firestore hace la lectura de candados + decisión + escritura de forma atómica. */
  book(draft: LessonDraft, decide: CollisionDecider): Promise<BookingOutcome> {
    return guard(async () => {
      await this.beforeBook?.(draft);
      const teacherSlot = slotId(draft.teacherId, draft.startAt);
      const studentSlot = slotId(draft.studentId, draft.startAt);
      const teacherRef = doc(this.db, COL.slots, teacherSlot);
      const studentRef = doc(this.db, COL.studentSlots, studentSlot);
      const lessonRef = doc(collection(this.db, COL.lessons)); // id fuera: la transacción puede reintentarse
      return runTransaction(this.db, async (tx): Promise<BookingOutcome> => {
        const [teacherSnap, studentSnap] = await Promise.all([tx.get(teacherRef), tx.get(studentRef)]);
        const decision = decide({ teacherLock: lockFromDoc(teacherSnap), studentLock: lockFromDoc(studentSnap) });
        if (!decision.ok) return { ok: false, reason: decision.reason };
        const createdAt = this.now();
        const lesson: Lesson = { ...draft, id: lessonRef.id, slotId: teacherSlot, status: LessonStatus.Confirmed, createdAt };
        tx.set(lessonRef, lessonData(lesson));
        tx.set(teacherRef, lockData(lesson, createdAt));
        tx.set(studentRef, lockData(lesson, createdAt));
        return { ok: true, lesson };
      });
    });
  }

  cancel(lessonId: Id): Promise<Lesson> {
    return guard(() =>
      runTransaction(this.db, async (tx) => {
        const ref = doc(this.db, COL.lessons, lessonId);
        const snap = await tx.get(ref);
        if (!snap.exists()) throw new NotFoundError('Lección');
        const lesson = lessonFromDoc(snap);
        if (lesson.status !== LessonStatus.Confirmed) throw new InvalidStateError();
        tx.delete(doc(this.db, COL.slots, slotId(lesson.teacherId, lesson.startAt)));
        tx.delete(doc(this.db, COL.studentSlots, slotId(lesson.studentId, lesson.startAt)));
        tx.update(ref, { status: LessonStatus.Cancelled });
        return { ...lesson, status: LessonStatus.Cancelled };
      }),
    );
  }
}

export class FirestoreSlotRepository implements SlotRepository {
  constructor(private readonly db: Db) {}

  /** Los candados del día se buscan por rango del ID: profesorId_AAAAMMDD_*. */
  listTeacherLocksForDay(teacherId: Id, day: Date): Promise<SlotLock[]> {
    return guard(async () => {
      const prefix = `${teacherId}_${slotKey(day).slice(0, 8)}_`;
      const snap = await getDocs(
        query(collection(this.db, COL.slots), where(documentId(), '>=', prefix), where(documentId(), '<', `${prefix}`)),
      );
      return snap.docs.map((d) => lockFromDoc(d) as SlotLock);
    });
  }
}

/** "Otro estudiante" simulado: toma el horario de Demo Race justo antes de confirmar. */
export const firestoreDemoRace = (db: Db, teacherId: Id): BeforeBook => async (draft) => {
  if (draft.teacherId !== teacherId) return;
  const ref = doc(db, COL.slots, slotId(draft.teacherId, draft.startAt));
  if ((await getDoc(ref)).exists()) return;
  await setDoc(ref, { lessonId: 'lesson-other', studentId: 'student-other', createdAt: new Date() });
};
