import { LessonStatus, OfflineError, SlotTakenError, StudentBusyError } from '@/domain';
import { FirestoreRepositoryFactory } from '@/data/firestore/FirestoreRepositoryFactory';
import { ServiceFactory } from '@/services/ServiceFactory';
import { DEMO_RACE_TEACHER_ID } from '@/data/seed/seed';
import { SessionManager } from '@/core/SessionManager';
import { FakeDb, makeFakeDb } from './fakeFirestore';
import { FakeAuth, makeFakeAuth } from './fakeAuth';
import { MONDAY, NOW, draftFor } from './helpers';

jest.mock('firebase/firestore', () => jest.requireActual('./fakeFirestore'));
jest.mock('firebase/auth', () => jest.requireActual('./fakeAuth'));

let db: FakeDb;
let auth: FakeAuth;
const build = (demoRace = false) => {
  const repos = new FirestoreRepositoryFactory({ db, auth } as never, demoRace);
  return { repos, services: new ServiceFactory(repos, () => NOW) };
};

beforeEach(() => {
  db = makeFakeDb();
  auth = makeFakeAuth();
  SessionManager.reset();
});

describe('catálogo en Firestore', () => {
  it('siembra una sola vez y lista cursos, niveles y profesores', async () => {
    const { services } = build();
    const catalog = services.catalog();
    expect((await catalog.listCourses()).length).toBe(2);
    const levels = await catalog.listLevels('course-general');
    expect(levels.map((l) => l.name)).toEqual(['A1', 'A2', 'B1', 'B2', 'C1']);
    const teachers = await catalog.listTeachers('course-general', levels[0].id);
    expect(teachers.map((t) => t.id)).toContain('teacher-ana');
  });
});

describe('autenticación y perfil', () => {
  it('registra, guarda el perfil, cierra e inicia sesión', async () => {
    const { services } = build();
    const a = services.auth();
    const student = await a.signUp({ name: 'Pablo', email: 'p@x.com', password: 'secreto1' });
    await a.signOut();
    const again = await a.signIn('p@x.com', 'secreto1');
    expect(again?.id).toBe(student.id);
    expect(again?.name).toBe('Pablo');
  });

  it('traduce errores de Firebase a errores de dominio', async () => {
    const { services } = build();
    const a = services.auth();
    await a.signUp({ name: 'Pablo', email: 'p@x.com', password: 'secreto1' });
    await expect(a.signUp({ name: 'Otro', email: 'p@x.com', password: 'secreto1' })).rejects.toMatchObject({ code: 'email_in_use' });
    await expect(a.signIn('p@x.com', 'mala-clave')).rejects.toMatchObject({ code: 'invalid_credentials' });
  });
});

describe('reservas en Firestore', () => {
  it('confirma, persiste y lista la lección; los candados quedan escritos', async () => {
    const { services } = build();
    const lesson = await services.booking().book(draftFor('s1', 'teacher-ana', MONDAY(9)));
    expect(lesson.status).toBe(LessonStatus.Confirmed);
    const mine = await services.lessons().upcoming('s1');
    expect(mine.map((l) => l.id)).toEqual([lesson.id]);
    expect(mine[0].startAt.getTime()).toBe(MONDAY(9).getTime());
    expect([...db.docs.keys()].filter((k) => k.startsWith('slots/') || k.startsWith('studentSlots/')).length).toBe(2);
  });

  it('dos estudiantes, mismo horario: gana uno y el otro recibe SlotTakenError', async () => {
    const { services } = build();
    const results = await Promise.allSettled(
      ['s1', 's2'].map((s) => services.booking().book(draftFor(s, 'teacher-ana', MONDAY(10)))),
    );
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    const lost = results.find((r) => r.status === 'rejected') as PromiseRejectedResult;
    expect(lost.reason).toBeInstanceOf(SlotTakenError);
  });

  it('diez intentos simultáneos: gana uno solo', async () => {
    const { services } = build();
    const results = await Promise.allSettled(
      Array.from({ length: 10 }, (_, i) => services.booking().book(draftFor(`s${i}`, 'teacher-ana', MONDAY(11)))),
    );
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
  });

  it('un estudiante no puede tener dos lecciones a la misma hora', async () => {
    const { services } = build();
    await services.booking().book(draftFor('s1', 'teacher-ana', MONDAY(9)));
    await expect(services.booking().book(draftFor('s1', 'teacher-demo-race', MONDAY(9)))).rejects.toBeInstanceOf(StudentBusyError);
  });

  it('el calendario del profesor marca el horario ocupado para otro dispositivo', async () => {
    const { services } = build();
    await services.booking().book(draftFor('s1', 'teacher-ana', MONDAY(9)));
    const other = build().services; // otra "app" sobre la misma base
    const slots = await other.availability().slotsForDay('teacher-ana', MONDAY(9));
    expect(slots.find((s) => s.startAt.getTime() === MONDAY(9).getTime())?.available).toBe(false);
    expect(slots.find((s) => s.startAt.getTime() === MONDAY(10).getTime())?.available).toBe(true);
  });

  it('cancelar libera los candados y conserva el historial', async () => {
    const { services } = build();
    const lesson = await services.booking().book(draftFor('s1', 'teacher-ana', MONDAY(9)));
    await services.lessons().cancel('s1', lesson.id);
    expect((await services.lessons().history('s1'))[0].status).toBe(LessonStatus.Cancelled);
    await expect(services.booking().book(draftFor('s2', 'teacher-ana', MONDAY(9)))).resolves.toBeDefined();
  });

  it('Demo Race: otro estudiante gana el horario justo antes de confirmar', async () => {
    const { services } = build(true);
    await expect(services.booking().book(draftFor('s1', DEMO_RACE_TEACHER_ID, MONDAY(12)))).rejects.toBeInstanceOf(SlotTakenError);
  });
});

describe('errores de red', () => {
  it('un fallo "unavailable" se muestra como sin conexión', async () => {
    const { repos } = build();
    db.docs.get = () => { throw Object.assign(new Error('offline'), { code: 'unavailable' }); };
    await expect(repos.students().get('a')).rejects.toBeInstanceOf(OfflineError);
  });
});
