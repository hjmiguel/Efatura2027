const trimSlash = (value: string) => value.replace(/\/$/, '');
export const env = {
  apiUrl: trimSlash(import.meta.env.VITE_API_URL || 'http://localhost:8787/api'),
  googleAuthUrl: import.meta.env.VITE_GOOGLE_AUTH_URL || '',
  requestTimeoutMs: Number(import.meta.env.VITE_REQUEST_TIMEOUT_MS || 20000),
};