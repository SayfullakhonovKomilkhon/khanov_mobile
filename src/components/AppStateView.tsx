import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { AlertCircle, Inbox } from 'lucide-react-native';
import { colors, radius, spacing } from '@/theme/tokens';

type Props = {
  kind: 'loading' | 'error' | 'empty';
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export function AppStateView({ kind, title, message, onRetry }: Props) {
  return (
    <View style={styles.root}>
      {kind === 'loading' ? (
        <ActivityIndicator size="large" color={colors.blue} />
      ) : kind === 'error' ? (
        <AlertCircle size={36} color={colors.danger} />
      ) : (
        <Inbox size={36} color={colors.inkMuted} />
      )}
      <Text style={styles.title}>
        {title || (kind === 'loading' ? 'Загружаем данные' : kind === 'error' ? 'Что-то пошло не так' : 'Пока пусто')}
      </Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {kind === 'error' && onRetry ? (
        <Pressable style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Повторить</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, minHeight: 280, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  title: { marginTop: spacing.md, color: colors.ink, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  message: { marginTop: spacing.xs, color: colors.inkSecondary, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  button: { marginTop: spacing.lg, paddingHorizontal: spacing.lg, paddingVertical: 12, borderRadius: radius.pill, backgroundColor: colors.blue },
  buttonText: { color: colors.white, fontWeight: '800' },
});
