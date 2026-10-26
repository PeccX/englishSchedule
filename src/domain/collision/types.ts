import { Availability, SlotLock } from '../entities';

export type CollisionReason =
  | 'invalid_slot'
  | 'past_slot'
  | 'outside_availability'
  | 'teacher_busy'
  | 'student_busy';

export type CollisionResult = { ok: true } | { ok: false; reason: CollisionReason };

export interface CollisionInput {
  startAt: Date;
  now: Date;
  availability: Availability[];
  /** Candado existente en `slots/profesorId_YYYYMMDD_HHmm` (null si está libre). */
  teacherLock: SlotLock | null;
  /** Candado existente en `studentSlots/estudianteId_YYYYMMDD_HHmm` (null si está libre). */
  studentLock: SlotLock | null;
}
