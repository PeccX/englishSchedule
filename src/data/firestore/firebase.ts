import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import * as FirebaseAuth from 'firebase/auth';
import { Firestore, getFirestore, initializeFirestore } from 'firebase/firestore';

export interface FirebaseClients {
  db: Firestore;
  auth: FirebaseAuth.Auth;
}

// Expo solo inyecta EXPO_PUBLIC_* cuando se leen con acceso literal (process.env.NOMBRE).
const firebaseConfig = () => ({
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
});

type RnPersistence = (storage: unknown) => FirebaseAuth.Persistence;
const rnPersistence = (FirebaseAuth as unknown as { getReactNativePersistence?: RnPersistence }).getReactNativePersistence;

const makeAuth = (app: FirebaseApp): FirebaseAuth.Auth => {
  try {
    return rnPersistence
      ? FirebaseAuth.initializeAuth(app, { persistence: rnPersistence(AsyncStorage) })
      : FirebaseAuth.getAuth(app);
  } catch {
    return FirebaseAuth.getAuth(app); // ya inicializado (recarga en caliente)
  }
};

const makeDb = (app: FirebaseApp): Firestore => {
  try {
    return initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
  } catch {
    return getFirestore(app);
  }
};

/** Crea (una sola vez por app) los clientes de Firestore y Auth. */
export function createFirebaseClients(): FirebaseClients {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig());
  return { db: makeDb(app), auth: makeAuth(app) };
}
