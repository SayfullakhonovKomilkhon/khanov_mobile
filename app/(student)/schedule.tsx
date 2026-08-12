import { StyleSheet, Text, View } from 'react-native';
import { Clock3, UserRound } from 'lucide-react-native';
import { Screen } from '@/components/Screen';
import { AppStateView } from '@/components/AppStateView';
import { Card, PageHeader, SectionTitle } from '@/components/ui';
import { useStudentSchedule } from '@/features/queries';
import { formatDate } from '@/lib/format';
import type { GroupSchedule, ScheduleSlot } from '@/types/models';
import { colors, radius, spacing } from '@/theme/tokens';

const DAY_LABELS: Record<string, string> = { MON: 'Пн', MONDAY: 'Пн', TUE: 'Вт', TUESDAY: 'Вт', WED: 'Ср', WEDNESDAY: 'Ср', THU: 'Чт', THURSDAY: 'Чт', FRI: 'Пт', FRIDAY: 'Пт', SAT: 'Сб', SATURDAY: 'Сб', SUN: 'Вс', SUNDAY: 'Вс' };

function normalize(schedule: GroupSchedule | undefined): ScheduleSlot[] {
  if (!schedule) return [];
  if (Array.isArray(schedule)) return schedule;
  if (Array.isArray(schedule.slots)) return schedule.slots;
  if (Array.isArray(schedule.days)) {
    const byTime = new Map<string, ScheduleSlot>();
    schedule.days.forEach((item) => {
      const key = `${item.startTime}-${item.endTime}`;
      const current = byTime.get(key) ?? { time: item.startTime, days: [] };
      current.days = [...(current.days ?? []), item.day];
      byTime.set(key, current);
    });
    return [...byTime.values()];
  }
  return [];
}

export default function StudentScheduleScreen() {
  const query = useStudentSchedule();
  if (query.isLoading) return <AppStateView kind="loading" />;
  if (query.isError) return <AppStateView kind="error" message="Не удалось загрузить расписание." onRetry={() => void query.refetch()} />;
  const slots = normalize(query.data?.schedule);
  return (
    <Screen>
      <PageHeader kicker="РАСПИСАНИЕ" title="Твои занятия" subtitle={`Группа: ${query.data?.groupName ?? '—'}`} />
      <SectionTitle title="Еженедельно" />
      {slots.length ? slots.map((slot, index) => (
        <Card key={`${slot.time}-${index}`} style={styles.slot}>
          <View style={styles.time}><Clock3 color={colors.blue} size={21} /><Text style={styles.timeText}>{slot.time ?? '—'}</Text>{slot.duration ? <Text style={styles.duration}>{slot.duration} мин</Text> : null}</View>
          <View style={styles.days}>{(slot.days ?? []).map((day) => <View key={day} style={styles.day}><Text style={styles.dayText}>{DAY_LABELS[day] ?? day}</Text></View>)}</View>
        </Card>
      )) : <AppStateView kind="empty" title="Расписание не задано" message="Администратор скоро добавит дни занятий." />}

      <SectionTitle title="Ближайшая тема" />
      <Card style={styles.topic}>
        <Text style={styles.topicDate}>{query.data?.nextTopic ? formatDate(query.data.nextTopic.date, { weekday: 'long', day: 'numeric', month: 'long' }) : 'Дата уточняется'}</Text>
        <Text style={styles.topicTitle}>{query.data?.nextTopic?.topic ?? 'Тема скоро появится'}</Text>
      </Card>

      {query.data?.teacher ? <><SectionTitle title="Преподаватель" /><Card style={styles.teacher}><View style={styles.teacherIcon}><UserRound color={colors.teal} size={22} /></View><View><Text style={styles.teacherName}>{query.data.teacher.fullName}</Text><Text style={styles.teacherPhone}>{query.data.teacher.phone ?? 'Телефон не указан'}</Text></View></Card></> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  slot: { marginBottom: spacing.sm },
  time: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  timeText: { color: colors.ink, fontSize: 20, fontWeight: '900' },
  duration: { marginLeft: 'auto', color: colors.inkSecondary, fontSize: 11 },
  days: { marginTop: spacing.md, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  day: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: '#EDF1FF' },
  dayText: { color: colors.blue, fontSize: 12, fontWeight: '900' },
  topic: { backgroundColor: colors.cream },
  topicDate: { color: colors.clay, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  topicTitle: { marginTop: spacing.xs, color: colors.ink, fontSize: 18, lineHeight: 24, fontWeight: '900' },
  teacher: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  teacherIcon: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm, backgroundColor: '#E8F5F2' },
  teacherName: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  teacherPhone: { marginTop: 3, color: colors.inkSecondary, fontSize: 11 },
});
