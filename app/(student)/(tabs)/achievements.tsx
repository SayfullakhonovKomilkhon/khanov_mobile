import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/components/Screen';
import { AppStateView } from '@/components/AppStateView';
import { Card, PageHeader, ProgressBar, SectionTitle, StatCard } from '@/components/ui';
import { useStudentAchievements, useStudentProgress } from '@/features/queries';
import { colors, radius, spacing } from '@/theme/tokens';

const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
const SPECIAL_NAMES: Record<string, { title: string; icon: string }> = {
  first_step: { title: 'Первый шаг', icon: '🌱' },
  iron_attendance: { title: 'Железная посещаемость', icon: '🛡️' },
  perfect_100: { title: 'Идеальные 100', icon: '💯' },
  three_months: { title: 'Три месяца', icon: '🔥' },
  quiet_hero: { title: 'Тихий герой', icon: '⭐' },
  year_legend: { title: 'Легенда года', icon: '👑' },
  no_miss: { title: 'Без пропусков', icon: '🎯' },
};

export default function StudentAchievementsScreen() {
  const achievements = useStudentAchievements();
  const progress = useStudentProgress();
  if (achievements.isLoading || progress.isLoading) return <AppStateView kind="loading" />;
  if (achievements.isError) return <AppStateView kind="error" message="Не удалось загрузить достижения." onRetry={() => void achievements.refetch()} />;

  const medals = achievements.data?.monthGrid ?? [];
  const unlocked = medals.filter((medal) => medal.unlocked);
  const gold = unlocked.filter((medal) => medal.place === 1).length;
  const silver = unlocked.filter((medal) => medal.place === 2).length;
  const bronze = unlocked.filter((medal) => medal.place === 3).length;
  const xpPercent = progress.data ? (progress.data.xpInLevel / Math.max(progress.data.xpForNextLevel, 1)) * 100 : 0;

  return (
    <Screen>
      <PageHeader kicker="МОИ НАГРАДЫ" title="Достижения" subtitle="Собирай медали, повышай уровень и открывай особые награды." />
      <LinearGradient colors={[colors.clay, '#FF6F59']} style={styles.hero}>
        <Text style={styles.heroEmoji}>{progress.data?.titleEmoji ?? '🌱'}</Text>
        <Text style={styles.heroLevel}>УРОВЕНЬ {progress.data?.level ?? 1}</Text>
        <Text style={styles.heroTitle}>{progress.data?.title ?? 'Юный исследователь'}</Text>
        <View style={styles.heroProgress}><ProgressBar value={xpPercent} color={colors.white} /></View>
        <Text style={styles.heroXp}>{progress.data?.xpInLevel ?? 0} из {progress.data?.xpForNextLevel ?? 500} XP</Text>
      </LinearGradient>

      <View style={styles.stats}><StatCard value={gold} label="Золото" tone="#E9A400" /><StatCard value={silver} label="Серебро" tone="#7B8496" /><StatCard value={bronze} label="Бронза" tone="#B16B3B" /></View>

      <SectionTitle title="Медали по месяцам" />
      <View style={styles.grid}>
        {Array.from({ length: 12 }, (_, index) => medals.find((medal) => medal.month === index + 1) ?? { month: index + 1, unlocked: false }).map((medal) => (
          <View key={medal.month} style={[styles.medal, medal.unlocked && styles.medalUnlocked]}>
            <Text style={[styles.medalIcon, !medal.unlocked && styles.locked]}>{medal.unlocked ? medal.place === 1 ? '🥇' : medal.place === 2 ? '🥈' : '🥉' : '🔒'}</Text>
            <Text style={styles.medalMonth}>{MONTHS[medal.month - 1]}</Text>
          </View>
        ))}
      </View>

      <SectionTitle title="Особые достижения" />
      {(achievements.data?.specialAchievements ?? []).map((item) => {
        const copy = SPECIAL_NAMES[item.key] ?? { title: item.key, icon: '⭐' };
        return (
          <Card key={item.key} style={[styles.special, !item.unlocked && styles.specialLocked]}>
            <Text style={[styles.specialIcon, !item.unlocked && styles.locked]}>{copy.icon}</Text>
            <View style={styles.specialCopy}><Text style={styles.specialTitle}>{copy.title}</Text><Text style={styles.specialMeta}>{item.unlocked ? 'Получено' : 'Продолжай заниматься, чтобы открыть'}</Text></View>
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', padding: spacing.xl, borderRadius: radius.lg },
  heroEmoji: { fontSize: 44 },
  heroLevel: { marginTop: spacing.sm, color: 'rgba(255,255,255,0.72)', fontSize: 10, fontWeight: '900', letterSpacing: 1.8 },
  heroTitle: { marginTop: 5, color: colors.white, fontSize: 23, fontWeight: '900' },
  heroProgress: { width: '100%', marginTop: spacing.lg },
  heroXp: { marginTop: 7, color: 'rgba(255,255,255,0.78)', fontSize: 11, fontWeight: '800' },
  stats: { marginTop: spacing.md, flexDirection: 'row', gap: spacing.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  medal: { width: '23%', minHeight: 86, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: '#EFF0F5' },
  medalUnlocked: { backgroundColor: colors.cream, borderColor: '#F7D79B' },
  medalIcon: { fontSize: 27 },
  medalMonth: { marginTop: 5, color: colors.inkSecondary, fontSize: 10, fontWeight: '800' },
  locked: { opacity: 0.3 },
  special: { marginBottom: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  specialLocked: { backgroundColor: '#F3F4F7' },
  specialIcon: { fontSize: 34 },
  specialCopy: { flex: 1 },
  specialTitle: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  specialMeta: { marginTop: 3, color: colors.inkSecondary, fontSize: 11 },
});
