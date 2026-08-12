import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useParentStore } from '@/store/parent';
import type { ApiEnvelope } from '@/types/api';
import type {
  AchievementsPayload,
  AnnouncementsResponse,
  AppNotification,
  AttendanceRecord,
  GradeRecord,
  Homework,
  MyRating,
  ParentProfile,
  PaymentSummary,
  ScheduleData,
  StudentProfile,
  StudentProgress,
} from '@/types/models';

const unwrap = <T,>(response: { data: ApiEnvelope<T> }) => response.data.data;

export function useStudentProfile() {
  return useQuery({
    queryKey: ['student-profile'],
    queryFn: () => api.get<ApiEnvelope<StudentProfile>>('/students/me').then(unwrap),
    staleTime: 5 * 60_000,
  });
}

export function useStudentProgress() {
  return useQuery({
    queryKey: ['student-progress'],
    queryFn: () => api.get<ApiEnvelope<StudentProgress>>('/achievements/my/progress').then(unwrap),
    refetchInterval: 30_000,
  });
}

export function useStudentHomeworks() {
  return useQuery({
    queryKey: ['student-homework'],
    queryFn: () => api.get<ApiEnvelope<Homework[]>>('/homework/my').then(unwrap),
  });
}

export function useStudentGrades() {
  return useQuery({
    queryKey: ['student-grades'],
    queryFn: () => api.get<ApiEnvelope<GradeRecord[]>>('/grades/my').then(unwrap),
  });
}

export function useStudentRating(period: 'month' | 'quarter' | 'all' = 'month') {
  return useQuery({
    queryKey: ['student-rating', period],
    queryFn: () => api.get<ApiEnvelope<MyRating>>('/grades/my/rating', { params: { period } }).then(unwrap),
  });
}

export function useStudentSchedule() {
  return useQuery({
    queryKey: ['student-schedule'],
    queryFn: () => api.get<ApiEnvelope<ScheduleData>>('/schedule/my').then(unwrap),
  });
}

export function useStudentPayments() {
  return useQuery({
    queryKey: ['student-payment'],
    queryFn: () => api.get<ApiEnvelope<PaymentSummary>>('/payments/my').then(unwrap),
  });
}

export function useStudentAchievements() {
  return useQuery({
    queryKey: ['student-achievements'],
    queryFn: () => api.get<ApiEnvelope<AchievementsPayload>>('/achievements/my').then(unwrap),
    staleTime: 5 * 60_000,
  });
}

export function useAnnouncements(limit = 50) {
  return useQuery({
    queryKey: ['announcements', 'my', limit],
    queryFn: () => api.get<ApiEnvelope<AnnouncementsResponse>>('/announcements/my', { params: { limit } }).then(unwrap),
  });
}

export function useMarkAnnouncementRead() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/announcements/${id}/read`),
    onSuccess: () => client.invalidateQueries({ queryKey: ['announcements'] }),
  });
}

export function useNotifications(type?: string) {
  return useQuery({
    queryKey: ['notifications', type || 'all'],
    queryFn: () =>
      api
        .get<ApiEnvelope<{ total: number; notifications: AppNotification[] }>>('/notifications', {
          params: { limit: 50, page: 0, ...(type ? { type } : {}) },
        })
        .then(unwrap),
  });
}

export function useNotificationActions() {
  const client = useQueryClient();
  const invalidate = () => {
    client.invalidateQueries({ queryKey: ['notifications'] });
    client.invalidateQueries({ queryKey: ['notification-count'] });
  };
  return {
    markRead: useMutation({ mutationFn: (id: string) => api.patch(`/notifications/${id}/read`), onSuccess: invalidate }),
    markAll: useMutation({ mutationFn: () => api.patch('/notifications/read-all'), onSuccess: invalidate }),
  };
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ['notification-count'],
    queryFn: () => api.get<ApiEnvelope<{ count: number }>>('/notifications/unread-count').then(unwrap),
    refetchInterval: 30_000,
  });
}

export function useParentProfile() {
  const query = useQuery({
    queryKey: ['parent-profile'],
    queryFn: () => api.get<ApiEnvelope<ParentProfile>>('/parents/me').then(unwrap),
    staleTime: 60_000,
  });
  const selectedChildId = useParentStore((state) => state.selectedChildId);
  const selectChild = useParentStore((state) => state.selectChild);
  const children = query.data?.children ?? [];
  const selected = children.find((child) => child.id === selectedChildId) ?? children[0] ?? null;

  useEffect(() => {
    if (selected && selected.id !== selectedChildId) selectChild(selected.id);
  }, [selectChild, selected, selectedChildId]);

  return { ...query, children, selected, selectedId: selected?.id ?? null, selectChild };
}

function childParams(studentId: string | null) {
  return studentId ? { studentId } : undefined;
}

export function useParentAttendance(studentId: string | null) {
  return useQuery({
    queryKey: ['parent-attendance', studentId],
    queryFn: () => api.get<ApiEnvelope<AttendanceRecord[]>>('/parents/me/child/attendance', { params: childParams(studentId) }).then(unwrap),
    enabled: !!studentId,
  });
}

export function useParentGrades(studentId: string | null) {
  return useQuery({
    queryKey: ['parent-grades', studentId],
    queryFn: () => api.get<ApiEnvelope<GradeRecord[]>>('/parents/me/child/grades', { params: childParams(studentId) }).then(unwrap),
    enabled: !!studentId,
  });
}

export function useParentHomeworks(studentId: string | null) {
  return useQuery({
    queryKey: ['parent-homework', studentId],
    queryFn: () => api.get<ApiEnvelope<Homework[]>>('/parents/me/child/homework', { params: childParams(studentId) }).then(unwrap),
    enabled: !!studentId,
  });
}

export function useParentPayments(studentId: string | null) {
  return useQuery({
    queryKey: ['parent-payment', studentId],
    queryFn: () => api.get<ApiEnvelope<PaymentSummary>>('/parents/me/child/payments', { params: childParams(studentId) }).then(unwrap),
    enabled: !!studentId,
  });
}

export function useParentAchievements(studentId: string | null) {
  return useQuery({
    queryKey: ['parent-achievements', studentId],
    queryFn: () => api.get<ApiEnvelope<AchievementsPayload>>(`/achievements/student/${studentId}`).then(unwrap),
    enabled: !!studentId,
  });
}
