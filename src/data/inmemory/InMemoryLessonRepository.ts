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
import { InMemoryStore } from './InMemoryStore';

/** Gancho que se ejecuta dentro de la sección crítica, antes de leer los candados. */
export type BeforeBookHook = (draft: LessonDraft, store: InMemoryStore) => void;

const yieldTick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

export class InMemoryLessonRepository implements LessonRepository {
  constructor(
    private readonly store: InMemoryStore,
    private readonly beforeBook?: BeforeBookHook,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async get(id: Id): Promise<Lesson | null> {
    const l = this.store.lessons.get(id);
    return l ? { ...l } : null;
  }

  async listByStudent(studentId: Id): Promise<Lesson[]> {
    return [...this.store.lessons.values()]
      .filter((l) => l.studentId === studentId)
      .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())
      .map((l) => ({ ...l }));
  }

  /** El mutex hace de transacción: lectura de candados + decisión + escritura son atómicas. */
  book(draft: LessonDraft, decide: CollisionDecider): Promise<BookingOutcome> {
    return this.store.mutex.runExclusive(async () => {
      this.beforeBook?.(draft, this.store);
      const teacherSlot = slotId(draft.teacherId, draft.startAt);
      const studentSlot = slotId(draft.studentId, draft.startAt);
      const decision = decide({
        teacherLock: this.store.slots.get(teacherSlot) ?? null,
        studentLock: this.store.studentSlots.get(studentSlot) ?? null,
      });
      if (!decision.ok) return { ok: false, reason: decision.reason };
      await yieldTick(); // latencia simulada: sin el mutex dos reservas se pisarían aquí
      const lesson = this.commit(draft, teacherSlot, studentSlot);
      return { ok: true, lesson: { ...lesson } };
    });
  }

  cancel(lessonId: Id): Promise<Lesson> {
    return this.store.mutex.runExclusive(async () => {
      const lesson = this.store.lessons.get(lessonId);
      if (!lesson) throw new NotFoundError('Lección');
      if (lesson.status !== LessonStatus.Confirmed) throw new InvalidStateError();
      this.store.slots.delete(slotId(lesson.teacherId, lesson.startAt));
      this.store.studentSlots.delete(slotId(lesson.studentId, lesson.startAt));
      const cancelled = { ...lesson, status: LessonStatus.Cancelled };
      this.store.lessons.set(lessonId, cancelled);
      return { ...cancelled };
    });
  }

  private commit(draft: LessonDraft, teacherSlot: string, studentSlot: string): Lesson {
    const createdAt = this.now();
    const lesson: Lesson = {
      ...draft,
      id: this.store.nextId('lesson'),
      slotId: teacherSlot,
      status: LessonStatus.Confirmed,
      createdAt,
    };
    const lock = (id: string): SlotLock => ({ id, lessonId: lesson.id, studentId: draft.studentId, createdAt });
    this.store.lessons.set(lesson.id, lesson);
    this.store.slots.set(teacherSlot, lock(teacherSlot));
    this.store.studentSlots.set(studentSlot, lock(studentSlot));
    return lesson;
  }
}

export class InMemorySlotRepository implements SlotRepository {
  constructor(private readonly store: InMemoryStore) {}

  async listTeacherLocksForDay(teacherId: Id, day: Date): Promise<SlotLock[]> {
    const prefix = `${teacherId}_${slotKey(day).slice(0, 8)}_`;
    return [...this.store.slots.values()].filter((l) => l.id.startsWith(prefix)).map((l) => ({ ...l }));
  }
}
