import { AppConfig, readConfig } from '@/core/config';
import type { FirebaseClients } from './firestore/firebase';
import { InMemoryStore } from './inmemory/InMemoryStore';
import { seedStore } from './seed/seed';

/**
 * Singleton: única instancia del acceso a datos (almacén en memoria sembrado y, en modo
 * firestore, los clientes de Firestore/Auth). Constructor privado.
 */
export class Database {
  private static instance: Database | null = null;
  readonly store: InMemoryStore;
  private clients: FirebaseClients | null = null;

  private constructor(readonly config: AppConfig) {
    this.store = new InMemoryStore();
    seedStore(this.store);
  }

  static getInstance(config: AppConfig = readConfig()): Database {
    return (Database.instance ??= new Database(config));
  }

  /** Clientes de Firebase: se crean una sola vez y solo cuando el modo es firestore. */
  firebase(): FirebaseClients {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- carga diferida: memory no necesita Firebase
    return (this.clients ??= (require('./firestore/firebase') as typeof import('./firestore/firebase')).createFirebaseClients());
  }

  /** Solo para pruebas: descarta la instancia y sus datos. */
  static reset(): void {
    Database.instance = null;
  }
}
