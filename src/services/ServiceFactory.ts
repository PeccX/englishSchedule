import { SessionManager } from '@/core/SessionManager';
import { RepositoryFactory, createRepositoryFactory } from '@/data/RepositoryFactory';
import { AuthService } from './AuthService';
import { AvailabilityService } from './AvailabilityService';
import { BookingService } from './BookingService';
import { CatalogService } from './CatalogService';
import { Clock, systemClock } from './Clock';
import { LessonService } from './LessonService';

/** Construye los servicios inyectándoles las abstracciones de la fábrica de repositorios. */
export class ServiceFactory {
  constructor(
    private readonly repos: RepositoryFactory = createRepositoryFactory(),
    private readonly now: Clock = systemClock,
  ) {}

  catalog = () => new CatalogService(this.repos.courses(), this.repos.levels(), this.repos.teachers());
  availability = () => new AvailabilityService(this.repos.teachers(), this.repos.slots(), this.now);
  booking = () => new BookingService(this.repos.teachers(), this.repos.lessons(), this.now);
  lessons = () => new LessonService(this.repos.lessons(), this.now);
  auth = () => new AuthService(this.repos.auth(), this.repos.students(), SessionManager.getInstance());
}
