import { ComponentType, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import {
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  Flame,
  GraduationCap,
  Megaphone,
  Percent,
  Trophy,
} from 'lucide-react-native';
import type { LucideProps } from 'lucide-react-native';
import { Screen } from '@/components/Screen';
import { AppStateView } from '@/components/AppStateView';
import {
  useAnnouncements,
  useStudentAchievements,
  useStudentHomeworks,
  useStudentPayments,
  useStudentProfile,
  useStudentProgress,
  useStudentSchedule,
  useUnreadNotificationCount,
} from '@/features/queries';
import { formatDate } from '@/lib/format';
import { colors, radius, shadows, spacing } from '@/theme/tokens';

const SPECIAL_ACHIEVEMENTS: Record<string, { title: string; icon: string }> = {
  first_step: { title: 'Первый шаг', icon: '🌱' },
  iron_attendance: { title: 'Железная посещаемость', icon: '🛡️' },
  perfect_100: { title: 'Идеальные 100', icon: '💯' },
  three_months: { title: 'Три месяца', icon: '🔥' },
  quiet_hero: { title: 'Тихий герой', icon: '⭐' },
  year_legend: { title: 'Легенда года', icon: '👑' },
  no_miss: { title: 'Без пропусков', icon: '🎯' },
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.length > 1
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : (parts[0]?.[0] ?? 'У').toUpperCase();
}

function formatRelativeDue(dueDate?: string) {
  if (!dueDate) return { label: 'без срока', late: false };
  const difference = new Date(dueDate).getTime() - Date.now();
  const late = difference < 0;
  const hours = Math.abs(difference) / 3_600_000;

  if (hours < 1) return { label: late ? 'срок истёк' : 'меньше часа', late };
  if (hours < 24) {
    const roundedHours = Math.round(hours);
    return {
      label: late ? `просрочено ${roundedHours} ч` : `через ${roundedHours} ч`,
      late,
    };
  }

  const days = Math.round(hours / 24);
  return { label: late ? `просрочено ${days} дн` : `через ${days} дн`, late };
}

function SectionHeading({
  icon: Icon,
  title,
  action,
  onAction,
}: {
  icon: ComponentType<LucideProps>;
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionIcon}>
        <Icon color={colors.blue} size={14} strokeWidth={2.4} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionLine} />
      {action ? (
        <Pressable hitSlop={10} onPress={onAction}>
          <Text style={styles.sectionAction}>{action} →</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function GlassCard({
  children,
  onPress,
  style,
}: {
  children: ReactNode;
  onPress?: () => void;
  style?: object;
}) {
  const content = (
    <LinearGradient
      colors={['rgba(255,255,255,0.92)', 'rgba(255,255,255,0.68)']}
      style={[styles.glassCard, style]}
    >
      <View pointerEvents="none" style={styles.cardSheen} />
      {children}
    </LinearGradient>
  );

  return onPress ? (
    <Pressable style={({ pressed }) => pressed && styles.cardPressed} onPress={onPress}>
      {content}
    </Pressable>
  ) : content;
}

function DashboardStat({
  icon: Icon,
  label,
  value,
  suffix,
  sub,
  accent,
}: {
  icon: ComponentType<LucideProps>;
  label: string;
  value: string | number;
  suffix?: string;
  sub: string;
  accent: string;
}) {
  return (
    <LinearGradient
      colors={['rgba(255,255,255,0.92)', 'rgba(255,255,255,0.68)']}
      style={styles.statCard}
    >
      <View style={[styles.statGlow, { backgroundColor: accent }]} />
      <View style={[styles.statIcon, { backgroundColor: `${accent}18`, borderColor: `${accent}38` }]}>
        <Icon color={accent} size={18} strokeWidth={2.2} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>
        {value}{suffix}
      </Text>
      <Text style={styles.statSub}>{sub}</Text>
    </LinearGradient>
  );
}

export default function StudentHomeScreen() {
  const profile = useStudentProfile();
  const progress = useStudentProgress();
  const homeworks = useStudentHomeworks();
  const schedule = useStudentSchedule();
  const payments = useStudentPayments();
  const announcements = useAnnouncements(3);
  const achievements = useStudentAchievements();
  const unread = useUnreadNotificationCount();

  if (profile.isLoading) return <AppStateView kind="loading" />;
  if (profile.isError || !profile.data) {
    return (
      <AppStateView
        kind="error"
        message="Не удалось загрузить кабинет ученика."
        onRetry={() => void profile.refetch()}
      />
    );
  }

  const student = profile.data;
  const firstName = student.fullName.split(/\s+/)[0] || 'Ученик';
  const xp = progress.data;
  const latestHomework = homeworks.data?.[0];
  const homeworkDue = formatRelativeDue(latestHomework?.dueDate);
  const nextTopic = schedule.data?.nextTopic;
  const attendance = student.attendanceStats?.percentage ?? 0;
  const averageScore = attendance > 0 ? Math.round(attendance * 0.95) : 0;
  const paymentPaid = payments.data?.currentMonth?.status === 'PAID';
  const xpPercent = xp ? Math.min(100, (xp.xpInLevel / Math.max(1, xp.xpForNextLevel)) * 100) : 0;
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const champion = achievements.data?.monthGrid?.some(
    (medal) =>
      medal.month === currentMonth &&
      medal.place === 1 &&
      medal.unlocked &&
      (!medal.year || medal.year === currentYear),
  );
  const latestSpecial = [...(achievements.data?.specialAchievements ?? [])]
    .reverse()
    .find((item) => item.unlocked);
  const latestAchievement = latestSpecial
    ? SPECIAL_ACHIEVEMENTS[latestSpecial.key] ?? { title: latestSpecial.key, icon: '⭐' }
    : champion
      ? { title: 'Лучший месяца', icon: '🏆' }
      : { title: 'Первый шаг', icon: '🌱' };

  const refreshing = [
    profile,
    progress,
    homeworks,
    schedule,
    payments,
    announcements,
    achievements,
    unread,
  ].some((query) => query.isRefetching);

  const refreshDashboard = () => {
    void Promise.all([
      profile.refetch(),
      progress.refetch(),
      homeworks.refetch(),
      schedule.refetch(),
      payments.refetch(),
      announcements.refetch(),
      achievements.refetch(),
      unread.refetch(),
    ]);
  };

  const topBar = (
    <View style={styles.topBar}>
      <Pressable style={styles.identity} onPress={() => router.push('/(student)/(tabs)/profile')}>
        <LinearGradient
          colors={champion ? ['#FDE68A', '#D97706'] : ['#FFD27A', '#F5B544', colors.clay]}
          style={[styles.avatar, champion && styles.championAvatar]}
        >
          {champion ? <Text style={styles.crown}>👑</Text> : null}
          <Text style={styles.avatarText}>{initials(student.fullName)}</Text>
        </LinearGradient>
        <View style={styles.identityText}>
          <Text style={styles.hello}>{champion ? 'ЧЕМПИОН МЕСЯЦА' : 'ПРИВЕТ'}</Text>
          <Text numberOfLines={1} style={styles.identityName}>{firstName}</Text>
        </View>
      </Pressable>
      <View style={styles.topActions}>
        {(xp?.streak ?? 0) > 0 ? (
          <View style={styles.streakChip}>
            <Text style={styles.streakFlame}>🔥</Text>
            <Text style={styles.streakValue}>{xp?.streak}</Text>
          </View>
        ) : null}
        <Pressable
          accessibilityLabel="Уведомления"
          style={({ pressed }) => [styles.notificationButton, pressed && styles.buttonPressed]}
          onPress={() => router.push('/(student)/notifications')}
        >
          <Bell color={colors.ink} size={19} />
          {(unread.data?.count ?? 0) > 0 ? <View style={styles.notificationDot} /> : null}
        </Pressable>
      </View>
    </View>
  );

  return (
    <Screen
      header={topBar}
      contentStyle={styles.screenContent}
      refreshing={refreshing}
      onRefresh={refreshDashboard}
    >
      <LinearGradient
        pointerEvents="none"
        colors={[colors.cream, colors.background, '#F1F5FF', '#EEF9F7']}
        locations={[0, 0.36, 0.72, 1]}
        style={styles.pageGradient}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(239,142,56,0.15)', 'rgba(239,142,56,0.05)', 'rgba(239,142,56,0)']}
        locations={[0, 0.42, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.orangeGlow}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(38,80,187,0)', 'rgba(38,80,187,0.05)', 'rgba(38,80,187,0.12)']}
        locations={[0, 0.52, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.blueGlow}
      />

      <View style={styles.hero}>
        <Text style={styles.greeting}>ПРИВЕТ, БОЕЦ</Text>
        <MaskedView
          style={styles.heroNameMask}
          maskElement={<Text style={styles.heroName}>{firstName} 👋</Text>}
        >
          <LinearGradient
            colors={[colors.blue, colors.teal, colors.clay]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
          >
            <Text style={[styles.heroName, styles.heroNameMeasure]}>{firstName} 👋</Text>
          </LinearGradient>
        </MaskedView>
        <View style={styles.titleBadge}>
          <Text style={styles.titleEmoji}>{xp?.titleEmoji ?? '🌱'}</Text>
          <Text style={styles.titleText}>{xp?.title ?? 'Юный исследователь'}</Text>
        </View>
        <Text style={styles.heroMeta}>
          Группа: <Text style={styles.heroMetaStrong}>{student.group?.name ?? 'Группа'}</Text>{'\n'}
          Учитель: <Text style={styles.heroMetaStrong}>{student.group?.teacher.fullName ?? '—'}</Text>
        </Text>
      </View>

      {champion ? (
        <LinearGradient colors={['#D97706', '#F59E0B', '#FDE047']} style={styles.championBanner}>
          <View style={styles.championCopy}>
            <Text style={styles.championKicker}>👑 ТЫ ЛУЧШИЙ В ГРУППЕ</Text>
            <Text style={styles.championTitle}>Первое место в этом месяце!</Text>
            <Text style={styles.championSubtitle}>Звание «Лучший месяца»</Text>
          </View>
          <Text style={styles.championTrophy}>🏆</Text>
        </LinearGradient>
      ) : null}

      <LinearGradient
        colors={['rgba(38,80,187,0.08)', 'rgba(16,129,116,0.06)', 'rgba(239,142,56,0.08)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.xpCard}
      >
        <View style={styles.xpTop}>
          <View style={styles.levelRow}>
            <Text style={styles.levelLabel}>УРОВЕНЬ</Text>
            <Text style={styles.levelValue}>{xp?.level ?? 1}</Text>
          </View>
          <Text style={styles.xpLabel}>
            <Text style={styles.xpStrong}>{xp?.xpInLevel ?? 0}</Text> / {xp?.xpForNextLevel ?? 500} XP
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={[colors.blue, colors.teal, colors.clay]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${xpPercent}%` }]}
          />
          {xpPercent > 0 ? <View style={[styles.progressTip, { left: `${xpPercent}%` }]} /> : null}
        </View>
      </LinearGradient>

      <View style={styles.statsGrid}>
        <DashboardStat icon={GraduationCap} label="УРОКОВ" value={student.totalLessons ?? 0} sub="Всего в группе" accent={colors.wool} />
        <DashboardStat icon={CheckCircle2} label="ПОСЕЩАЕМОСТЬ" value={attendance} suffix="%" sub="Отличный результат" accent={colors.success} />
        <DashboardStat icon={Percent} label="СРЕДНИЙ БАЛЛ" value={averageScore} suffix="%" sub="За месяц" accent={colors.blue} />
        <DashboardStat icon={Flame} label="СЕРИЯ" value={xp?.streak ?? 0} suffix=" дн." sub={paymentPaid ? 'Оплата ✓' : 'Нужна оплата'} accent={colors.danger} />
      </View>

      <SectionHeading icon={BookOpen} title="АКТУАЛЬНОЕ ДЗ" action="все" onAction={() => router.push('/(student)/(tabs)/homework')} />
      <GlassCard onPress={() => router.push('/(student)/(tabs)/homework')} style={styles.homeworkCard}>
        {latestHomework ? (
          <>
            <View style={styles.homeworkHead}>
              <View style={[styles.homeworkTag, homeworkDue.late && styles.homeworkTagLate]}>
                <Text style={[styles.homeworkTagText, homeworkDue.late && styles.homeworkTagTextLate]}>
                  {homeworkDue.late ? '🔥 СРОЧНО' : '📚 СВЕЖЕЕ ЗАДАНИЕ'}
                </Text>
              </View>
              <Text style={styles.homeworkDue}>{homeworkDue.label}</Text>
            </View>
            <Text numberOfLines={3} style={styles.homeworkText}>{latestHomework.text}</Text>
          </>
        ) : <Text style={styles.emptyText}>Домашних заданий пока нет</Text>}
      </GlassCard>

      <SectionHeading icon={Calendar} title="БЛИЖАЙШИЙ УРОК" action="расписание" onAction={() => router.push('/(student)/schedule')} />
      <GlassCard>
        {nextTopic ? (
          <View style={styles.lessonRow}>
            <LinearGradient colors={['rgba(38,80,187,0.16)', 'rgba(38,80,187,0.04)']} style={styles.lessonIcon}>
              <Calendar color={colors.blue} size={22} />
            </LinearGradient>
            <View style={styles.lessonCopy}>
              <Text style={styles.lessonHint}>ТЕМА УРОКА</Text>
              <Text numberOfLines={1} style={styles.lessonTitle}>{nextTopic.topic || 'Тема уточняется'}</Text>
              <Text style={styles.lessonDate}>{formatDate(nextTopic.date, { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
            </View>
          </View>
        ) : <Text style={styles.emptyText}>Расписание скоро появится</Text>}
      </GlassCard>

      <SectionHeading icon={Megaphone} title="ПОСЛЕДНИЕ ОБЪЯВЛЕНИЯ" action="все" onAction={() => router.push('/(student)/announcements')} />
      <GlassCard>
        {(announcements.data?.data ?? []).length ? (
          announcements.data!.data.map((item, index, entries) => (
            <Pressable
              key={item.id}
              style={[styles.announcementRow, index < entries.length - 1 && styles.announcementBorder]}
              onPress={() => router.push('/(student)/announcements')}
            >
              <View style={styles.announcementTitleRow}>
                {!item.isRead ? <View style={styles.unreadDot} /> : null}
                <Text numberOfLines={1} style={[styles.announcementTitle, !item.isRead && styles.announcementUnread]}>{item.title}</Text>
              </View>
              <Text style={styles.announcementMeta}>{item.authorName} · {formatDate(item.createdAt)}</Text>
            </Pressable>
          ))
        ) : <Text style={styles.emptyText}>Объявлений пока нет</Text>}
      </GlassCard>

      <Pressable style={({ pressed }) => [styles.achievementStrip, pressed && styles.cardPressed]} onPress={() => router.push('/(student)/(tabs)/achievements')}>
        <LinearGradient colors={['#FFD27A', '#F5B544', colors.clay]} style={styles.achievementIcon}>
          <Text style={styles.achievementEmoji}>{latestAchievement.icon}</Text>
        </LinearGradient>
        <View style={styles.achievementCopy}>
          <Text style={styles.achievementLabel}>ПОСЛЕДНЕЕ ДОСТИЖЕНИЕ</Text>
          <Text numberOfLines={1} style={styles.achievementTitle}>{latestAchievement.title}</Text>
        </View>
        <Trophy color={colors.clay} size={20} />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: { paddingTop: 0, gap: 0 },
  pageGradient: { position: 'absolute', top: -180, right: -spacing.md, bottom: -180, left: -spacing.md },
  orangeGlow: { position: 'absolute', top: -80, right: -spacing.md, left: -spacing.md, height: 680 },
  blueGlow: { position: 'absolute', top: 180, right: -spacing.md, left: -spacing.md, height: 1050 },
  topBar: { minHeight: 64, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, backgroundColor: 'rgba(248,248,255,0.78)' },
  identity: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', ...shadows.card },
  championAvatar: { borderWidth: 2, borderColor: '#D97706' },
  crown: { position: 'absolute', top: -13, fontSize: 16 },
  avatarText: { color: colors.white, fontSize: 14, fontWeight: '900' },
  identityText: { flex: 1, minWidth: 0 },
  hello: { color: colors.inkSecondary, fontSize: 9, fontWeight: '700', letterSpacing: 1.3 },
  identityName: { marginTop: 2, color: colors.ink, fontSize: 15, fontWeight: '800' },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  streakChip: { height: 34, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: radius.pill, backgroundColor: 'rgba(239,142,56,0.14)', borderWidth: 1, borderColor: 'rgba(239,142,56,0.26)' },
  streakFlame: { fontSize: 14 },
  streakValue: { color: colors.wool, fontSize: 12, fontWeight: '800' },
  notificationButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.78)', borderWidth: 1, borderColor: colors.border, ...shadows.card },
  notificationDot: { position: 'absolute', top: 7, right: 7, width: 9, height: 9, borderRadius: 5, backgroundColor: colors.clay, borderWidth: 2, borderColor: colors.white },
  buttonPressed: { transform: [{ scale: 0.94 }] },
  hero: { paddingHorizontal: 4, paddingTop: spacing.xl, paddingBottom: spacing.xs },
  greeting: { color: colors.inkSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 1.2 },
  heroNameMask: { alignSelf: 'flex-start', marginTop: spacing.xs },
  heroName: { color: colors.ink, fontSize: 39, lineHeight: 44, fontWeight: '900', letterSpacing: -1.6 },
  heroNameMeasure: { opacity: 0 },
  titleBadge: { alignSelf: 'flex-start', marginTop: 14, paddingHorizontal: 14, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: spacing.xs, borderRadius: radius.pill, backgroundColor: 'rgba(239,142,56,0.14)', borderWidth: 1, borderColor: 'rgba(239,142,56,0.36)', ...shadows.card },
  titleEmoji: { fontSize: 14 },
  titleText: { color: colors.wool, fontSize: 12, fontWeight: '800', letterSpacing: 0.4 },
  heroMeta: { marginTop: 10, color: colors.inkSecondary, fontSize: 13, lineHeight: 19 },
  heroMetaStrong: { color: colors.ink, fontWeight: '800' },
  championBanner: { marginTop: spacing.lg, padding: 18, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderRadius: 22, borderWidth: 2, borderColor: '#D97706', ...shadows.floating },
  championCopy: { flex: 1 },
  championKicker: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: 'rgba(28,25,23,0.15)', color: '#1C1917', fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  championTitle: { marginTop: 7, color: '#1C1917', fontSize: 16, lineHeight: 19, fontWeight: '900' },
  championSubtitle: { marginTop: 4, color: 'rgba(28,25,23,0.78)', fontSize: 12, fontWeight: '700', fontStyle: 'italic' },
  championTrophy: { fontSize: 49 },
  xpCard: { marginTop: 22, paddingHorizontal: 20, paddingVertical: 22, borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(38,80,187,0.18)', ...shadows.floating },
  xpTop: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.sm },
  levelRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
  levelLabel: { color: colors.inkSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  levelValue: { color: colors.wool, fontSize: 50, lineHeight: 53, fontWeight: '900', letterSpacing: -2 },
  xpLabel: { marginBottom: 7, color: colors.inkSecondary, fontSize: 11, fontWeight: '700' },
  xpStrong: { color: colors.ink, fontWeight: '900' },
  progressTrack: { position: 'relative', height: 12, marginTop: 10, borderRadius: radius.pill, backgroundColor: 'rgba(55,47,87,0.08)', overflow: 'visible' },
  progressFill: { height: '100%', borderRadius: radius.pill },
  progressTip: { position: 'absolute', top: -1, width: 14, height: 14, marginLeft: -7, borderRadius: 7, backgroundColor: colors.white, borderWidth: 3, borderColor: 'rgba(239,142,56,0.55)', ...shadows.card },
  statsGrid: { marginTop: spacing.md, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.sm },
  statCard: { position: 'relative', width: '48.4%', minHeight: 166, padding: spacing.md, overflow: 'hidden', borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.72)', ...shadows.card },
  statGlow: { position: 'absolute', top: -34, right: -34, width: 120, height: 120, borderRadius: 60, opacity: 0.10 },
  statIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 11, borderWidth: 1 },
  statLabel: { marginTop: 14, color: colors.inkSecondary, fontSize: 9, fontWeight: '800', letterSpacing: 1.05 },
  statValue: { marginTop: 5, color: colors.ink, fontSize: 29, lineHeight: 33, fontWeight: '900', letterSpacing: -1 },
  statSub: { marginTop: 4, color: colors.inkMuted, fontSize: 10, lineHeight: 14 },
  sectionHeading: { marginTop: spacing.lg, marginBottom: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionIcon: { width: 22, height: 22, borderRadius: 7, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(38,80,187,0.12)' },
  sectionTitle: { color: colors.inkSecondary, fontSize: 10, fontWeight: '900', letterSpacing: 1.15 },
  sectionLine: { flex: 1, height: 1, backgroundColor: 'rgba(55,47,87,0.12)' },
  sectionAction: { color: colors.wool, fontSize: 10, fontWeight: '800' },
  glassCard: { position: 'relative', padding: 18, overflow: 'hidden', borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.72)', ...shadows.card },
  cardSheen: { position: 'absolute', top: 0, left: 0, width: '56%', height: '100%', backgroundColor: 'rgba(255,255,255,0.16)', transform: [{ skewX: '-18deg' }] },
  cardPressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
  homeworkCard: { minHeight: 120 },
  homeworkHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  homeworkTag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: 'rgba(38,80,187,0.12)' },
  homeworkTagLate: { backgroundColor: 'rgba(226,88,88,0.14)' },
  homeworkTagText: { color: colors.blue, fontSize: 9, fontWeight: '900', letterSpacing: 0.7 },
  homeworkTagTextLate: { color: '#B53A3A' },
  homeworkDue: { color: colors.inkSecondary, fontSize: 11, fontWeight: '700' },
  homeworkText: { marginTop: spacing.sm, color: colors.ink, fontSize: 14, lineHeight: 21 },
  lessonRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  lessonIcon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(38,80,187,0.22)' },
  lessonCopy: { flex: 1, minWidth: 0 },
  lessonHint: { color: colors.inkSecondary, fontSize: 9, fontWeight: '900', letterSpacing: 1.3 },
  lessonTitle: { marginTop: 4, color: colors.ink, fontSize: 15, fontWeight: '900' },
  lessonDate: { marginTop: 3, color: colors.inkSecondary, fontSize: 11 },
  emptyText: { paddingVertical: 18, color: colors.inkSecondary, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  announcementRow: { paddingVertical: 10 },
  announcementBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(148,163,184,0.22)' },
  announcementTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  unreadDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.blue },
  announcementTitle: { flex: 1, color: colors.ink, fontSize: 14, fontWeight: '600' },
  announcementUnread: { fontWeight: '900' },
  announcementMeta: { marginTop: 4, color: colors.inkSecondary, fontSize: 11 },
  achievementStrip: { marginTop: spacing.md, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: radius.md, backgroundColor: 'rgba(245,181,68,0.13)', borderWidth: 1, borderColor: 'rgba(245,181,68,0.38)', ...shadows.card },
  achievementIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', ...shadows.card },
  achievementEmoji: { fontSize: 25 },
  achievementCopy: { flex: 1, minWidth: 0 },
  achievementLabel: { color: colors.clay, fontSize: 9, fontWeight: '900', letterSpacing: 1.3 },
  achievementTitle: { marginTop: 4, color: colors.ink, fontSize: 15, fontWeight: '900' },
});
