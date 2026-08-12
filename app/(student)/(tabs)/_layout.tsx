import { Tabs } from 'expo-router';
import { BarChart3, BookOpen, Home, Trophy, UserRound } from 'lucide-react-native';
import { AnimatedTabBar } from '@/components/AnimatedTabBar';
import { colors } from '@/theme/tokens';

export default function StudentTabs() {
  return (
    <Tabs
      tabBar={(props) => (
        <AnimatedTabBar
          {...props}
          floating
          accent={colors.ink}
          activeBackground="rgba(239,142,56,0.12)"
        />
      )}
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Главная', tabBarIcon: ({ color }) => <Home color={color} size={21} /> }} />
      <Tabs.Screen name="homework" options={{ title: 'ДЗ', tabBarIcon: ({ color }) => <BookOpen color={color} size={21} /> }} />
      <Tabs.Screen name="achievements" options={{ title: 'Награды', tabBarIcon: ({ color }) => <Trophy color={color} size={21} /> }} />
      <Tabs.Screen name="grades" options={{ title: 'Рейтинг', tabBarIcon: ({ color }) => <BarChart3 color={color} size={21} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Профиль', tabBarIcon: ({ color }) => <UserRound color={color} size={21} /> }} />
    </Tabs>
  );
}
