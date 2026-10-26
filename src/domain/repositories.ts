import {
  AuthUser,
  Course,
  Id,
  Lesson,
  LessonDraft,
  Level,
  SlotLock,
  Student,
  Teacher,
} from './entities';
import { CollisionReason, CollisionResult } from './collision';

export interface StudentRepository {
  get(id: Id): Promise<Student | null>;
  save(student: Student): Promise<void>;
}

export interface CourseRepository {
  list(): Promise<Course[]>;
}

export interface LevelRepository {
  listByCourse(courseId: Id): Promise<Level[]>;
}

export interface TeacherRepository {
  get(id: Id): Promise<Teacher | null>;
  listByCourseAndLevel(courseId: Id, levelId: Id): Promise<Teacher[]>;
}

/** Candados leídos dentro de la transacción de reserva (lectura por ID). */
export interface LockSnapshot {
  teacherLock: SlotLock | null;
  studentLock: SlotLock | null;
}

export type BookingOutcome =
  | { ok: true; lesson: Lesson }
  | { ok: false; reason: CollisionReason };

export type CollisionDecider = (locks: LockSnapshot) => CollisionResult;

export interface LessonRepository {
  get(id: Id): Promise<Lesson | null>;
  listByStudent(studentId: Id): Promise<Lesson[]>;
  /**
   * Reserva atómica: lee ambos candados por ID, consulta `decide` y, si procede,
   * escribe la lección Confirmada + los dos candados en una sola transacción.
   */
  book(draft: LessonDraft, decide: CollisionDecider): Promise<BookingOutcome>;
  /** Marca Cancelada y borra los candados (la lección queda en el historial). */
  cancel(lessonId: Id): Promise<Lesson>;
}

export interface SlotRepository {
  /** Candados del profesor en el día de `day` (para pintar ocupados). */
  listTeacherLocksForDay(teacherId: Id, day: Date): Promise<SlotLock[]>;
}

export interface AuthGateway {
  signIn(email: string, password: string): Promise<AuthUser>;
  signUp(email: string, password: string): Promise<AuthUser>;
  signOut(): Promise<void>;
  sendPasswordReset(email: string): Promise<void>;
  currentUser(): AuthUser | null;
}
