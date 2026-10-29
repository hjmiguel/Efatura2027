import { adminClient } from './common.ts';

export const PROXYPAY_API_BASE = 'https://api.proxypay.co.ao';
export const PROXYPAY_ENTITY = '11367';

function getHeaders() {
  const apiKey = Deno.env.get('PROXYPAY_API_KEY');
  if (!apiKey) throw new Error('PROXYPAY_API_KEY não configurada');
  return {
    Authorization: `Token ${apiKey}`,
    Accept: 'application/vnd.proxypay.v2+json',
    'Content-Type': 'application/json',
  };
}

export async function generateReferenceId(): Promise<string> {
  const res = await fetch(`${PROXYPAY_API_BASE}/reference_ids`, { method: 'POST', headers: getHeaders() });
  if (!res.ok) throw new Error(`Proxypay reference_ids: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return String(data.id || data.reference_id || data);
}

export async function createReference(
  id: string,
  amount: number,
  endDatetime: string,
  customFields: Record<string, unknown> = {},
) {
  const res = await fetch(`${PROXYPAY_API_BASE}/references/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ amount: amount.toFixed(2), end_datetime: endDatetime, custom_fields: customFields }),
  });
  if (!res.ok && res.status !== 204) throw new Error(`Proxypay create reference: ${res.status} ${await res.text()}`);
}

export async function getPayments(): Promise<Array<Record<string, unknown>>> {
  const res = await fetch(`${PROXYPAY_API_BASE}/payments`, { method: 'GET', headers: getHeaders() });
  if (!res.ok) throw new Error(`Proxypay get payments: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function acknowledgePayment(paymentId: string) {
  const res = await fetch(`${PROXYPAY_API_BASE}/payments/${paymentId}/acknowledge`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok && res.status !== 204) throw new Error(`Proxypay acknowledge: ${res.status} ${await res.text()}`);
}

// Ativa a subscrição pendente correspondente à referência e faz acknowledge. Idempotente.
export async function processSubscriptionPayment(reference: string, paymentId?: string | number) {
  if (!reference) return { skipped: true, reason: 'no_reference' };
  const admin = adminClient();

  const { data: rows, error } = await admin
    .from('records')
    .select('id, data')
    .eq('entity', 'Subscription')
    .eq('data->>proxypay_reference', reference)
    .eq('data->>status', 'pending')
    .limit(1);
  if (error) throw error;
  if (!rows || rows.length === 0) return { skipped: true, reason: 'not_found_or_already_processed' };

  const sub = rows[0];
  const end = new Date();
  end.setDate(end.getDate() + (sub.data.plan === 'yearly' ? 365 : 30));

  // Atualização condicional (só se ainda estiver pendente): evita dupla ativação em pedidos simultâneos.
  const { data: updated, error: upErr } = await admin
    .from('records')
    .update({
      data: {
        ...sub.data,
        status: 'active',
        start_date: new Date().toISOString().slice(0, 10),
        end_date: end.toISOString().slice(0, 10),
        proxypay_payment_id: String(paymentId ?? ''),
      },
    })
    .eq('id', sub.id)
    .eq('data->>status', 'pending')
    .select('id');
  if (upErr) throw upErr;
  if (!updated || updated.length === 0) return { skipped: true, reason: 'already_processed' };

  let ackId = String(paymentId ?? '');
  if (!ackId) {
    try {
      const match = (await getPayments()).find((p) => String(p.reference) === reference);
      if (match) ackId = String(match.id);
    } catch (e) {
      console.error('getPayments fallback:', (e as Error).message);
    }
  }
  if (ackId) {
    try { await acknowledgePayment(ackId); } catch (e) { console.error('Acknowledge:', (e as Error).message); }
  }
  return { activated: true, subscription_id: sub.id as string };
}