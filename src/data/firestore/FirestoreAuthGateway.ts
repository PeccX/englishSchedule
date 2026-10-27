import {
  Auth,
  User,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { AuthGateway, AuthUser, EmailInUseError, InvalidCredentialsError, NotFoundError } from '@/domain';
import { guard } from './support';

const toUser = (u: User): AuthUser => ({ uid: u.uid, email: u.email ?? '' });
const code = (e: unknown) => (e as { code?: string })?.code ?? '';

/** Firebase Auth detrás de la interfaz AuthGateway (mismo contrato que la versión en memoria). */
export class FirestoreAuthGateway implements AuthGateway {
  constructor(private readonly auth: Auth) {}

  signIn(email: string, password: string): Promise<AuthUser> {
    return guard(async () => {
      try {
        return toUser((await signInWithEmailAndPassword(this.auth, email.trim().toLowerCase(), password)).user);
      } catch (e) {
        if (['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found', 'auth/invalid-email'].includes(code(e)))
          throw new InvalidCredentialsError();
        throw e;
      }
    });
  }

  signUp(email: string, password: string): Promise<AuthUser> {
    return guard(async () => {
      try {
        return toUser((await createUserWithEmailAndPassword(this.auth, email.trim().toLowerCase(), password)).user);
      } catch (e) {
        if (code(e) === 'auth/email-already-in-use') throw new EmailInUseError();
        throw e;
      }
    });
  }

  signOut(): Promise<void> {
    return guard(() => signOut(this.auth));
  }

  sendPasswordReset(email: string): Promise<void> {
    return guard(async () => {
      try {
        await sendPasswordResetEmail(this.auth, email.trim().toLowerCase());
      } catch (e) {
        if (code(e) === 'auth/user-not-found') throw new NotFoundError('Cuenta');
        throw e;
      }
    });
  }

  currentUser(): AuthUser | null {
    return this.auth.currentUser ? toUser(this.auth.currentUser) : null;
  }
}
