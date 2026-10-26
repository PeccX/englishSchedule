import { useRouter } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { SlotPicker } from '@/components/SlotPicker';
import { formatDateTime } from '@/components/format';
import { colors } from '@/components/theme';
import { useBookingDraft } from '@/hooks/useBookingDraft';

export default function CalendarScreen() {
  const router = useRouter();
  const { draft, update } = useBookingDraft();

  return (
    <Screen testID="screen-calendar" title="Calendario">
      {!draft.teacher ? (
        <>
          <Text testID="calendar-empty" style={styles.muted}>
            Elige curso, nivel y profesor para ver su calendario.
          </Text>
          <Button testID="calendar-go-book" label="Elegir profesor" onPress={() => router.push('/book')} />
        </>
      ) : (
        <>
          <Text testID="calendar-teacher" style={styles.text}>
            Profesor: {draft.teacher.name}
          </Text>
          <SlotPicker teacherId={draft.teacher.id} selected={draft.startAt} onSelect={(startAt) => update({ startAt })} />
          {draft.startAt && (
            <>
              <Text testID="calendar-selected" style={styles.text}>
                Seleccionado: {formatDateTime(draft.startAt)}
              </Text>
              <Button testID="calendar-continue" label="Continuar a agendar" onPress={() => router.push('/book')} />
            </>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  muted: { color: colors.muted },
  text: { color: colors.text, fontSize: 15 },
});
