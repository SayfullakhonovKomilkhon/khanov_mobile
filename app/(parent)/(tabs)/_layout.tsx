import { Tabs } from 'expo-router';
import { BarChart3, CalendarCheck2, CreditCard, Home, Menu } from 'lucide-react-native';
import { AnimatedTabBar } from '@/components/AnimatedTabBar';
import { colors } from '@/theme/tokens';

export default function ParentTabs() {
  return (
    <Tabs
      tabBar={(props) => (
        <AnimatedTabBar {...props} accent={colors.teal} activeBackground="#E4F4F1" />
      )}
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Главная', tabBarIcon: ({ color }) => <Home color={color} size={21} /> }} />
      <Tabs.Screen name="attendance" options={{ title: 'Учёт', tabBarIcon: ({ color }) => <CalendarCheck2 color={color} size={21} /> }} />
      <Tabs.Screen name="grades" options={{ title: 'Оценки', tabBarIcon: ({ color }) => <BarChart3 color={color} size={21} /> }} />
      <Tabs.Screen name="payment" options={{ title: 'Оплата', tabBarIcon: ({ color }) => <CreditCard color={color} size={21} /> }} />
      <Tabs.Screen name="more" options={{ title: 'Ещё', tabBarIcon: ({ color }) => <Menu color={color} size={21} /> }} />
    </Tabs>
  );
}
