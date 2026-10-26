import { Course, CourseRepository, Id, Level, LevelRepository, Teacher, TeacherRepository } from '@/domain';

/** Caso de uso: consultar cursos, niveles y profesores para armar la reserva. */
export class CatalogService {
  constructor(
    private readonly courses: CourseRepository,
    private readonly levels: LevelRepository,
    private readonly teachers: TeacherRepository,
  ) {}

  listCourses(): Promise<Course[]> {
    return this.courses.list();
  }

  listLevels(courseId: Id): Promise<Level[]> {
    return this.levels.listByCourse(courseId);
  }

  listTeachers(courseId: Id, levelId: Id): Promise<Teacher[]> {
    return this.teachers.listByCourseAndLevel(courseId, levelId);
  }
}
