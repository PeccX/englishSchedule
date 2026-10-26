import { SessionManager } from '@/core/SessionManager';
import { AppConfig } from '@/core/config';
import { Database } from '@/data/Database';
import { createRepositoryFactory } from '@/data/RepositoryFactory';
import { ServiceFactory } from '@/services/ServiceFactory';

export const NOW = new Date(2030, 0, 1, 8, 0); // martes
export const MONDAY = (hour: number) => new Date(2030, 0, 7, hour, 0);

export function makeEnv(config: Partial<AppConfig> = {}) {
  Database.reset();
  SessionManager.reset();
  const full: AppConfig = { dataMode: 'memory', demoRace: false, ...config };
  const db = Database.getInstance(full);
  const repos = createRepositoryFactory(db);
  return { db, repos, services: new ServiceFactory(repos, () => NOW) };
}

export const draftFor = (studentId: string, teacherId: string, startAt: Date) => ({
  studentId,
  teacherId,
  courseId: 'course-general',
  levelId: 'level-general-a1',
  startAt,
});
