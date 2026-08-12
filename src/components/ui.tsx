import { ComponentType, ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { router } from 'expo-router';
import { Bell, ChevronRight } from 'lucide-react-native';
import type { LucideProps } from 'lucide-react-native';
import { colors, radius, shadows, spacing } from '@/theme/tokens';

export function PageHeader({
  kicker,
  title,
  subtitle,
  notificationsHref,
  unreadCount = 0,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  notificationsHref?: string;
  unreadCount?: number;
}) {
  return (
    <View style={styles.headerRow}>
      <View style={styles.headerCopy}>
        {kicker ? <Text style={styles.kicker}>{kicker}</Text> : null}
        <Text style={styles.pageTitle}>{title}</Text>
        {subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}
      </View>
      {notificationsHref ? (
        <Pressable
          style={styles.notificationButton}
          onPress={() => router.push(notificationsHref as never)}
        >
          <Bell color={colors.ink} size={21} />
          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          ) : null}
        </Pressable>
      ) : null}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? <Pressable onPress={onAction}><Text style={styles.sectionAction}>{action}</Text></Pressable> : null}
    </View>
  );
}

export function StatCard({ value, label, tone = colors.blue }: { value: string | number; label: string; tone?: string }) {
  return (
    <Card style={styles.statCard}>
      <Text style={[styles.statValue, { color: tone }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

export function ProgressBar({ value, color = colors.blue }: { value: number; color?: string }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${safeValue}%`, backgroundColor: color }]} />
    </View>
  );
}

export function StatusChip({ label, tone = 'neutral' }: { label: string; tone?: 'success' | 'warning' | 'danger' | 'blue' | 'neutral' }) {
  const palette = CHIP_TONES[tone];
  return (
    <View style={[styles.chip, { backgroundColor: palette.background }]}>
      <Text style={[styles.chipText, { color: palette.foreground }]}>{label}</Text>
    </View>
  );
}

const CHIP_TONES = {
  success: { background: '#E7F8F0', foreground: colors.success },
  warning: { background: '#FFF5DA', foreground: '#A26A00' },
  danger: { background: '#FFF0F0', foreground: colors.danger },
  blue: { background: '#EDF1FF', foreground: colors.blue },
  neutral: { background: '#F1F2F7', foreground: colors.inkSecondary },
};

export function MenuRow({
  icon: Icon,
  title,
  subtitle,
  onPress,
  color = colors.blue,
  right,
}: {
  icon: ComponentType<LucideProps>;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  color?: string;
  right?: ReactNode;
}) {
  return (
    <Pressable style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]} onPress={onPress}>
      <View style={[styles.menuIcon, { backgroundColor: `${color}14` }]}>
        <Icon color={color} size={20} />
      </View>
      <View style={styles.menuCopy}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle ? <Text style={styles.menuSubtitle}>{subtitle}</Text> : null}
      </View>
      {right ?? <ChevronRight color={colors.inkMuted} size={19} />}
    </Pressable>
  );
}

export function EmptyInline({ text }: { text: string }) {
  return <Text style={styles.emptyInline}>{text}</Text>;
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md, marginBottom: spacing.xl },
  headerCopy: { flex: 1 },
  kicker: { color: colors.blue, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  pageTitle: { marginTop: 4, color: colors.ink, fontSize: 30, lineHeight: 36, fontWeight: '900', letterSpacing: -1 },
  pageSubtitle: { marginTop: 5, color: colors.inkSecondary, fontSize: 14, lineHeight: 20 },
  notificationButton: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, ...shadows.card },
  badge: { position: 'absolute', top: -3, right: -3, minWidth: 19, height: 19, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderRadius: radius.pill, backgroundColor: colors.danger, borderWidth: 2, borderColor: colors.background },
  badgeText: { color: colors.white, fontSize: 9, fontWeight: '900' },
  card: { padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, ...shadows.card },
  sectionTitleRow: { marginTop: spacing.xl, marginBottom: spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  sectionAction: { color: colors.blue, fontSize: 13, fontWeight: '800' },
  statCard: { flex: 1, minHeight: 92, justifyContent: 'center' },
  statValue: { fontSize: 25, fontWeight: '900', letterSpacing: -0.8 },
  statLabel: { marginTop: 3, color: colors.inkSecondary, fontSize: 11, lineHeight: 15 },
  progressTrack: { height: 9, overflow: 'hidden', borderRadius: radius.pill, backgroundColor: '#E8EAF2' },
  progressFill: { height: '100%', borderRadius: radius.pill },
  chip: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 5, borderRadius: radius.pill },
  chipText: { fontSize: 10, fontWeight: '900' },
  menuRow: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, backgroundColor: colors.surface },
  pressed: { opacity: 0.65 },
  menuIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 13 },
  menuCopy: { flex: 1 },
  menuTitle: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  menuSubtitle: { marginTop: 3, color: colors.inkSecondary, fontSize: 11, lineHeight: 16 },
  emptyInline: { paddingVertical: spacing.xl, color: colors.inkSecondary, textAlign: 'center', fontSize: 14 },
});
