import { Availability, Course, Level, Teacher } from '@/domain';
import { InMemoryStore } from '../inmemory/InMemoryStore';

export const DEMO_RACE_TEACHER_ID = 'teacher-demo-race';
export const DEMO_STUDENT = {
  uid: 'student-demo',
  email: 'demo@english.com',
  password: 'demo1234',
};

const LEVEL_NAMES = ['A1', 'A2', 'B1', 'B2', 'C1'];
const COURSES: Course[] = [
  { id: 'course-general', name: 'General English', description: 'Conversación y gramática del día a día.' },
  { id: 'course-business', name: 'Business English', description: 'Inglés para reuniones, correos y negociación.' },
];

const weekdays = (start: string, end: string): Availability[] =>
  [1, 2, 3, 4, 5].map((day) => ({ day, start, end }));

const levelIds = (courseId: string) => LEVEL_NAMES.map((n) => `level-${courseId.slice(7)}-${n.toLowerCase()}`);

const levelsOf = (course: Course): Level[] =>
  LEVEL_NAMES.map((name, order) => ({
    id: levelIds(course.id)[order],
    courseId: course.id,
    name,
    order,
  }));

const TEACHERS: Teacher[] = [
  {
    id: 'teacher-ana',
    name: 'Ana Rivera',
    courseIds: ['course-general'],
    levelIds: levelIds('course-general'),
    availability: weekdays('09:00', '13:00'),
  },
  {
    id: 'teacher-brian',
    name: 'Brian Cooper',
    courseIds: ['course-general', 'course-business'],
    levelIds: [...levelIds('course-general'), ...levelIds('course-business')],
    availability: weekdays('14:00', '19:00'),
  },
  {
    id: DEMO_RACE_TEACHER_ID,
    name: 'Demo Race',
    courseIds: ['course-general'],
    levelIds: levelIds('course-general'),
    availability: weekdays('09:00', '17:00'),
  },
];

export function seedStore(store: InMemoryStore): void {
  COURSES.forEach((c) => {
    store.courses.set(c.id, c);
    levelsOf(c).forEach((l) => store.levels.set(l.id, l));
  });
  TEACHERS.forEach((t) => store.teachers.set(t.id, t));
  store.students.set(DEMO_STUDENT.uid, {
    id: DEMO_STUDENT.uid,
    name: 'Estudiante Demo',
    email: DEMO_STUDENT.email,
    phone: '5555-0000',
    currentLevel: 'A1',
  });
}
