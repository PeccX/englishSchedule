import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { Choice } from '@/components/Choice';
import { Screen, Section } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { colors, spacing } from '@/components/theme';
import { messageOf } from '@/core/messages';
import { useServices } from '@/hooks/useServices';
import { useSession } from '@/hooks/useSession';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];

export default function ProfileScreen() {
  const { auth } = useServices();
  const student = useSession()?.student;
  const [name, setName] = useState(student?.name ?? '');
  const [phone, setPhone] = useState(student?.phone ?? '');
  const [level, setLevel] = useState(student?.currentLevel ?? 'A1');
  const [feedback, setFeedback] = useState<{ tone: 'error' | 'success'; text: string } | null>(null);

  const save = async () => {
    try {
      await auth().updateProfile({ name, phone, currentLevel: level });
      setFeedback({ tone: 'success', text: 'Perfil actualizado.' });
    } catch (e) {
      setFeedback({ tone: 'error', text: messageOf(e) });
    }
  };

  return (
    <Screen testID="screen-profile" title="Perfil">
      <Text testID="profile-email" style={styles.muted}>
        {student?.email}
      </Text>
      <TextField testID="profile-name" label="Nombre" autoCapitalize="words" value={name} onChangeText={setName} />
      <TextField testID="profile-phone" label="Teléfono" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <Section title="Nivel actual">
        <View style={styles.row}>
          {LEVELS.map((l) => (
            <Choice key={l} testID={`profile-level-${l}`} label={l} selected={level === l} onPress={() => setLevel(l)} />
          ))}
        </View>
      </Section>
      {feedback && <Banner testID="profile-feedback" tone={feedback.tone} message={feedback.text} />}
      <Button testID="profile-save" label="Guardar cambios" onPress={save} />
      <Button testID="profile-logout" variant="secondary" label="Cerrar sesión" onPress={() => auth().signOut()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  muted: { color: colors.muted },
});
