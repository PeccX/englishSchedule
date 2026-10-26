import { SessionManager } from '@/core/SessionManager';
import { AuthGateway, Student, StudentRepository, ValidationError } from '@/domain';
import { requireEmail, requirePassword, requireText } from './validation';

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export type ProfileChanges = Pick<Student, 'name' | 'phone' | 'currentLevel'>;

/** Caso de uso: registro, acceso y perfil del estudiante. */
export class AuthService {
  constructor(
    private readonly gateway: AuthGateway,
    private readonly students: StudentRepository,
    private readonly session: SessionManager = SessionManager.getInstance(),
  ) {}

  async signIn(email: string, password: string): Promise<Student | null> {
    const user = await this.gateway.signIn(requireEmail(email), requireText(password, 'La contraseña'));
    const student = await this.students.get(user.uid);
    this.session.start(user, student);
    return student;
  }

  async signUp(input: SignUpInput): Promise<Student> {
    const name = requireText(input.name, 'El nombre');
    const email = requireEmail(input.email);
    const user = await this.gateway.signUp(email, requirePassword(input.password));
    const student: Student = { id: user.uid, name, email, phone: input.phone?.trim() ?? '', currentLevel: 'A1' };
    await this.students.save(student);
    this.session.start(user, student);
    return student;
  }

  async signOut(): Promise<void> {
    await this.gateway.signOut();
    this.session.clear();
  }

  resetPassword(email: string): Promise<void> {
    return this.gateway.sendPasswordReset(requireEmail(email));
  }

  async updateProfile(changes: ProfileChanges): Promise<Student> {
    const current = this.session.current?.student;
    if (!current) throw new ValidationError('No hay un perfil de estudiante cargado.');
    const updated = { ...current, ...changes, name: requireText(changes.name, 'El nombre') };
    await this.students.save(updated);
    this.session.updateStudent(updated);
    return updated;
  }
}
