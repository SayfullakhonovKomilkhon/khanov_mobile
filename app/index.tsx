import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { Brand } from '@/components/Brand';
import { useAuthStore } from '@/store/auth';
import { colors, spacing } from '@/theme/tokens';

export default function EntryScreen() {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Keeps the native splash transition visually stable during auth hydration.
  }, []);

  if (status === 'booting') {
    return (
      <View style={styles.root}>
        <Brand />
        <ActivityIndicator style={styles.loader} color={colors.blue} />
        <Text style={styles.caption}>Подготавливаем ваш кабинет…</Text>
      </View>
    );
  }

  if (status === 'anonymous') return <Redirect href="/(auth)/login" />;
  if (user?.role === 'STUDENT') return <Redirect href="/(student)/(tabs)" />;
  if (user?.role === 'PARENT') return <Redirect href="/(parent)/(tabs)" />;
  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  loader: { marginTop: spacing.xxl },
  caption: { marginTop: spacing.sm, color: colors.inkSecondary, fontSize: 14 },
});
