import { useState } from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { BookOpen, Clock3, PlayCircle } from 'lucide-react-native';
import { Screen } from '@/components/Screen';
import { AppStateView } from '@/components/AppStateView';
import { Card, EmptyInline, PageHeader, SectionTitle, StatusChip } from '@/components/ui';
import { useStudentHomeworks } from '@/features/queries';
import { formatDate } from '@/lib/format';
import { colors, radius, spacing } from '@/theme/tokens';

export default function StudentHomeworkScreen() {
  const query = useStudentHomeworks();
  const [now] = useState(() => Date.now());
  if (query.isLoading) return <AppStateView kind="loading" />;
  if (query.isError) return <AppStateView kind="error" message="Не удалось загрузить домашние задания." onRetry={() => void query.refetch()} />;

  const items = query.data ?? [];
  return (
    <Screen>
      <PageHeader kicker="ДОМАШКА" title="Твои задания" subtitle="Каждое задание закрепляет тему и приближает к новому уровню." />
      {items.length === 0 ? <AppStateView kind="empty" title="Заданий пока нет" message="Новое домашнее задание появится здесь." /> : null}
      {items.map((item, index) => {
        const overdue = !!item.dueDate && new Date(item.dueDate).getTime() < now;
        return (
          <View key={item.id}>
            {index === 0 ? <SectionTitle title="Актуальное задание" /> : index === 1 ? <SectionTitle title="Предыдущие задания" /> : null}
            <Card style={styles.card}>
              <View style={styles.row}>
                <StatusChip label={index === 0 ? 'Текущее' : formatDate(item.createdAt)} tone={index === 0 ? 'blue' : 'neutral'} />
                {item.dueDate ? <StatusChip label={`до ${formatDate(item.dueDate)}`} tone={overdue ? 'danger' : 'warning'} /> : null}
              </View>
              <Text style={styles.text}>{item.text}</Text>
              {item.imageUrls?.length ? (
                <View style={styles.images}>
                  {item.imageUrls.map((url) => (
                    <Pressable key={url} onPress={() => void Linking.openURL(url)} style={styles.imageWrap}>
                      <Image source={{ uri: url }} style={styles.image} resizeMode="cover" />
                    </Pressable>
                  ))}
                </View>
              ) : null}
              {item.youtubeUrl ? (
                <Pressable style={styles.video} onPress={() => void Linking.openURL(item.youtubeUrl!)}>
                  <PlayCircle color={colors.clay} size={21} />
                  <Text style={styles.videoText}>Открыть видео к заданию</Text>
                </Pressable>
              ) : null}
              <View style={styles.meta}>
                {item.teacher ? <><BookOpen color={colors.inkMuted} size={14} /><Text style={styles.metaText}>{item.teacher.fullName}</Text></> : null}
                <Clock3 color={colors.inkMuted} size={14} />
                <Text style={styles.metaText}>{formatDate(item.createdAt)}</Text>
              </View>
            </Card>
          </View>
        );
      })}
      {items.length === 0 ? <EmptyInline text="Отдыхай или повтори пройденные темы." /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  text: { marginTop: spacing.md, color: colors.ink, fontSize: 15, lineHeight: 23, fontWeight: '600' },
  images: { marginTop: spacing.md, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  imageWrap: { width: '48%', aspectRatio: 1.25, overflow: 'hidden', borderRadius: radius.sm, backgroundColor: colors.background },
  image: { width: '100%', height: '100%' },
  video: { marginTop: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.xs, padding: spacing.sm, borderRadius: radius.sm, backgroundColor: colors.cream },
  videoText: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  meta: { marginTop: spacing.md, paddingTop: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: 6, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  metaText: { marginRight: spacing.sm, color: colors.inkSecondary, fontSize: 11 },
});
