// Faturas emitidas por parceiros só são mostradas ao utilizador se ele tiver
// dado consentimento ativo a esse parceiro (por NIF) e tiver subscrição ativa.
// A importação/emissão do lado do parceiro nunca depende disto — só a apresentação.
export function filterVisibleInvoices(invoices, { consents = [], hasActiveSubscription = false } = {}) {
  const activeConsentNifs = new Set(
    (consents || []).filter((c) => c.consent_status === 'active').map((c) => c.partner_nif)
  );
  return (invoices || []).filter((inv) => {
    if (inv.source !== 'partner') return true;
    return hasActiveSubscription && activeConsentNifs.has(inv.issuer_nif);
  });
}