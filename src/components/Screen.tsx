import { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from './theme';

interface Props {
  title: string;
  testID: string;
  children: ReactNode;
}

export function Screen({ title, testID, children }: Props) {
  return (
    <ScrollView testID={testID} style={styles.root} contentContainerStyle={styles.content}>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      <View style={styles.body}>{children}</View>
    </ScrollView>
  );
}

export const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingTop: spacing.xl * 2, gap: spacing.lg },
  title: { fontSize: 26, fontWeight: '700', color: colors.text },
  body: { gap: spacing.lg },
  section: { gap: spacing.sm },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
});
