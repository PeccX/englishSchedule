import { slotId } from '@/domain';
import { RepositoryFactory } from '../RepositoryFactory';
import { DEMO_RACE_TEACHER_ID, DEMO_STUDENT } from '../seed/seed';
import { InMemoryAuthGateway } from './InMemoryAuthGateway';
import {
  InMemoryCourseRepository,
  InMemoryLevelRepository,
  InMemoryStudentRepository,
  InMemoryTeacherRepository,
} from './InMemoryCatalogRepositories';
import { BeforeBookHook, InMemoryLessonRepository, InMemorySlotRepository } from './InMemoryLessonRepository';
import { InMemoryStore } from './InMemoryStore';

const OTHER_STUDENT = 'student-other';

/** "Otro estudiante" simulado: toma el horario del profesor Demo Race justo antes de confirmar. */
export const demoRaceHook: BeforeBookHook = (draft, store) => {
  if (draft.teacherId !== DEMO_RACE_TEACHER_ID) return;
  const id = slotId(draft.teacherId, draft.startAt);
  if (store.slots.has(id)) return;
  store.slots.set(id, { id, lessonId: 'lesson-other', studentId: OTHER_STUDENT, createdAt: new Date() });
};

export class InMemoryRepositoryFactory implements RepositoryFactory {
  private readonly authGateway = new InMemoryAuthGateway([{ ...DEMO_STUDENT }]);

  constructor(
    private readonly store: InMemoryStore,
    private readonly demoRace = false,
  ) {}

  students = () => new InMemoryStudentRepository(this.store);
  courses = () => new InMemoryCourseRepository(this.store);
  levels = () => new InMemoryLevelRepository(this.store);
  teachers = () => new InMemoryTeacherRepository(this.store);
  slots = () => new InMemorySlotRepository(this.store);
  lessons = () => new InMemoryLessonRepository(this.store, this.demoRace ? demoRaceHook : undefined);
  auth = () => this.authGateway;
}
