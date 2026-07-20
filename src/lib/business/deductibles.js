// Regras de dedutibilidade IRPS — fatura sem NIF não entra no acumulado

export function isDeductible(invoice) {
  if (!invoice) return false;
  if (invoice.has_nif !== true) return false;
  if (!invoice.deductible_type || invoice.deductible_type === 'none') return false;
  return true;
}

export function filterDeductible(invoices) {
  if (!invoices || invoices.length === 0) return [];
  return invoices.filter(isDeductible);
}

export function calculateDeductibleTotal(invoices) {
  if (!invoices || invoices.length === 0) return 0;
  return filterDeductible(invoices).reduce((sum, i) => sum + (i.amount || 0), 0);
}

export function groupDeductibleByType(invoices) {
  if (!invoices || invoices.length === 0) return {};
  const deductible = filterDeductible(invoices);
  return deductible.reduce((groups, inv) => {
    const type = inv.deductible_type;
    if (!groups[type]) groups[type] = 0;
    groups[type] += inv.amount || 0;
    return groups;
  }, {});
}