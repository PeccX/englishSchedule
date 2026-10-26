export type Id = string;

export enum LessonStatus {
  Requested = 'Solicitada',
  Validating = 'Validando',
  Confirmed = 'Confirmada',
  Rejected = 'Rechazada',
  Cancelled = 'Cancelada',
  Completed = 'Completada',
}

export interface Student {
  id: Id;
  name: string;
  email: string;
  phone: string;
  currentLevel: string;
}

export interface Course {
  id: Id;
  name: string;
  description: string;
}

export interface Level {
  id: Id;
  courseId: Id;
  name: string;
  order: number;
}

/** Ventana semanal de atención. day: 0 (domingo) – 6 (sábado); start/end: "HH:mm". */
export interface Availability {
  day: number;
  start: string;
  end: string;
}

export interface Teacher {
  id: Id;
  name: string;
  courseIds: Id[];
  levelIds: Id[];
  availability: Availability[];
}

export interface Lesson {
  id: Id;
  studentId: Id;
  teacherId: Id;
  courseId: Id;
  levelId: Id;
  startAt: Date;
  slotId: string;
  status: LessonStatus;
  createdAt: Date;
}

export type LessonDraft = Omit<Lesson, 'id' | 'slotId' | 'status' | 'createdAt'>;

/** Candado de un horario (docs `slots` y `studentSlots`). */
export interface SlotLock {
  id: string;
  lessonId: Id;
  studentId: Id;
  createdAt: Date;
}

export interface AuthUser {
  uid: Id;
  email: string;
}

export interface TimeSlot {
  startAt: Date;
  available: boolean;
}
