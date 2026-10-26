import {
  Lesson,
  LessonDraft,
  LessonRepository,
  NotFoundError,
  Teacher,
  TeacherRepository,
  ValidationError,
  checkCollision,
  errorFor,
} from '@/domain';
import { Clock, systemClock } from './Clock';

const teaches = (t: Teacher, d: LessonDraft) => t.courseIds.includes(d.courseId) && t.levelIds.includes(d.levelId);

/** Caso de uso: reservar una lección. La decisión anticolisión la toma `checkCollision`. */
export class BookingService {
  constructor(
    private readonly teachers: TeacherRepository,
    private readonly lessons: LessonRepository,
    private readonly now: Clock = systemClock,
  ) {}

  async book(draft: LessonDraft): Promise<Lesson> {
    const teacher = await this.teachers.get(draft.teacherId);
    if (!teacher) throw new NotFoundError('Profesor');
    if (!teaches(teacher, draft)) throw new ValidationError('El profesor no imparte ese curso o nivel.');
    const outcome = await this.lessons.book(draft, (locks) =>
      checkCollision({ ...locks, startAt: draft.startAt, now: this.now(), availability: teacher.availability }),
    );
    if (!outcome.ok) throw errorFor(outcome.reason);
    return outcome.lesson;
  }
}
