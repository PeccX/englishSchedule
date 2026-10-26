import { StyleSheet, Text, View } from 'react-native';
import { Lesson } from '@/domain';
import { LessonLabels } from '@/hooks/useLessonLabels';
import { Button } from './Button';
import { STATUS_LABEL, formatDateTime } from './format';
import { colors, spacing } from './theme';

interface Props {
  lesson: Lesson;
  labels?: LessonLabels;
  expanded?: boolean;
  onToggle?: () => void;
  onCancel?: () => void;
}

export function LessonCard({ lesson, labels, expanded = false, onToggle, onCancel }: Props) {
  const teacher = labels?.teacher[lesson.teacherId] ?? '…';
  const course = labels?.course[lesson.courseId] ?? '…';
  const level = labels?.level[lesson.levelId] ?? '…';
  return (
    <View testID={`lesson-${lesson.id}`} style={styles.card}>
      <Text style={styles.title}>{formatDateTime(lesson.startAt)}</Text>
      <Text style={styles.sub}>
        {course} · {level} · {teacher}
      </Text>
      <Text testID={`lesson-status-${lesson.id}`} style={styles.status}>
        {STATUS_LABEL[lesson.status]}
      </Text>
      {expanded && (
        <View testID={`lesson-details-${lesson.id}`} style={styles.details}>
          <Text style={styles.sub}>Profesor: {teacher}</Text>
          <Text style={styles.sub}>Curso: {course}</Text>
          <Text style={styles.sub}>Nivel: {level}</Text>
          <Text style={styles.sub}>Duración: 60 min</Text>
          <Text style={styles.sub}>Reservada: {formatDateTime(lesson.createdAt)}</Text>
        </View>
      )}
      {onToggle && (
        <Button
          variant="secondary"
          testID={`lesson-toggle-${lesson.id}`}
          label={expanded ? 'Ocultar detalles' : 'Ver detalles'}
          onPress={onToggle}
        />
      )}
      {onCancel && <Button variant="danger" testID={`lesson-cancel-${lesson.id}`} label="Cancelar lección" onPress={onCancel} />}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: { fontSize: 17, fontWeight: '600', color: colors.text },
  sub: { color: colors.muted, fontSize: 14 },
  status: { color: colors.primary, fontWeight: '600' },
  details: { gap: spacing.xs, paddingVertical: spacing.xs },
});
