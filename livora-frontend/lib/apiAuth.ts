import { apiRequest, type ApiRequestOptions } from './api';
import { getSession } from './session';

export async function apiRequestAuth<T>(options: ApiRequestOptions): Promise<T> {
  const session = getSession();

  if (!session?.tokens?.accessToken) {
    throw new Error('Not authenticated');
  }

  return apiRequest<T>({
    ...options,
    headers: {
      ...(options.headers ?? {}),
      Authorization: `Bearer ${session.tokens.accessToken}`
    }
  });
}
