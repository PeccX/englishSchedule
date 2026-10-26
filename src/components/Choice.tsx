import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, spacing } from './theme';

interface Props {
  label: string;
  testID: string;
  selected?: boolean;
  disabled?: boolean;
  hint?: string;
  onPress: () => void;
}

export function Choice({ label, testID, selected = false, disabled = false, hint, onPress }: Props) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.base, selected && styles.selected, disabled && styles.disabled]}
    >
      <Text style={[styles.label, selected && styles.labelSelected, disabled && styles.labelDisabled]}>{label}</Text>
      {hint ? <Text style={[styles.hint, selected && styles.labelSelected]}>{hint}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  disabled: { backgroundColor: colors.bg, borderStyle: 'dashed' },
  label: { color: colors.text, fontSize: 15 },
  labelSelected: { color: colors.primaryText },
  labelDisabled: { color: colors.disabled },
  hint: { color: colors.muted, fontSize: 12 },
});
