import { useState } from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { AppStateView } from '@/components/AppStateView';
import { ChildSelector } from '@/components/ChildSelector';
import { Card, EmptyInline, PageHeader, SectionTitle, StatusChip } from '@/components/ui';
import { useParentHomeworks, useParentProfile } from '@/features/queries';
import { formatDate } from '@/lib/format';
import { colors, radius, spacing } from '@/theme/tokens';

export default function ParentHomeworkScreen() {
  const profile = useParentProfile();
  const query = useParentHomeworks(profile.selectedId);
  const [now] = useState(() => Date.now());
  if (profile.isLoading || query.isLoading) return <AppStateView kind="loading" />;
  if (profile.isError || query.isError) return <AppStateView kind="error" message="Не удалось загрузить домашние задания." onRetry={() => { void profile.refetch(); void query.refetch(); }} />;
  const items = query.data ?? [];
  return (
    <Screen>
      <PageHeader kicker="УЧЁБА" title="Домашние задания" subtitle="Задания и материалы выбранного ребёнка." />
      <ChildSelector items={profile.children} selectedId={profile.selectedId} onSelect={profile.selectChild} />
      {items.map((item, index) => { const overdue = !!item.dueDate && new Date(item.dueDate).getTime() < now; return <View key={item.id}>{index === 0 ? <SectionTitle title="Актуальное задание" /> : index === 1 ? <SectionTitle title="Предыдущие" /> : null}<Card style={styles.card}><View style={styles.top}><StatusChip label={index === 0 ? 'Актуальное' : formatDate(item.createdAt)} tone={index === 0 ? 'blue' : 'neutral'} />{item.dueDate ? <StatusChip label={`до ${formatDate(item.dueDate)}`} tone={overdue ? 'danger' : 'warning'} /> : null}</View><Text style={styles.text}>{item.text}</Text>{item.imageUrls?.length ? <View style={styles.images}>{item.imageUrls.map((url) => <Pressable key={url} style={styles.imageWrap} onPress={() => void Linking.openURL(url)}><Image source={{ uri: url }} style={styles.image} /></Pressable>)}</View> : null}<Text style={styles.teacher}>{item.teacher?.fullName ?? ''}</Text></Card></View>; })}
      {items.length === 0 ? <EmptyInline text="Домашних заданий пока нет." /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.sm },
  top: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  text: { marginTop: spacing.md, color: colors.ink, fontSize: 14, lineHeight: 22, fontWeight: '600' },
  images: { marginTop: spacing.md, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  imageWrap: { width: '48%', aspectRatio: 1.25, overflow: 'hidden', borderRadius: radius.sm },
  image: { width: '100%', height: '100%' },
  teacher: { marginTop: spacing.sm, color: colors.inkSecondary, fontSize: 10 },
});
