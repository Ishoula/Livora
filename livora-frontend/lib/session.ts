export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type PublicUser = {
  id: number;
  fullName: string;
  phone: string | null;
  role: string;
  createdAt: string;
};

export type Session = {
  user: PublicUser;
  tokens: AuthTokens;
};

let currentSession: Session | null = null;

export function getSession(): Session | null {
  return currentSession;
}

export function setSession(session: Session): void {
  currentSession = session;
}

export function clearSession(): void {
  currentSession = null;
}
