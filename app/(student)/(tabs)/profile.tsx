import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CalendarDays, CreditCard, LogOut, MessageCircle, Save } from 'lucide-react-native';
import { Screen } from '@/components/Screen';
import { AppStateView } from '@/components/AppStateView';
import { Card, MenuRow, PageHeader } from '@/components/ui';
import { useStudentProfile } from '@/features/queries';
import { api, getApiErrorMessage } from '@/lib/api';
import { initials } from '@/lib/format';
import { useAuthStore } from '@/store/auth';
import { colors, radius, spacing } from '@/theme/tokens';
import type { StudentProfile } from '@/types/models';

export default function StudentProfileScreen() {
  const profile = useStudentProfile();
  if (profile.isLoading) return <AppStateView kind="loading" />;
  if (profile.isError || !profile.data) return <AppStateView kind="error" message="Не удалось загрузить профиль." onRetry={() => void profile.refetch()} />;
  return <StudentProfileContent student={profile.data} />;
}

function StudentProfileContent({ student }: { student: StudentProfile }) {
  const logout = useAuthStore((state) => state.logout);
  const client = useQueryClient();
  const [fullName, setFullName] = useState(student.fullName ?? '');
  const [phone, setPhone] = useState(student.phone ?? '');
  const [message, setMessage] = useState('');
  const update = useMutation({
    mutationFn: () => api.patch('/students/me', { fullName: fullName.trim(), phone: phone.trim() || undefined }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['student-profile'] });
      setMessage('Данные сохранены');
    },
    onError: (error) => setMessage(getApiErrorMessage(error, 'Не удалось сохранить изменения')),
  });

  return (
    <Screen keyboard>
      <PageHeader kicker="МОЙ КАБИНЕТ" title="Профиль" subtitle="Личные данные и настройки приложения." />
      <View style={styles.identity}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{initials(student.fullName)}</Text></View>
        <Text style={styles.name}>{student.fullName}</Text>
        <Text style={styles.group}>{student.group?.name ?? 'Без группы'}</Text>
      </View>

      <Card style={styles.form}>
        <Text style={styles.label}>Имя и фамилия</Text>
        <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Имя ученика" placeholderTextColor={colors.inkMuted} />
        <Text style={styles.label}>Номер телефона</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+998" placeholderTextColor={colors.inkMuted} />
        {message ? <Text style={[styles.message, message === 'Данные сохранены' && styles.success]}>{message}</Text> : null}
        <Pressable style={styles.save} onPress={() => update.mutate()} disabled={update.isPending}>
          {update.isPending ? <ActivityIndicator color={colors.white} /> : <><Save color={colors.white} size={18} /><Text style={styles.saveText}>Сохранить</Text></>}
        </Pressable>
      </Card>

      <View style={styles.menu}>
        <MenuRow icon={CalendarDays} title="Расписание" subtitle="Дни и время занятий" onPress={() => router.push('/(student)/schedule')} color={colors.blue} />
        <MenuRow icon={CreditCard} title="Оплата" subtitle="Статус и история" onPress={() => router.push('/(student)/payment')} color={colors.teal} />
        <MenuRow icon={Bell} title="Уведомления" subtitle="Все важные события" onPress={() => router.push('/(student)/notifications')} color={colors.clay} />
        <MenuRow icon={MessageCircle} title="Telegram" subtitle="Дополнительный канал" onPress={() => router.push('/(student)/telegram')} color={colors.blue} />
      </View>

      <Pressable style={styles.logout} onPress={() => { void logout().then(() => router.replace('/(auth)/login')); }}>
        <LogOut color={colors.danger} size={19} />
        <Text style={styles.logoutText}>Выйти из аккаунта</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: { alignItems: 'center', marginBottom: spacing.xl },
  avatar: { width: 82, height: 82, alignItems: 'center', justifyContent: 'center', borderRadius: 28, backgroundColor: colors.wool },
  avatarText: { color: colors.white, fontSize: 27, fontWeight: '900' },
  name: { marginTop: spacing.sm, color: colors.ink, fontSize: 21, fontWeight: '900' },
  group: { marginTop: 3, color: colors.inkSecondary, fontSize: 12 },
  form: { gap: spacing.xs },
  label: { marginTop: spacing.xs, color: colors.inkSecondary, fontSize: 11, fontWeight: '800' },
  input: { minHeight: 50, paddingHorizontal: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, backgroundColor: colors.background, color: colors.ink, fontSize: 15 },
  message: { marginTop: 5, color: colors.danger, fontSize: 12 },
  success: { color: colors.success },
  save: { minHeight: 50, marginTop: spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, borderRadius: radius.sm, backgroundColor: colors.blue },
  saveText: { color: colors.white, fontSize: 14, fontWeight: '900' },
  menu: { marginTop: spacing.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md },
  logout: { minHeight: 54, marginTop: spacing.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, borderRadius: radius.sm, backgroundColor: '#FFF0F0' },
  logoutText: { color: colors.danger, fontSize: 14, fontWeight: '900' },
});
