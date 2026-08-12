import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { AppStateView } from '@/components/AppStateView';
import { ChildSelector } from '@/components/ChildSelector';
import { Card, EmptyInline, PageHeader, ProgressBar, SectionTitle, StatCard, StatusChip } from '@/components/ui';
import { useParentAttendance, useParentProfile } from '@/features/queries';
import { formatDate, lessonTypeLabel } from '@/lib/format';
import { colors, radius, spacing } from '@/theme/tokens';

const statusCopy = (status: string) => status === 'PRESENT' ? { label: 'Присутствовал', tone: 'success' as const } : status === 'LATE' ? { label: 'Опоздал', tone: 'warning' as const } : { label: 'Отсутствовал', tone: 'danger' as const };

export default function ParentAttendanceScreen() {
  const profile = useParentProfile();
  const query = useParentAttendance(profile.selectedId);
  if (profile.isLoading || query.isLoading) return <AppStateView kind="loading" />;
  if (profile.isError || query.isError) return <AppStateView kind="error" message="Не удалось загрузить посещаемость." onRetry={() => { void profile.refetch(); void query.refetch(); }} />;
  const items = query.data ?? [];
  const present = items.filter((item) => item.status === 'PRESENT').length;
  const late = items.filter((item) => item.status === 'LATE').length;
  const absent = items.filter((item) => item.status === 'ABSENT').length;
  const percent = items.length ? Math.round(((present + late) / items.length) * 100) : 0;
  return (
    <Screen>
      <PageHeader kicker="КОНТРОЛЬ" title="Посещаемость" subtitle="Визиты и пропуски выбранного ребёнка." />
      <ChildSelector items={profile.children} selectedId={profile.selectedId} onSelect={profile.selectChild} />
      <Card style={styles.hero}>
        <View style={styles.ring}><Text style={styles.percent}>{percent}%</Text></View>
        <View style={styles.heroCopy}><Text style={styles.heroTitle}>Общая посещаемость</Text><Text style={styles.heroMeta}>{present + late} из {items.length} занятий посещено</Text><View style={styles.progress}><ProgressBar value={percent} color={percent >= 90 ? colors.success : percent >= 70 ? colors.blue : colors.danger} /></View></View>
      </Card>
      <View style={styles.stats}><StatCard value={present} label="Присутствие" tone={colors.success} /><StatCard value={late} label="Опоздания" tone={colors.warning} /><StatCard value={absent} label="Пропуски" tone={colors.danger} /></View>
      <SectionTitle title="Последние занятия" />
      <View style={styles.list}>
        {items.slice(0, 30).map((item) => { const copy = statusCopy(item.status); return <View key={item.id} style={styles.row}><View style={styles.date}><Text style={styles.day}>{new Date(item.date).getDate()}</Text><Text style={styles.month}>{new Date(item.date).toLocaleDateString('ru-RU', { month: 'short' })}</Text></View><View style={styles.copy}><Text style={styles.title}>{formatDate(item.date, { weekday: 'long', day: 'numeric', month: 'long' })}</Text><Text style={styles.meta}>{lessonTypeLabel(item.lessonType)}</Text></View><StatusChip label={copy.label} tone={copy.tone} /></View>; })}
        {items.length === 0 ? <EmptyInline text="Записей о посещаемости пока нет." /> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  ring: { width: 86, height: 86, alignItems: 'center', justifyContent: 'center', borderRadius: 43, borderWidth: 9, borderColor: '#DDEAE7', backgroundColor: colors.surface },
  percent: { color: colors.teal, fontSize: 19, fontWeight: '900' },
  heroCopy: { flex: 1 },
  heroTitle: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  heroMeta: { marginTop: 4, color: colors.inkSecondary, fontSize: 11 },
  progress: { marginTop: spacing.sm },
  stats: { marginTop: spacing.md, flexDirection: 'row', gap: spacing.xs },
  list: { overflow: 'hidden', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface },
  row: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  date: { width: 42, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: colors.background },
  day: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  month: { color: colors.inkSecondary, fontSize: 8, textTransform: 'uppercase' },
  copy: { flex: 1 },
  title: { color: colors.ink, fontSize: 12, fontWeight: '800', textTransform: 'capitalize' },
  meta: { marginTop: 3, color: colors.inkSecondary, fontSize: 10 },
});
