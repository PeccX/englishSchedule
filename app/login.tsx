import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { colors, spacing } from '@/components/theme';
import { messageOf } from '@/core/messages';
import { useServices } from '@/hooks/useServices';

type Mode = 'login' | 'register' | 'recover';

const TITLES: Record<Mode, string> = {
  login: 'Iniciar sesión',
  register: 'Crear cuenta',
  recover: 'Recuperar contraseña',
};
const SUBMIT: Record<Mode, string> = { login: 'Entrar', register: 'Registrarme', recover: 'Enviar enlace' };

export default function LoginScreen() {
  const { auth } = useServices();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'error' | 'success'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setFeedback(null);
    try {
      if (mode === 'login') await auth().signIn(email, password);
      if (mode === 'register') await auth().signUp({ name, email, password });
      if (mode === 'recover') {
        await auth().resetPassword(email);
        setFeedback({ tone: 'success', text: 'Te enviamos un enlace para restablecer tu contraseña.' });
      }
    } catch (e) {
      setFeedback({ tone: 'error', text: messageOf(e) });
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setFeedback(null);
  };

  return (
    <Screen testID="screen-login" title={TITLES[mode]}>
      {mode === 'register' && <TextField testID="auth-name" label="Nombre" value={name} onChangeText={setName} />}
      <TextField
        testID="auth-email"
        label="Correo"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      {mode !== 'recover' && (
        <TextField testID="auth-password" label="Contraseña" secureTextEntry value={password} onChangeText={setPassword} />
      )}
      {feedback && <Banner testID="auth-feedback" tone={feedback.tone} message={feedback.text} />}
      <Button testID="auth-submit" label={busy ? 'Un momento…' : SUBMIT[mode]} disabled={busy} onPress={submit} />
      <View style={styles.links}>
        {mode !== 'login' && <Button testID="auth-mode-login" variant="secondary" label="Ya tengo cuenta" onPress={() => switchMode('login')} />}
        {mode !== 'register' && <Button testID="auth-mode-register" variant="secondary" label="Crear cuenta" onPress={() => switchMode('register')} />}
        {mode !== 'recover' && <Button testID="auth-mode-recover" variant="secondary" label="Olvidé mi contraseña" onPress={() => switchMode('recover')} />}
      </View>
      <Text style={styles.hint}>Demo: demo@english.com / demo1234</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  links: { gap: spacing.sm },
  hint: { color: colors.muted, textAlign: 'center' },
});
