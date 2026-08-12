import { StyleSheet, Text, View } from 'react-native';
import { Megaphone, Pin } from 'lucide-react-native';
import { Screen } from '@/components/Screen';
import { AppStateView } from '@/components/AppStateView';
import { Card, EmptyInline, PageHeader, StatusChip } from '@/components/ui';
import { useAnnouncements, useMarkAnnouncementRead } from '@/features/queries';
import { relativeTime } from '@/lib/format';
import { colors, spacing } from '@/theme/tokens';

export function AnnouncementsScreen() {
  const query = useAnnouncements();
  const markRead = useMarkAnnouncementRead();
  if (query.isLoading) return <AppStateView kind="loading" />;
  if (query.isError) return <AppStateView kind="error" message="Не удалось загрузить объявления." onRetry={() => void query.refetch()} />;
  const items = query.data?.data ?? [];
  return (
    <Screen>
      <PageHeader kicker="НОВОСТИ" title="Объявления" subtitle="Важные сообщения учебного центра и вашей группы." />
      {items.map((item) => (
        <Card key={item.id} style={[styles.card, !item.isRead && styles.unread]}>
          <View style={styles.top}>
            <View style={styles.icon}><Megaphone color={colors.blue} size={19} /></View>
            <View style={styles.copy}>
              <View style={styles.titleRow}><Text style={styles.title}>{item.title}</Text>{item.isPinned ? <Pin color={colors.clay} size={14} /> : null}</View>
              <Text style={styles.meta}>{item.authorName} · {relativeTime(item.createdAt)}</Text>
            </View>
            {!item.isRead ? <StatusChip label="Новое" tone="blue" /> : null}
          </View>
          <Text style={styles.message}>{item.message}</Text>
          {item.group ? <Text style={styles.group}>Группа: {item.group.name}</Text> : null}
          {!item.isRead ? <Text style={styles.read} onPress={() => markRead.mutate(item.id)}>Отметить прочитанным</Text> : null}
        </Card>
      ))}
      {items.length === 0 ? <EmptyInline text="Новых объявлений пока нет." /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.sm },
  unread: { borderColor: '#B8C6F8', backgroundColor: '#F9FAFF' },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  icon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: '#EDF1FF' },
  copy: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  title: { flexShrink: 1, color: colors.ink, fontSize: 14, fontWeight: '900' },
  meta: { marginTop: 3, color: colors.inkSecondary, fontSize: 10 },
  message: { marginTop: spacing.md, color: colors.inkSecondary, fontSize: 13, lineHeight: 20 },
  group: { marginTop: spacing.sm, color: colors.teal, fontSize: 10, fontWeight: '800' },
  read: { marginTop: spacing.md, color: colors.blue, fontSize: 12, fontWeight: '900' },
});
