import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Banner, Loading } from '@/components/Banner';
import { Button } from '@/components/Button';
import { LessonCard } from '@/components/LessonCard';
import { Screen, Section } from '@/components/Screen';
import { colors } from '@/components/theme';
import { useAsync } from '@/hooks/useAsync';
import { useLessonLabels } from '@/hooks/useLessonLabels';
import { useServices } from '@/hooks/useServices';
import { useSession } from '@/hooks/useSession';

export default function HomeScreen() {
  const router = useRouter();
  const { lessons } = useServices();
  const session = useSession();
  const studentId = session?.user.uid ?? '';
  const summary = useAsync(() => lessons().summary(studentId), [studentId]);
  const labels = useLessonLabels(summary.data?.next ? [summary.data.next] : []);
  const { reload } = summary;
  useFocusEffect(useCallback(() => reload(), [reload]));

  return (
    <Screen testID="screen-home" title={`Hola, ${session?.student?.name ?? 'estudiante'}`}>
      {summary.error && <Banner testID="home-error" message={summary.error} onRetry={summary.reload} />}
      {!summary.data && !summary.error && <Loading testID="home-loading" />}
      {summary.data && (
        <>
          <Section title="Próxima lección">
            {summary.data.next ? (
              <LessonCard lesson={summary.data.next} labels={labels.data} />
            ) : (
              <Text testID="home-no-next" style={styles.muted}>
                Aún no tienes lecciones próximas.
              </Text>
            )}
          </Section>
          <Section title="Resumen">
            <Text testID="home-upcoming-count" style={styles.text}>
              Próximas: {summary.data.upcoming}
            </Text>
            <Text testID="home-history-count" style={styles.text}>
              Historial: {summary.data.history}
            </Text>
          </Section>
        </>
      )}
      <Button testID="home-book" label="Agendar nueva lección" onPress={() => router.push('/book')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  muted: { color: colors.muted },
  text: { color: colors.text, fontSize: 15 },
});
