import { ServiceFactory } from '@/services/ServiceFactory';

let factory: ServiceFactory | null = null;

/** Punto único de composición para la UI: nadie más construye servicios ni repos. */
export const getServices = (): ServiceFactory => (factory ??= new ServiceFactory());

/** Solo para pruebas de UI: descarta la composición actual. */
export const setServices = (next: ServiceFactory | null): void => {
  factory = next;
};
