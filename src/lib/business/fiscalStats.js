// Fonte única dos contadores fiscais: faturas Invoice visíveis do utilizador no ano corrente.
export function invoiceYear(inv) {
  const d = inv.issue_date || inv.due_date || inv.created_date;
  return d ? new Date(d).getFullYear() : null;
}

export function currentYearInvoices(invoices, year = new Date().getFullYear()) {
  return invoices.filter((i) => invoiceYear(i) === year);
}

export const isAgtVerified = (i) => i.source === 'agt' || i.agt_status === 'paid';

export function isDeductiblePaid(i) {
  return i.status === 'paid' && i.deductible_type && i.deductible_type !== 'none' && i.has_nif !== false;
}

export function fiscalStats(invoices) {
  return {
    total: invoices.length,
    emitted: invoices.length,
    paid: invoices.filter((i) => i.status === 'paid').length,
    verified: invoices.filter(isAgtVerified).length,
    deductibleTotal: invoices.filter(isDeductiblePaid).reduce((s, i) => s + (i.amount || 0), 0),
  };
}