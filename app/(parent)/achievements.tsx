import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { AppStateView } from '@/components/AppStateView';
import { ChildSelector } from '@/components/ChildSelector';
import { Card, PageHeader, SectionTitle, StatCard } from '@/components/ui';
import { useParentAchievements, useParentProfile } from '@/features/queries';
import { colors, radius, spacing } from '@/theme/tokens';

const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
const SPECIAL: Record<string, string> = { first_step: 'Первый шаг', iron_attendance: 'Железная посещаемость', perfect_100: 'Идеальные 100', three_months: 'Три месяца', quiet_hero: 'Тихий герой', year_legend: 'Легенда года', no_miss: 'Без пропусков' };

export default function ParentAchievementsScreen() {
  const profile = useParentProfile();
  const query = useParentAchievements(profile.selectedId);
  if (profile.isLoading || query.isLoading) return <AppStateView kind="loading" />;
  if (profile.isError || query.isError) return <AppStateView kind="error" message="Не удалось загрузить достижения." onRetry={() => { void profile.refetch(); void query.refetch(); }} />;
  const medals = query.data?.monthGrid ?? [];
  const stats = query.data?.stats;
  return (
    <Screen>
      <PageHeader kicker="ПРОГРЕСС" title="Достижения" subtitle="Медали и особые награды выбранного ребёнка." />
      <ChildSelector items={profile.children} selectedId={profile.selectedId} onSelect={profile.selectChild} />
      <View style={styles.stats}><StatCard value={stats?.goldCount ?? 0} label="Золото" tone="#E9A400" /><StatCard value={stats?.silverCount ?? 0} label="Серебро" tone="#7B8496" /><StatCard value={stats?.bronzeCount ?? 0} label="Бронза" tone="#B16B3B" /></View>
      <SectionTitle title="Медали по месяцам" />
      <View style={styles.grid}>{Array.from({ length: 12 }, (_, index) => medals.find((medal) => medal.month === index + 1) ?? { month: index + 1, unlocked: false }).map((medal) => <View key={medal.month} style={[styles.medal, medal.unlocked && styles.unlocked]}><Text style={[styles.icon, !medal.unlocked && styles.locked]}>{medal.unlocked ? medal.place === 1 ? '🥇' : medal.place === 2 ? '🥈' : '🥉' : '🔒'}</Text><Text style={styles.month}>{MONTHS[medal.month - 1]}</Text></View>)}</View>
      <SectionTitle title="Особые достижения" />
      {(query.data?.specialAchievements ?? []).map((item) => <Card key={item.key} style={[styles.special, !item.unlocked && styles.specialLocked]}><Text style={[styles.specialIcon, !item.unlocked && styles.locked]}>⭐</Text><View><Text style={styles.specialTitle}>{SPECIAL[item.key] ?? item.key}</Text><Text style={styles.specialMeta}>{item.unlocked ? 'Получено' : 'Пока не открыто'}</Text></View></Card>)}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: spacing.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  medal: { width: '23%', minHeight: 86, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm, backgroundColor: '#EFF0F5', borderWidth: 1, borderColor: colors.border },
  unlocked: { backgroundColor: colors.cream, borderColor: '#F7D79B' },
  icon: { fontSize: 27 },
  locked: { opacity: 0.3 },
  month: { marginTop: 4, color: colors.inkSecondary, fontSize: 10, fontWeight: '800' },
  special: { marginBottom: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  specialLocked: { backgroundColor: '#F3F4F7' },
  specialIcon: { fontSize: 29 },
  specialTitle: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  specialMeta: { marginTop: 3, color: colors.inkSecondary, fontSize: 10 },
});
