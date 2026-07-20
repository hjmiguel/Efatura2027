import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import { processSubscriptionPayment } from "../../shared/proxypay.ts";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // GET — verificação de webhook (alguns provedores fazem GET inicial)
    if (req.method === "GET") {
      return Response.json({ status: "ok" });
    }

    const body = await req.json();

    // Extrair referência do payload (nomes de campos flexíveis)
    const reference = String(
      body.reference || body.reference_id || body.custom_fields?.subscription_reference || ''
    );
    const paymentId = body.id || body.payment_id || '';

    if (!reference) {
      return Response.json({ error: 'No reference in payload' }, { status: 400 });
    }

    const result = await processSubscriptionPayment(base44, reference, paymentId);

    if (result.skipped) {
      return Response.json({ skipped: true, reason: result.reason }, { status: 404 });
    }

    return Response.json({ success: true, subscription_id: result.subscription_id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});