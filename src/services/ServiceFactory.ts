import { RepositoryFactory, createRepositoryFactory } from '@/data/RepositoryFactory';
import { CatalogService } from './CatalogService';

/** Construye los servicios inyectándoles las abstracciones de la fábrica de repositorios. */
export class ServiceFactory {
  constructor(private readonly repos: RepositoryFactory = createRepositoryFactory()) {}

  catalog = () => new CatalogService(this.repos.courses(), this.repos.levels(), this.repos.teachers());
}
