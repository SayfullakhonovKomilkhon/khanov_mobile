import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Eye, EyeOff, LockKeyhole, Phone } from 'lucide-react-native';
import { Brand } from '@/components/Brand';
import { Screen } from '@/components/Screen';
import { getApiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { colors, radius, shadows, spacing } from '@/theme/tokens';

const schema = z.object({
  phone: z.string().trim().min(9, 'Введите корректный номер телефона'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginScreen() {
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { phone: '+998', password: '' },
  });

  const submit = handleSubmit(async (values) => {
    setServerError('');
    try {
      const user = await login(values.phone, values.password);
      if (user.role === 'STUDENT') {
        router.replace('/(student)/(tabs)');
        return;
      }
      if (user.role === 'PARENT') {
        router.replace('/(parent)/(tabs)');
        return;
      }
      await logout();
      setServerError('Мобильное приложение доступно только ученикам и родителям.');
    } catch (error) {
      setServerError(getApiErrorMessage(error, 'Неверный номер телефона или пароль'));
    }
  });

  return (
    <Screen keyboard contentStyle={styles.screen}>
      <Brand />
      <View style={styles.copy}>
        <Text style={styles.kicker}>ЛИЧНЫЙ КАБИНЕТ</Text>
        <Text style={styles.title}>С возвращением!</Text>
        <Text style={styles.subtitle}>Войдите как ученик или родитель, чтобы продолжить обучение.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Номер телефона</Text>
        <View style={[styles.field, errors.phone && styles.fieldError]}>
          <Phone color={colors.inkMuted} size={19} />
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                autoComplete="tel"
                placeholder="+998 90 123 45 67"
                placeholderTextColor={colors.inkMuted}
              />
            )}
          />
        </View>
        {errors.phone ? <Text style={styles.error}>{errors.phone.message}</Text> : null}

        <Text style={[styles.label, styles.passwordLabel]}>Пароль</Text>
        <View style={[styles.field, errors.password && styles.fieldError]}>
          <LockKeyhole color={colors.inkMuted} size={19} />
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry={!showPassword}
                textContentType="password"
                autoComplete="password"
                placeholder="Введите пароль"
                placeholderTextColor={colors.inkMuted}
                onSubmitEditing={() => void submit()}
              />
            )}
          />
          <Pressable onPress={() => setShowPassword((value) => !value)} hitSlop={12}>
            {showPassword ? <EyeOff color={colors.inkSecondary} size={20} /> : <Eye color={colors.inkSecondary} size={20} />}
          </Pressable>
        </View>
        {errors.password ? <Text style={styles.error}>{errors.password.message}</Text> : null}
        {serverError ? <Text style={styles.serverError}>{serverError}</Text> : null}

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, isSubmitting && styles.buttonDisabled]}
          onPress={() => void submit()}
          disabled={isSubmitting}
        >
          {isSubmitting ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Войти</Text>}
        </Pressable>
      </View>

      <Text style={styles.help}>Нет доступа? Обратитесь к администратору учебного центра.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: 36 },
  copy: { marginTop: 44, marginBottom: spacing.xl },
  kicker: { color: colors.blue, fontSize: 11, fontWeight: '900', letterSpacing: 2.2 },
  title: { marginTop: spacing.sm, color: colors.ink, fontSize: 36, lineHeight: 42, fontWeight: '900', letterSpacing: -1.4 },
  subtitle: { marginTop: spacing.sm, maxWidth: 360, color: colors.inkSecondary, fontSize: 16, lineHeight: 24 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, ...shadows.card },
  label: { marginBottom: spacing.xs, color: colors.ink, fontSize: 13, fontWeight: '800' },
  passwordLabel: { marginTop: spacing.md },
  field: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.md, backgroundColor: colors.background },
  fieldError: { borderColor: colors.danger },
  input: { flex: 1, minHeight: 54, color: colors.ink, fontSize: 16 },
  error: { marginTop: 6, color: colors.danger, fontSize: 12 },
  serverError: { marginTop: spacing.md, padding: spacing.sm, borderRadius: radius.sm, color: colors.danger, backgroundColor: '#FFF1F1', fontSize: 13, lineHeight: 19 },
  button: { minHeight: 56, marginTop: spacing.xl, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm, backgroundColor: colors.blue, ...shadows.floating },
  buttonPressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  buttonDisabled: { opacity: 0.65 },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: '900' },
  help: { marginTop: spacing.xl, paddingHorizontal: spacing.md, color: colors.inkSecondary, textAlign: 'center', fontSize: 13, lineHeight: 19 },
});
