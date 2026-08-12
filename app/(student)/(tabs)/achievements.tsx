import { useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Award, ChevronRight, Sparkles, Trophy, Users, X } from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { AppStateView } from '@/components/AppStateView';
import { StudentBackground } from '@/components/StudentBackground';
import {
  useStudentAchievements,
  useStudentProfile,
  useStudentRating,
} from '@/features/queries';
import type { AchievementMedal, Gender, RatingEntry, SpecialAchievement } from '@/types/models';
import { colors, radius, spacing } from '@/theme/tokens';

const MONTHS = [
  { name: 'Январь', emoji: '❄️', colors: ['#0C4A6E', '#0EA5E9'] as const, decor: '❄' },
  { name: 'Февраль', emoji: '🎖️', colors: ['#14532D', '#4D7C0F'] as const, decor: '★' },
  { name: 'Март', emoji: '🌸', colors: ['#14532D', '#22C55E'] as const, decor: '🌸' },
  { name: 'Апрель', emoji: '⚡', colors: ['#1E1B4B', '#4F46E5'] as const, decor: '⚡' },
  { name: 'Май', emoji: '🎆', colors: ['#7C2D12', '#EF4444'] as const, decor: '✦' },
  { name: 'Июнь', emoji: '☀️', colors: ['#92400E', '#F59E0B'] as const, decor: '☀' },
  { name: 'Июль', emoji: '🌊', colors: ['#0C4A6E', '#06B6D4'] as const, decor: '≈' },
  { name: 'Август', emoji: '🌠', colors: ['#312E81', '#7C3AED'] as const, decor: '✦' },
  { name: 'Сентябрь', emoji: '🍂', colors: ['#7C2D12', '#EA580C'] as const, decor: '🍁' },
  { name: 'Октябрь', emoji: '🎃', colors: ['#3B0764', '#9333EA'] as const, decor: '✧' },
  { name: 'Ноябрь', emoji: '🌩️', colors: ['#1E293B', '#475569'] as const, decor: '⚡' },
  { name: 'Декабрь', emoji: '🎄', colors: ['#14532D', '#DC2626'] as const, decor: '✦' },
];

type SpecialDefinition = {
  title: string;
  titleFemale?: string;
  icon: string;
  description: string;
  descriptionFemale?: string;
  condition: string;
  label: string;
  colors: readonly [string, string];
  decor: string;
};

const SPECIALS: Record<string, SpecialDefinition> = {
  iron_attendance: { title: 'Железная посещаемость', icon: '🧲', description: 'Не пропустил ни одного урока за месяц', descriptionFemale: 'Не пропустила ни одного урока за месяц', condition: '0 пропусков за месяц', label: 'Железная дисциплина', colors: ['#1E3A5F', '#3B82F6'], decor: '⚙' },
  perfect_100: { title: '100 из 100', icon: '💯', description: 'Получил максимальный балл на работе', descriptionFemale: 'Получила максимальный балл на работе', condition: 'Максимальный балл на практической работе', label: 'Идеальный результат', colors: ['#14532D', '#22C55E'], decor: '✓' },
  first_step: { title: 'На старт!', icon: '🎯', description: 'Первые шаги в мире побед', condition: 'Первое достижение в системе', label: 'Начало пути', colors: ['#7C3AED', '#A78BFA'], decor: '✦' },
  three_months: { title: 'Три месяца подряд', icon: '🔥', description: 'В тройке лучших три месяца без остановки', condition: '3 месяца подряд в топ‑3 без перерыва', label: 'Огненная серия', colors: ['#7C2D12', '#F97316'], decor: '🔥' },
  year_legend: { title: 'Легенда года', titleFemale: 'Звезда года', icon: '🌠', description: 'Был лучшим в группе за год', descriptionFemale: 'Была лучшей в группе за год', condition: 'Хотя бы раз топ‑1 за учебный год', label: 'Звёздное достижение', colors: ['#0F0A1E', '#4F46E5'], decor: '★' },
  quiet_hero: { title: 'Тихий герой', titleFemale: 'Тихая героиня', icon: '📈', description: 'Улучшил результат на 30%+ за месяц', descriptionFemale: 'Улучшила результат на 30%+ за месяц', condition: 'Рост результатов на 30%+ за месяц', label: 'Взрывной рост', colors: ['#064E3B', '#10B981'], decor: '↑' },
  no_miss: { title: 'Без единого пропуска', icon: '🏅', description: 'Ни одного пропуска за весь учебный год', condition: '0 пропусков за весь учебный год', label: 'Редчайшая награда', colors: ['#1C1917', '#D97706'], decor: '★' },
};

