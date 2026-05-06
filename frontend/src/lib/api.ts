import { supabase } from './supabase';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = new Headers(init?.headers);
  const token = session?.access_token;
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type') && init?.body && typeof init.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const url = `/api/${path.replace(/^\/+/, '')}`;
  const res = await fetch(url, { ...init, headers });
  const text = await res.text();
  let parsed: unknown = text;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    /* texto plano */
  }

  if (!res.ok) {
    const msg =
      typeof parsed === 'object' &&
      parsed !== null &&
      'error' in parsed &&
      typeof (parsed as { error: string }).error === 'string'
        ? (parsed as { error: string }).error
        : `Erro ${res.status}`;
    throw new ApiError(res.status, msg);
  }

  return parsed as T;
}
