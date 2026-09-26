import { createClient } from '@base44/sdk';

// Cliente nativo Base44 — entidades, autenticação e integrações reais da plataforma.
export const base44 = createClient({
  appId: import.meta.env.VITE_BASE44_APP_ID,
});