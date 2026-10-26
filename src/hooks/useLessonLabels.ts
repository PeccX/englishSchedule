import { Lesson } from '@/domain';
import { useServices } from './useServices';
import { useAsync } from './useAsync';

export interface LessonLabels {
  teacher: Record<string, string>;
  course: Record<string, string>;
  level: Record<string, string>;
}

/** Resuelve nombres de profesor, curso y nivel para mostrar las lecciones. */
export function useLessonLabels(lessons: Lesson[] | undefined) {
  const { catalog } = useServices();
  const key = (lessons ?? []).map((l) => l.id).join(',');
  return useAsync<LessonLabels>(
    async () => {
      const service = catalog();
      const list = lessons ?? [];
      const courses = await service.listCourses();
      const levels = (await Promise.all(courses.map((c) => service.listLevels(c.id)))).flat();
      const teacherIds = [...new Set(list.map((l) => l.teacherId))];
      const teachers = await Promise.all(teacherIds.map((id) => service.getTeacher(id)));
      return {
        course: Object.fromEntries(courses.map((c) => [c.id, c.name])),
        level: Object.fromEntries(levels.map((l) => [l.id, l.name])),
        teacher: Object.fromEntries(teachers.flatMap((t) => (t ? [[t.id, t.name]] : []))),
      };
    },
    [key],
  );
}
