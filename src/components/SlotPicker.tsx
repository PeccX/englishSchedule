import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAsync } from '@/hooks/useAsync';
import { useServices } from '@/hooks/useServices';
import { Banner, Loading } from './Banner';
import { Choice } from './Choice';
import { dateKey, formatDate, formatTime, timeKey } from './format';
import { colors, spacing } from './theme';

interface Props {
  teacherId: string;
  selected?: Date;
  onSelect: (startAt: Date) => void;
}

/** Fechas disponibles + horarios libres/ocupados de un profesor. Los ocupados no se pueden elegir. */
export function SlotPicker({ teacherId, selected, onSelect }: Props) {
  const { availability } = useServices();
  const [day, setDay] = useState<Date | undefined>(selected);
  const dates = useAsync(() => availability().availableDates(teacherId), [teacherId], `dates:${teacherId}`);
  const slots = useAsync(
    async () => (day ? availability().slotsForDay(teacherId, day) : []),
    [teacherId, day?.getTime()],
  );

  if (dates.error) return <Banner testID="dates-error" message={dates.error} onRetry={dates.reload} />;
  if (!dates.data) return <Loading testID="dates-loading" />;

  return (
    <View style={styles.wrap} testID="slot-picker">
      <Text style={styles.label}>Fechas disponibles</Text>
      <View style={styles.row}>
        {dates.data.map((d) => (
          <Choice
            key={dateKey(d)}
            testID={`date-${dateKey(d)}`}
            label={formatDate(d)}
            selected={day ? dateKey(day) === dateKey(d) : false}
            onPress={() => setDay(d)}
          />
        ))}
      </View>
      {day && (
        <>
          <Text style={styles.label}>Horarios (libres y ocupados)</Text>
          {slots.error && <Banner testID="slots-error" message={slots.error} onRetry={slots.reload} />}
          <View style={styles.row}>
            {(slots.data ?? []).map((s) => (
              <Choice
                key={timeKey(s.startAt)}
                testID={`slot-${timeKey(s.startAt)}`}
                label={formatTime(s.startAt)}
                hint={s.available ? 'Libre' : 'Ocupado'}
                disabled={!s.available}
                selected={selected?.getTime() === s.startAt.getTime()}
                onPress={() => onSelect(s.startAt)}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  label: { color: colors.muted, fontSize: 14 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
