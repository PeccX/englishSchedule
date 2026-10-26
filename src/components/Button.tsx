import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, spacing } from './theme';

interface Props {
  label: string;
  onPress: () => void;
  testID: string;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

export function Button({ label, onPress, testID, variant = 'primary', disabled = false }: Props) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.base, styles[variant], disabled && styles.disabled]}
    >
      <Text style={[styles.label, variant === 'secondary' && styles.labelSecondary]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderRadius: 10, alignItems: 'center' },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.primary },
  danger: { backgroundColor: colors.danger },
  disabled: { backgroundColor: colors.disabled, borderColor: colors.disabled },
  label: { color: colors.primaryText, fontWeight: '600', fontSize: 16 },
  labelSecondary: { color: colors.primary },
});
