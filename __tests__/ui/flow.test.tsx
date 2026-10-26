import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import { SessionManager } from '@/core/SessionManager';
import { setServices } from '@/core/container';
import { readConfig } from '@/core/config';
import { Database } from '@/data/Database';
import { createRepositoryFactory } from '@/data/RepositoryFactory';
import { clearReadCache } from '@/hooks/useAsync';
import { ServiceFactory } from '@/services/ServiceFactory';

const boot = async (demoRace: boolean) => {
  Database.reset();
  SessionManager.reset();
  clearReadCache();
  const db = Database.getInstance({ ...readConfig({}), demoRace });
  setServices(new ServiceFactory(createRepositoryFactory(db)));
  await renderRouter('./app', { initialUrl: '/login' });
};

const login = async () => {
  await fireEvent.changeText(screen.getByTestId('auth-email'), 'demo@english.com');
  await fireEvent.changeText(screen.getByTestId('auth-password'), 'demo1234');
  await fireEvent.press(screen.getByTestId('auth-submit'));
  await screen.findByTestId('screen-home');
};

const pickTeacher = async (teacherId: string) => {
  await fireEvent.press(screen.getByTestId('home-book'));
  await fireEvent.press(await screen.findByTestId('course-course-general'));
  await fireEvent.press(await screen.findByTestId('level-level-general-a1'));
  await fireEvent.press(await screen.findByTestId(`teacher-${teacherId}`));
  const dateButton = (await screen.findAllByTestId(/^date-\d{8}$/))[0];
  await fireEvent.press(dateButton);
  await fireEvent.press(await screen.findByTestId('slot-1000'));
};

jest.setTimeout(30000);
afterAll(() => setServices(null));

describe('UI caja negra (RNTL)', () => {
  it('login con credenciales inválidas muestra error', async () => {
    await boot(false);
    await fireEvent.changeText(screen.getByTestId('auth-email'), 'demo@english.com');
    await fireEvent.changeText(screen.getByTestId('auth-password'), 'incorrecta');
    await fireEvent.press(screen.getByTestId('auth-submit'));
    expect(await screen.findByText('Correo o contraseña incorrectos.')).toBeTruthy();
  });

  it('reserva exitosa lleva a la confirmación y aparece en Mis lecciones', async () => {
    await boot(false);
    await login();
    await pickTeacher('teacher-ana');
    await fireEvent.press(screen.getByTestId('book-confirm'));
    expect(await screen.findByTestId('confirmation-success')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('confirmation-go-lessons'));
    await screen.findByTestId('screen-lessons');
    expect(await screen.findByText('Confirmada')).toBeTruthy();
  });

  it('Demo Race: otro estudiante toma el horario y se muestra el conflicto', async () => {
    await boot(true);
    await login();
    await pickTeacher('teacher-demo-race');
    await fireEvent.press(screen.getByTestId('book-confirm'));
    expect(await screen.findByTestId('confirmation-conflict')).toBeTruthy();
    expect(screen.getByText(/ya fue tomado por otro estudiante/i)).toBeTruthy();
    await fireEvent.press(screen.getByTestId('confirmation-retry'));
    await screen.findByTestId('screen-book');
    await waitFor(() => expect(screen.queryByTestId('book-summary')).toBeNull());
  });

  it('cancelar una lección la mueve al historial como Cancelada', async () => {
    await boot(false);
    await login();
    await pickTeacher('teacher-ana');
    await fireEvent.press(screen.getByTestId('book-confirm'));
    await screen.findByTestId('confirmation-success');
    await fireEvent.press(screen.getByTestId('confirmation-go-lessons'));
    const cancel = await screen.findByTestId(/^lesson-cancel-lesson-/);
    await fireEvent.press(cancel);
    await fireEvent.press(await screen.findByTestId(/^cancel-yes-/));
    expect(await screen.findByText('Cancelada')).toBeTruthy();
    expect(await screen.findByTestId('lessons-no-upcoming')).toBeTruthy();
  });

  it('cerrar sesión regresa al login', async () => {
    await boot(false);
    await login();
    await fireEvent.press(screen.getByTestId('tab-profile'));
    await fireEvent.press(await screen.findByTestId('profile-logout'));
    expect(await screen.findByTestId('screen-login')).toBeTruthy();
  });
});
