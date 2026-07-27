import { env } from '@/config/env';
import { tokenStorage } from './tokenStorage';
import type { ApiError } from '@/types/models';

export class HttpClient {
  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.requestTimeoutMs);
    const token = tokenStorage.get();
    const headers = new Headers(init.headers);
    if (!(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    try {
      const response = await fetch(`${env.apiUrl}${path}`, { ...init, headers, signal: controller.signal });
      const data = response.status === 204 ? undefined : await response.json();
      if (!response.ok) throw { message: data?.message || 'Pedido não concluído', status: response.status, details: data } as ApiError;
      return data as T;
    } finally { clearTimeout(timeout); }
  }
  get<T>(path: string) { return this.request<T>(path); }
  post<T>(path: string, body?: unknown) { return this.request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) }); }
  patch<T>(path: string, body: unknown) { return this.request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }); }
  delete<T>(path: string, body?: unknown) { return this.request<T>(path, { method: 'DELETE', body: body === undefined ? undefined : JSON.stringify(body) }); }
}
export const httpClient = new HttpClient();