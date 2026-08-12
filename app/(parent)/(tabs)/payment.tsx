import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, Send } from 'lucide-react-native';
import { Screen } from '@/components/Screen';
import { AppStateView } from '@/components/AppStateView';
import { ChildSelector } from '@/components/ChildSelector';
import { Card, EmptyInline, PageHeader, SectionTitle, StatusChip } from '@/components/ui';
import { useParentPayments, useParentProfile } from '@/features/queries';
import { api, getApiErrorMessage } from '@/lib/api';
import { formatDate, formatMoney } from '@/lib/format';
import { colors, radius, spacing } from '@/theme/tokens';

const status = (value?: string) => value === 'PAID' || value === 'CONFIRMED' ? { label: 'Оплачено', tone: 'success' as const } : value === 'PENDING' ? { label: 'На проверке', tone: 'warning' as const } : value === 'REJECTED' ? { label: 'Отклонено', tone: 'danger' as const } : { label: 'Не оплачено', tone: 'danger' as const };

export default function ParentPaymentScreen() {
  const profile = useParentProfile();
  const query = useParentPayments(profile.selectedId);
  const client = useQueryClient();
  const [asset, setAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [message, setMessage] = useState('');
  const upload = useMutation({
    mutationFn: async () => {
      if (!asset || !profile.selectedId) throw new Error('Файл не выбран');
      const form = new FormData();
      form.append('studentId', profile.selectedId);
      form.append('file', { uri: asset.uri, name: asset.fileName || `receipt-${Date.now()}.jpg`, type: asset.mimeType || 'image/jpeg' } as unknown as Blob);
      return api.post('/parents/me/child/payments/receipt', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: async () => { setAsset(null); setMessage('Квитанция отправлена на проверку'); await client.invalidateQueries({ queryKey: ['parent-payment'] }); },
    onError: (error) => setMessage(getApiErrorMessage(error, 'Не удалось отправить квитанцию')),
  });
  if (profile.isLoading || query.isLoading) return <AppStateView kind="loading" />;
  if (profile.isError || query.isError) return <AppStateView kind="error" message="Не удалось загрузить оплату." onRetry={() => { void profile.refetch(); void query.refetch(); }} />;
  const current = query.data?.currentMonth;
  const currentStatus = status(current?.status);
  const pick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.82 });
    if (!result.canceled) { setAsset(result.assets[0]); setMessage(''); }
  };
  return (
    <Screen>
      <PageHeader kicker="ОПЛАТА" title="Обучение" subtitle="Баланс, история и отправка квитанции." />
      <ChildSelector items={profile.children} selectedId={profile.selectedId} onSelect={profile.selectChild} />
      <Card style={styles.hero}><View style={styles.heroTop}><Text style={styles.heroLabel}>К оплате</Text><StatusChip label={currentStatus.label} tone={currentStatus.tone} /></View><Text style={styles.amount}>{formatMoney(current?.amount)}</Text><Text style={styles.next}>Следующий платёж: {formatDate(current?.nextPaymentDate)}</Text></Card>

      <SectionTitle title="Отправить квитанцию" />
      <Card>
        {asset ? <Image source={{ uri: asset.uri }} style={styles.preview} resizeMode="cover" /> : <Pressable style={styles.picker} onPress={() => void pick()}><ImagePlus color={colors.teal} size={28} /><Text style={styles.pickerTitle}>Выбрать изображение</Text><Text style={styles.pickerMeta}>JPG, PNG или фото квитанции</Text></Pressable>}
        {asset ? <Pressable style={styles.change} onPress={() => void pick()}><Text style={styles.changeText}>Выбрать другое изображение</Text></Pressable> : null}
        {message ? <Text style={[styles.message, message.includes('отправлена') && styles.success]}>{message}</Text> : null}
        <Pressable style={[styles.send, !asset && styles.disabled]} onPress={() => upload.mutate()} disabled={!asset || upload.isPending}>{upload.isPending ? <ActivityIndicator color={colors.white} /> : <><Send color={colors.white} size={18} /><Text style={styles.sendText}>Отправить на проверку</Text></>}</Pressable>
      </Card>

      <SectionTitle title="История платежей" />
      <View style={styles.history}>{(query.data?.history ?? []).map((item) => { const itemStatus = status(item.status); return <View key={item.id} style={styles.historyRow}><View><Text style={styles.historyAmount}>{formatMoney(item.amount)}</Text><Text style={styles.historyDate}>{formatDate(item.createdAt)}</Text>{item.rejectReason ? <Text style={styles.reject}>{item.rejectReason}</Text> : null}</View><StatusChip label={itemStatus.label} tone={itemStatus.tone} /></View>; })}{(query.data?.history ?? []).length === 0 ? <EmptyInline text="История платежей пока пуста." /> : null}</View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: '#E8F5F2' },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroLabel: { color: colors.inkSecondary, fontSize: 11, fontWeight: '800' },
  amount: { marginTop: spacing.md, color: colors.teal, fontSize: 34, fontWeight: '900' },
  next: { marginTop: 4, color: colors.inkSecondary, fontSize: 11 },
  picker: { minHeight: 150, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderStyle: 'dashed', borderColor: '#B8DCD6', borderRadius: radius.sm, backgroundColor: '#F3FBF9' },
  pickerTitle: { marginTop: spacing.xs, color: colors.ink, fontSize: 14, fontWeight: '900' },
  pickerMeta: { marginTop: 3, color: colors.inkSecondary, fontSize: 10 },
  preview: { width: '100%', height: 210, borderRadius: radius.sm },
  change: { alignItems: 'center', paddingTop: spacing.sm },
  changeText: { color: colors.teal, fontSize: 12, fontWeight: '900' },
  message: { marginTop: spacing.sm, color: colors.danger, fontSize: 12, textAlign: 'center' },
  success: { color: colors.success },
  send: { minHeight: 52, marginTop: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, borderRadius: radius.sm, backgroundColor: colors.teal },
  disabled: { opacity: 0.4 },
  sendText: { color: colors.white, fontSize: 14, fontWeight: '900' },
  history: { overflow: 'hidden', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface },
  historyRow: { minHeight: 70, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  historyAmount: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  historyDate: { marginTop: 3, color: colors.inkSecondary, fontSize: 10 },
  reject: { marginTop: 3, color: colors.danger, fontSize: 10 },
});
