import {
  ForbiddenError,
  InvalidStateError,
  Lesson,
  LessonRepository,
  LessonStatus,
  NotFoundError,
} from '@/domain';
import { Clock, systemClock } from './Clock';

export interface LessonSummary {
  upcoming: number;
  history: number;
  next: Lesson | null;
}

/** Caso de uso: consultar y cancelar las lecciones del estudiante. */
export class LessonService {
  constructor(
    private readonly lessons: LessonRepository,
    private readonly now: Clock = systemClock,
  ) {}

  private isUpcoming = (l: Lesson) =>
    l.status === LessonStatus.Confirmed && l.startAt.getTime() > this.now().getTime();

  async upcoming(studentId: string): Promise<Lesson[]> {
    return (await this.lessons.listByStudent(studentId)).filter(this.isUpcoming);
  }

  async history(studentId: string): Promise<Lesson[]> {
    const all = await this.lessons.listByStudent(studentId);
    return all.filter((l) => !this.isUpcoming(l)).sort((a, b) => b.startAt.getTime() - a.startAt.getTime());
  }

  async summary(studentId: string): Promise<LessonSummary> {
    const [upcoming, history] = await Promise.all([this.upcoming(studentId), this.history(studentId)]);
    return { upcoming: upcoming.length, history: history.length, next: upcoming[0] ?? null };
  }

  async get(studentId: string, lessonId: string): Promise<Lesson> {
    const lesson = await this.lessons.get(lessonId);
    if (!lesson) throw new NotFoundError('Lección');
    if (lesson.studentId !== studentId) throw new ForbiddenError();
    return lesson;
  }

  async cancel(studentId: string, lessonId: string): Promise<Lesson> {
    const lesson = await this.get(studentId, lessonId);
    if (!this.isUpcoming(lesson)) throw new InvalidStateError('Solo se pueden cancelar lecciones próximas.');
    return this.lessons.cancel(lessonId);
  }
}
