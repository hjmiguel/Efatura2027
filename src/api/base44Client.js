import { createClient } from '@base44/sdk';
import { supabaseApi } from './supabaseClient';
import { SUPABASE_URL } from './supabaseConfig';

// Com VITE_SUPABASE_URL definido, a app usa Supabase (Auth + Postgres + Storage).
// Sem a variável, continua no Base44 — permite migrar e reverter sem mexer nas páginas.
const useSupabase = !!SUPABASE_URL;

export const base44 = useSupabase
  ? supabaseApi
  : createClient({ appId: import.meta.env.VITE_BASE44_APP_ID });