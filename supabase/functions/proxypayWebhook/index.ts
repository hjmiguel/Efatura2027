import { json } from '../_shared/common.ts';
import { processSubscriptionPayment } from '../_shared/proxypay.ts';

// Chamado pelo Proxypay (sem JWT). Se PROXYPAY_WEBHOOK_SECRET estiver definido,
// o URL registado no Proxypay deve terminar em ?secret=<valor>.
Deno.serve(async (req) => {
  try {
    const expected = Deno.env.get('PROXYPAY_WEBHOOK_SECRET');
    if (expected && new URL(req.url).searchParams.get('secret') !== expected) {
      return json({ error: 'Não autorizado' }, 401);
    }
    if (req.method === 'GET') return json({ status: 'ok' });

    const body = await req.json();
    const reference = String(body.reference || body.reference_id || body.custom_fields?.subscription_reference || '');
    const paymentId = body.id || body.payment_id || '';
    if (!reference) return json({ error: 'Sem referência no payload' }, 400);

    const result = await processSubscriptionPayment(reference, paymentId);
    if (result.skipped) return json({ skipped: true, reason: result.reason }, 404);
    return json({ success: true, subscription_id: result.subscription_id });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});