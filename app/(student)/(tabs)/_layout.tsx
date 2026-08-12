import { Tabs } from 'expo-router';
import { BarChart3, BookOpen, Home, Trophy, UserRound } from 'lucide-react-native';
import { colors, shadows } from '@/theme/tokens';

export default function StudentTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.blue,
        tabBarInactiveTintColor: colors.inkMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '800', marginTop: 3 },
        tabBarStyle: {
          height: 76,
          paddingTop: 8,
          paddingBottom: 12,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          ...shadows.floating,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Главная', tabBarIcon: ({ color }) => <Home color={color} size={21} /> }} />
      <Tabs.Screen name="homework" options={{ title: 'ДЗ', tabBarIcon: ({ color }) => <BookOpen color={color} size={21} /> }} />
      <Tabs.Screen name="grades" options={{ title: 'Оценки', tabBarIcon: ({ color }) => <BarChart3 color={color} size={21} /> }} />
      <Tabs.Screen name="achievements" options={{ title: 'Награды', tabBarIcon: ({ color }) => <Trophy color={color} size={21} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Профиль', tabBarIcon: ({ color }) => <UserRound color={color} size={21} /> }} />
    </Tabs>
  );
}
