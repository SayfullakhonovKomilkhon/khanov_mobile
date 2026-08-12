import { create } from 'zustand';
import { api, setSessionExpiredHandler } from '@/lib/api';
import { clearTokens, getAccessToken, saveTokens } from '@/lib/secure-session';
import type { ApiEnvelope, AuthPayload, AuthUser } from '@/types/api';
import { unregisterCurrentDevice } from '@/lib/push';
import { clearUserQueryCache } from '@/lib/query-client';

type AuthStatus = 'booting' | 'authenticated' | 'anonymous';

type AuthState = {
  status: AuthStatus;
  user: AuthUser | null;
  hydrate: () => Promise<void>;
  login: (phone: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  expire: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  status: 'booting',
  user: null,

  hydrate: async () => {
    const token = await getAccessToken();
    if (!token) {
      set({ status: 'anonymous', user: null });
      return;
    }

    try {
      const response = await api.get<ApiEnvelope<AuthUser>>('/auth/me');
      set({ status: 'authenticated', user: response.data.data });
    } catch {
      await clearTokens();
      await clearUserQueryCache();
      set({ status: 'anonymous', user: null });
    }
  },

  login: async (phone, password) => {
    const response = await api.post<ApiEnvelope<AuthPayload>>('/auth/login', {
      phone: phone.trim(),
      password,
    });
    const payload = response.data.data;
    await saveTokens(payload.accessToken, payload.refreshToken);
    set({ status: 'authenticated', user: payload.user });
    return payload.user;
  },

  logout: async () => {
    try {
      await unregisterCurrentDevice();
      await api.post('/auth/logout');
    } catch {
      // Local logout must always succeed, including when the server is offline.
    } finally {
      await clearTokens();
      await clearUserQueryCache();
      set({ status: 'anonymous', user: null });
    }
  },

  expire: () => {
    void clearUserQueryCache();
    set({ status: 'anonymous', user: null });
  },
}));

setSessionExpiredHandler(() => useAuthStore.getState().expire());
