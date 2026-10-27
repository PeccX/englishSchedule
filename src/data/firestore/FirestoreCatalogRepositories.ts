import { collection, doc, getDoc, getDocs, limit, query, setDoc, where, writeBatch } from 'firebase/firestore';
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
import { seedCatalog } from '../seed/seed';
import { COL, Db, guard } from './support';

const withId = <T extends { id: string }>(id: string, data: unknown) => ({ ...(data as T), id });

/** Siembra cursos, niveles y profesores la primera vez (idempotente; se reintenta si falla). */
const seeding = new WeakMap<Db, Promise<void>>();
export function ensureSeeded(db: Db): Promise<void> {
  const cached = seeding.get(db);
  if (cached) return cached;
  const run = guard(async () => {
    if (!(await getDocs(query(collection(db, COL.courses), limit(1)))).empty) return;
    const { courses, levels, teachers } = seedCatalog();
    const batch = writeBatch(db);
    courses.forEach(({ id, ...d }) => batch.set(doc(db, COL.courses, id), d));
    levels.forEach(({ id, ...d }) => batch.set(doc(db, COL.levels, id), d));
    teachers.forEach(({ id, ...d }) => batch.set(doc(db, COL.teachers, id), d));
    await batch.commit();
  });
  seeding.set(db, run);
  run.catch(() => seeding.delete(db));
  return run;
}

export class FirestoreStudentRepository implements StudentRepository {
  constructor(private readonly db: Db) {}

  get(id: Id): Promise<Student | null> {
    return guard(async () => {
      const snap = await getDoc(doc(this.db, COL.students, id));
      return snap.exists() ? withId<Student>(snap.id, snap.data()) : null;
    });
  }

  save({ id, ...data }: Student): Promise<void> {
    return guard(() => setDoc(doc(this.db, COL.students, id), data));
  }
}

export class FirestoreCourseRepository implements CourseRepository {
  constructor(private readonly db: Db) {}

  list(): Promise<Course[]> {
    return guard(async () => {
      await ensureSeeded(this.db);
      return (await getDocs(collection(this.db, COL.courses))).docs.map((d) => withId<Course>(d.id, d.data()));
    });
  }
}

export class FirestoreLevelRepository implements LevelRepository {
  constructor(private readonly db: Db) {}

  listByCourse(courseId: Id): Promise<Level[]> {
    return guard(async () => {
      await ensureSeeded(this.db);
      const snap = await getDocs(query(collection(this.db, COL.levels), where('courseId', '==', courseId)));
      return snap.docs.map((d) => withId<Level>(d.id, d.data())).sort((a, b) => a.order - b.order);
    });
  }
}

export class FirestoreTeacherRepository implements TeacherRepository {
  constructor(private readonly db: Db) {}

  get(id: Id): Promise<Teacher | null> {
    return guard(async () => {
      await ensureSeeded(this.db);
      const snap = await getDoc(doc(this.db, COL.teachers, id));
      return snap.exists() ? withId<Teacher>(snap.id, snap.data()) : null;
    });
  }

  listByCourseAndLevel(courseId: Id, levelId: Id): Promise<Teacher[]> {
    return guard(async () => {
      await ensureSeeded(this.db);
      const snap = await getDocs(query(collection(this.db, COL.teachers), where('courseIds', 'array-contains', courseId)));
      return snap.docs.map((d) => withId<Teacher>(d.id, d.data())).filter((t) => t.levelIds.includes(levelId));
    });
  }
}
