import { LessonStatus } from '@/domain';
import { AvailabilityService } from '@/services/AvailabilityService';
import { MONDAY, NOW, draftFor, makeEnv } from './helpers';

const slotAt = async (availability: AvailabilityService, hour: number) =>
  (await availability.slotsForDay('teacher-ana', MONDAY(0))).find(
    (s) => s.startAt.getHours() === hour,
  );

describe('Availability + Lesson (InMemory)', () => {
  it('marca ocupado el horario reservado y lo libera al cancelar', async () => {
    const { services } = makeEnv();
    const lesson = await services.booking().book(draftFor('s1', 'teacher-ana', MONDAY(10)));
    const availability = services.availability();
    expect((await slotAt(availability, 10))?.available).toBe(false);

    const cancelled = await services.lessons().cancel('s1', lesson.id);
    expect(cancelled.status).toBe(LessonStatus.Cancelled);
    expect((await slotAt(availability, 10))?.available).toBe(true);
    await expect(services.booking().book(draftFor('s2', 'teacher-ana', MONDAY(10)))).resolves.toBeDefined();
  });

  it('lista las horas de la ventana de Ana y solo fechas laborales futuras', async () => {
    const { services } = makeEnv();
    const slots = await services.availability().slotsForDay('teacher-ana', MONDAY(0));
    expect(slots.map((s) => s.startAt.getHours())).toEqual([9, 10, 11, 12]);
    const dates = await services.availability().availableDates('teacher-ana');
    expect(dates.every((d) => d.getDay() >= 1 && d.getDay() <= 5)).toBe(true);
    expect(dates.every((d) => d.getTime() > NOW.getTime())).toBe(true);
  });

  it('separa próximas e historial y conserva la cancelada', async () => {
    const { services } = makeEnv();
    const lessons = services.lessons();
    const a = await services.booking().book(draftFor('s1', 'teacher-ana', MONDAY(9)));
    await services.booking().book(draftFor('s1', 'teacher-ana', MONDAY(10)));
    await lessons.cancel('s1', a.id);
    const summary = await lessons.summary('s1');
    expect(summary).toMatchObject({ upcoming: 1, history: 1 });
    expect(summary.next?.startAt).toEqual(MONDAY(10));
    expect((await lessons.history('s1'))[0].status).toBe(LessonStatus.Cancelled);
  });

  it('no permite cancelar lecciones ajenas, dos veces, ni leer inexistentes', async () => {
    const { services } = makeEnv();
    const lesson = await services.booking().book(draftFor('s1', 'teacher-ana', MONDAY(10)));
    await expect(services.lessons().cancel('s2', lesson.id)).rejects.toMatchObject({ code: 'forbidden' });
    await services.lessons().cancel('s1', lesson.id);
    await expect(services.lessons().cancel('s1', lesson.id)).rejects.toMatchObject({ code: 'invalid_state' });
    await expect(services.lessons().get('s1', 'nope')).rejects.toMatchObject({ code: 'not_found' });
  });
});
