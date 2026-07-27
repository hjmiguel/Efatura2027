import { repositories } from '@/repositories';
import { authService } from '@/services/authService';
import { actionService, aiService, ocrService, storageService } from '@/services/integrationServices';
import { tokenStorage } from '@/services/tokenStorage';

const entity = (repo: any) => ({
  list: (sort?: string, limit?: number) => repo.list({ sort, limit }),
  filter: (filter: Record<string, unknown>, sort?: string, limit?: number) => repo.list({ filter, sort, limit }),
  get: (id: string) => repo.get(id), create: (data: unknown) => repo.create(data), update: (id: string, data: unknown) => repo.update(id, data), delete: (id: string) => repo.delete(id), deleteMany: (filter: Record<string, unknown>) => repo.deleteMany(filter),
  bulkCreate: (items: unknown[]) => Promise.all(items.map(item => repo.create(item))),
  bulkUpdate: (items: any[]) => Promise.all(items.map(({ id, ...data }) => repo.update(id, data))),
  updateMany: async (filter: Record<string, unknown>, update: any) => {
    const items = await repo.list({ filter });
    const changes = update?.$set || update;
    return Promise.all(items.map((item: any) => repo.update(item.id, changes)));
  },
});
export const appApi = {
  entities: Object.fromEntries(Object.entries(repositories).map(([name, repo]) => [name, entity(repo)])),
  auth: {
    me: () => authService.me(), updateMe: (data: unknown) => authService.updateMe(data as any),
    loginViaEmailPassword: (email: string, password: string) => authService.login(email, password),
    register: ({ email, password }: any) => authService.register(email, password),
    verifyOtp: async () => ({ access_token: tokenStorage.get() }), resendOtp: async () => undefined,
    setToken: tokenStorage.set, resetPasswordRequest: (email: string) => authService.requestPasswordReset(email),
    resetPassword: ({ resetToken, newPassword }: any) => authService.resetPassword(resetToken, newPassword),
    loginWithProvider: (_provider: string, returnTo: string) => authService.loginWithGoogle(returnTo),
    logout: (redirect?: string) => { authService.logout(); if (redirect) window.location.href = redirect; },
    isAuthenticated: async () => { try { await authService.me(); return true; } catch { return false; } },
  },
  users: { inviteUser: (email: string, role: string) => actionService.invoke('invite-user', { email, role }) },
  analytics: { track: (event: unknown) => actionService.invoke('analytics', event).catch(() => undefined) },
  functions: { invoke: async (name: string, payload: unknown) => ({ data: await actionService.invoke(name, payload) }) },
  integrations: { Core: {
    UploadFile: ({ file }: { file: File }) => storageService.upload(file),
    InvokeLLM: async ({ prompt, file_urls, response_json_schema }: any) => file_urls?.length ? ocrService.extractInvoice(file_urls[0]) : aiService.complete(prompt, response_json_schema),
  } },
};