import { apiRequest } from './api';
import { clearSession, setSession, type PublicUser, type Session } from './session';

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  role: string;
};

export type AuthResponse = {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
};

export async function login(req: LoginRequest): Promise<Session> {
  const data = await apiRequest<AuthResponse>({
    method: 'POST',
    path: '/api/auth/login',
    body: req
  });

  const session: Session = {
    user: data.user,
    tokens: {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken
    }
  };

  setSession(session);
  return session;
}

export async function register(req: RegisterRequest): Promise<Session> {
  const data = await apiRequest<AuthResponse>({
    method: 'POST',
    path: '/api/auth/register',
    body: req
  });

  const session: Session = {
    user: data.user,
    tokens: {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken
    }
  };

  setSession(session);
  return session;
}

export async function logout(refreshToken: string): Promise<void> {
  await apiRequest<{ message: string }>({
    method: 'POST',
    path: '/api/auth/logout',
    body: { refreshToken }
  });

  clearSession();
}
