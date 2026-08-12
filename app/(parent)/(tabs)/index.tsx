import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Award, BookOpen, CreditCard, Megaphone } from 'lucide-react-native';
import { Screen } from '@/components/Screen';
import { AppStateView } from '@/components/AppStateView';
import { ChildSelector } from '@/components/ChildSelector';
import { Card, MenuRow, PageHeader, ProgressBar, SectionTitle, StatusChip } from '@/components/ui';
import { useAnnouncements, useParentAchievements, useParentGrades, useParentPayments, useParentProfile, useUnreadNotificationCount } from '@/features/queries';
import { formatMoney, lessonTypeLabel } from '@/lib/format';
import { colors, radius, shadows, spacing } from '@/theme/tokens';

export default function ParentHomeScreen() {
  const profile = useParentProfile();
  const grades = useParentGrades(profile.selectedId);
  const payments = useParentPayments(profile.selectedId);
  const achievements = useParentAchievements(profile.selectedId);
  const announcements = useAnnouncements(3);
  const unread = useUnreadNotificationCount();

  if (profile.isLoading) return <AppStateView kind="loading" />;
  if (profile.isError || !profile.data) return <AppStateView kind="error" message="Не удалось загрузить кабинет родителя." onRetry={() => void profile.refetch()} />;
  const child = profile.selected;
  const gradeItems = grades.data ?? [];
  const total = gradeItems.reduce((sum, item) => sum + Number(item.score || 0), 0);
  const totalMax = gradeItems.reduce((sum, item) => sum + Number(item.maxScore || 0), 0);
  const average = totalMax > 0 ? Math.round((total / totalMax) * 100) : 0;
  const current = payments.data?.currentMonth;
  const stats = achievements.data?.stats;

  return (
    <Screen>
      <PageHeader kicker="КАБИНЕТ РОДИТЕЛЯ" title={`Здравствуйте, ${profile.data.fullName.split(/\s+/)[0] || 'Родитель'}!`} subtitle="Вся важная информация об обучении ребёнка." notificationsHref="/(parent)/notifications" unreadCount={unread.data?.count ?? 0} />
      <ChildSelector items={profile.children} selectedId={profile.selectedId} onSelect={profile.selectChild} />
      {!child ? <AppStateView kind="empty" title="Ребёнок не привязан" message="Обратитесь к администратору учебного центра." /> : (
        <>
          <Card style={styles.hero}>
            <Text style={styles.heroKicker}>УЧЕБНЫЙ ПРОГРЕСС</Text>
            <Text style={styles.heroName}>{child.fullName}</Text>
            <Text style={styles.heroGroup}>{child.group?.name ?? 'Без группы'} · {child.group?.teacher.fullName ?? 'Преподаватель не назначен'}</Text>
            <View style={styles.progressRow}><Text style={styles.progressValue}>{average}%</Text><Text style={styles.progressLabel}>средний результат</Text></View>
            <ProgressBar value={average} color={colors.teal} />
          </Card>

          <View style={styles.stats}>
            <Card style={styles.stat}><Text style={styles.statValue}>{gradeItems.length}</Text><Text style={styles.statLabel}>оценок</Text></Card>
            <Card style={styles.stat}><Text style={styles.statValue}>{stats?.totalAchievements ?? 0}</Text><Text style={styles.statLabel}>наград</Text></Card>
            <Card style={styles.stat}><Text style={styles.statValue}>{formatMoney(current?.amount).replace(' сум', '')}</Text><Text style={styles.statLabel}>к оплате</Text></Card>
          </View>

          <SectionTitle title="Последние результаты" action="Все оценки" onAction={() => router.push('/(parent)/(tabs)/grades')} />
          <View style={styles.listCard}>
            {gradeItems.slice(0, 3).map((grade) => <MenuRow key={grade.id} icon={BookOpen} title={lessonTypeLabel(grade.lessonType)} subtitle={`${grade.score} из ${grade.maxScore} баллов`} color={colors.blue} right={<StatusChip label={`${Math.round(grade.scorePercent)}%`} tone={grade.scorePercent >= 80 ? 'success' : 'warning'} />} />)}
            {gradeItems.length === 0 ? <MenuRow icon={BookOpen} title="Оценок пока нет" subtitle="Новые результаты появятся здесь" color={colors.inkMuted} /> : null}
          </View>

          <SectionTitle title="Быстрый доступ" />
          <View style={styles.listCard}>
            <MenuRow icon={CreditCard} title="Оплата" subtitle={formatMoney(current?.amount)} color={colors.teal} onPress={() => router.push('/(parent)/(tabs)/payment')} right={<StatusChip label={current?.status === 'PAID' ? 'Оплачено' : current?.status === 'PENDING' ? 'Проверяется' : 'Не оплачено'} tone={current?.status === 'PAID' ? 'success' : current?.status === 'PENDING' ? 'warning' : 'danger'} />} />
            <MenuRow icon={Award} title="Достижения" subtitle={`${stats?.totalAchievements ?? 0} наград получено`} color={colors.clay} onPress={() => router.push('/(parent)/achievements')} />
          </View>

          <SectionTitle title="Объявления" action="Все" onAction={() => router.push('/(parent)/announcements')} />
          <View style={styles.listCard}>{(announcements.data?.data ?? []).map((item) => <MenuRow key={item.id} icon={Megaphone} title={item.title} subtitle={item.message} color={colors.blue} onPress={() => router.push('/(parent)/announcements')} />)}</View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { padding: spacing.lg, backgroundColor: '#E8F5F2' },
  heroKicker: { color: colors.teal, fontSize: 10, fontWeight: '900', letterSpacing: 1.6 },
  heroName: { marginTop: spacing.xs, color: colors.ink, fontSize: 22, fontWeight: '900' },
  heroGroup: { marginTop: 4, color: colors.inkSecondary, fontSize: 12 },
  progressRow: { marginTop: spacing.lg, marginBottom: spacing.xs, flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
  progressValue: { color: colors.teal, fontSize: 29, fontWeight: '900' },
  progressLabel: { color: colors.inkSecondary, fontSize: 11 },
  stats: { marginTop: spacing.md, flexDirection: 'row', gap: spacing.xs },
  stat: { flex: 1, minHeight: 84, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xs },
  statValue: { color: colors.ink, fontSize: 19, fontWeight: '900' },
  statLabel: { marginTop: 3, color: colors.inkSecondary, fontSize: 9, textAlign: 'center' },
  listCard: { overflow: 'hidden', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, ...shadows.card },
});
