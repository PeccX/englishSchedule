import {
  AuthGateway,
  CourseRepository,
  LessonRepository,
  LevelRepository,
  SlotRepository,
  StudentRepository,
  TeacherRepository,
} from '@/domain';
import { Database } from './Database';
import { InMemoryRepositoryFactory } from './inmemory/InMemoryRepositoryFactory';

/** Abstract Factory: familia de repositorios de una misma fuente de datos. */
export interface RepositoryFactory {
  students(): StudentRepository;
  courses(): CourseRepository;
  levels(): LevelRepository;
  teachers(): TeacherRepository;
  lessons(): LessonRepository;
  slots(): SlotRepository;
  auth(): AuthGateway;
}

/** Elige la fábrica concreta según la configuración (OCP: otra fuente = otra fábrica). */
export function createRepositoryFactory(db: Database = Database.getInstance()): RepositoryFactory {
  // 'firestore' llegará con su propia fábrica; hoy toda configuración usa memoria.
  return new InMemoryRepositoryFactory(db.store, db.config.demoRace);
}
