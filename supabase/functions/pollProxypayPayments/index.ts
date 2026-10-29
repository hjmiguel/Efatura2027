import { json } from '../_shared/common.ts';
import { getPayments, processSubscriptionPayment } from '../_shared/proxypay.ts';

// Fallback ao webhook: agendar de 5 em 5 minutos (ver instruções de pg_cron).
Deno.serve(async (req) => {
  try {
    // Só aceita a chave de serviço (usada pelo pg_cron).
    const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!serviceKey || token !== serviceKey) return json({ error: 'Não autorizado' }, 401);

    const list = await getPayments();
    let activated = 0;
    let skipped = 0;
    const errors: Array<{ reference: string; error: string }> = [];

    for (const p of list) {
      const reference = String(p.reference || p.reference_id || '');
      try {
        const r = await processSubscriptionPayment(reference, (p.id || p.payment_id || '') as string);
        if (r.activated) activated++; else skipped++;
      } catch (e) {
        errors.push({ reference, error: (e as Error).message });
      }
    }
    return json({ checked: list.length, activated, skipped, errors });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});