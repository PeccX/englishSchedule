import { ValidationError } from '@/domain';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD = 6;

export const requireEmail = (email: string): string => {
  const clean = email.trim().toLowerCase();
  if (!EMAIL.test(clean)) throw new ValidationError('Ingresa un correo válido.');
  return clean;
};

export const requirePassword = (password: string): string => {
  if (password.length < MIN_PASSWORD) {
    throw new ValidationError(`La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`);
  }
  return password;
};

export const requireText = (value: string, label: string): string => {
  const clean = value.trim();
  if (!clean) throw new ValidationError(`${label} es obligatorio.`);
  return clean;
};