type Detail =
  | { kind: 'month'; medal: AchievementMedal }
  | { kind: 'special'; achievement: SpecialAchievement; definition: SpecialDefinition };

type RewardListItem =
  | { kind: 'monthsHeading'; id: string }
  | { kind: 'monthRow'; id: string; medals: AchievementMedal[]; startIndex: number }
  | { kind: 'monthsHint'; id: string }
  | { kind: 'specialsHeading'; id: string }
  | { kind: 'special'; id: string; achievement: SpecialAchievement; definition: SpecialDefinition; index: number };

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase();
}

function formatDate(value?: string) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function SectionHeading({ icon, label, action, onAction }: { icon: React.ReactNode; label: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeading}>
      <LinearGradient colors={['rgba(38,80,187,0.18)', 'rgba(239,142,56,0.16)']} style={styles.sectionIcon}>
        {icon}
      </LinearGradient>
      <Text style={styles.sectionLabel}>{label}</Text>
      <LinearGradient colors={['rgba(55,47,87,0.16)', 'rgba(55,47,87,0)']} style={styles.sectionLine} />
      {action ? (
        <Pressable style={styles.sectionAction} onPress={onAction}>
          <Text style={styles.sectionActionText}>{action}</Text>
          <ChevronRight color={colors.wool} size={13} />
        </Pressable>
      ) : null}
    </View>
  );
}

