import { createClient } from '@base44/sdk';
import { supabaseApi } from './supabaseClient';

// Com VITE_SUPABASE_URL definido, a app usa Supabase (Auth + Postgres + Storage).
// Sem a variável, continua no Base44 — permite migrar e reverter sem mexer nas páginas.
const useSupabase = !!import.meta.env.VITE_SUPABASE_URL;

export const base44 = useSupabase
  ? supabaseApi
  : createClient({ appId: import.meta.env.VITE_BASE44_APP_ID });