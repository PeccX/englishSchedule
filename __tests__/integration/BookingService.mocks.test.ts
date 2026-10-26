import { LessonRepository, LessonStatus, SlotTakenError, Teacher, TeacherRepository, ValidationError } from '@/domain';
import { BookingService } from '@/services/BookingService';
import { MONDAY, NOW, draftFor } from './helpers';

const teacher: Teacher = {
  id: 't1',
  name: 'T',
  courseIds: ['course-general'],
  levelIds: ['level-general-a1'],
  availability: [{ day: 1, start: '09:00', end: '12:00' }],
};

const teachers = (t: Teacher | null): TeacherRepository => ({
  get: jest.fn().mockResolvedValue(t),
  listByCourseAndLevel: jest.fn(),
});

const lessonsWith = (book: jest.Mock) => ({ book }) as unknown as LessonRepository;

describe('BookingService con repos simulados', () => {
  it('devuelve la lección cuando el repositorio confirma', async () => {
    const lesson = { id: 'l1', status: LessonStatus.Confirmed };
    const book = jest.fn().mockResolvedValue({ ok: true, lesson });
    const service = new BookingService(teachers(teacher), lessonsWith(book), () => NOW);
    expect(await service.book(draftFor('s1', 't1', MONDAY(10)))).toBe(lesson);
  });

  it('traduce teacher_busy a SlotTakenError', async () => {
    const book = jest.fn().mockResolvedValue({ ok: false, reason: 'teacher_busy' });
    const service = new BookingService(teachers(teacher), lessonsWith(book), () => NOW);
    await expect(service.book(draftFor('s1', 't1', MONDAY(10)))).rejects.toBeInstanceOf(SlotTakenError);
  });

  it('pasa al repo un decider que usa CollisionChecker con la disponibilidad del profesor', async () => {
    const book = jest.fn().mockResolvedValue({ ok: true, lesson: {} });
    const service = new BookingService(teachers(teacher), lessonsWith(book), () => NOW);
    await service.book(draftFor('s1', 't1', MONDAY(10)));
    const decide = book.mock.calls[0][1];
    expect(decide({ teacherLock: null, studentLock: null })).toEqual({ ok: true });
    expect(decide({ teacherLock: { id: 'x' }, studentLock: null })).toEqual({ ok: false, reason: 'teacher_busy' });
  });

  it('falla si el profesor no existe, sin tocar el repo de lecciones', async () => {
    const book = jest.fn();
    const service = new BookingService(teachers(null), lessonsWith(book), () => NOW);
    await expect(service.book(draftFor('s1', 'nope', MONDAY(10)))).rejects.toMatchObject({ code: 'not_found' });
    expect(book).not.toHaveBeenCalled();
  });

  it('rechaza cursos/niveles que el profesor no imparte', async () => {
    const book = jest.fn();
    const service = new BookingService(teachers(teacher), lessonsWith(book), () => NOW);
    const bad = { ...draftFor('s1', 't1', MONDAY(10)), levelId: 'level-business-c1' };
    await expect(service.book(bad)).rejects.toBeInstanceOf(ValidationError);
    expect(book).not.toHaveBeenCalled();
  });
});
