import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import { acknowledgePayment, getPayments } from "../../shared/proxypay.ts";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // GET — verificação de webhook (alguns provedores fazem GET inicial)
    if (req.method === "GET") {
      return Response.json({ status: "ok" });
    }

    const body = await req.json();

    // Extrair referência do payload (nomes de campo flexíveis)
    const reference = String(
      body.reference || body.reference_id || body.custom_fields?.subscription_reference || ''
    );
    const paymentId = body.id || body.payment_id || '';

    if (!reference) {
      return Response.json({ error: 'No reference in payload' }, { status: 400 });
    }

    // Procurar subscrição pendente por referência
    const subscriptions = await base44.asServiceRole.entities.Subscription.filter({
      proxypay_reference: reference,
      status: 'pending',
    });

    if (subscriptions.length === 0) {
      return Response.json({ error: 'Subscription not found or already processed' }, { status: 404 });
    }

    const subscription = subscriptions[0];
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (subscription.plan === 'yearly' ? 365 : 30));

    // Ativar subscrição
    await base44.asServiceRole.entities.Subscription.update(subscription.id, {
      status: 'active',
      start_date: today.toISOString().slice(0, 10),
      end_date: endDate.toISOString().slice(0, 10),
      proxypay_payment_id: String(paymentId),
    });

    // Confirmar pagamento no Proxypay (acknowledge)
    let ackId = String(paymentId);
    if (!ackId) {
      // Sem payment_id no webhook — procurar nos payments pendentes
      try {
        const payments = await getPayments();
        const match = Array.isArray(payments) ? payments.find(p => String(p.reference) === reference) : null;
        if (match) ackId = String(match.id);
      } catch (e) {
        console.error("getPayments fallback:", e.message);
      }
    }
    if (ackId) {
      try { await acknowledgePayment(ackId); } catch (e) { console.error("Acknowledge:", e.message); }
    }

    return Response.json({ success: true, subscription_id: subscription.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});