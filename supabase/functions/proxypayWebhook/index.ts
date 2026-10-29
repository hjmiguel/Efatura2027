import { json } from '../_shared/common.ts';
import { processSubscriptionPayment } from '../_shared/proxypay.ts';

async function hmacHex(key: string, message: string) {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Chamado pelo Proxypay (sem JWT). Valida X-Signature = HMAC-SHA256(corpo, PROXYPAY_API_KEY).
Deno.serve(async (req) => {
  try {
    if (req.method === 'GET') return json({ status: 'ok' });

    const apiKey = Deno.env.get('PROXYPAY_API_KEY');
    if (!apiKey) return json({ error: 'PROXYPAY_API_KEY não configurada' }, 500);

    const raw = await req.text();
    const header = (req.headers.get('X-Signature') ?? '').trim().toLowerCase().replace(/^sha256=/, '');
    const expected = await hmacHex(apiKey, raw);
    if (!header || !safeEqual(header, expected)) return json({ error: 'Assinatura inválida' }, 401);

    const body = JSON.parse(raw);
    const reference = String(body.reference_id || body.reference || '');
    const paymentId = body.id || body.payment_id || '';
    if (!reference) return json({ error: 'Sem reference_id no payload' }, 400);

    // Idempotente: a ativação é atómica, repetições do mesmo reference_id devolvem 200 sem efeito.
    const result = await processSubscriptionPayment(reference, paymentId);
    if (result.skipped) return json({ success: true, duplicate: true, reason: result.reason });
    return json({ success: true, subscription_id: result.subscription_id });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});