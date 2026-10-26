import { checkCollision, CollisionInput } from '@/domain/collision';
import { SlotLock } from '@/domain/entities';
import { slotId } from '@/domain/slot';

// Lunes 2030-01-07 (futuro y estable)
const MONDAY_10 = new Date(2030, 0, 7, 10, 0);
const NOW = new Date(2030, 0, 1, 8, 0);
const WINDOW_MON = { day: 1, start: '09:00', end: '12:00' };

const lock = (owner: string): SlotLock => ({
  id: slotId(owner, MONDAY_10),
  lessonId: 'l1',
  studentId: 's9',
  createdAt: NOW,
});

const input = (over: Partial<CollisionInput> = {}): CollisionInput => ({
  startAt: MONDAY_10,
  now: NOW,
  availability: [WINDOW_MON],
  teacherLock: null,
  studentLock: null,
  ...over,
});

const reason = (r: string) => ({ ok: false, reason: r });

describe('checkCollision', () => {
  it('acepta un horario libre dentro de la disponibilidad', () => {
    expect(checkCollision(input())).toEqual({ ok: true });
  });

  it('rechaza horarios que no inician en punto', () => {
    expect(checkCollision(input({ startAt: new Date(2030, 0, 7, 10, 30) }))).toEqual(reason('invalid_slot'));
  });

  it('rechaza segundos/milisegundos residuales', () => {
    expect(checkCollision(input({ startAt: new Date(2030, 0, 7, 10, 0, 0, 5) }))).toEqual(reason('invalid_slot'));
  });

  it('rechaza horarios en el pasado', () => {
    expect(checkCollision(input({ now: new Date(2030, 0, 8) }))).toEqual(reason('past_slot'));
  });

  it('rechaza el instante exacto de "ahora"', () => {
    expect(checkCollision(input({ now: MONDAY_10 }))).toEqual(reason('past_slot'));
  });

  it('rechaza un día en que el profesor no atiende', () => {
    expect(checkCollision(input({ availability: [{ ...WINDOW_MON, day: 2 }] }))).toEqual(
      reason('outside_availability'),
    );
  });

  it('rechaza si no hay ventanas de disponibilidad', () => {
    expect(checkCollision(input({ availability: [] }))).toEqual(reason('outside_availability'));
  });

  it('acepta el primer slot de la ventana (límite inferior)', () => {
    expect(checkCollision(input({ startAt: new Date(2030, 0, 7, 9, 0) }))).toEqual({ ok: true });
  });

  it('acepta el último slot que termina justo al cierre', () => {
    expect(checkCollision(input({ startAt: new Date(2030, 0, 7, 11, 0) }))).toEqual({ ok: true });
  });

  it('rechaza un slot que se pasaría del cierre', () => {
    expect(checkCollision(input({ startAt: new Date(2030, 0, 7, 12, 0) }))).toEqual(
      reason('outside_availability'),
    );
  });

  it('rechaza un slot antes de la apertura', () => {
    expect(checkCollision(input({ startAt: new Date(2030, 0, 7, 8, 0) }))).toEqual(
      reason('outside_availability'),
    );
  });

  it('acepta si alguna de varias ventanas cubre el slot', () => {
    const availability = [{ day: 1, start: '14:00', end: '16:00' }, WINDOW_MON];
    expect(checkCollision(input({ availability }))).toEqual({ ok: true });
  });

  it('reporta teacher_busy cuando el candado del profesor existe', () => {
    expect(checkCollision(input({ teacherLock: lock('t1') }))).toEqual(reason('teacher_busy'));
  });

  it('reporta student_busy cuando solo el estudiante tiene candado', () => {
    expect(checkCollision(input({ studentLock: lock('s1') }))).toEqual(reason('student_busy'));
  });

  it('prioriza teacher_busy si ambos candados existen', () => {
    const r = checkCollision(input({ teacherLock: lock('t1'), studentLock: lock('s1') }));
    expect(r).toEqual(reason('teacher_busy'));
  });

  it('prioriza invalid_slot sobre el resto de errores', () => {
    const r = checkCollision(
      input({ startAt: new Date(2020, 0, 1, 3, 15), teacherLock: lock('t1'), availability: [] }),
    );
    expect(r).toEqual(reason('invalid_slot'));
  });
});
