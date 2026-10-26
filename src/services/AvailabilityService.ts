import {
  NotFoundError,
  SlotRepository,
  Teacher,
  TeacherRepository,
  TimeSlot,
  addDays,
  atMinutes,
  slotId,
  startOfDay,
  windowStarts,
} from '@/domain';
import { Clock, systemClock } from './Clock';

export const DEFAULT_HORIZON_DAYS = 14;

/** Caso de uso: qué fechas y horas se pueden mostrar como libres u ocupadas. */
export class AvailabilityService {
  constructor(
    private readonly teachers: TeacherRepository,
    private readonly slots: SlotRepository,
    private readonly now: Clock = systemClock,
  ) {}

  async availableDates(teacherId: string, horizonDays = DEFAULT_HORIZON_DAYS): Promise<Date[]> {
    const teacher = await this.requireTeacher(teacherId);
    const today = startOfDay(this.now());
    return Array.from({ length: horizonDays }, (_, i) => addDays(today, i + 1)).filter((day) =>
      teacher.availability.some((w) => w.day === day.getDay()),
    );
  }

  /** Todas las horas del día con su estado: libre u ocupada/pasada. */
  async slotsForDay(teacherId: string, day: Date): Promise<TimeSlot[]> {
    const teacher = await this.requireTeacher(teacherId);
    const taken = new Set((await this.slots.listTeacherLocksForDay(teacherId, day)).map((l) => l.id));
    const now = this.now().getTime();
    return this.startsOf(teacher, day).map((startAt) => ({
      startAt,
      available: startAt.getTime() > now && !taken.has(slotId(teacherId, startAt)),
    }));
  }

  private startsOf(teacher: Teacher, day: Date): Date[] {
    return teacher.availability
      .filter((w) => w.day === day.getDay())
      .flatMap(windowStarts)
      .sort((a, b) => a - b)
      .map((minutes) => atMinutes(day, minutes));
  }

  private async requireTeacher(id: string): Promise<Teacher> {
    const teacher = await this.teachers.get(id);
    if (!teacher) throw new NotFoundError('Profesor');
    return teacher;
  }
}
