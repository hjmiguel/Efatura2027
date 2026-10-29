import { adminClient, corsHeaders, getUser, json } from '../_shared/common.ts';
import { PROXYPAY_ENTITY, createReference, generateReferenceId } from '../_shared/proxypay.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const user = await getUser(req);
    if (!user) return json({ error: 'Não autorizado' }, 401);

    let body: { plan?: string } = {};
    try { body = await req.json(); } catch { /* sem corpo */ }
    const plan = body.plan === 'yearly' ? 'yearly' : 'monthly';
    const amount = plan === 'yearly' ? 27000 : 2500;

    const admin = adminClient();
    const { data: existing } = await admin
      .from('records')
      .select('id, data')
      .eq('entity', 'Subscription')
      .eq('data->>user_id', user.id)
      .eq('data->>status', 'active')
      .limit(1);
    if (existing && existing.length > 0) {
      return json({ error: 'Já tens uma subscrição ativa', subscription: { id: existing[0].id, ...existing[0].data } }, 409);
    }

    const referenceId = await generateReferenceId();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await createReference(referenceId, amount, tomorrow.toISOString().slice(0, 10), { user_id: user.id, plan });

    const { data: created, error } = await admin
      .from('records')
      .insert({
        entity: 'Subscription',
        owner_id: user.id,
        data: {
          user_id: user.id,
          plan,
          amount,
          status: 'pending',
          proxypay_reference: referenceId,
          proxypay_entity: PROXYPAY_ENTITY,
        },
      })
      .select('id')
      .single();
    if (error) throw error;

    return json({ subscription_id: created.id, entity: PROXYPAY_ENTITY, reference: referenceId, amount });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});