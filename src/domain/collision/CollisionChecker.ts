import { fitsWindow, isSlotAligned } from '../slot';
import { CollisionInput, CollisionReason, CollisionResult } from './types';

const OK: CollisionResult = { ok: true };
const fail = (reason: CollisionReason): CollisionResult => ({ ok: false, reason });

/**
 * Decide si un horario se puede reservar. Función pura (sin I/O): recibe lo leído
 * dentro de la transacción y devuelve la decisión. Cada regla es un early return.
 */
export function checkCollision(input: CollisionInput): CollisionResult {
  const { startAt, now, availability, teacherLock, studentLock } = input;
  if (!isSlotAligned(startAt)) return fail('invalid_slot');
  if (startAt.getTime() <= now.getTime()) return fail('past_slot');
  if (!availability.some((w) => fitsWindow(startAt, w))) return fail('outside_availability');
  if (teacherLock) return fail('teacher_busy');
  if (studentLock) return fail('student_busy');
  return OK;
}
