import { Stack } from 'expo-router';
import { BookingDraftProvider } from '@/hooks/useBookingDraft';
import { useSession } from '@/hooks/useSession';

export default function RootLayout() {
  const authenticated = useSession() !== null;
  return (
    <BookingDraftProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!authenticated}>
          <Stack.Screen name="login" />
        </Stack.Protected>
        <Stack.Protected guard={authenticated}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="confirmation" />
        </Stack.Protected>
      </Stack>
    </BookingDraftProvider>
  );
}
