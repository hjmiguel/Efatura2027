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

export { PROXYPAY_API_BASE, PROXYPAY_ENTITY, generateReferenceId, createReference, getPayments, acknowledgePayment };