export type DataMode = 'memory' | 'firestore';

export interface AppConfig {
  dataMode: DataMode;
  demoRace: boolean;
}

// Expo solo inyecta EXPO_PUBLIC_* con acceso literal (process.env.NOMBRE), no con el objeto entero.
const publicEnv = (): Record<string, string | undefined> => ({
  EXPO_PUBLIC_DATA_MODE: process.env.EXPO_PUBLIC_DATA_MODE,
  EXPO_PUBLIC_DEMO_RACE: process.env.EXPO_PUBLIC_DEMO_RACE,
  EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
});

/** Firestore solo se activa si se pide explícitamente y hay credenciales. */
export function readConfig(env: Record<string, string | undefined> = publicEnv()): AppConfig {
  const wantsFirestore = env.EXPO_PUBLIC_DATA_MODE === 'firestore';
  const hasCredentials = Boolean(env.EXPO_PUBLIC_FIREBASE_API_KEY);
  return {
    dataMode: wantsFirestore && hasCredentials ? 'firestore' : 'memory',
    demoRace: env.EXPO_PUBLIC_DEMO_RACE === '1',
  };
}
