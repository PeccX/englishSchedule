import { AuthUser, Student } from '@/domain';

export interface Session {
  user: AuthUser;
  student: Student | null;
}

type Listener = (session: Session | null) => void;

/** Singleton: mantiene la sesión del estudiante autenticado. */
export class SessionManager {
  private static instance: SessionManager | null = null;
  private session: Session | null = null;
  private listeners = new Set<Listener>();

  private constructor() {}

  static getInstance(): SessionManager {
    return (SessionManager.instance ??= new SessionManager());
  }

  /** Solo para pruebas. */
  static reset(): void {
    SessionManager.instance = null;
  }

  get current(): Session | null {
    return this.session;
  }

  get isAuthenticated(): boolean {
    return this.session !== null;
  }

  start(user: AuthUser, student: Student | null): void {
    this.set({ user, student });
  }

  updateStudent(student: Student): void {
    if (this.session) this.set({ ...this.session, student });
  }

  clear(): void {
    this.set(null);
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private set(session: Session | null): void {
    this.session = session;
    this.listeners.forEach((l) => l(session));
  }
}
