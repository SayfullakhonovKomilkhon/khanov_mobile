import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, ShieldCheck, Unlink } from 'lucide-react-native';
import { Screen } from '@/components/Screen';
import { AppStateView } from '@/components/AppStateView';
import { Card, PageHeader, StatusChip } from '@/components/ui';
import { api } from '@/lib/api';
import type { ApiEnvelope } from '@/types/api';
import { colors, radius, spacing } from '@/theme/tokens';

type TelegramStatus = { linked: boolean };
type TelegramCode = { code: string; botUsername: string };

export function TelegramScreen() {
  const client = useQueryClient();
  const status = useQuery({ queryKey: ['telegram-status'], queryFn: () => api.get<ApiEnvelope<TelegramStatus>>('/telegram/status').then((response) => response.data.data) });
  const generate = useMutation({ mutationFn: () => api.post<ApiEnvelope<TelegramCode>>('/telegram/generate-code').then((response) => response.data.data), onSuccess: (data) => void Linking.openURL(`https://t.me/${data.botUsername}?start=${data.code}`) });
  const unlink = useMutation({ mutationFn: () => api.post('/telegram/unlink'), onSuccess: () => client.invalidateQueries({ queryKey: ['telegram-status'] }) });
  if (status.isLoading) return <AppStateView kind="loading" />;
  return (
    <Screen>
      <PageHeader kicker="НАСТРОЙКИ" title="Telegram" subtitle="Дополнительный канал уведомлений KhanovMath Academy." />
      <Card style={styles.statusCard}>
        <View style={styles.icon}><MessageCircle color={colors.blue} size={30} /></View>
        <Text style={styles.title}>{status.data?.linked ? 'Telegram подключён' : 'Подключите Telegram'}</Text>
        <Text style={styles.text}>{status.data?.linked ? 'Бот может отправлять вам дополнительные уведомления.' : 'Нажмите кнопку — откроется бот, который безопасно свяжет ваш аккаунт.'}</Text>
        <StatusChip label={status.data?.linked ? 'Подключено' : 'Не подключено'} tone={status.data?.linked ? 'success' : 'warning'} />
      </Card>
      <View style={styles.security}><ShieldCheck color={colors.teal} size={20} /><Text style={styles.securityText}>Код одноразовый. Бот не получает ваш пароль.</Text></View>
      {status.data?.linked ? <Pressable style={[styles.button, styles.unlink]} onPress={() => unlink.mutate()}><Unlink color={colors.danger} size={18} /><Text style={styles.unlinkText}>Отключить Telegram</Text></Pressable> : <Pressable style={styles.button} onPress={() => generate.mutate()}><MessageCircle color={colors.white} size={18} /><Text style={styles.buttonText}>Открыть Telegram-бота</Text></Pressable>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  statusCard: { alignItems: 'center', paddingVertical: spacing.xxl },
  icon: { width: 68, height: 68, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: '#EDF1FF' },
  title: { marginTop: spacing.md, color: colors.ink, fontSize: 20, fontWeight: '900' },
  text: { marginVertical: spacing.sm, color: colors.inkSecondary, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  security: { marginTop: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.sm, backgroundColor: '#E8F5F2' },
  securityText: { flex: 1, color: colors.teal, fontSize: 12, lineHeight: 18, fontWeight: '700' },
  button: { minHeight: 54, marginTop: spacing.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, borderRadius: radius.sm, backgroundColor: colors.blue },
  buttonText: { color: colors.white, fontSize: 14, fontWeight: '900' },
  unlink: { backgroundColor: '#FFF0F0' },
  unlinkText: { color: colors.danger, fontSize: 14, fontWeight: '900' },
});
