import { Tabs } from 'expo-router';

const TABS = [
  { name: 'index', title: 'Inicio', testID: 'tab-home' },
  { name: 'book', title: 'Agendar', testID: 'tab-book' },
  { name: 'calendar', title: 'Calendario', testID: 'tab-calendar' },
  { name: 'lessons', title: 'Mis lecciones', testID: 'tab-lessons' },
  { name: 'profile', title: 'Perfil', testID: 'tab-profile' },
];

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      {TABS.map((t) => (
        <Tabs.Screen key={t.name} name={t.name} options={{ title: t.title, tabBarButtonTestID: t.testID }} />
      ))}
    </Tabs>
  );
}
