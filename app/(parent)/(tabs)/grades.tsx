import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/components/Screen';
import { AppStateView } from '@/components/AppStateView';
import { ChildSelector } from '@/components/ChildSelector';
import { EmptyInline, PageHeader, ProgressBar, SectionTitle, StatusChip } from '@/components/ui';
import { useParentGrades, useParentProfile } from '@/features/queries';
import { formatDate, lessonTypeLabel } from '@/lib/format';
import { colors, radius, spacing } from '@/theme/tokens';

export default function ParentGradesScreen() {
  const profile = useParentProfile();
  const query = useParentGrades(profile.selectedId);
  if (profile.isLoading || query.isLoading) return <AppStateView kind="loading" />;
  if (profile.isError || query.isError) return <AppStateView kind="error" message="Не удалось загрузить оценки." onRetry={() => { void profile.refetch(); void query.refetch(); }} />;
  const items = query.data ?? [];
  const points = items.reduce((sum, item) => sum + Number(item.score || 0), 0);
  const max = items.reduce((sum, item) => sum + Number(item.maxScore || 0), 0);
  const average = max ? Math.round((points / max) * 100) : 0;
  return (
    <Screen>
      <PageHeader kicker="УСПЕВАЕМОСТЬ" title="Оценки" subtitle="Результаты тестов, контрольных и практических работ." />
      <ChildSelector items={profile.children} selectedId={profile.selectedId} onSelect={profile.selectChild} />
      <LinearGradient colors={[colors.blue, colors.wool]} style={styles.hero}>
        <Text style={styles.heroKicker}>СРЕДНИЙ РЕЗУЛЬТАТ</Text>
        <Text style={styles.heroValue}>{average}%</Text>
        <Text style={styles.heroMeta}>{points} из {max} баллов · {items.length} работ</Text>
        <View style={styles.progress}><ProgressBar value={average} color={colors.clay} /></View>
      </LinearGradient>
      <SectionTitle title="Все оценки" />
      <View style={styles.list}>
        {items.map((item) => (
          <View key={item.id} style={styles.row}>
            <View style={styles.score}><Text style={styles.scoreMain}>{item.score}</Text><Text style={styles.scoreMax}>/{item.maxScore}</Text></View>
            <View style={styles.copy}><Text style={styles.title}>{lessonTypeLabel(item.lessonType)}</Text><Text style={styles.meta}>{formatDate(item.date)} · {item.groupName}</Text>{item.comment ? <Text style={styles.comment}>{item.comment}</Text> : null}</View>
            <StatusChip label={`${Math.round(item.scorePercent)}%`} tone={item.scorePercent >= 80 ? 'success' : item.scorePercent >= 60 ? 'warning' : 'danger'} />
          </View>
        ))}
        {items.length === 0 ? <EmptyInline text="Оценок пока нет." /> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { padding: spacing.xl, borderRadius: radius.lg },
  heroKicker: { color: 'rgba(255,255,255,0.66)', fontSize: 10, fontWeight: '900', letterSpacing: 1.8 },
  heroValue: { marginTop: spacing.xs, color: colors.white, fontSize: 48, fontWeight: '900', letterSpacing: -2 },
  heroMeta: { color: 'rgba(255,255,255,0.75)', fontSize: 11 },
  progress: { marginTop: spacing.md },
  list: { overflow: 'hidden', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface },
  row: { minHeight: 82, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  score: { width: 50, height: 50, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', paddingTop: 12, borderRadius: 15, backgroundColor: '#EDF1FF' },
  scoreMain: { color: colors.blue, fontSize: 18, fontWeight: '900' },
  scoreMax: { color: colors.inkMuted, fontSize: 9 },
  copy: { flex: 1 },
  title: { color: colors.ink, fontSize: 13, fontWeight: '900' },
  meta: { marginTop: 4, color: colors.inkSecondary, fontSize: 10 },
  comment: { marginTop: 4, color: colors.inkSecondary, fontSize: 10, fontStyle: 'italic' },
});
