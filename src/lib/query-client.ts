import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnReconnect: true,
    },
    mutations: { retry: 0 },
  },
});

export const queryPersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'khanovmath.query-cache',
  throttleTime: 1000,
});

export async function clearUserQueryCache() {
  queryClient.clear();
  await queryPersister.removeClient();
}
