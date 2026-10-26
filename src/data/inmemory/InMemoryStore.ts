import { Course, Lesson, Level, SlotLock, Student, Teacher } from '@/domain';
import { Mutex } from './Mutex';

/** "Base de datos" en memoria: una tabla por colección Firestore. */
export class InMemoryStore {
  readonly students = new Map<string, Student>();
  readonly courses = new Map<string, Course>();
  readonly levels = new Map<string, Level>();
  readonly teachers = new Map<string, Teacher>();
  readonly lessons = new Map<string, Lesson>();
  readonly slots = new Map<string, SlotLock>();
  readonly studentSlots = new Map<string, SlotLock>();
  readonly mutex = new Mutex();
  private sequence = 0;

  nextId(prefix: string): string {
    this.sequence += 1;
    return `${prefix}-${this.sequence}`;
  }
}
