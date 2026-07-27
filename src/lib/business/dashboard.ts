import type { Account, Invoice, Transaction } from '@/types/models';
export function calculateDashboard(accounts: Account[], transactions: Transaction[], invoices: Invoice[], now = new Date()) {
  const pendingInvoices=invoices.filter(i=>i.status==='pending'||i.status==='overdue').sort((a,b)=>new Date(a.due_date).getTime()-new Date(b.due_date).getTime());
  const monthTransactions=transactions.filter(t=>{const d=new Date(t.date);return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();});
  const patrimonio=Math.round(accounts.reduce((sum,a)=>sum+(a.balance||0),0));
  const pendingTotal=Math.round(pendingInvoices.reduce((sum,i)=>sum+(i.amount||0),0));
  return { pendingInvoices, patrimonio, pendingTotal, disponibilidade:patrimonio-pendingTotal, urgentCount:pendingInvoices.filter(i=>i.status==='overdue').length, monthIncome:Math.round(monthTransactions.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0)), monthExpense:Math.round(monthTransactions.filter(t=>t.type==='expense').reduce((s,t)=>s+Math.abs(t.amount),0)) };
}