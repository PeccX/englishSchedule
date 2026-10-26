import { errorFor } from '@/domain/errorFor';
import { SlotTakenError, StudentBusyError } from '@/domain/errors';
import { fitsWindow, slotId, slotKey, windowStarts } from '@/domain/slot';

describe('slot helpers', () => {
  it('formatea el ID determinista profesorId_YYYYMMDD_HHmm', () => {
    expect(slotId('t1', new Date(2030, 0, 7, 9, 5))).toBe('t1_20300107_0905');
    expect(slotKey(new Date(2031, 11, 25, 23, 0))).toBe('20311225_2300');
  });

  it('genera los inicios horarios de una ventana', () => {
    expect(windowStarts({ day: 1, start: '09:00', end: '12:00' })).toEqual([540, 600, 660]);
    expect(windowStarts({ day: 1, start: '09:00', end: '09:30' })).toEqual([]);
  });

  it('fitsWindow valida día y rango', () => {
    const w = { day: 1, start: '09:00', end: '11:00' };
    expect(fitsWindow(new Date(2030, 0, 7, 10, 0), w)).toBe(true);
    expect(fitsWindow(new Date(2030, 0, 7, 11, 0), w)).toBe(false);
    expect(fitsWindow(new Date(2030, 0, 8, 10, 0), w)).toBe(false);
  });

  it('errorFor traduce razones de colisión a errores de dominio', () => {
    expect(errorFor('teacher_busy')).toBeInstanceOf(SlotTakenError);
    expect(errorFor('student_busy')).toBeInstanceOf(StudentBusyError);
  });
});
