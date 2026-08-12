import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { AppStateView } from '@/components/AppStateView';
import { Card, EmptyInline, PageHeader, ProgressBar, SectionTitle, StatusChip } from '@/components/ui';
import { useStudentGrades, useStudentRating } from '@/features/queries';
import { formatDate, lessonTypeLabel } from '@/lib/format';
import { colors, radius, spacing } from '@/theme/tokens';

export default function StudentGradesScreen() {
  const [tab, setTab] = useState<'rating' | 'grades'>('rating');
  const rating = useStudentRating('month');
  const grades = useStudentGrades();

  if (rating.isLoading || grades.isLoading) return <AppStateView kind="loading" />;
  if (rating.isError || grades.isError) return <AppStateView kind="error" message="Не удалось загрузить оценки и рейтинг." onRetry={() => { void rating.refetch(); void grades.refetch(); }} />;

  return (
    <Screen>
      <PageHeader kicker="РЕЗУЛЬТАТЫ" title="Оценки и рейтинг" subtitle="Следи за своим прогрессом и местом в группе." />
      <View style={styles.tabs}>
        <Tab active={tab === 'rating'} label="🏆 Рейтинг" onPress={() => setTab('rating')} />
        <Tab active={tab === 'grades'} label="📈 Мои оценки" onPress={() => setTab('grades')} />
      </View>

      {tab === 'rating' ? (
        <>
          <Card style={styles.placeCard}>
            <Text style={styles.placeNumber}>{rating.data?.myPlace ?? '—'}</Text>
            <View style={styles.placeCopy}>
              <Text style={styles.placeTitle}>Моё место в группе</Text>
              <Text style={styles.placeMeta}>из {rating.data?.totalStudents ?? 0} учеников · средний результат {Math.round(rating.data?.myAverageScore ?? 0)}%</Text>
            </View>
          </Card>
          <SectionTitle title="Рейтинг месяца" />
          <View style={styles.listCard}>
            {(rating.data?.rating ?? []).map((entry) => (
              <View key={entry.studentId} style={styles.ratingRow}>
                <View style={[styles.rank, entry.place <= 3 && styles.topRank]}><Text style={[styles.rankText, entry.place <= 3 && styles.topRankText]}>{entry.place}</Text></View>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle}>{entry.fullName}</Text>
                  <ProgressBar value={entry.averageScore} color={entry.place <= 3 ? colors.clay : colors.blue} />
                </View>
                <Text style={styles.score}>{Math.round(entry.averageScore)}%</Text>
              </View>
            ))}
            {(rating.data?.rating ?? []).length === 0 ? <EmptyInline text="Рейтинг ещё не сформирован." /> : null}
          </View>
        </>
      ) : (
        <>
          <SectionTitle title="Все оценки" />
          <View style={styles.listCard}>
            {(grades.data ?? []).map((grade) => (
              <View key={grade.id} style={styles.gradeRow}>
                <View style={styles.scoreCircle}><Text style={styles.scoreCircleText}>{grade.score}</Text><Text style={styles.scoreMax}>/{grade.maxScore}</Text></View>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle}>{lessonTypeLabel(grade.lessonType)}</Text>
                  <Text style={styles.rowMeta}>{formatDate(grade.date)} · {grade.groupName}</Text>
                  {grade.comment ? <Text style={styles.comment}>{grade.comment}</Text> : null}
                </View>
                <StatusChip label={`${Math.round(grade.scorePercent)}%`} tone={grade.scorePercent >= 80 ? 'success' : grade.scorePercent >= 60 ? 'warning' : 'danger'} />
              </View>
            ))}
            {(grades.data ?? []).length === 0 ? <EmptyInline text="Оценок пока нет." /> : null}
          </View>
        </>
      )}
    </Screen>
  );
}

function Tab({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return <Pressable style={[styles.tab, active && styles.tabActive]} onPress={onPress}><Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', padding: 4, borderRadius: radius.sm, backgroundColor: '#ECEEF5' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 10 },
  tabActive: { backgroundColor: colors.surface },
  tabText: { color: colors.inkSecondary, fontSize: 12, fontWeight: '800' },
  tabTextActive: { color: colors.ink },
  placeCard: { marginTop: spacing.lg, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cream },
  placeNumber: { width: 72, color: colors.clay, fontSize: 48, fontWeight: '900', textAlign: 'center' },
  placeCopy: { flex: 1 },
  placeTitle: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  placeMeta: { marginTop: 4, color: colors.inkSecondary, fontSize: 12, lineHeight: 18 },
  listCard: { overflow: 'hidden', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface },
  ratingRow: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  gradeRow: { minHeight: 82, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  rank: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: '#EEF0F6' },
  topRank: { backgroundColor: colors.cream },
  rankText: { color: colors.inkSecondary, fontWeight: '900' },
  topRankText: { color: colors.clay },
  rowCopy: { flex: 1, gap: 5 },
  rowTitle: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  rowMeta: { color: colors.inkSecondary, fontSize: 10 },
  comment: { color: colors.inkSecondary, fontSize: 11, fontStyle: 'italic' },
  score: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  scoreCircle: { width: 50, height: 50, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', paddingTop: 12, borderRadius: 15, backgroundColor: '#EDF1FF' },
  scoreCircleText: { color: colors.blue, fontSize: 18, fontWeight: '900' },
  scoreMax: { color: colors.inkMuted, fontSize: 9, fontWeight: '700' },
});
