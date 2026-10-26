import {
  AuthGateway,
  AuthUser,
  EmailInUseError,
  InvalidCredentialsError,
  NotFoundError,
} from '@/domain';

interface Account extends AuthUser {
  password: string;
}

export class InMemoryAuthGateway implements AuthGateway {
  private readonly accounts = new Map<string, Account>();
  private signedIn: AuthUser | null = null;
  private counter = 0;

  constructor(seedAccounts: Account[] = []) {
    seedAccounts.forEach((a) => this.accounts.set(a.email, a));
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    const account = this.accounts.get(email.trim().toLowerCase());
    if (!account || account.password !== password) throw new InvalidCredentialsError();
    return this.open(account);
  }

  async signUp(email: string, password: string): Promise<AuthUser> {
    const key = email.trim().toLowerCase();
    if (this.accounts.has(key)) throw new EmailInUseError();
    this.counter += 1;
    const account = { uid: `student-${this.counter}`, email: key, password };
    this.accounts.set(key, account);
    return this.open(account);
  }

  async signOut(): Promise<void> {
    this.signedIn = null;
  }

  async sendPasswordReset(email: string): Promise<void> {
    if (!this.accounts.has(email.trim().toLowerCase())) throw new NotFoundError('Cuenta');
  }

  currentUser(): AuthUser | null {
    return this.signedIn;
  }

  private open({ uid, email }: Account): AuthUser {
    this.signedIn = { uid, email };
    return { ...this.signedIn };
  }
}
