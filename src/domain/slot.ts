import { Availability } from './entities';

export const SLOT_MINUTES = 60;
export const SLOT_MS = SLOT_MINUTES * 60_000;

const pad = (n: number, size = 2) => String(n).padStart(size, '0');

/** `YYYYMMDD_HHmm` en hora local. */
export const slotKey = (d: Date) =>
  `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;

export const slotId = (ownerId: string, startAt: Date) => `${ownerId}_${slotKey(startAt)}`;

export const minutesOfDay = (d: Date) => d.getHours() * 60 + d.getMinutes();

export const parseHHmm = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

export const isSlotAligned = (d: Date) =>
  d.getMinutes() === 0 && d.getSeconds() === 0 && d.getMilliseconds() === 0;

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const addDays = (d: Date, days: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + days, d.getHours(), d.getMinutes());

/** Un slot cabe si empieza dentro de la ventana y termina antes de su cierre. */
export const fitsWindow = (startAt: Date, w: Availability) => {
  if (w.day !== startAt.getDay()) return false;
  const from = minutesOfDay(startAt);
  return from >= parseHHmm(w.start) && from + SLOT_MINUTES <= parseHHmm(w.end);
};

/** Horas de inicio (en minutos del día) que genera una ventana. */
export const windowStarts = (w: Availability) => {
  const starts: number[] = [];
  for (let m = parseHHmm(w.start); m + SLOT_MINUTES <= parseHHmm(w.end); m += SLOT_MINUTES) starts.push(m);
  return starts;
};

export const atMinutes = (day: Date, minutes: number) =>
  new Date(day.getFullYear(), day.getMonth(), day.getDate(), Math.floor(minutes / 60), minutes % 60);
