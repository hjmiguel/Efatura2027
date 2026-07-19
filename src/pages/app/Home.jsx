import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { getFirstName } from '@/lib/format';
import PatrimonioHero from '@/components/app/PatrimonioHero';
import AccountCard from '@/components/app/AccountCard';
import DeductibleCard from '@/components/app/DeductibleCard';
import PendingInvoiceList from '@/components/app/PendingInvoiceList';
import RecentTransactions from '@/components/app/RecentTransactions';
import { Bell } from 'lucide-react';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [pendingInvoices, setPendingInvoices] = useState([]);
  const [deductibleTotal, setDeductibleTotal] = useState(0);
  const [invoicesWithoutNif, setInvoicesWithoutNif] = useState(0);
  const [monthDelta, setMonthDelta] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [me, accts, txns, allInvoices] = await Promise.all([
        base44.auth.me(),
        base44.entities.Account.list(),
        base44.entities.Transaction.list('-date', 50),
        base44.entities.Invoice.list(),
      ]);

      setUser(me);
      setAccounts(accts);
      setTransactions(txns.slice(0, 6));

      const pending = allInvoices
        .filter((i) => i.status === 'pending' || i.status === 'overdue')
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
      setPendingInvoices(pending);

      const deductibles = allInvoices.filter(
        (i) => i.deductible_type && i.deductible_type !== 'none' && i.has_nif !== false && i.status === 'paid'
      );
      const total = deductibles.reduce((sum, i) => sum + (i.amount || 0), 0);
      setDeductibleTotal(total);
      setInvoicesWithoutNif(allInvoices.filter((i) => i.has_nif === false).length);

      const now = new Date();
      const monthTxns = txns.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
      const income = monthTxns.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
      const expense = monthTxns.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
      setMonthDelta(income - expense);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }

  const patrimonio = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-line border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-2">Bem-vinda</p>
          <h1 className="font-heading text-2xl font-bold text-ink">
            Olá, {getFirstName(user?.full_name) || 'utilizador'}
          </h1>
        </div>
        <button className="p-2.5 rounded-xl bg-surface border border-line text-muted-foreground hover:text-ink hover:border-primary/30 transition-colors hidden md:block">
          <Bell className="w-5 h-5" />
        </button>
      </div>

      {/* Património hero */}
      <PatrimonioHero patrimonio={patrimonio} monthDelta={monthDelta} />

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AccountCard accounts={accounts} />
          <RecentTransactions transactions={transactions} />
        </div>
        <div className="space-y-6">
          <DeductibleCard total={deductibleTotal} invoicesWithoutNif={invoicesWithoutNif} />
          <PendingInvoiceList invoices={pendingInvoices} />
        </div>
      </div>
    </div>
  );
}