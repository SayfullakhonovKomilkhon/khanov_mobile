import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, CalendarDays, CreditCard, Megaphone } from 'lucide-react-native';
import { Screen } from '@/components/Screen';
import { AppStateView } from '@/components/AppStateView';
import { Card, MenuRow, PageHeader, ProgressBar, SectionTitle, StatCard, StatusChip } from '@/components/ui';
import {
  useAnnouncements,
  useStudentHomeworks,
  useStudentPayments,
  useStudentProfile,
  useStudentProgress,
  useStudentSchedule,
  useUnreadNotificationCount,
} from '@/features/queries';
import { formatDate, formatMoney } from '@/lib/format';
import { colors, radius, shadows, spacing } from '@/theme/tokens';

export default function StudentHomeScreen() {
  const profile = useStudentProfile();
  const progress = useStudentProgress();
  const homeworks = useStudentHomeworks();
  const schedule = useStudentSchedule();
  const payments = useStudentPayments();
  const announcements = useAnnouncements(3);
  const unread = useUnreadNotificationCount();

  if (profile.isLoading) return <AppStateView kind="loading" />;
  if (profile.isError || !profile.data) {
    return <AppStateView kind="error" message="Не удалось загрузить кабинет ученика." onRetry={() => void profile.refetch()} />;
  }

  const student = profile.data;
  const firstName = student.fullName.split(/\s+/)[0] || 'Ученик';
  const xp = progress.data;
  const latestHomework = homeworks.data?.[0];
  const payment = payments.data?.currentMonth;
  const nextTopic = schedule.data?.nextTopic;
  const xpPercent = xp ? (xp.xpInLevel / Math.max(1, xp.xpForNextLevel)) * 100 : 0;

  return (
    <Screen>
      <PageHeader
        kicker="KHANOVMATH ACADEMY"
        title={`Привет, ${firstName}!`}
        subtitle={`${student.group?.name ?? 'Без группы'} · ${student.group?.teacher.fullName ?? 'Преподаватель не назначен'}`}
        notificationsHref="/(student)/notifications"
        unreadCount={unread.data?.count ?? 0}
      />

      <LinearGradient colors={[colors.wool, colors.blue]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroKicker}>УРОВЕНЬ {xp?.level ?? 1}</Text>
            <Text style={styles.heroTitle}>{xp?.titleEmoji ?? '🌱'} {xp?.title ?? 'Юный исследователь'}</Text>
          </View>
          <View style={styles.streak}><Text style={styles.streakText}>🔥 {xp?.streak ?? 0}</Text></View>
        </View>
        <ProgressBar value={xpPercent} color={colors.clay} />
        <View style={styles.xpRow}>
          <Text style={styles.heroMeta}>{xp?.xpInLevel ?? 0} XP</Text>
          <Text style={styles.heroMeta}>{xp?.xpForNextLevel ?? 500} XP</Text>
        </View>
      </LinearGradient>

      <View style={styles.statsRow}>
        <StatCard value={`${student.attendanceStats?.percentage ?? 0}%`} label="Посещаемость" tone={colors.teal} />
        <StatCard value={student.totalLessons ?? 0} label="Всего уроков" tone={colors.blue} />
        <StatCard value={xp?.bestStreak ?? 0} label="Лучший стрик" tone={colors.clay} />
      </View>

      <SectionTitle title="Ближайшее" action="Расписание" onAction={() => router.push('/(student)/schedule')} />
      <Card>
        <Text style={styles.cardKicker}>{nextTopic ? formatDate(nextTopic.date, { weekday: 'long', day: 'numeric', month: 'long' }) : 'Следующее занятие'}</Text>
        <Text style={styles.cardTitle}>{nextTopic?.topic ?? 'Тема скоро появится'}</Text>
        <Text style={styles.cardMeta}>{schedule.data?.groupName ?? student.group?.name ?? '—'}</Text>
      </Card>

      <SectionTitle title="Учёба и оплата" />
      <View style={styles.menuCard}>
        <MenuRow icon={BookOpen} title="Домашнее задание" subtitle={latestHomework?.text ?? 'Новых заданий нет'} color={colors.clay} onPress={() => router.push('/(student)/(tabs)/homework')} right={latestHomework?.dueDate ? <StatusChip label={`до ${formatDate(latestHomework.dueDate)}`} tone="warning" /> : undefined} />
        <MenuRow icon={CreditCard} title="Оплата" subtitle={formatMoney(payment?.amount)} color={colors.teal} onPress={() => router.push('/(student)/payment')} right={<StatusChip label={payment?.status === 'PAID' ? 'Оплачено' : payment?.status === 'PENDING' ? 'Проверяется' : 'Не оплачено'} tone={payment?.status === 'PAID' ? 'success' : payment?.status === 'PENDING' ? 'warning' : 'danger'} />} />
      </View>

      <SectionTitle title="Объявления" action="Все" onAction={() => router.push('/(student)/announcements')} />
      <View style={styles.menuCard}>
        {(announcements.data?.data ?? []).length ? (
          announcements.data!.data.map((item) => (
            <MenuRow key={item.id} icon={Megaphone} title={item.title} subtitle={item.message} color={colors.blue} onPress={() => router.push('/(student)/announcements')} />
          ))
        ) : (
          <MenuRow icon={CalendarDays} title="Новых объявлений нет" subtitle="Здесь появятся новости учебного центра" color={colors.inkMuted} />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { padding: spacing.lg, borderRadius: radius.lg, ...shadows.floating },
  heroTop: { marginBottom: spacing.lg, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  heroKicker: { color: 'rgba(255,255,255,0.66)', fontSize: 10, fontWeight: '900', letterSpacing: 1.8 },
  heroTitle: { marginTop: 6, color: colors.white, fontSize: 21, fontWeight: '900' },
  streak: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.14)' },
  streakText: { color: colors.white, fontSize: 12, fontWeight: '900' },
  xpRow: { marginTop: 7, flexDirection: 'row', justifyContent: 'space-between' },
  heroMeta: { color: 'rgba(255,255,255,0.66)', fontSize: 10, fontWeight: '800' },
  statsRow: { marginTop: spacing.md, flexDirection: 'row', gap: spacing.xs },
  cardKicker: { color: colors.blue, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  cardTitle: { marginTop: spacing.xs, color: colors.ink, fontSize: 18, lineHeight: 24, fontWeight: '900' },
  cardMeta: { marginTop: spacing.xs, color: colors.inkSecondary, fontSize: 12 },
  menuCard: { overflow: 'hidden', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, ...shadows.card },
});
