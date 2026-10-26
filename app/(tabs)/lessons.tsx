import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Banner, Loading } from '@/components/Banner';
import { Button } from '@/components/Button';
import { LessonCard } from '@/components/LessonCard';
import { Screen, Section } from '@/components/Screen';
import { colors, spacing } from '@/components/theme';
import { messageOf } from '@/core/messages';
import { Lesson } from '@/domain';
import { useAsync } from '@/hooks/useAsync';
import { useLessonLabels } from '@/hooks/useLessonLabels';
import { useServices } from '@/hooks/useServices';
import { useSession } from '@/hooks/useSession';

export default function LessonsScreen() {
  const { lessons } = useServices();
  const studentId = useSession()?.user.uid ?? '';
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pendingCancel, setPendingCancel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const data = useAsync(
    async () => {
      const service = lessons();
      const [upcoming, history] = await Promise.all([service.upcoming(studentId), service.history(studentId)]);
      return { upcoming, history };
    },
    [studentId],
  );
  const { reload } = data;
  useFocusEffect(useCallback(() => reload(), [reload]));
  const labels = useLessonLabels([...(data.data?.upcoming ?? []), ...(data.data?.history ?? [])]);

  const cancel = async (id: string) => {
    try {
      await lessons().cancel(studentId, id);
      setError(null);
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setPendingCancel(null);
      reload();
    }
  };

  const renderCard = (lesson: Lesson, cancellable: boolean) => (
    <View key={lesson.id} style={styles.item}>
      <LessonCard
        lesson={lesson}
        labels={labels.data}
        expanded={expanded === lesson.id}
        onToggle={() => setExpanded(expanded === lesson.id ? null : lesson.id)}
        onCancel={cancellable ? () => setPendingCancel(lesson.id) : undefined}
      />
      {pendingCancel === lesson.id && (
        <View testID={`cancel-confirm-${lesson.id}`} style={styles.confirm}>
          <Text style={styles.text}>¿Seguro que quieres cancelar esta lección?</Text>
          <Button testID={`cancel-yes-${lesson.id}`} variant="danger" label="Sí, cancelar" onPress={() => cancel(lesson.id)} />
          <Button testID={`cancel-no-${lesson.id}`} variant="secondary" label="Conservar" onPress={() => setPendingCancel(null)} />
        </View>
      )}
    </View>
  );

  return (
    <Screen testID="screen-lessons" title="Mis lecciones">
      {(error || data.error) && <Banner testID="lessons-error" message={(error ?? data.error)!} onRetry={reload} />}
      {!data.data && !data.error && <Loading testID="lessons-loading" />}
      {data.data && (
        <>
          <Section title="Próximas lecciones">
            {data.data.upcoming.length === 0 && (
              <Text testID="lessons-no-upcoming" style={styles.muted}>
                No tienes lecciones próximas.
              </Text>
            )}
            {data.data.upcoming.map((l) => renderCard(l, true))}
          </Section>
          <Section title="Historial">
            {data.data.history.length === 0 && (
              <Text testID="lessons-no-history" style={styles.muted}>
                Aún no hay historial.
              </Text>
            )}
            {data.data.history.map((l) => renderCard(l, false))}
          </Section>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: { gap: spacing.sm },
  confirm: { gap: spacing.sm, padding: spacing.md, backgroundColor: colors.dangerBg, borderRadius: 10 },
  muted: { color: colors.muted },
  text: { color: colors.text },
});
