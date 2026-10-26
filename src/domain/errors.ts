export class DomainError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class SlotTakenError extends DomainError {
  constructor() {
    super('slot_taken', 'Este horario ya fue tomado por otro estudiante.');
  }
}
export class StudentBusyError extends DomainError {
  constructor() {
    super('student_busy', 'Ya tienes otra lección en ese horario.');
  }
}
export class OutsideAvailabilityError extends DomainError {
  constructor() {
    super('outside_availability', 'El profesor no atiende en ese horario.');
  }
}
export class PastSlotError extends DomainError {
  constructor() {
    super('past_slot', 'No puedes agendar una lección en el pasado.');
  }
}
export class InvalidSlotError extends DomainError {
  constructor() {
    super('invalid_slot', 'El horario debe iniciar en punto.');
  }
}
export class NotFoundError extends DomainError {
  constructor(what = 'Recurso') {
    super('not_found', `${what} no encontrado.`);
  }
}
export class InvalidStateError extends DomainError {
  constructor(message = 'La lección no se puede modificar en su estado actual.') {
    super('invalid_state', message);
  }
}
export class ForbiddenError extends DomainError {
  constructor() {
    super('forbidden', 'No tienes permiso para esta acción.');
  }
}
export class NotAuthenticatedError extends DomainError {
  constructor() {
    super('not_authenticated', 'Inicia sesión para continuar.');
  }
}
export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('invalid_credentials', 'Correo o contraseña incorrectos.');
  }
}
export class EmailInUseError extends DomainError {
  constructor() {
    super('email_in_use', 'Ya existe una cuenta con ese correo.');
  }
}
export class ValidationError extends DomainError {
  constructor(message: string) {
    super('validation', message);
  }
}
export class OfflineError extends DomainError {
  constructor() {
    super('offline', 'Sin conexión. Revisa tu red e intenta de nuevo.');
  }
}
