import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CheckCheck } from 'lucide-react-native';
import { Screen } from '@/components/Screen';
import { AppStateView } from '@/components/AppStateView';
import { EmptyInline, PageHeader } from '@/components/ui';
import { useNotificationActions, useNotifications } from '@/features/queries';
import { relativeTime } from '@/lib/format';
import { colors, radius, spacing } from '@/theme/tokens';

const FILTERS = [{ value: '', label: 'Все' }, { value: 'ACHIEVEMENT', label: 'Награды' }, { value: 'HOMEWORK', label: 'ДЗ' }, { value: 'PAYMENT', label: 'Оплата' }, { value: 'ANNOUNCEMENT', label: 'Новости' }];
const ICONS: Record<string, string> = { PAYMENT: '💳', HOMEWORK: '📚', ATTENDANCE: '📋', ACHIEVEMENT: '🏆', ANNOUNCEMENT: '📢', GRADE: '📈' };

export function NotificationsScreen() {
  const [filter, setFilter] = useState('');
  const query = useNotifications(filter || undefined);
  const actions = useNotificationActions();
  if (query.isLoading) return <AppStateView kind="loading" />;
  if (query.isError) return <AppStateView kind="error" message="Не удалось загрузить уведомления." onRetry={() => void query.refetch()} />;
  const items = query.data?.notifications ?? [];
  return (
    <Screen>
      <PageHeader kicker="СОБЫТИЯ" title="Уведомления" subtitle="Оценки, задания, оплата и важные напоминания." />
      <View style={styles.actions}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{FILTERS.map((item) => <Pressable key={item.value} style={[styles.filter, filter === item.value && styles.filterActive]} onPress={() => setFilter(item.value)}><Text style={[styles.filterText, filter === item.value && styles.filterTextActive]}>{item.label}</Text></Pressable>)}</ScrollView></View>
      {items.some((item) => !item.isRead) ? <Pressable style={styles.markAll} onPress={() => actions.markAll.mutate()}><CheckCheck color={colors.blue} size={17} /><Text style={styles.markAllText}>Прочитать всё</Text></Pressable> : null}
      <View style={styles.list}>
        {items.map((item) => (
          <Pressable key={item.id} style={[styles.item, !item.isRead && styles.unread]} onPress={() => { if (!item.isRead) actions.markRead.mutate(item.id); }}>
            <View style={styles.icon}><Text style={styles.iconText}>{ICONS[item.type] ?? '🔔'}</Text></View>
            <View style={styles.copy}><Text style={[styles.message, !item.isRead && styles.messageUnread]}>{item.message}</Text><Text style={styles.time}>{relativeTime(item.createdAt)}</Text></View>
            {!item.isRead ? <View style={styles.dot} /> : null}
          </Pressable>
        ))}
        {items.length === 0 ? <EmptyInline text="Уведомлений пока нет." /> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { marginHorizontal: -spacing.md },
  filters: { gap: spacing.xs, paddingHorizontal: spacing.md },
  filter: { paddingHorizontal: spacing.md, paddingVertical: 9, borderRadius: radius.pill, backgroundColor: '#ECEEF4' },
  filterActive: { backgroundColor: colors.blue },
  filterText: { color: colors.inkSecondary, fontSize: 11, fontWeight: '800' },
  filterTextActive: { color: colors.white },
  markAll: { alignSelf: 'flex-end', marginVertical: spacing.md, flexDirection: 'row', alignItems: 'center', gap: 5 },
  markAllText: { color: colors.blue, fontSize: 12, fontWeight: '900' },
  list: { marginTop: spacing.md, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface },
  item: { minHeight: 80, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  unread: { backgroundColor: '#F7F9FF' },
  icon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: colors.background },
  iconText: { fontSize: 21 },
  copy: { flex: 1 },
  message: { color: colors.inkSecondary, fontSize: 12, lineHeight: 18 },
  messageUnread: { color: colors.ink, fontWeight: '700' },
  time: { marginTop: 4, color: colors.inkMuted, fontSize: 9 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.blue },
});
