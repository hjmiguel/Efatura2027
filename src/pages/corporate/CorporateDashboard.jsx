import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { TrendingUp, TrendingDown, Wallet, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatKz, formatDate } from '@/lib/format';

export default function CorporateDashboard() {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [approvals, setApprovals] = useState([]);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [accts, txns, approvalList] = await Promise.all([
        base44.entities.Account.list(),
        base44.entities.Transaction.list('-date', 50),
        base44.entities.Approval.list('-created_date', 20),
      ]);
      setAccounts(accts);
      setTransactions(txns);
      setApprovals(approvalList);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);
  const now = new Date();
  const monthTxns = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const inflows = monthTxns.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const outflows = monthTxns.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const pendingApprovals = approvals.filter(a => a.status === 'pending');
  const pendingAmount = pendingApprovals.reduce((s, a) => s + (a.amount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-line border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-ink">Tesouraria</h1>
        <p className="text-sm text-muted-2">Visão geral financeira da empresa</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-line rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-2 uppercase tracking-wide">Saldo total</span>
            <Wallet className="w-4 h-4 text-primary" />
          </div>
          <p className="text-xl font-heading font-bold text-ink font-mono">{formatKz(totalBalance)}</p>
        </div>
        <div className="bg-surface border border-line rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-2 uppercase tracking-wide">Entradas (mês)</span>
            <TrendingUp className="w-4 h-4 text-ok" />
          </div>
          <p className="text-xl font-heading font-bold text-ok font-mono">{formatKz(inflows)}</p>
        </div>
        <div className="bg-surface border border-line rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-2 uppercase tracking-wide">Saídas (mês)</span>
            <TrendingDown className="w-4 h-4 text-destructive" />
          </div>
          <p className="text-xl font-heading font-bold text-destructive font-mono">{formatKz(outflows)}</p>
        </div>
        <div className="bg-surface border border-line rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-2 uppercase tracking-wide">Aprovações pendentes</span>
            <Clock className="w-4 h-4 text-gold" />
          </div>
          <p className="text-xl font-heading font-bold text-ink font-mono">{formatKz(pendingAmount)}</p>
          <p className="text-xs text-muted-2 mt-0.5">{pendingApprovals.length} pedido(s)</p>
        </div>
      </div>

      {/* Accounts */}
      <div className="bg-surface border border-line rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-line">
          <h2 className="font-heading font-bold text-ink">Contas</h2>
        </div>
        <div className="divide-y divide-line">
          {accounts.map(a => (
            <div key={a.id} className="px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm text-ink font-medium">{a.name}</p>
                <p className="text-xs text-muted-2">{a.bank_name} · {a.type}</p>
              </div>
              <p className="text-sm font-mono text-ink">{formatKz(a.balance)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent approvals */}
      <div className="bg-surface border border-line rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-line">
          <h2 className="font-heading font-bold text-ink">Aprovações recentes</h2>
        </div>
        {approvals.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted-2 text-center">Sem pedidos de aprovação.</p>
        ) : (
          <div className="divide-y divide-line">
            {approvals.slice(0, 10).map(a => (
              <div key={a.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-ink font-medium">{a.entity_description}</p>
                  <p className="text-xs text-muted-2">
                    {a.supplier_name && `${a.supplier_name} · `}
                    {a.requested_by_name || '—'} · {formatDate(a.created_date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-ink">{formatKz(a.amount)}</p>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                    a.status === 'approved' ? 'text-ok' : a.status === 'rejected' ? 'text-destructive' : 'text-gold'
                  }`}>
                    {a.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                    {a.status === 'rejected' && <XCircle className="w-3 h-3" />}
                    {a.status === 'pending' && <Clock className="w-3 h-3" />}
                    {a.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}