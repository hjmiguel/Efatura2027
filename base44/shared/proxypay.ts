const PROXYPAY_API_BASE = "https://api.proxypay.co.ao";
const PROXYPAY_ENTITY = "11367";

function getHeaders() {
  const apiKey = Deno.env.get("PROXYPAY_API_KEY");
  if (!apiKey) throw new Error("PROXYPAY_API_KEY não configurada");
  return {
    "Authorization": `Token ${apiKey}`,
    "Accept": "application/vnd.proxypay.v2+json",
    "Content-Type": "application/json",
  };
}

async function generateReferenceId() {
  const res = await fetch(`${PROXYPAY_API_BASE}/reference_ids`, {
    method: "POST",
    headers: getHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Proxypay reference_ids: ${res.status} ${text}`);
  }
  const data = await res.json();
  const id = data.id || data.reference_id || data;
  return String(id);
}

async function createReference(id, amount, endDatetime, customFields) {
  const body = {
    amount: amount.toFixed(2),
    end_datetime: endDatetime,
    custom_fields: customFields || {},
  };
  const res = await fetch(`${PROXYPAY_API_BASE}/references/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok && res.status !== 204) {
    const text = await res.text();
    throw new Error(`Proxypay create reference: ${res.status} ${text}`);
  }
  return true;
}

async function getPayments() {
  const res = await fetch(`${PROXYPAY_API_BASE}/payments`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Proxypay get payments: ${res.status} ${text}`);
  }
  return await res.json();
}

async function acknowledgePayment(paymentId) {
  const res = await fetch(`${PROXYPAY_API_BASE}/payments/${paymentId}/acknowledge`, {
    method: "POST",
    headers: getHeaders(),
  });
  if (!res.ok && res.status !== 204) {
    const text = await res.text();
    throw new Error(`Proxypay acknowledge: ${res.status} ${text}`);
  }
  return true;
}

/**
 * Processa um pagamento Proxypay: ativa a subscrição pendente correspondente
 * e faz acknowledge no Proxypay. Idempotente — ignora se já processada.
 * Partilhado entre webhook e polling para evitar duplicação de lógica.
 */
async function processSubscriptionPayment(base44, reference, paymentId) {
  if (!reference) return { skipped: true, reason: "no_reference" };

  const subscriptions = await base44.asServiceRole.entities.Subscription.filter({
    proxypay_reference: reference,
    status: 'pending',
  });

  if (subscriptions.length === 0) {
    return { skipped: true, reason: "not_found_or_already_processed" };
  }

  const subscription = subscriptions[0];
  const today = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + (subscription.plan === 'yearly' ? 365 : 30));

  await base44.asServiceRole.entities.Subscription.update(subscription.id, {
    status: 'active',
    start_date: today.toISOString().slice(0, 10),
    end_date: endDate.toISOString().slice(0, 10),
    proxypay_payment_id: String(paymentId || ''),
  });

  // Acknowledge no Proxypay (para remover o pagamento da lista de pendentes)
  let ackId = String(paymentId || '');
  if (!ackId) {
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

  return { activated: true, subscription_id: subscription.id };
}

export {
  PROXYPAY_API_BASE, PROXYPAY_ENTITY,
  generateReferenceId, createReference, getPayments, acknowledgePayment,
  processSubscriptionPayment,
};