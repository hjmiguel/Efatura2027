// Cálculos financeiros — funções puras para testar aritmética

export function calculateTotalBalance(accounts) {
  if (!accounts || accounts.length === 0) return 0;
  return accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
}

export function calculateTotalPending(invoices) {
  if (!invoices || invoices.length === 0) return 0;
  return invoices
    .filter((i) => i.status === 'pending')
    .reduce((sum, i) => sum + (i.amount || 0), 0);
}

export function calculateTotalPaid(invoices) {
  if (!invoices || invoices.length === 0) return 0;
  return invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + (i.amount || 0), 0);
}

export function calculateCategorySpent(transactions, categoryId, month) {
  if (!transactions || transactions.length === 0) return 0;
  return transactions
    .filter(
      (t) =>
        t.category_id === categoryId &&
        t.date &&
        t.date.startsWith(month)
    )
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
}

export function calculateMonthlyExpenses(transactions, month) {
  if (!transactions || transactions.length === 0) return 0;
  return transactions
    .filter(
      (t) =>
        t.type === 'expense' && t.date && t.date.startsWith(month)
    )
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
}

export function calculateMonthlyIncome(transactions, month) {
  if (!transactions || transactions.length === 0) return 0;
  return transactions
    .filter(
      (t) => t.type === 'income' && t.date && t.date.startsWith(month)
    )
    .reduce((sum, t) => sum + (t.amount || 0), 0);
}