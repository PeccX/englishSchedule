import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Banner, Loading } from '@/components/Banner';
import { Button } from '@/components/Button';
import { Choice } from '@/components/Choice';
import { Screen, Section } from '@/components/Screen';
import { SlotPicker } from '@/components/SlotPicker';
import { formatDateTime } from '@/components/format';
import { colors, spacing } from '@/components/theme';
import { messageOf } from '@/core/messages';
import { SlotTakenError, StudentBusyError } from '@/domain';
import { useAsync } from '@/hooks/useAsync';
import { useBookingDraft } from '@/hooks/useBookingDraft';
import { useServices } from '@/hooks/useServices';
import { useSession } from '@/hooks/useSession';

export default function BookScreen() {
  const router = useRouter();
  const { catalog, booking } = useServices();
  const { draft, update, reset } = useBookingDraft();
  const studentId = useSession()?.user.uid ?? '';
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const courses = useAsync(() => catalog().listCourses(), [], 'courses');
  const levels = useAsync(
    async () => (draft.course ? catalog().listLevels(draft.course.id) : []),
    [draft.course?.id],
    draft.course ? `levels:${draft.course.id}` : undefined,
  );
  const teachers = useAsync(
    async () => (draft.course && draft.level ? catalog().listTeachers(draft.course.id, draft.level.id) : []),
    [draft.course?.id, draft.level?.id],
  );

  const ready = Boolean(draft.course && draft.level && draft.teacher && draft.startAt);

  const confirm = async () => {
    if (!draft.course || !draft.level || !draft.teacher || !draft.startAt) return;
    setBusy(true);
    setError(null);
    try {
      const lesson = await booking().book({
        studentId,
        teacherId: draft.teacher.id,
        courseId: draft.course.id,
        levelId: draft.level.id,
        startAt: draft.startAt,
      });
      reset();
      router.replace({ pathname: '/confirmation', params: { status: 'success', lessonId: lesson.id } });
    } catch (e) {
      if (e instanceof SlotTakenError || e instanceof StudentBusyError) {
        router.replace({ pathname: '/confirmation', params: { status: 'conflict', message: e.message } });
      } else {
        setError(messageOf(e));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen testID="screen-book" title="Agendar lección">
      <Section title="1. Curso">
        {courses.error && <Banner testID="courses-error" message={courses.error} onRetry={courses.reload} />}
        {!courses.data && !courses.error && <Loading testID="courses-loading" />}
        <View style={styles.row}>
          {(courses.data ?? []).map((c) => (
            <Choice
              key={c.id}
              testID={`course-${c.id}`}
              label={c.name}
              selected={draft.course?.id === c.id}
              onPress={() => update({ course: c, level: undefined, teacher: undefined, startAt: undefined })}
            />
          ))}
        </View>
      </Section>

      {draft.course && (
        <Section title="2. Nivel">
          <View style={styles.row}>
            {(levels.data ?? []).map((l) => (
              <Choice
                key={l.id}
                testID={`level-${l.id}`}
                label={l.name}
                selected={draft.level?.id === l.id}
                onPress={() => update({ level: l, teacher: undefined, startAt: undefined })}
              />
            ))}
          </View>
        </Section>
      )}

      {draft.level && (
        <Section title="3. Profesor">
          {teachers.data?.length === 0 && <Text style={styles.muted}>No hay profesores para este nivel.</Text>}
          <View style={styles.row}>
            {(teachers.data ?? []).map((t) => (
              <Choice
                key={t.id}
                testID={`teacher-${t.id}`}
                label={t.name}
                selected={draft.teacher?.id === t.id}
                onPress={() => update({ teacher: t, startAt: undefined })}
              />
            ))}
          </View>
        </Section>
      )}

      {draft.teacher && (
        <Section title="4. Fecha y hora">
          <SlotPicker teacherId={draft.teacher.id} selected={draft.startAt} onSelect={(startAt) => update({ startAt })} />
        </Section>
      )}

      {draft.startAt && (
        <Text testID="book-summary" style={styles.summary}>
          {draft.teacher?.name} · {formatDateTime(draft.startAt)}
        </Text>
      )}
      {error && <Banner testID="book-error" message={error} />}
      <Button testID="book-confirm" label={busy ? 'Confirmando…' : 'Confirmar lección'} disabled={!ready || busy} onPress={confirm} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  muted: { color: colors.muted },
  summary: { color: colors.text, fontWeight: '600' },
});
