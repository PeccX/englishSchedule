import { StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { colors, spacing } from './theme';

interface Props {
  message: string;
  testID: string;
  tone?: 'error' | 'success';
  onRetry?: () => void;
}

/** Retroalimentación visible ante errores, conflictos o falta de conexión. */
export function Banner({ message, testID, tone = 'error', onRetry }: Props) {
  return (
    <View testID={testID} accessibilityRole="alert" style={[styles.box, tone === 'error' ? styles.error : styles.success]}>
      <Text style={styles.text}>{message}</Text>
      {onRetry && <Button label="Reintentar" variant="secondary" testID={`${testID}-retry`} onPress={onRetry} />}
    </View>
  );
}

export const Loading = ({ testID }: { testID: string }) => (
  <Text testID={testID} style={styles.loading}>
    Cargando…
  </Text>
);

const styles = StyleSheet.create({
  box: { padding: spacing.md, borderRadius: 10, gap: spacing.sm },
  error: { backgroundColor: colors.dangerBg },
  success: { backgroundColor: colors.successBg },
  text: { color: colors.text, fontSize: 15 },
  loading: { color: colors.muted },
});
