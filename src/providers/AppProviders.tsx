import { PropsWithChildren, useEffect } from 'react';
import { AppState } from 'react-native';
import { focusManager } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useAuthStore } from '@/store/auth';
import { PushLifecycle } from './PushLifecycle';
import { queryClient, queryPersister } from '@/lib/query-client';

export function AppProviders({ children }: PropsWithChildren) {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      focusManager.setFocused(state === 'active');
    });
    return () => subscription.remove();
  }, []);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: queryPersister, maxAge: 24 * 60 * 60 * 1000 }}
    >
      <PushLifecycle />
      {children}
    </PersistQueryClientProvider>
  );
}
