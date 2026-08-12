import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { AppStateView } from '@/components/AppStateView';
import { Card, EmptyInline, PageHeader, SectionTitle, StatusChip } from '@/components/ui';
import { useStudentPayments } from '@/features/queries';
import { formatDate, formatMoney } from '@/lib/format';
import { colors, radius, spacing } from '@/theme/tokens';

const status = (value?: string) => value === 'PAID' || value === 'CONFIRMED' ? { label: 'Оплачено', tone: 'success' as const } : value === 'PENDING' ? { label: 'На проверке', tone: 'warning' as const } : value === 'REJECTED' ? { label: 'Отклонено', tone: 'danger' as const } : { label: 'Не оплачено', tone: 'danger' as const };

export default function StudentPaymentScreen() {
  const query = useStudentPayments();
  if (query.isLoading) return <AppStateView kind="loading" />;
  if (query.isError) return <AppStateView kind="error" message="Не удалось загрузить оплату." onRetry={() => void query.refetch()} />;
  const current = query.data?.currentMonth;
  const currentStatus = status(current?.status);
  return (
    <Screen>
      <PageHeader kicker="ОПЛАТА" title="Обучение" subtitle="Текущая сумма и история платежей." />
      <Card style={styles.hero}>
        <View style={styles.heroRow}><Text style={styles.heroLabel}>К оплате в этом месяце</Text><StatusChip label={currentStatus.label} tone={currentStatus.tone} /></View>
        <Text style={styles.amount}>{formatMoney(current?.amount)}</Text>
        <Text style={styles.next}>Следующий платёж: {formatDate(current?.nextPaymentDate)}</Text>
      </Card>
      <SectionTitle title="Как оплатить" />
      <View style={styles.methods}>{['💳 Payme', '🟢 Click', '🧡 Apelsin', '🏦 Банк'].map((method) => <View key={method} style={styles.method}><Text style={styles.methodText}>{method}</Text><Text style={styles.methodHint}>KhanovMath Academy</Text></View>)}</View>
      <SectionTitle title="История платежей" />
      <View style={styles.history}>
        {(query.data?.history ?? []).map((item) => { const itemStatus = status(item.status); return <View key={item.id} style={styles.historyRow}><View><Text style={styles.historyAmount}>{formatMoney(item.amount)}</Text><Text style={styles.historyDate}>{formatDate(item.createdAt)}</Text></View><StatusChip label={itemStatus.label} tone={itemStatus.tone} /></View>; })}
        {(query.data?.history ?? []).length === 0 ? <EmptyInline text="История платежей пока пуста." /> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: '#EDF1FF' },
  heroRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroLabel: { color: colors.inkSecondary, fontSize: 11, fontWeight: '800' },
  amount: { marginTop: spacing.md, color: colors.blue, fontSize: 34, fontWeight: '900', letterSpacing: -1 },
  next: { marginTop: 5, color: colors.inkSecondary, fontSize: 12 },
  methods: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  method: { width: '48%', minHeight: 78, justifyContent: 'center', padding: spacing.sm, borderRadius: radius.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  methodText: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  methodHint: { marginTop: 4, color: colors.inkSecondary, fontSize: 9 },
  history: { overflow: 'hidden', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface },
  historyRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  historyAmount: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  historyDate: { marginTop: 3, color: colors.inkSecondary, fontSize: 10 },
});
