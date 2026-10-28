# englishSchedule

App móvil para agendar lecciones de inglés sin choques de horario. Hecha con React Native, Expo y TypeScript, con Firebase (Firestore y Authentication).

## Requisitos
- Node.js (versión LTS) y npm
- La app Expo Go en el celular (para probar en un dispositivo real)

## Instalación
```bash
npm install
```
El archivo `.npmrc` ya incluye `legacy-peer-deps=true` por conflictos de dependencias del SDK 58 de Expo.

## Configuración
Copia `.env.example` a `.env` y llénalo:

- `EXPO_PUBLIC_DATA_MODE=firestore` usa Firebase. Con `memory` la app corre sin internet y sin credenciales.
- `EXPO_PUBLIC_FIREBASE_*` son las credenciales de la app web del proyecto de Firebase (con Authentication por correo y contraseña, y Firestore habilitados; las reglas están en `firestore.rules`).
- `EXPO_PUBLIC_DEMO_RACE=1` activa al profesor "Demo Race", que simula a otro estudiante tomando el horario para mostrar el conflicto.

## Ejecutar
```bash
npx expo start --tunnel -c
```
Escanea el código QR con Expo Go. En modo `memory` se puede entrar con `demo@english.com` / `demo1234`; en modo `firestore` se crea una cuenta con *Registrarse*.

## Pruebas y calidad
```bash
npm test            # pruebas unitarias, de integración y de interfaz
npm run lint        # ESLint, incluye el límite de complejidad ciclomática
npm run typecheck   # verificación de tipos
```