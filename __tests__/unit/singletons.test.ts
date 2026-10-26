import { SessionManager } from '@/core/SessionManager';
import { Database } from '@/data/Database';

beforeEach(() => {
  Database.reset();
  SessionManager.reset();
});

describe('Database (Singleton)', () => {
  it('getInstance devuelve siempre la misma instancia', () => {
    expect(Database.getInstance()).toBe(Database.getInstance());
  });

  it('el constructor es privado y la siembra ocurre una sola vez', () => {
    const db = Database.getInstance();
    db.store.courses.clear();
    expect(Database.getInstance().store.courses.size).toBe(0);
  });

  it('reset crea una instancia nueva con datos semilla', () => {
    const first = Database.getInstance();
    Database.reset();
    const second = Database.getInstance();
    expect(second).not.toBe(first);
    expect(second.store.courses.size).toBeGreaterThan(0);
  });

  it('usa modo memory por defecto', () => {
    expect(Database.getInstance().config.dataMode).toBe('memory');
  });
});

describe('SessionManager (Singleton)', () => {
  it('comparte la sesión entre llamadas a getInstance', () => {
    SessionManager.getInstance().start({ uid: 'u1', email: 'a@b.c' }, null);
    expect(SessionManager.getInstance().isAuthenticated).toBe(true);
    expect(SessionManager.getInstance().current?.user.uid).toBe('u1');
  });

  it('notifica a los suscriptores y permite darse de baja', () => {
    const listener = jest.fn();
    const unsubscribe = SessionManager.getInstance().subscribe(listener);
    SessionManager.getInstance().start({ uid: 'u1', email: 'a@b.c' }, null);
    SessionManager.getInstance().clear();
    unsubscribe();
    SessionManager.getInstance().start({ uid: 'u2', email: 'x@y.z' }, null);
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith(null);
  });
});
