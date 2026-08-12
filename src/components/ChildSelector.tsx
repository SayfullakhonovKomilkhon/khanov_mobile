import { ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';
import { UserRound } from 'lucide-react-native';
import type { ParentChild } from '@/types/models';
import { colors, radius, spacing } from '@/theme/tokens';

export function ChildSelector({
  items,
  selectedId,
  onSelect,
}: {
  items: ParentChild[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>К аккаунту пока не привязан ребёнок.</Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
      {items.map((child) => {
        const selected = child.id === selectedId;
        return (
          <Pressable key={child.id} style={[styles.item, selected && styles.selected]} onPress={() => onSelect(child.id)}>
            <View style={[styles.avatar, selected && styles.avatarSelected]}>
              <UserRound size={17} color={selected ? colors.white : colors.teal} />
            </View>
            <View>
              <Text numberOfLines={1} style={[styles.name, selected && styles.nameSelected]}>{child.fullName}</Text>
              <Text numberOfLines={1} style={[styles.group, selected && styles.groupSelected]}>{child.group?.name ?? 'Без группы'}</Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm, paddingBottom: spacing.md },
  item: { minWidth: 200, maxWidth: 260, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface },
  selected: { borderColor: colors.teal, backgroundColor: colors.teal },
  avatar: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#E8F5F2' },
  avatarSelected: { backgroundColor: 'rgba(255,255,255,0.18)' },
  name: { maxWidth: 165, color: colors.ink, fontSize: 13, fontWeight: '900' },
  nameSelected: { color: colors.white },
  group: { marginTop: 2, color: colors.inkSecondary, fontSize: 10 },
  groupSelected: { color: 'rgba(255,255,255,0.72)' },
  empty: { padding: spacing.md, borderRadius: radius.md, backgroundColor: '#FFF5DA' },
  emptyText: { color: '#8A5A00', fontSize: 13, lineHeight: 19 },
});
