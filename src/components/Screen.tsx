import { PropsWithChildren, ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme/tokens';

type Props = PropsWithChildren<{
  scroll?: boolean;
  keyboard?: boolean;
  header?: ReactNode;
  background?: ReactNode;
  contentStyle?: ViewStyle;
  refreshing?: boolean;
  onRefresh?: () => void;
}>;

export function Screen({
  children,
  scroll = true,
  keyboard,
  header,
  background,
  contentStyle,
  refreshing = false,
  onRefresh,
}: Props) {
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.content, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, styles.flex, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {background ? <View pointerEvents="none" style={styles.background}>{background}</View> : null}
      {header}
      {keyboard ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  background: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  flex: { flex: 1 },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: 120 },
});
