import { adminClient, corsHeaders, json, userClient } from '../_shared/common.ts';

// Só administradores podem convidar. O convite é enviado pelo Supabase Auth (SMTP configurado no projeto).
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { data: auth } = await userClient(req).auth.getUser();
    if (!auth.user) return json({ error: 'Não autorizado' }, 401);

    const admin = adminClient();
    const { data: me } = await admin.from('profiles').select('role').eq('id', auth.user.id).single();
    if (me?.role !== 'admin') return json({ error: 'Apenas administradores podem convidar' }, 403);

    const { email, role } = await req.json();
    if (!email) return json({ error: 'email é obrigatório' }, 400);
    const finalRole = role === 'admin' ? 'admin' : 'user';

    const { data, error } = await admin.auth.admin.inviteUserByEmail(email);
    if (error) throw error;
    await admin.from('profiles').update({ role: finalRole }).eq('id', data.user.id);
    return json({ success: true });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});