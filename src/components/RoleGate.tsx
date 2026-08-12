import { PropsWithChildren } from 'react';
import { Redirect } from 'expo-router';
import { AppStateView } from './AppStateView';
import { useAuthStore } from '@/store/auth';
import type { Role } from '@/types/api';

export function RoleGate({ role, children }: PropsWithChildren<{ role: Role }>) {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);

  if (status === 'booting') return <AppStateView kind="loading" />;
  if (status === 'anonymous') return <Redirect href="/(auth)/login" />;
  if (user?.role !== role) return <Redirect href="/" />;
  return children;
}
