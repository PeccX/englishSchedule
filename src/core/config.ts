export type DataMode = 'memory' | 'firestore';

export interface AppConfig {
  dataMode: DataMode;
  demoRace: boolean;
}

/** Firestore solo se activa si se pide explícitamente y hay credenciales. */
export function readConfig(env: Record<string, string | undefined> = process.env): AppConfig {
  const wantsFirestore = env.EXPO_PUBLIC_DATA_MODE === 'firestore';
  const hasCredentials = Boolean(env.EXPO_PUBLIC_FIREBASE_API_KEY);
  return {
    dataMode: wantsFirestore && hasCredentials ? 'firestore' : 'memory',
    demoRace: env.EXPO_PUBLIC_DEMO_RACE === '1',
  };
}
