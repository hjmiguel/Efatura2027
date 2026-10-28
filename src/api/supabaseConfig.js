// A chave "publishable" (anon) é pública por desenho; a segurança vem das regras RLS.
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://wxsmijwygdbzcwhkxiyr.supabase.co';
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ma9fsU97y2SRUDe7c-phVg_ykrMqHWp';