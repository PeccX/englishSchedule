import { RepositoryFactory } from '../RepositoryFactory';
import { DEMO_RACE_TEACHER_ID } from '../seed/seed';
import { FirestoreAuthGateway } from './FirestoreAuthGateway';
import {
  FirestoreCourseRepository,
  FirestoreLevelRepository,
  FirestoreStudentRepository,
  FirestoreTeacherRepository,
} from './FirestoreCatalogRepositories';
import { FirestoreLessonRepository, FirestoreSlotRepository, firestoreDemoRace } from './FirestoreLessonRepository';
import { FirebaseClients } from './firebase';

/** Abstract Factory concreta: la misma familia de repositorios, respaldada por Firestore y Firebase Auth. */
export class FirestoreRepositoryFactory implements RepositoryFactory {
  private readonly authGateway: FirestoreAuthGateway;

  constructor(
    private readonly clients: Pick<FirebaseClients, 'db' | 'auth'>,
    private readonly demoRace = false,
  ) {
    this.authGateway = new FirestoreAuthGateway(clients.auth);
  }

  students = () => new FirestoreStudentRepository(this.clients.db);
  courses = () => new FirestoreCourseRepository(this.clients.db);
  levels = () => new FirestoreLevelRepository(this.clients.db);
  teachers = () => new FirestoreTeacherRepository(this.clients.db);
  slots = () => new FirestoreSlotRepository(this.clients.db);
  lessons = () =>
    new FirestoreLessonRepository(this.clients.db, this.demoRace ? firestoreDemoRace(this.clients.db, DEMO_RACE_TEACHER_ID) : undefined);
  auth = () => this.authGateway;
}
