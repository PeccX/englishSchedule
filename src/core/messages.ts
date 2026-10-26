import { DomainError } from '@/domain';

/** Mensaje claro para el usuario ante cualquier error (Larsson: feedback transparente). */
export const messageOf = (error: unknown): string =>
  error instanceof DomainError ? error.message : 'Algo salió mal. Revisa tu conexión e intenta de nuevo.';
