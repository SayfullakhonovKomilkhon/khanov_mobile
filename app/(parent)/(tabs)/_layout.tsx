import { Tabs } from 'expo-router';
import { BarChart3, CalendarCheck2, CreditCard, Home, Menu } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadows } from '@/theme/tokens';

export default function ParentTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.teal,
        tabBarInactiveTintColor: colors.inkMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '800', marginTop: 3 },
        tabBarStyle: {
          height: 64 + insets.bottom,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 8),
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          ...shadows.floating,
        },
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
