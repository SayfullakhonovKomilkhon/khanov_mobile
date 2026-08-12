import { useEffect, useMemo, useState } from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, ChevronDown, Play } from 'lucide-react-native';
import Animated, {
  FadeInDown,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Screen } from '@/components/Screen';
import { AppStateView } from '@/components/AppStateView';
import { StudentBackground } from '@/components/StudentBackground';
import { useStudentHomeworks } from '@/features/queries';
import type { Homework } from '@/types/models';
import { colors, radius, spacing } from '@/theme/tokens';

function extractVideoId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([A-Za-z0-9_-]{6,})/);
  return match?.[1] ?? null;
}

function dueInfo(dueDate?: string) {
  if (!dueDate) return { label: 'без срока', late: false };
  const due = new Date(dueDate);
  return {
    late: due.getTime() < Date.now(),
    label: `до ${due.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    })}`,
  };
}

function historyDate(value: string) {
  return new Date(value).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function HomeworkMedia({ homework }: { homework: Homework }) {
  const videoId = extractVideoId(homework.youtubeUrl);

  return (
    <>
      {videoId && homework.youtubeUrl ? (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Открыть видео к домашнему заданию"
          style={({ pressed }) => [styles.video, pressed && styles.pressed]}
          onPress={() => void Linking.openURL(homework.youtubeUrl!)}
        >
          <Image
            source={{ uri: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` }}
            style={styles.videoImage}
            resizeMode="cover"
          />
          <View style={styles.videoShade} />
          <View style={styles.playButton}>
            <Play color={colors.white} fill={colors.white} size={22} />
          </View>
        </Pressable>
      ) : null}

      {homework.imageUrls?.length ? (
        <View style={styles.mediaGrid}>
          {homework.imageUrls.map((url) => (
            <Pressable
              key={url}
              accessibilityRole="imagebutton"
              style={({ pressed }) => [styles.mediaItem, pressed && styles.pressed]}
              onPress={() => void Linking.openURL(url)}
            >
              <Image source={{ uri: url }} style={styles.mediaImage} resizeMode="cover" />
            </Pressable>
          ))}
        </View>
      ) : null}
    </>
  );
}

function CurrentHomework({ homework }: { homework: Homework }) {
  const due = useMemo(() => dueInfo(homework.dueDate), [homework.dueDate]);
  const glow = useSharedValue(0);

  useEffect(() => {
    if (!due.late) return;
    glow.value = withRepeat(
      withSequence(withTiming(1, { duration: 900 }), withTiming(0, { duration: 900 })),
      -1,
      false,
    );
  }, [due.late, glow]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: due.late ? 0.45 + glow.value * 0.5 : 1,
    transform: [{ scale: due.late ? 1 + glow.value * 0.025 : 1 }],
  }));

  return (
    <Animated.View entering={FadeInDown.duration(560).springify()} style={styles.currentWrap}>
      <LinearGradient
        colors={['rgba(38,80,187,0.11)', 'rgba(16,129,116,0.08)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.current}
      >
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(255,255,255,0.62)', 'rgba(255,255,255,0)', 'rgba(255,248,240,0.24)']}
          locations={[0, 0.52, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.currentHead}>
          <Animated.View style={[styles.currentPill, due.late && styles.currentPillLate, glowStyle]}>
            <Text style={[styles.currentPillText, due.late && styles.currentPillTextLate]}>
              {due.late ? '🔥 ПРОСРОЧЕНО' : '🎯 ТЕКУЩЕЕ'}
            </Text>
          </Animated.View>
          <Text style={styles.due}>{due.label}</Text>
        </View>
        <Text style={styles.currentText}>{homework.text}</Text>
        <HomeworkMedia homework={homework} />
      </LinearGradient>
    </Animated.View>
  );
}

function HistoryItem({ homework, index }: { homework: Homework; index: number }) {
  const [open, setOpen] = useState(false);
  const arrow = useSharedValue(0);

  useEffect(() => {
    arrow.value = withTiming(open ? 1 : 0, { duration: 220 });
  }, [arrow, open]);

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${arrow.value * 180}deg` }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(100 + index * 70).duration(420)}
      layout={LinearTransition.duration(240)}
      style={styles.historyShadow}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={({ pressed }) => [styles.historyItem, pressed && styles.historyPressed]}
        onPress={() => setOpen((value) => !value)}
      >
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(255,255,255,0.94)', 'rgba(255,255,255,0.68)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.historyRow}>
          <View style={styles.historyCopy}>
            <Text style={styles.historyDate}>{historyDate(homework.createdAt)}</Text>
            <Text numberOfLines={open ? undefined : 1} style={styles.historyPreview}>
              {homework.text}
            </Text>
          </View>
          <Animated.View style={arrowStyle}>
            <ChevronDown color={colors.inkSecondary} size={17} />
          </Animated.View>
        </View>
        {open ? (
          <Animated.View entering={FadeInDown.duration(220)} exiting={FadeOut.duration(140)} style={styles.historyBody}>
            <Text style={styles.historyBodyText}>{homework.text}</Text>
            <HomeworkMedia homework={homework} />
          </Animated.View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

export default function StudentHomeworkScreen() {
  const query = useStudentHomeworks();

  if (query.isLoading) return <AppStateView kind="loading" />;
  if (query.isError) {
    return (
      <AppStateView
        kind="error"
        message="Не удалось загрузить домашние задания."
        onRetry={() => void query.refetch()}
      />
    );
  }

  const items = query.data ?? [];
  const latest = items[0];
  const history = items.slice(1);

  return (
    <Screen
      background={<StudentBackground />}
      contentStyle={styles.screenContent}
      refreshing={query.isRefetching}
      onRefresh={() => void query.refetch()}
    >
      <Animated.View entering={FadeInDown.duration(460)} style={styles.pageHeader}>
        <View style={styles.kicker}>
          <Text style={styles.kickerText}>ДОМАШКА</Text>
        </View>
        <MaskedView
          style={styles.titleMask}
          maskElement={<Text style={styles.pageTitle}>Твои задания</Text>}
        >
          <LinearGradient
            colors={[colors.blue, colors.teal, colors.clay]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
          >
            <Text style={[styles.pageTitle, styles.titleMeasure]}>Твои задания</Text>
          </LinearGradient>
        </MaskedView>
        <Text style={styles.pageDescription}>Каждое ДЗ — шанс закрепить тему и собрать XP.</Text>
      </Animated.View>

      {latest ? (
        <CurrentHomework homework={latest} />
      ) : (
        <Animated.View entering={FadeInDown.delay(80).duration(460)} style={styles.empty}>
          <Text style={styles.emptyEmoji}>📚</Text>
          <Text style={styles.emptyText}>Домашних заданий пока нет</Text>
        </Animated.View>
      )}

      {history.length ? (
        <View style={styles.historySection}>
          <View style={styles.sectionHeading}>
            <LinearGradient
              colors={['rgba(38,80,187,0.18)', 'rgba(239,142,56,0.16)']}
              style={styles.sectionIcon}
            >
              <BookOpen color={colors.blue} size={14} />
            </LinearGradient>
            <Text style={styles.sectionLabel}>ИСТОРИЯ ЗАДАНИЙ</Text>
            <LinearGradient
              colors={['rgba(55,47,87,0.16)', 'rgba(55,47,87,0)']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.sectionLine}
            />
          </View>
          {history.map((homework, index) => (
            <HistoryItem key={homework.id} homework={homework} index={index} />
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: { paddingTop: 4, paddingBottom: 210 },
  pageHeader: { marginBottom: 22 },
  kicker: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: 'rgba(38,80,187,0.10)', borderWidth: 1, borderColor: 'rgba(38,80,187,0.28)' },
  kickerText: { color: colors.blue, fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  titleMask: { alignSelf: 'flex-start', marginTop: 12 },
  pageTitle: { color: colors.ink, fontSize: 34, lineHeight: 37, fontWeight: '900', letterSpacing: -1.4 },
  titleMeasure: { opacity: 0 },
  pageDescription: { marginTop: 6, color: colors.inkSecondary, fontSize: 13, lineHeight: 20 },
  currentWrap: { borderRadius: radius.lg, boxShadow: '0 24px 64px rgba(38,80,187,0.13)' },
  current: { position: 'relative', overflow: 'hidden', padding: 20, borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(38,80,187,0.24)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.72)' },
  currentHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.xs, marginBottom: spacing.sm },
  currentPill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: 'rgba(38,80,187,0.14)' },
  currentPillLate: { backgroundColor: 'rgba(226,88,88,0.14)' },
  currentPillText: { color: colors.blue, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  currentPillTextLate: { color: '#B53A3A' },
  due: { flexShrink: 1, color: colors.inkSecondary, fontSize: 11, fontWeight: '700', textAlign: 'right' },
  currentText: { color: colors.ink, fontSize: 15, lineHeight: 23, fontWeight: '500' },
  video: { height: 174, marginTop: 14, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: '#0A0F29' },
  videoImage: { width: '100%', height: '100%' },
  videoShade: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(10,15,41,0.30)' },
  playButton: { position: 'absolute', width: 54, height: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 27, backgroundColor: 'rgba(239,142,56,0.94)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.84)', boxShadow: '0 10px 28px rgba(239,142,56,0.34)' },
  mediaGrid: { marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  mediaItem: { width: '48.7%', aspectRatio: 1, overflow: 'hidden', borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: '#EEF0FA' },
  mediaImage: { width: '100%', height: '100%' },
  pressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
  empty: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md, paddingVertical: 40 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { marginTop: 10, color: colors.inkSecondary, fontSize: 14, textAlign: 'center' },
  historySection: { marginTop: 28, gap: 10 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 2 },
  sectionIcon: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderRadius: 7 },
  sectionLabel: { color: colors.inkSecondary, fontSize: 12, fontWeight: '800', letterSpacing: 1.6 },
  sectionLine: { flex: 1, height: 1 },
  historyShadow: { borderRadius: radius.md, boxShadow: '0 4px 18px rgba(55,47,87,0.08), 0 1px 3px rgba(55,47,87,0.04)' },
  historyItem: { position: 'relative', overflow: 'hidden', padding: 14, borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.68)' },
  historyPressed: { transform: [{ scale: 0.985 }], borderColor: 'rgba(38,80,187,0.28)' },
  historyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  historyCopy: { flex: 1, minWidth: 0 },
  historyDate: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  historyPreview: { marginTop: 3, color: colors.inkSecondary, fontSize: 12, lineHeight: 17 },
  historyBody: { marginTop: 10, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  historyBodyText: { color: colors.ink, fontSize: 13, lineHeight: 20 },
});