function ProfileHero({ fullName, groupName, gold, silver, bronze }: { fullName: string; groupName: string; gold: number; silver: number; bronze: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(80).duration(480)} style={styles.profileShadow}>
      <LinearGradient colors={['rgba(245,181,68,0.20)', 'rgba(239,142,56,0.13)', 'rgba(255,255,255,0.54)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.profileHero}>
        <LinearGradient colors={['#FFD27A', '#F5B544', '#EF8E38']} style={styles.profileMedal}>
          <Text style={styles.profileMedalEmoji}>🏅</Text>
        </LinearGradient>
        <View style={styles.profileCopy}>
          <Text numberOfLines={1} style={styles.profileName}>{fullName}</Text>
          <Text style={styles.profileGroup}>{groupName || '—'}</Text>
          <View style={styles.medalStats}>
            {[
              ['🥇', gold, 'золото'],
              ['🥈', silver, 'серебро'],
              ['🥉', bronze, 'бронза'],
            ].map(([emoji, value, label]) => (
              <View key={String(label)} style={styles.medalStat}>
                <Text style={styles.medalStatValue}>{emoji} {value}</Text>
                <Text numberOfLines={1} style={styles.medalStatLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

function PodiumColumn({ entry, place, index }: { entry?: RatingEntry; place: 1 | 2 | 3; index: number }) {
  const crown = useSharedValue(0);
  useEffect(() => {
    if (place === 1) crown.value = withRepeat(withSequence(withTiming(-4, { duration: 1000 }), withTiming(0, { duration: 1000 })), -1, true);
  }, [crown, place]);
  const crownStyle = useAnimatedStyle(() => ({ transform: [{ translateY: crown.value }] }));
  const pedestalColors = place === 1 ? ['#FFD27A', '#EF8E38'] : place === 2 ? ['#EEF2FF', '#CBD5F5'] : ['#F5CFA7', '#D08450'];

  return (
    <Animated.View entering={FadeInDown.delay(180 + index * 180).springify()} style={styles.podiumColumn}>
      {place === 1 ? <Animated.Text style={[styles.crown, crownStyle]}>👑</Animated.Text> : null}
      <LinearGradient colors={[colors.blue, colors.teal, colors.clay, '#F5B544']} style={styles.avatarRing}>
        <LinearGradient colors={[colors.cream, '#EEF0FA']} style={styles.podiumAvatar}>
          <Text style={styles.podiumInitials}>{entry ? initials(entry.fullName) : '—'}</Text>
        </LinearGradient>
      </LinearGradient>
      <Text numberOfLines={1} style={styles.podiumName}>{entry?.fullName ?? '—'}</Text>
      <Text style={styles.podiumScore}>{entry ? `${Math.round(entry.totalPoints)} балл.` : ''}</Text>
      <LinearGradient colors={pedestalColors as [string, string]} style={[styles.pedestal, place === 1 ? styles.pedestal1 : place === 2 ? styles.pedestal2 : styles.pedestal3]}>
        <Text style={styles.pedestalText}>{place}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

function Podium({ entries }: { entries: RatingEntry[] }) {
  const byPlace = (place: number) => entries.find((item) => item.place === place);
  if (!entries.length) return <Text style={styles.podiumEmpty}>Подиум ещё не сформирован</Text>;

  return (
    <View style={styles.podiumStage}>
      <LinearGradient colors={['rgba(38,80,187,0)', 'rgba(38,80,187,0.20)', 'rgba(38,80,187,0)']} style={styles.podiumFloor} />
      <View style={styles.podiumRow}>
        <PodiumColumn entry={byPlace(2)} place={2} index={0} />
        <PodiumColumn entry={byPlace(1)} place={1} index={2} />
        <PodiumColumn entry={byPlace(3)} place={3} index={1} />
      </View>
    </View>
  );
}

function MonthCard({ medal, index, onPress }: { medal: AchievementMedal; index: number; onPress: () => void }) {
  const meta = MONTHS[medal.month - 1] ?? MONTHS[0];
  const float = useSharedValue(0);
  useEffect(() => {
    if (!medal.unlocked) {
      float.value = 0;
      return;
    }
    float.value = withDelay(index * 70, withRepeat(withSequence(withTiming(-3, { duration: 1300 }), withTiming(0, { duration: 1300 })), -1, true));
  }, [float, index, medal.unlocked]);
  const iconStyle = useAnimatedStyle(() => ({ transform: [{ translateY: float.value }, { scale: medal.place === 1 ? 1.04 : 1 }] }));
  const unlocked = !!medal.unlocked && !!medal.place;
  const borderColor = medal.place === 1 ? '#D97706' : medal.place === 2 ? '#94A3B8' : '#EA8C4A';

  return (
    <Animated.View entering={medal.unlocked ? FadeInDown.delay(Math.min(index, 3) * 45).duration(400) : undefined} style={styles.monthCell}>
      <Pressable disabled={!unlocked} style={({ pressed }) => [styles.monthPressable, pressed && styles.cardPressed]} onPress={onPress}>
        {unlocked ? (
          <LinearGradient colors={meta.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.monthCard, { borderColor, borderWidth: medal.place === 1 ? 2 : 1 }]}>
            <LinearGradient colors={['rgba(255,255,255,0.30)', 'rgba(255,255,255,0)', 'rgba(255,255,255,0.12)']} style={StyleSheet.absoluteFill} />
            <Text style={[styles.decor, styles.decorTop]}>{meta.decor}</Text>
            <Text style={[styles.decor, styles.decorBottom]}>{meta.decor}</Text>
            <Text style={styles.monthLabel}>{meta.emoji} {meta.name.toUpperCase()}</Text>
            <View style={styles.placeBubble}><Text style={styles.placeBubbleText}>{medal.place === 1 ? '🥇' : medal.place === 2 ? '🥈' : '🥉'}</Text></View>
            <Animated.Text style={[styles.monthMainIcon, iconStyle]}>{medal.place === 1 ? '👑' : medal.place === 2 ? '🛡️' : '⭐'}</Animated.Text>
            <View style={styles.monthBottom}>
              <Text style={styles.monthTitle}>{medal.place === 1 ? 'Лучший месяца' : medal.place === 2 ? 'Шаг до вершины' : 'В тройке лучших'}</Text>
              <Text style={styles.monthDescription}>Заслуженное место среди лидеров группы</Text>
            </View>
          </LinearGradient>
        ) : (
          <LinearGradient colors={['rgba(226,232,240,0.72)', 'rgba(203,213,225,0.56)']} style={styles.monthLocked}>
            <Text style={styles.lockedMonthLabel}>{meta.emoji} {meta.name.toUpperCase()}</Text>
            <Animated.Text style={[styles.lockIcon, iconStyle]}>🔒</Animated.Text>
            <Text style={styles.lockedText}>ЕЩЁ НЕ ПОЛУЧЕНО</Text>
          </LinearGradient>
        )}
      </Pressable>
    </Animated.View>
  );
}

function SpecialCard({ achievement, definition, gender, index, onPress }: { achievement: SpecialAchievement; definition: SpecialDefinition; gender: Gender; index: number; onPress: () => void }) {
  const unlocked = !!achievement.unlocked;
  const female = gender === 'FEMALE';
  const title = female && definition.titleFemale ? definition.titleFemale : definition.title;
  const description = female && definition.descriptionFemale ? definition.descriptionFemale : definition.description;
  return (
    <Animated.View entering={FadeInDown.delay(index * 70).duration(420)} style={styles.specialShadow}>
      <Pressable disabled={!unlocked} style={({ pressed }) => [pressed && styles.cardPressed]} onPress={onPress}>
        {unlocked ? (
          <LinearGradient colors={definition.colors} style={styles.specialCard}>
            <LinearGradient colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0)', 'rgba(255,255,255,0.08)']} style={StyleSheet.absoluteFill} />
            <Text style={[styles.specialDecor, styles.specialDecorTop]}>{definition.decor}</Text>
            <Text style={[styles.specialDecor, styles.specialDecorBottom]}>{definition.icon}</Text>
            <View style={styles.specialHead}>
              <View style={styles.specialIconWrap}><Text style={styles.specialIcon}>{definition.icon}</Text></View>
              <View style={styles.specialCopy}>
                <Text style={styles.specialTitleLight}>{title}</Text>
                <Text style={styles.specialLabelLight}>{definition.label.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.specialDescriptionLight}>{description}</Text>
            <View style={styles.specialFooter}>
              <View style={styles.specialTagLight}><Text style={styles.specialTagTextLight}>ПОЛУЧЕНО</Text></View>
              <Text style={styles.specialDateLight}>{formatDate(achievement.unlockedAt)}</Text>
            </View>
          </LinearGradient>
        ) : (
          <LinearGradient colors={['rgba(226,232,240,0.72)', 'rgba(203,213,225,0.56)']} style={styles.specialLocked}>
            <View style={styles.specialHead}>
              <View style={styles.specialLockWrap}><Text style={styles.specialLock}>🔒</Text></View>
              <View style={styles.specialCopy}>
                <Text style={styles.specialTitleLocked}>{title}</Text>
                <Text style={styles.specialLabelLocked}>ЕЩЁ НЕ ПОЛУЧЕНО</Text>
              </View>
            </View>
            <Text style={styles.specialCondition}>{definition.condition}</Text>
            <View style={styles.conditionTag}><Text style={styles.conditionTagText}>УСЛОВИЕ</Text></View>
          </LinearGradient>
        )}
      </Pressable>
    </Animated.View>
  );
}

function DetailModal({ detail, onClose }: { detail: Detail | null; onClose: () => void }) {
  if (!detail) return null;
  const monthly = detail.kind === 'month';
  const title = monthly ? MONTHS[detail.medal.month - 1]?.name ?? 'Медаль' : detail.definition.title;
  const icon = monthly ? detail.medal.place === 1 ? '🥇' : detail.medal.place === 2 ? '🥈' : '🥉' : detail.definition.icon;
  const date = monthly ? detail.medal.unlockedAt : detail.achievement.unlockedAt;
  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(150)} style={styles.modalBackdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View entering={SlideInDown.springify().damping(18)} exiting={SlideOutDown.duration(180)} style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Pressable style={styles.modalClose} onPress={onClose}><X color={colors.inkSecondary} size={20} /></Pressable>
          <LinearGradient colors={['#FFD27A', '#F5B544', colors.clay]} style={styles.modalIcon}><Text style={styles.modalEmoji}>{icon}</Text></LinearGradient>
          <Text style={styles.modalKicker}>{monthly ? 'МЕДАЛЬ ЗА МЕСЯЦ' : 'ОСОБОЕ ДОСТИЖЕНИЕ'}</Text>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalDescription}>{monthly ? `${detail.medal.place}-е место в группе. Отличный результат!` : detail.definition.description}</Text>
          {date ? <Text style={styles.modalDate}>Получено: {formatDate(date)}</Text> : null}
          <Pressable style={styles.modalButton} onPress={onClose}><Text style={styles.modalButtonText}>Отлично!</Text></Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

export default function StudentAchievementsScreen() {
  const achievements = useStudentAchievements();
  const profile = useStudentProfile();
  const rating = useStudentRating('month');
  const [detail, setDetail] = useState<Detail | null>(null);

  if (achievements.isLoading || profile.isLoading) return <AppStateView kind="loading" />;
  if (achievements.isError) return <AppStateView kind="error" message="Не удалось загрузить достижения." onRetry={() => void achievements.refetch()} />;

  const payload = achievements.data;
  const student = payload?.student;
  const gender = student?.gender ?? profile.data?.gender ?? 'MALE';
  const medals = Array.from({ length: 12 }, (_, index) => payload?.monthGrid?.find((item) => item.month === index + 1) ?? { month: index + 1, unlocked: false });
  const unlocked = medals.filter((medal) => medal.unlocked);
  const gold = payload?.stats?.goldCount ?? unlocked.filter((medal) => medal.place === 1).length;
  const silver = payload?.stats?.silverCount ?? unlocked.filter((medal) => medal.place === 2).length;
  const bronze = payload?.stats?.bronzeCount ?? unlocked.filter((medal) => medal.place === 3).length;
  const specials = payload?.specialAchievements ?? [];
  const podium = rating.data?.rating?.slice(0, 3) ?? [];
  const refreshing = achievements.isRefetching || profile.isRefetching || rating.isRefetching;
  const listData: RewardListItem[] = (() => {
    const items: RewardListItem[] = [{ kind: 'monthsHeading', id: 'months-heading' }];
    for (let index = 0; index < medals.length; index += 2) {
      items.push({
        kind: 'monthRow',
        id: `months-${index}`,
        medals: medals.slice(index, index + 2),
        startIndex: index,
      });
    }
    items.push({ kind: 'monthsHint', id: 'months-hint' });
    if (specials.length) {
      items.push({ kind: 'specialsHeading', id: 'specials-heading' });
      specials.forEach((achievement, index) => {
        const definition = SPECIALS[achievement.key];
        if (definition) items.push({ kind: 'special', id: `special-${achievement.key}`, achievement, definition, index });
      });
    }
    return items;
  })();

  const listHeader = (
    <>
      <Animated.View entering={FadeInDown.duration(440)} style={styles.pageHeader}>
        <View style={styles.kicker}><Text style={styles.kickerText}>НАГРАДЫ</Text></View>
        <MaskedView style={styles.titleMask} maskElement={<Text style={styles.pageTitle}>Твой путь</Text>}>
          <LinearGradient colors={[colors.blue, colors.teal, colors.clay]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}>
            <Text style={[styles.pageTitle, styles.titleMeasure]}>Твой путь</Text>
          </LinearGradient>
        </MaskedView>
        <Text style={styles.pageDescription}>Каждая медаль — доказательство твоих усилий.</Text>
      </Animated.View>

      <ProfileHero fullName={student?.fullName ?? profile.data?.fullName ?? 'Ученик'} groupName={student?.groupName ?? profile.data?.group?.name ?? '—'} gold={gold} silver={silver} bronze={bronze} />

      <View style={styles.section}>
        <SectionHeading icon={<Users color={colors.blue} size={14} />} label="ТОП‑3 ГРУППЫ" action="рейтинг" onAction={() => router.push('/(student)/(tabs)/grades')} />
        <Animated.View entering={FadeInDown.delay(160).duration(480)} style={styles.podiumWrap}>
          <View style={styles.podiumTitle}><Trophy color="#F5B544" size={16} /><Text style={styles.podiumTitleText}>Подиум месяца</Text></View>
          <Podium entries={podium} />
        </Animated.View>
      </View>
    </>
  );

  const renderItem = ({ item }: { item: RewardListItem }) => {
    if (item.kind === 'monthsHeading') {
      return <View style={styles.section}><SectionHeading icon={<Award color={colors.blue} size={14} />} label="МЕДАЛИ ПО МЕСЯЦАМ" /></View>;
    }
    if (item.kind === 'monthRow') {
      return (
        <View style={styles.monthRow}>
          {item.medals.map((medal, offset) => (
            <MonthCard key={medal.month} medal={medal} index={item.startIndex + offset} onPress={() => setDetail({ kind: 'month', medal })} />
          ))}
        </View>
      );
    }
    if (item.kind === 'monthsHint') {
      return <Text style={styles.hint}>Нажми на карточку, чтобы увидеть подробности и поделиться победой.</Text>;
    }
    if (item.kind === 'specialsHeading') {
      return <View style={styles.section}><SectionHeading icon={<Sparkles color={colors.blue} size={14} />} label="ОСОБЫЕ ДОСТИЖЕНИЯ" /></View>;
    }
    return (
      <View style={styles.specialItem}>
        <SpecialCard achievement={item.achievement} definition={item.definition} gender={gender} index={item.index} onPress={() => setDetail({ kind: 'special', achievement: item.achievement, definition: item.definition })} />
      </View>
    );
  };

  return (
    <>
      <Screen scroll={false} background={<StudentBackground particleCount={3} />} contentStyle={styles.screenFrame}>
        <FlatList
          data={listData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={listHeader}
          contentContainerStyle={styles.screenContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          updateCellsBatchingPeriod={48}
          windowSize={4}
          removeClippedSubviews
          refreshing={refreshing}
          onRefresh={() => void Promise.all([achievements.refetch(), profile.refetch(), rating.refetch()])}
        />
      </Screen>
      <DetailModal detail={detail} onClose={() => setDetail(null)} />
    </>
  );
}

const styles = StyleSheet.create({
  screenFrame: { paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 },
  screenContent: { paddingHorizontal: spacing.md, paddingTop: 4, paddingBottom: 210 },
  pageHeader: { marginBottom: 22 },
  kicker: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: 'rgba(38,80,187,0.10)', borderWidth: 1, borderColor: 'rgba(38,80,187,0.28)' },
  kickerText: { color: colors.blue, fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  titleMask: { alignSelf: 'flex-start', height: 44, marginTop: 12 },
  pageTitle: { color: colors.ink, fontSize: 34, lineHeight: 42, fontWeight: '900', letterSpacing: -1.4 },
  titleMeasure: { opacity: 0 },
  pageDescription: { marginTop: 6, color: colors.inkSecondary, fontSize: 13, lineHeight: 20 },
  profileShadow: { borderRadius: radius.lg, boxShadow: '0 4px 18px rgba(55,47,87,0.08), 0 1px 3px rgba(55,47,87,0.04)' },
  profileHero: { paddingHorizontal: 14, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(245,181,68,0.40)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.70)' },
  profileMedal: { width: 54, height: 54, flexShrink: 0, alignItems: 'center', justifyContent: 'center', borderRadius: 18, boxShadow: '0 12px 30px rgba(245,181,68,0.32)' },
  profileMedalEmoji: { fontSize: 29 }, profileCopy: { flex: 1, minWidth: 0 },
  profileName: { color: colors.ink, fontSize: 17, lineHeight: 20, fontWeight: '900' },
  profileGroup: { marginTop: 3, color: colors.inkSecondary, fontSize: 12 },
  medalStats: { marginTop: 10, flexDirection: 'row', gap: 6 },
  medalStat: { flex: 1, minWidth: 0, alignItems: 'center', paddingHorizontal: 4, paddingVertical: 7, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.62)', borderWidth: 1, borderColor: 'rgba(245,181,68,0.28)' },
  medalStatValue: { color: colors.ink, fontSize: 13, fontWeight: '900' }, medalStatLabel: { marginTop: 2, color: colors.inkSecondary, fontSize: 9, fontWeight: '600' },
  section: { marginTop: 26 }, sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 12 },
  sectionIcon: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderRadius: 7 },
  sectionLabel: { color: colors.inkSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 1.35 }, sectionLine: { flex: 1, height: 1 },
  sectionAction: { flexDirection: 'row', alignItems: 'center' }, sectionActionText: { color: colors.wool, fontSize: 10, fontWeight: '800' },
  podiumWrap: { overflow: 'hidden', paddingTop: 16, borderRadius: radius.lg, backgroundColor: 'rgba(255,255,255,0.76)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.68)', boxShadow: '0 4px 18px rgba(55,47,87,0.08)' },
  podiumTitle: { paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8 }, podiumTitleText: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  podiumStage: { position: 'relative', paddingHorizontal: 14, paddingTop: 40, paddingBottom: 20 }, podiumFloor: { position: 'absolute', left: '8%', right: '8%', bottom: 0, height: 60, borderRadius: 60 },
  podiumRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 7 }, podiumColumn: { position: 'relative', flex: 1, minWidth: 0, alignItems: 'center', gap: 7 }, crown: { position: 'absolute', top: -28, fontSize: 23 },
  avatarRing: { width: 50, height: 50, padding: 3, borderRadius: 25 }, podiumAvatar: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 22 }, podiumInitials: { color: colors.wool, fontSize: 16, fontWeight: '900' },
  podiumName: { width: '100%', paddingHorizontal: 2, color: colors.ink, fontSize: 10, fontWeight: '800', textAlign: 'center' }, podiumScore: { minHeight: 14, color: colors.inkSecondary, fontSize: 9, fontWeight: '700' },
  pedestal: { width: '100%', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 9, borderTopLeftRadius: 14, borderTopRightRadius: 14 }, pedestal1: { height: 100 }, pedestal2: { height: 78 }, pedestal3: { height: 62 }, pedestalText: { color: colors.wool, fontSize: 23, fontWeight: '900' }, podiumEmpty: { padding: 24, color: colors.inkSecondary, fontSize: 13, textAlign: 'center' },
  monthRow: { flexDirection: 'row', gap: 12, marginBottom: 12 }, monthCell: { flex: 1 }, monthPressable: { borderRadius: 18 }, cardPressed: { transform: [{ scale: 0.97 }] },
  monthCard: { position: 'relative', overflow: 'hidden', minHeight: 176, paddingHorizontal: 12, paddingVertical: 14, borderRadius: 18 }, monthLocked: { minHeight: 170, paddingHorizontal: 12, paddingVertical: 14, borderRadius: 18, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(100,116,139,0.55)' },
  monthLabel: { color: 'rgba(255,255,255,0.78)', fontSize: 9, fontWeight: '900', letterSpacing: 1.05 }, lockedMonthLabel: { color: 'rgba(15,23,42,0.55)', fontSize: 9, fontWeight: '900', letterSpacing: 1.05 },
  placeBubble: { position: 'absolute', top: 10, right: 10, width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.65)', boxShadow: '0 6px 14px rgba(15,23,42,0.18)' }, placeBubbleText: { fontSize: 15 },
  monthMainIcon: { marginTop: 16, fontSize: 38 }, monthBottom: { marginTop: 'auto' }, monthTitle: { color: colors.white, fontSize: 14, lineHeight: 17, fontWeight: '900' }, monthDescription: { marginTop: 4, color: 'rgba(255,255,255,0.80)', fontSize: 10, lineHeight: 14 },
  decor: { position: 'absolute', color: 'rgba(255,255,255,0.18)', fontSize: 23 }, decorTop: { top: 36, right: 18 }, decorBottom: { bottom: 22, left: 16 }, lockIcon: { marginTop: 23, fontSize: 29, opacity: 0.56 }, lockedText: { marginTop: 'auto', color: 'rgba(15,23,42,0.55)', fontSize: 9, fontWeight: '900', letterSpacing: 1.05 },
  hint: { marginTop: -2, marginHorizontal: 2, color: colors.inkMuted, fontSize: 11, lineHeight: 17 }, specialItem: { marginBottom: 12 }, specialShadow: { borderRadius: 18 },
  specialCard: { position: 'relative', overflow: 'hidden', paddingHorizontal: 16, paddingVertical: 18, gap: 10, borderRadius: 18, borderWidth: 2, borderColor: 'rgba(255,255,255,0.20)', boxShadow: '0 14px 30px rgba(15,23,42,0.20)' }, specialLocked: { paddingHorizontal: 16, paddingVertical: 18, gap: 10, borderRadius: 18, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(100,116,139,0.55)' },
  specialHead: { flexDirection: 'row', alignItems: 'center', gap: 12 }, specialIconWrap: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: 'rgba(15,23,42,0.30)', boxShadow: '0 10px 22px rgba(0,0,0,0.30)' }, specialIcon: { fontSize: 28 }, specialCopy: { flex: 1, minWidth: 0 },
  specialTitleLight: { color: '#F8FAFC', fontSize: 16, fontWeight: '900' }, specialLabelLight: { marginTop: 2, color: 'rgba(248,250,252,0.78)', fontSize: 9, fontWeight: '800', letterSpacing: 1.25 }, specialDescriptionLight: { color: 'rgba(248,250,252,0.88)', fontSize: 12, lineHeight: 18 },
  specialFooter: { marginTop: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, specialTagLight: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: 'rgba(15,23,42,0.36)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' }, specialTagTextLight: { color: colors.white, fontSize: 9, fontWeight: '900', letterSpacing: 1 }, specialDateLight: { color: 'rgba(248,250,252,0.72)', fontSize: 9, fontWeight: '700' },
  specialDecor: { position: 'absolute', color: 'rgba(255,255,255,0.16)', fontSize: 38 }, specialDecorTop: { top: -5, right: -3 }, specialDecorBottom: { bottom: -13, left: -5, opacity: 0.12 }, specialLockWrap: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: 'rgba(226,232,240,0.90)', borderWidth: 1, borderColor: 'rgba(100,116,139,0.30)' }, specialLock: { fontSize: 26, opacity: 0.7 }, specialTitleLocked: { color: 'rgba(15,23,42,0.70)', fontSize: 16, fontWeight: '900' }, specialLabelLocked: { marginTop: 2, color: 'rgba(15,23,42,0.48)', fontSize: 9, fontWeight: '800', letterSpacing: 1.25 }, specialCondition: { color: 'rgba(15,23,42,0.55)', fontSize: 12, lineHeight: 18 }, conditionTag: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: 'rgba(148,163,184,0.22)' }, conditionTagText: { color: 'rgba(15,23,42,0.60)', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(10,15,41,0.48)' }, modalSheet: { alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: 12, paddingBottom: 34, borderTopLeftRadius: 30, borderTopRightRadius: 30, backgroundColor: colors.background, boxShadow: '0 -24px 60px rgba(55,47,87,0.25)' }, modalHandle: { width: 42, height: 4, borderRadius: 2, backgroundColor: colors.border }, modalClose: { position: 'absolute', top: 18, right: 18, width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.82)' }, modalIcon: { width: 82, height: 82, marginTop: 24, alignItems: 'center', justifyContent: 'center', borderRadius: 26, boxShadow: '0 16px 36px rgba(245,181,68,0.35)' }, modalEmoji: { fontSize: 42 }, modalKicker: { marginTop: 18, color: colors.clay, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 }, modalTitle: { marginTop: 7, color: colors.ink, fontSize: 24, fontWeight: '900', textAlign: 'center' }, modalDescription: { marginTop: 8, color: colors.inkSecondary, fontSize: 13, lineHeight: 20, textAlign: 'center' }, modalDate: { marginTop: 12, color: colors.inkMuted, fontSize: 11, fontWeight: '700' }, modalButton: { width: '100%', marginTop: 22, paddingVertical: 14, alignItems: 'center', borderRadius: radius.md, backgroundColor: colors.wool }, modalButtonText: { color: colors.white, fontSize: 14, fontWeight: '900' },
});
