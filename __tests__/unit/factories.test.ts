import { readConfig } from '@/core/config';
import { Database } from '@/data/Database';
import { InMemoryRepositoryFactory } from '@/data/inmemory/InMemoryRepositoryFactory';
import { createRepositoryFactory } from '@/data/RepositoryFactory';
import { DEMO_RACE_TEACHER_ID } from '@/data/seed/seed';
import { ServiceFactory } from '@/services/ServiceFactory';

beforeEach(() => Database.reset());

describe('readConfig', () => {
  it('cae a memory sin credenciales aunque se pida firestore', () => {
    expect(readConfig({ EXPO_PUBLIC_DATA_MODE: 'firestore' }).dataMode).toBe('memory');
  });
  it('activa firestore con credenciales', () => {
    const env = { EXPO_PUBLIC_DATA_MODE: 'firestore', EXPO_PUBLIC_FIREBASE_API_KEY: 'k' };
    expect(readConfig(env).dataMode).toBe('firestore');
  });
  it('lee EXPO_PUBLIC_DEMO_RACE', () => {
    expect(readConfig({ EXPO_PUBLIC_DEMO_RACE: '1' }).demoRace).toBe(true);
    expect(readConfig({}).demoRace).toBe(false);
  });
});

describe('RepositoryFactory', () => {
  it('construye la familia InMemory por defecto', () => {
    expect(createRepositoryFactory()).toBeInstanceOf(InMemoryRepositoryFactory);
  });

  it('todos los repos comparten el mismo almacén del Singleton', async () => {
    const repos = createRepositoryFactory();
    const courses = await repos.courses().list();
    expect(courses.map((c) => c.id)).toContain('course-general');
    expect(repos.auth()).toBe(repos.auth());
  });
});

describe('ServiceFactory + CatalogService', () => {
  it('inyecta repos y lista profesores por curso y nivel', async () => {
    const catalog = new ServiceFactory().catalog();
    const [course] = await catalog.listCourses();
    const [level] = await catalog.listLevels(course.id);
    const teachers = await catalog.listTeachers(course.id, level.id);
    expect(teachers.map((t) => t.id)).toContain(DEMO_RACE_TEACHER_ID);
  });

  it('acepta una fábrica de repos sustituta (DIP/OCP)', async () => {
    const fake = { courses: () => ({ list: async () => [] }), levels: jest.fn(), teachers: jest.fn() };
    const catalog = new ServiceFactory(fake as never).catalog();
    expect(await catalog.listCourses()).toEqual([]);
  });
});
