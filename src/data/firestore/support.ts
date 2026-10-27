import { DocumentData, DocumentSnapshot, Firestore, Timestamp } from 'firebase/firestore';
import { Lesson, OfflineError, SlotLock } from '@/domain';

export type Db = Firestore;

export const COL = {
  students: 'students',
  courses: 'courses',
  levels: 'levels',
  teachers: 'teachers',
  lessons: 'lessons',
  slots: 'slots',
  studentSlots: 'studentSlots',
} as const;

/** Firestore guarda fechas como Timestamp; el dominio usa Date. */
export const toDate = (v: Timestamp | Date): Date => (typeof (v as Timestamp).toDate === 'function' ? (v as Timestamp).toDate() : (v as Date));

export const lessonFromDoc = (snap: DocumentSnapshot<DocumentData>): Lesson => {
  const d = snap.data() as DocumentData;
  return { ...(d as Lesson), id: snap.id, startAt: toDate(d.startAt), createdAt: toDate(d.createdAt) };
};

/** El ID es el del documento, no un campo. */
export const lessonData = (lesson: Lesson) => {
  const data: Partial<Lesson> = { ...lesson };
  delete data.id;
  return data;
};

export const lockFromDoc = (snap: DocumentSnapshot<DocumentData>): SlotLock | null => {
  if (!snap.exists()) return null;
  const d = snap.data() as DocumentData;
  return { id: snap.id, lessonId: d.lessonId, studentId: d.studentId, createdAt: toDate(d.createdAt) };
};

export const lockData = (lesson: Lesson, createdAt: Date) => ({
  lessonId: lesson.id,
  studentId: lesson.studentId,
  createdAt,
});

const OFFLINE_CODES = ['unavailable', 'deadline-exceeded', 'auth/network-request-failed'];

/** Traduce fallos de red de Firebase al error de dominio de "sin conexión". */
export async function guard<T>(task: () => Promise<T>): Promise<T> {
  try {
    return await task();
  } catch (e) {
    throw OFFLINE_CODES.includes((e as { code?: string })?.code ?? '') ? new OfflineError() : e;
  }
}
