import { AxiosError, InternalAxiosRequestConfig, create, isAxiosError } from 'axios';
import { API_URL } from './config';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from './secure-session';
import type { ApiEnvelope, AuthPayload } from '@/types/api';

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const plainApi = create({ baseURL: API_URL, timeout: 15_000 });
export const api = create({ baseURL: API_URL, timeout: 15_000 });

let refreshPromise: Promise<string> | null = null;
let sessionExpiredHandler: (() => void) | null = null;

export function setSessionExpiredHandler(handler: (() => void) | null) {
  sessionExpiredHandler = handler;
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) throw new Error('Refresh token is missing');

      const response = await plainApi.post<ApiEnvelope<AuthPayload>>('/auth/refresh', {
        refreshToken,
      });
      const payload = response.data.data;
      await saveTokens(payload.accessToken, payload.refreshToken);
      return payload.accessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    if (error.response?.status !== 401 || !original || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;
    try {
      const accessToken = await refreshAccessToken();
      original.headers.Authorization = `Bearer ${accessToken}`;
      return api(original);
    } catch (refreshError) {
      await clearTokens();
      sessionExpiredHandler?.();
      return Promise.reject(refreshError);
    }
  },
);

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    if (message) return message;
    if (error.code === 'ECONNABORTED') return 'Сервер отвечает слишком долго. Попробуйте ещё раз.';
    if (!error.response) return 'Нет соединения с сервером. Проверьте интернет.';
  }
  return fallback;
}
