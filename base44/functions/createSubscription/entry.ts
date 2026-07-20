import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import { PROXYPAY_ENTITY, generateReferenceId, createReference } from "../../shared/proxypay.ts";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let body = {};
    try { body = await req.json(); } catch (e) {}
    const { plan = 'monthly' } = body;
    const amount = plan === 'yearly' ? 27000 : 2500;

    // Verificar subscrição ativa existente
    const existing = await base44.entities.Subscription.filter({ user_id: user.id, status: 'active' });
    if (existing.length > 0) {
      return Response.json({ error: 'Já tens uma subscrição ativa', subscription: existing[0] }, { status: 409 });
    }

    // Gerar referência no Proxypay
    const referenceId = await generateReferenceId();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const endDatetime = tomorrow.toISOString().slice(0, 10);

    await createReference(referenceId, amount, endDatetime, {
      user_id: user.id,
      plan,
    });

    // Criar registo de subscrição
    const subscription = await base44.entities.Subscription.create({
      user_id: user.id,
      plan,
      amount,
      status: 'pending',
      proxypay_reference: referenceId,
      proxypay_entity: PROXYPAY_ENTITY,
    });

    return Response.json({
      subscription_id: subscription.id,
      entity: PROXYPAY_ENTITY,
      reference: referenceId,
      amount,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});