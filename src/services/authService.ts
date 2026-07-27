import { httpClient } from './httpClient';
import { tokenStorage } from './tokenStorage';
import { env } from '@/config/env';
import type { IAuthService } from '@/types/contracts';
import type { AuthTokens, User } from '@/types/models';

class AuthService implements IAuthService {
  async login(email: string, password: string) { const result = await httpClient.post<AuthTokens>('/auth/login', { email, password }); tokenStorage.set(result.access_token); return result; }
  async register(email: string, password: string) { const result = await httpClient.post<AuthTokens & { user: User }>('/auth/register', { email, password }); tokenStorage.set(result.access_token); return result; }
  me() { return httpClient.get<User>('/auth/me'); }
  updateMe(data: Partial<User>) { return httpClient.patch<User>('/auth/me', data); }
  logout() { tokenStorage.clear(); }
  requestPasswordReset(email: string) { return httpClient.post<void>('/auth/password/request', { email }); }
  resetPassword(token: string, password: string) { return httpClient.post<void>('/auth/password/reset', { token, password }); }
  loginWithGoogle(returnTo = '/app') { if (!env.googleAuthUrl) throw new Error('VITE_GOOGLE_AUTH_URL não configurada'); window.location.href = `${env.googleAuthUrl}?returnTo=${encodeURIComponent(returnTo)}`; }
}
export const authService = new AuthService();