import { Lesson, LessonStatus, slotKey } from '@/domain';

const DAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const pad = (n: number) => String(n).padStart(2, '0');

export const formatDate = (d: Date) => `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
export const formatTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
export const formatDateTime = (d: Date) => `${formatDate(d)} · ${formatTime(d)}`;
export const dateKey = (d: Date) => slotKey(d).slice(0, 8);
export const timeKey = (d: Date) => slotKey(d).slice(9);

export const STATUS_LABEL: Record<LessonStatus, string> = {
  [LessonStatus.Requested]: 'Solicitada',
  [LessonStatus.Validating]: 'Validando',
  [LessonStatus.Confirmed]: 'Confirmada',
  [LessonStatus.Rejected]: 'Rechazada',
  [LessonStatus.Cancelled]: 'Cancelada',
  [LessonStatus.Completed]: 'Completada',
};

export const lessonTitle = (l: Lesson) => formatDateTime(l.startAt);
