// Deteção de duplicados — número do documento + NIF do emitente + montante

export function getDuplicateKey(invoice) {
  return `${invoice.document_number || ''}|${invoice.issuer_nif || ''}|${invoice.amount || 0}`;
}

export function isDuplicate(inv1, inv2) {
  return getDuplicateKey(inv1) === getDuplicateKey(inv2);
}

export function deduplicateInvoices(invoices) {
  if (!invoices || invoices.length === 0) return [];
  const seen = new Map();
  const result = [];
  for (const inv of invoices) {
    const key = getDuplicateKey(inv);
    if (!seen.has(key)) {
      seen.set(key, true);
      result.push(inv);
    }
  }
  return result;
}

export function findDuplicates(invoices) {
  if (!invoices || invoices.length === 0) return [];
  const seen = new Map();
  const duplicates = [];
  for (const inv of invoices) {
    const key = getDuplicateKey(inv);
    if (seen.has(key)) {
      duplicates.push(inv);
    } else {
      seen.set(key, true);
    }
  }
  return duplicates;
}