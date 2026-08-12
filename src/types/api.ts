export type Role =
  | 'STUDENT'
  | 'PARENT'
  | 'TEACHER'
  | 'ADMIN'
  | 'SUPER_ADMIN'
  | 'SALES_MANAGER';

export type AuthUser = {
  id: string;
  phone: string;
  fullName?: string | null;
  role: Role;
  telegramChatId?: string | null;
};

export type ApiEnvelope<T> = {
  data: T;
  statusCode?: number;
  timestamp?: string;
};

export type AuthPayload = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};
