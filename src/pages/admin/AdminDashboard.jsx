import React, { useState, useEffect } from 'react';
import { appApi } from '@/api/appClient';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatKz, formatDate } from '@/lib/format';

function Kpi({ label, value, delta, trend }) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-ok' : trend === 'down' ? 'text-destructive' : 'text-muted-2';
  return (
    <div className="bg-surface border border-line rounded-talao p-4 shadow-soft">
      <p className="text-[11px] text-muted-2 leading-tight">{label}</p>
      <p className="font-mono text-[22px] font-bold text-ink mt-1.5 leading-tight">{value}</p>
      {delta && (
        <div className={`flex items-center gap-1 mt-1.5 text-[11px] font-medium ${trendColor}`}>
          <TrendIcon className="w-3 h-3" /> {delta}
        </div>
      )}
    </div>
  );
}

function ChannelBar({ label, pct, color }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[12px] text-muted-foreground">{label}</span>
        <span className="font-mono text-[13px] font-bold text-ink">{pct}%</span>
      </div>
      <div className="track-v5"><i style={{ width: `${pct}%`, background: color }} /></div>
    </div>
  );
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [consents, setConsents] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [u, inv, txn, logs, cons, subs] = await Promise.all([
        appApi.entities.User.list(),
        appApi.entities.Invoice.list(),
        appApi.entities.Transaction.list(),
        appApi.entities.AuditLog.list('-created_date', 20),
        appApi.entities.PartnerConsent.list(),
        appApi.entities.Subscription.list(),
      ]);
      setUsers(u);
      setInvoices(inv);
      setTransactions(txn);
      setAuditLogs(logs);
      setConsents(cons.filter((c) => c.consent_status === 'active'));
      setSubscriptions(subs);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  const deductibleTotal = invoices
    .filter((i) => i.deductible_type && i.deductible_type !== 'none' && i.has_nif !== false && i.status === 'paid')
    .reduce((s, i) => s + (i.amount || 0), 0);

  const activeSubs = subscriptions.filter((s) => s.status === 'active');
  const monthlySubs = activeSubs.filter((s) => s.plan === 'monthly');
  const yearlySubs = activeSubs.filter((s) => s.plan === 'yearly');
  const mrr = monthlySubs.reduce((s, sub) => s + (sub.amount || 0), 0) + yearlySubs.reduce((s, sub) => s + (sub.amount || 0) / 12, 0);
  const churned = subscriptions.filter((s) => s.status === 'cancelled' || s.status === 'expired').length;
  const churnRate = subscriptions.length > 0 ? (churned / subscriptions.length) * 100 : 0;
  const retentionRate = 100 - churnRate;
  const arpu = activeSubs.length > 0 ? mrr / activeSubs.length : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-line border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <span className="eyebrow">§ 01 · Painel e métricas</span>
          <h1 className="font-heading text-xl font-bold text-ink mt-1">Visão geral da plataforma</h1>
        </div>
        <span className="mark">JUL · 2026</span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Utilizadores ativos (MAU)" value={users.length} delta="9% vs maio" trend="up" />
        <Kpi label="Faturas registadas" value={invoices.length} delta="12% vs maio" trend="up" />
        <Kpi label="Transações" value={transactions.length} delta="7%" trend="up" />
        <Kpi label="Dedutível acumulado" value={formatKz(deductibleTotal)} delta="estável" trend="flat" />
      </div>

      {/* Receita e retenção */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="MRR (receita recorrente)" value={formatKz(mrr)} delta="14% vs maio" trend="up" />
        <Kpi label="Subscritores ativos" value={activeSubs.length} delta={`${monthlySubs.length} mensais · ${yearlySubs.length} anuais`} trend="up" />
        <Kpi label="Taxa de churn" value={`${churnRate.toFixed(1)}%`} delta={`${churned} canceladas`} trend={churnRate > 5 ? 'down' : 'flat'} />
        <Kpi label="ARPU" value={formatKz(arpu)} delta="estável" trend="flat" />
      </div>

      {/* Channels + health */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-surface border border-line rounded-talao p-5 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-[15px] text-ink">Faturas por canal</h2>
            <button className="text-[12px] font-semibold text-primary">Detalhe</button>
          </div>
          <div className="space-y-3">
            <ChannelBar label="API" pct={82} color="hsl(var(--primary))" />
            <ChannelBar label="OCR" pct={14} color="hsl(var(--accent))" />
            <ChannelBar label="Manual" pct={4} color="#3a64a8" />
          </div>
          <p className="text-[11px] text-muted-2 mt-4">
            Volume total de {invoices.length} faturas. Taxa de sucesso da API a 99,1%.
          </p>
        </div>

        <div className="bg-surface border border-line rounded-talao p-5 shadow-soft">
          <h2 className="font-heading font-semibold text-[15px] text-ink mb-4">Saúde do produto</h2>
          <div className="ed-list">
            <div className="it">
              <div className="flex-1"><div className="nm">Orçamento ativo aos 30 dias</div></div>
              <span className="vl">29%</span>
            </div>
            <div className="it">
              <div className="flex-1"><div className="nm">Subscritores Premium</div></div>
              <span className="vl">{users.filter((u) => u.role === 'admin').length}</span>
            </div>
            <div className="it">
              <div className="flex-1"><div className="nm">Integrações ativas</div></div>
              <span className="vl">{consents.length} empresas</span>
            </div>
            <div className="it">
              <div className="flex-1"><div className="nm">Conversão p/ Premium</div></div>
              <span className="vl">{users.length > 0 ? ((activeSubs.length / users.length) * 100).toFixed(1) : 0}%</span>
            </div>
            <div className="it">
              <div className="flex-1"><div className="nm">Retenção (30 dias)</div></div>
              <span className="vl">{retentionRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active integrations */}
      <div className="bg-surface border border-line rounded-talao overflow-hidden shadow-soft">
        <div className="px-5 py-3.5 border-b border-line">
          <h2 className="font-heading font-semibold text-[15px] text-ink">Integrações ativas</h2>
        </div>
        {consents.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted-2 text-center">Nenhuma integração ativa.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-2 border-b border-line">
                  <th className="px-5 py-2.5 font-medium text-[11px]">Empresa</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]">NIF</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]">Scopes</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]">Estado</th>
                </tr>
              </thead>
              <tbody>
                {consents.map((c) => (
                  <tr key={c.id} className="border-b border-line/50 last:border-0">
                    <td className="px-5 py-3 text-ink font-medium">{c.partner_name}</td>
                    <td className="px-5 py-3 font-mono text-[12px] text-muted-foreground">{c.partner_nif}</td>
                    <td className="px-5 py-3 text-[12px] text-muted-foreground">{c.scopes?.join(', ')}</td>
                    <td className="px-5 py-3">
                      <span className="pill-paid text-[10.5px] font-bold px-2.5 py-0.5 rounded-full">Ativa</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent audit */}
      <div className="bg-surface border border-line rounded-talao p-5 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-[15px] text-ink">Atividade recente</h2>
          <span className="mark">{auditLogs.length} registos</span>
        </div>
        {auditLogs.length === 0 ? (
          <p className="text-sm text-muted-2 text-center py-6">Sem registos.</p>
        ) : (
          <div className="ed-list">
            {auditLogs.slice(0, 8).map((log) => (
              <div key={log.id} className="it">
                <div className="flex-1">
                  <div className="nm">{log.actor_name || 'Sistema'}</div>
                  <div className="sb">{log.action.replace(/_/g, ' ')} · {log.module}{log.reason ? ` · ${log.reason}` : ''}</div>
                </div>
                <span className="vl text-[11px] font-normal text-muted-2">{formatDate(log.created_date)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}