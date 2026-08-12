export function formatMoney(value?: number | null) {
  return typeof value === 'number' ? `${value.toLocaleString('ru-RU')} сум` : '—';
}

export function formatDate(value?: string | null, options?: Intl.DateTimeFormatOptions) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('ru-RU', options ?? { day: 'numeric', month: 'long' });
}

export function relativeTime(value: string) {
  const date = new Date(value);
  const minutes = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (minutes < 1) return 'только что';
  if (minutes < 60) return `${minutes} мин назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч назад`;
  if (hours < 48) return 'вчера';
  return formatDate(value);
}

export function initials(name?: string | null) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  return `${parts[0]?.[0] ?? 'K'}${parts[1]?.[0] ?? ''}`.toUpperCase();
}

export function lessonTypeLabel(type?: string) {
  const labels: Record<string, string> = {
    REGULAR: 'Урок',
    PRACTICE: 'Практика',
    TEST: 'Тест',
    CONTROL: 'Контрольная',
    HOMEWORK: 'Домашняя',
    EXAM: 'Экзамен',
  };
  return type ? labels[type] ?? type : 'Урок';
}
