import { CollisionReason } from './collision';
import {
  DomainError,
  InvalidSlotError,
  OutsideAvailabilityError,
  PastSlotError,
  SlotTakenError,
  StudentBusyError,
} from './errors';

const BY_REASON: Record<CollisionReason, () => DomainError> = {
  invalid_slot: () => new InvalidSlotError(),
  past_slot: () => new PastSlotError(),
  outside_availability: () => new OutsideAvailabilityError(),
  teacher_busy: () => new SlotTakenError(),
  student_busy: () => new StudentBusyError(),
};

export const errorFor = (reason: CollisionReason): DomainError => BY_REASON[reason]();
