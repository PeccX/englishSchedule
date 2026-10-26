import { AppConfig, readConfig } from '@/core/config';
import { InMemoryStore } from './inmemory/InMemoryStore';
import { seedStore } from './seed/seed';

/**
 * Singleton: única instancia del acceso a datos (almacén en memoria sembrado hoy;
 * cliente Firestore/Auth cuando se active ese modo). Constructor privado.
 */
export class Database {
  private static instance: Database | null = null;
  readonly store: InMemoryStore;

  private constructor(readonly config: AppConfig) {
    this.store = new InMemoryStore();
    seedStore(this.store);
  }

  static getInstance(config: AppConfig = readConfig()): Database {
    return (Database.instance ??= new Database(config));
  }

  /** Solo para pruebas: descarta la instancia y sus datos. */
  static reset(): void {
    Database.instance = null;
  }
}
