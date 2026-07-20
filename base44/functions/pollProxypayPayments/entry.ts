import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import { getPayments, processSubscriptionPayment } from "../../shared/proxypay.ts";

/**
 * Polling de pagamentos Proxypay — fallback de segurança ao webhook.
 * Invocado por workflow agendado a cada 15 minutos.
 * Chama GET /payments, ativa subscrições pendentes e faz acknowledge.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const payments = await getPayments();
    const list = Array.isArray(payments) ? payments : [];

    let activated = 0;
    let skipped = 0;
    const errors = [];

    for (const payment of list) {
      const reference = String(payment.reference || payment.reference_id || '');
      const paymentId = payment.id || payment.payment_id || '';
      try {
        const result = await processSubscriptionPayment(base44, reference, paymentId);
        if (result.activated) activated++;
        else skipped++;
      } catch (e) {
        errors.push({ reference, error: e.message });
      }
    }

    return Response.json({
      checked: list.length,
      activated,
      skipped,
      errors,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});