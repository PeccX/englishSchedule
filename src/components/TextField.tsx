import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, spacing } from './theme';

interface Props extends Pick<TextInputProps, 'keyboardType' | 'secureTextEntry' | 'autoCapitalize'> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  testID: string;
}

export function TextField({ label, testID, ...input }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput testID={testID} accessibilityLabel={label} autoCapitalize="none" style={styles.input} {...input} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  label: { color: colors.muted, fontSize: 14 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
});
