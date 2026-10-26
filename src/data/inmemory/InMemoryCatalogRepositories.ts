import {
  Course,
  CourseRepository,
  Id,
  Level,
  LevelRepository,
  Student,
  StudentRepository,
  Teacher,
  TeacherRepository,
} from '@/domain';
import { InMemoryStore } from './InMemoryStore';

const copyTeacher = (t: Teacher): Teacher => ({
  ...t,
  courseIds: [...t.courseIds],
  levelIds: [...t.levelIds],
  availability: t.availability.map((a) => ({ ...a })),
});

export class InMemoryStudentRepository implements StudentRepository {
  constructor(private readonly store: InMemoryStore) {}

  async get(id: Id): Promise<Student | null> {
    const s = this.store.students.get(id);
    return s ? { ...s } : null;
  }

  async save(student: Student): Promise<void> {
    this.store.students.set(student.id, { ...student });
  }
}

export class InMemoryCourseRepository implements CourseRepository {
  constructor(private readonly store: InMemoryStore) {}

  async list(): Promise<Course[]> {
    return [...this.store.courses.values()].map((c) => ({ ...c }));
  }
}

export class InMemoryLevelRepository implements LevelRepository {
  constructor(private readonly store: InMemoryStore) {}

  async listByCourse(courseId: Id): Promise<Level[]> {
    return [...this.store.levels.values()]
      .filter((l) => l.courseId === courseId)
      .sort((a, b) => a.order - b.order)
      .map((l) => ({ ...l }));
  }
}

export class InMemoryTeacherRepository implements TeacherRepository {
  constructor(private readonly store: InMemoryStore) {}

  async get(id: Id): Promise<Teacher | null> {
    const t = this.store.teachers.get(id);
    return t ? copyTeacher(t) : null;
  }

  async listByCourseAndLevel(courseId: Id, levelId: Id): Promise<Teacher[]> {
    return [...this.store.teachers.values()]
      .filter((t) => t.courseIds.includes(courseId) && t.levelIds.includes(levelId))
      .map(copyTeacher);
  }
}
