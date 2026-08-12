import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Award, Bell, BookOpen, LogOut, Megaphone, MessageCircle } from 'lucide-react-native';
import { Screen } from '@/components/Screen';
import { AppStateView } from '@/components/AppStateView';
import { MenuRow, PageHeader } from '@/components/ui';
import { useParentProfile } from '@/features/queries';
import { initials } from '@/lib/format';
import { useAuthStore } from '@/store/auth';
import { colors, radius, spacing } from '@/theme/tokens';

export default function ParentMoreScreen() {
  const profile = useParentProfile();
  const logout = useAuthStore((state) => state.logout);
  if (profile.isLoading) return <AppStateView kind="loading" />;
  return (
    <Screen>
      <PageHeader kicker="КАБИНЕТ" title="Ещё" subtitle="Дополнительные разделы и настройки." />
      <View style={styles.profile}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{initials(profile.data?.fullName)}</Text></View>
        <View><Text style={styles.name}>{profile.data?.fullName ?? 'Родитель'}</Text><Text style={styles.phone}>{profile.data?.phone ?? 'Телефон не указан'}</Text></View>
      </View>
      <View style={styles.menu}>
        <MenuRow icon={BookOpen} title="Домашние задания" subtitle="Задания выбранного ребёнка" color={colors.clay} onPress={() => router.push('/(parent)/homework')} />
        <MenuRow icon={Award} title="Достижения" subtitle="Медали, уровень и прогресс" color={colors.clay} onPress={() => router.push('/(parent)/achievements')} />
        <MenuRow icon={Megaphone} title="Объявления" subtitle="Новости учебного центра" color={colors.blue} onPress={() => router.push('/(parent)/announcements')} />
        <MenuRow icon={Bell} title="Уведомления" subtitle="Все важные события" color={colors.teal} onPress={() => router.push('/(parent)/notifications')} />
        <MenuRow icon={MessageCircle} title="Telegram" subtitle="Дополнительный канал" color={colors.blue} onPress={() => router.push('/(parent)/telegram')} />
      </View>
      <Pressable style={styles.logout} onPress={() => { void logout().then(() => router.replace('/(auth)/login')); }}><LogOut color={colors.danger} size={19} /><Text style={styles.logoutText}>Выйти из аккаунта</Text></Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profile: { marginBottom: spacing.xl, flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: '#E8F5F2' },
  avatar: { width: 58, height: 58, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: colors.teal },
  avatarText: { color: colors.white, fontSize: 20, fontWeight: '900' },
  name: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  phone: { marginTop: 4, color: colors.inkSecondary, fontSize: 11 },
  menu: { overflow: 'hidden', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface },
  logout: { minHeight: 54, marginTop: spacing.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, borderRadius: radius.sm, backgroundColor: '#FFF0F0' },
  logoutText: { color: colors.danger, fontSize: 14, fontWeight: '900' },
});
