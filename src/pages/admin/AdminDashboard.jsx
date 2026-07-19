import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, Receipt, ArrowLeftRight, PiggyBank, ScrollText, Shield, AlertTriangle } from 'lucide-react';
import KpiCard from '@/components/admin/KpiCard';
import { formatKz, formatDate } from '@/lib/format';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [consents, setConsents] = useState([]);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [u, inv, txn, logs, cons] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.Invoice.list(),
        base44.entities.Transaction.list(),
        base44.entities.AuditLog.list('-created_date', 20),
        base44.entities.PartnerConsent.list(),
      ]);
      setUsers(u);
      setInvoices(inv);
      setTransactions(txn);
      setAuditLogs(logs);
      setConsents(cons.filter(c => c.consent_status === 'active'));
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  }

  const deductibleTotal = invoices
    .filter(i => i.deductible_type && i.deductible_type !== 'none' && i.has_nif !== false && i.status === 'paid')
    .reduce((s, i) => s + (i.amount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center">
          <Shield className="w-5 h-5 text-gold" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Painel de administração</h1>
          <p className="text-sm text-slate-500">Visão geral da plataforma</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Users} label="Utilizadores" value={users.length} accent="blue" />
        <KpiCard icon={Receipt} label="Faturas" value={invoices.length} accent="gold" />
        <KpiCard icon={ArrowLeftRight} label="Transações" value={transactions.length} accent="green" />
        <KpiCard icon={PiggyBank} label="Dedutível acumulado" value={formatKz(deductibleTotal)} accent="gold" />
      </div>

      {/* Users table */}
      <div className="bg-[hsl(163_30%_13%)] border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800">
          <h2 className="font-heading font-bold text-white">Utilizadores registados</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-800">
                <th className="px-5 py-2.5 font-medium">Nome</th>
                <th className="px-5 py-2.5 font-medium">Email</th>
                <th className="px-5 py-2.5 font-medium">Papel</th>
                <th className="px-5 py-2.5 font-medium">NIF</th>
                <th className="px-5 py-2.5 font-medium">Registado em</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="px-5 py-3 text-white">{u.full_name || '—'}</td>
                  <td className="px-5 py-3 text-slate-400">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      u.role === 'admin' ? 'bg-gold/15 text-gold' : 'bg-slate-700 text-slate-300'
                    }`}>{u.role || 'user'}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-400 font-mono">{u.nif || '—'}</td>
                  <td className="px-5 py-3 text-slate-500">{formatDate(u.created_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit trail + consents */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-[hsl(163_30%_13%)] border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-gold" />
            <h2 className="font-heading font-bold text-white">Trilha de auditoria</h2>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {auditLogs.length === 0 ? (
              <p className="px-5 py-8 text-sm text-slate-500 text-center">Sem registos de auditoria.</p>
            ) : (
              auditLogs.map(log => (
                <div key={log.id} className="px-5 py-3 border-b border-slate-800/50 last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white font-medium">{log.action.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] text-slate-500">{formatDate(log.created_date)}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {log.actor_name} · {log.module}
                    {log.reason && <span className="text-gold"> · motivo: {log.reason}</span>}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-[hsl(163_30%_13%)] border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-gold" />
            <h2 className="font-heading font-bold text-white">Consentimentos ativos</h2>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {consents.length === 0 ? (
              <p className="px-5 py-8 text-sm text-slate-500 text-center">Nenhum consentimento ativo.</p>
            ) : (
              consents.map(c => (
                <div key={c.id} className="px-5 py-3 border-b border-slate-800/50 last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white font-medium">{c.partner_name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-400/10 text-emerald-400">ativo</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">NIF: {c.partner_nif} · {c.scopes?.join(', ')}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}