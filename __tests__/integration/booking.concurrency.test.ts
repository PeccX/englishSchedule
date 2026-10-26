import { DEMO_RACE_TEACHER_ID } from '@/data/seed/seed';
import { LessonStatus, SlotTakenError, StudentBusyError } from '@/domain';
import { MONDAY, draftFor, makeEnv } from './helpers';

const rejections = (results: PromiseSettledResult<unknown>[]) =>
  results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');
const fulfilled = (results: PromiseSettledResult<unknown>[]) => results.filter((r) => r.status === 'fulfilled');

describe('reserva concurrente en InMemory', () => {
  it('dos estudiantes, mismo profesor y hora: uno ok, otro conflicto', async () => {
    const booking = makeEnv().services.booking();
    const results = await Promise.allSettled([
      booking.book(draftFor('s1', 'teacher-ana', MONDAY(10))),
      booking.book(draftFor('s2', 'teacher-ana', MONDAY(10))),
    ]);
    expect(fulfilled(results)).toHaveLength(1);
    expect(rejections(results)).toHaveLength(1);
    expect(rejections(results)[0].reason).toBeInstanceOf(SlotTakenError);
  });

  it('con 10 intentos simultáneos solo uno gana', async () => {
    const booking = makeEnv().services.booking();
    const attempts = Array.from({ length: 10 }, (_, i) =>
      booking.book(draftFor(`s${i}`, 'teacher-ana', MONDAY(11))).then(
        () => 'ok',
        () => 'conflict',
      ),
    );
    const outcomes = await Promise.all(attempts);
    expect(outcomes.filter((o) => o === 'ok')).toHaveLength(1);
    expect(outcomes.filter((o) => o === 'conflict')).toHaveLength(9);
  });

  it('el mismo estudiante no puede estar con dos profesores a la misma hora', async () => {
    const booking = makeEnv().services.booking();
    const results = await Promise.allSettled([
      booking.book(draftFor('s1', 'teacher-ana', MONDAY(10))),
      booking.book(draftFor('s1', DEMO_RACE_TEACHER_ID, MONDAY(10))),
    ]);
    expect(fulfilled(results)).toHaveLength(1);
    expect(rejections(results)[0].reason).toBeInstanceOf(StudentBusyError);
  });

  it('horas distintas del mismo profesor no chocan', async () => {
    const booking = makeEnv().services.booking();
    const lessons = await Promise.all([
      booking.book(draftFor('s1', 'teacher-ana', MONDAY(9))),
      booking.book(draftFor('s2', 'teacher-ana', MONDAY(10))),
    ]);
    expect(lessons.every((l) => l.status === LessonStatus.Confirmed)).toBe(true);
  });

  it('rechaza horarios fuera de la disponibilidad del profesor', async () => {
    const booking = makeEnv().services.booking();
    await expect(booking.book(draftFor('s1', 'teacher-ana', MONDAY(15)))).rejects.toMatchObject({
      code: 'outside_availability',
    });
  });
});

describe('Demo Race', () => {
  it('con DEMO_RACE un "otro estudiante" gana justo antes de confirmar', async () => {
    const booking = makeEnv({ demoRace: true }).services.booking();
    await expect(booking.book(draftFor('s1', DEMO_RACE_TEACHER_ID, MONDAY(10)))).rejects.toBeInstanceOf(
      SlotTakenError,
    );
  });

  it('solo afecta al profesor Demo Race', async () => {
    const booking = makeEnv({ demoRace: true }).services.booking();
    await expect(booking.book(draftFor('s1', 'teacher-ana', MONDAY(10)))).resolves.toBeDefined();
  });

  it('sin la bandera el profesor Demo Race se reserva normal', async () => {
    const booking = makeEnv().services.booking();
    await expect(booking.book(draftFor('s1', DEMO_RACE_TEACHER_ID, MONDAY(10)))).resolves.toBeDefined();
  });
});
