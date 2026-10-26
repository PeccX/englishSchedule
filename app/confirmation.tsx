import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { Banner, Loading } from '@/components/Banner';
import { Button } from '@/components/Button';
import { LessonCard } from '@/components/LessonCard';
import { Screen } from '@/components/Screen';
import { colors } from '@/components/theme';
import { useAsync } from '@/hooks/useAsync';
import { useBookingDraft } from '@/hooks/useBookingDraft';
import { useLessonLabels } from '@/hooks/useLessonLabels';
import { useServices } from '@/hooks/useServices';
import { useSession } from '@/hooks/useSession';

const FALLBACK = 'Este horario ya fue tomado por otro estudiante. Elige otro horario.';

export default function ConfirmationScreen() {
  const router = useRouter();
  const { status, lessonId, message } = useLocalSearchParams<{ status?: string; lessonId?: string; message?: string }>();
  const { update } = useBookingDraft();
  const { lessons } = useServices();
  const studentId = useSession()?.user.uid ?? '';
  const success = status === 'success' && Boolean(lessonId);

  const lesson = useAsync(async () => (success ? lessons().get(studentId, lessonId!) : undefined), [lessonId, studentId]);
  const labels = useLessonLabels(lesson.data ? [lesson.data] : []);

  if (!success) {
    return (
      <Screen testID="screen-confirmation" title="Horario no disponible">
        <Banner testID="confirmation-conflict" message={message || FALLBACK} />
        <Button
          testID="confirmation-retry"
          label="Elegir otro horario"
          onPress={() => {
            update({ startAt: undefined });
            router.replace('/book');
          }}
        />
        <Button testID="confirmation-home" variant="secondary" label="Ir al inicio" onPress={() => router.replace('/')} />
      </Screen>
    );
  }

  return (
    <Screen testID="screen-confirmation" title="¡Lección confirmada!">
      <Text testID="confirmation-success" style={styles.success}>
        Tu lección quedó agendada.
      </Text>
      {lesson.error && <Banner testID="confirmation-error" message={lesson.error} onRetry={lesson.reload} />}
      {!lesson.data && !lesson.error && <Loading testID="confirmation-loading" />}
      {lesson.data && <LessonCard lesson={lesson.data} labels={labels.data} />}
      <Button testID="confirmation-go-lessons" label="Ver mis lecciones" onPress={() => router.replace('/lessons')} />
      <Button testID="confirmation-home" variant="secondary" label="Ir al inicio" onPress={() => router.replace('/')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  success: { color: colors.success, fontSize: 16, fontWeight: '600' },
});
