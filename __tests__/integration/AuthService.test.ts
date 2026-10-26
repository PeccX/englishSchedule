import { SessionManager } from '@/core/SessionManager';
import { DEMO_STUDENT } from '@/data/seed/seed';
import { AuthGateway, StudentRepository } from '@/domain';
import { AuthService } from '@/services/AuthService';
import { makeEnv } from './helpers';

describe('AuthService con mocks', () => {
  beforeEach(() => SessionManager.reset());

  it('signUp crea el perfil y abre la sesión', async () => {
    const gateway = { signUp: jest.fn().mockResolvedValue({ uid: 'u1', email: 'a@b.co' }) } as unknown as AuthGateway;
    const save = jest.fn().mockResolvedValue(undefined);
    const service = new AuthService(gateway, { save } as unknown as StudentRepository, SessionManager.getInstance());
    const student = await service.signUp({ name: ' Ana ', email: 'A@B.co', password: 'secret1' });
    expect(gateway.signUp).toHaveBeenCalledWith('a@b.co', 'secret1');
    expect(save).toHaveBeenCalledWith(student);
    expect(student.name).toBe('Ana');
    expect(SessionManager.getInstance().current?.student).toEqual(student);
  });

  it('valida antes de llamar al gateway', async () => {
    const gateway = { signUp: jest.fn() } as unknown as AuthGateway;
    const service = new AuthService(gateway, {} as StudentRepository, SessionManager.getInstance());
    const badEmail = { name: 'A', email: 'malo', password: 'secret1' };
    const badPass = { name: 'A', email: 'a@b.co', password: '123' };
    await expect(service.signUp(badEmail)).rejects.toMatchObject({ code: 'validation' });
    await expect(service.signUp(badPass)).rejects.toMatchObject({ code: 'validation' });
    expect(gateway.signUp).not.toHaveBeenCalled();
  });
});

describe('AuthService con InMemory', () => {
  it('flujo completo: registro, cierre, acceso, perfil y recuperación', async () => {
    const auth = makeEnv().services.auth();
    await auth.signUp({ name: 'Luis', email: 'luis@mail.com', password: 'abcdef' });
    await auth.signOut();
    expect(SessionManager.getInstance().isAuthenticated).toBe(false);

    const student = await auth.signIn('luis@mail.com', 'abcdef');
    expect(student?.name).toBe('Luis');
    const updated = await auth.updateProfile({ name: 'Luis P', phone: '123', currentLevel: 'B1' });
    expect(SessionManager.getInstance().current?.student).toEqual(updated);
    await expect(auth.resetPassword('luis@mail.com')).resolves.toBeUndefined();
  });

  it('errores: credenciales, correo duplicado, cuenta inexistente', async () => {
    const auth = makeEnv().services.auth();
    await expect(auth.signIn(DEMO_STUDENT.email, 'mala-clave')).rejects.toMatchObject({ code: 'invalid_credentials' });
    const dup = { name: 'X', email: DEMO_STUDENT.email, password: 'abcdef' };
    await expect(auth.signUp(dup)).rejects.toMatchObject({ code: 'email_in_use' });
    await expect(auth.resetPassword('nadie@mail.com')).rejects.toMatchObject({ code: 'not_found' });
  });

  it('el estudiante demo semilla puede iniciar sesión', async () => {
    const student = await makeEnv().services.auth().signIn(DEMO_STUDENT.email, DEMO_STUDENT.password);
    expect(student?.id).toBe(DEMO_STUDENT.uid);
  });
});
