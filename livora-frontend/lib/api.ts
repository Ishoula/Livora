export type ApiErrorPayload = {
  message?: string;
  error?: string;
};

export type ApiErrorRequestInfo = {
  method: string;
  url: string;
};

export class ApiError extends Error {
  status: number;
  payload?: ApiErrorPayload;
  request?: ApiErrorRequestInfo;

  constructor(status: number, message: string, payload?: ApiErrorPayload, request?: ApiErrorRequestInfo) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
    this.request = request;
  }
}

const getBaseUrl = () => {
  const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envBaseUrl) return envBaseUrl.replace(/\/$/, '');

  return 'http://10.11.74.62:2727';
};

export const API_BASE_URL = getBaseUrl();

export type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
};

export async function apiRequest<T>(options: ApiRequestOptions): Promise<T> {
  const url = `${API_BASE_URL}${options.path.startsWith('/') ? '' : '/'}${options.path}`;
  const method = options.method ?? 'GET';

  const res = await fetch(url, {
    method,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers ?? {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const contentType = res.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');

  const payload: any = isJson ? await res.json().catch(() => undefined) : await res.text().catch(() => undefined);

  if (!res.ok) {
    const message =
      (payload && typeof payload === 'object' && (payload.message || payload.error))
        ? String(payload.message || payload.error)
        : `Request failed with status ${res.status}`;

    throw new ApiError(
      res.status,
      `${message} (${method} ${url})`,
      typeof payload === 'object' ? payload : undefined,
      { method, url }
    );
  }

  return payload as T;
}
