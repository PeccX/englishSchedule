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
  if (db.config.dataMode === 'firestore') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- carga diferida: memory no necesita Firebase
    const { FirestoreRepositoryFactory } = require('./firestore/FirestoreRepositoryFactory') as typeof import('./firestore/FirestoreRepositoryFactory');
    return new FirestoreRepositoryFactory(db.firebase(), db.config.demoRace);
  }
  return new InMemoryRepositoryFactory(db.store, db.config.demoRace);
}
