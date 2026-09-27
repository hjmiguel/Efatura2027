import React from 'react';
import { formatKz, formatDate } from '@/lib/format';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

function Kpi({ label, value, delta, trend, highlight }) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-ok' : trend === 'down' ? 'text-destructive' : 'text-muted-2';
  return (
    <div className={`bg-surface border rounded-talao p-4 shadow-soft ${highlight ? 'border-primary/40 ring-1 ring-primary/10' : 'border-line'}`}>
      <p className="text-[11px] text-muted-2 leading-tight">{label}</p>
      <p className={`font-mono text-[22px] font-bold mt-1.5 leading-tight ${highlight ? 'text-primary' : 'text-ink'}`}>{value}</p>
      {delta && (
        <div className={`flex items-center gap-1 mt-1.5 text-[11px] font-medium ${trendColor}`}>
          <TrendIcon className="w-3 h-3" /> {delta}
        </div>
      )}
    </div>
  );
}

function statusPill(status) {
  if (status === 'paid') return 'pill-paid';
  if (status === 'overdue') return 'pill-late';
  return 'pill-pend';
}

function statusLabel(status) {
  if (status === 'paid') return 'Paga';
  if (status === 'overdue') return 'Vencida';
  return 'Pendente';
}

export default function PartnerDashboard({ invoices, consents }) {
  const total = invoices.length;
  const paid = invoices.filter((i) => i.status === 'paid');
  const paidCount = paid.length;
  const pendingCount = invoices.filter((i) => i.status === 'pending').length;
  const overdueCount = invoices.filter((i) => i.status === 'overdue').length;

  const daysToPayment = paid
    .filter((i) => i.paid_date && i.issue_date)
    .map((i) => Math.max(0, Math.round((new Date(i.paid_date) - new Date(i.issue_date)) / 86400000)));
  const avgDays = daysToPayment.length ? Math.round(daysToPayment.reduce((s, d) => s + d, 0) / daysToPayment.length) : 0;

  const onTimeCount = paid.filter((i) => i.due_date && i.paid_date && new Date(i.paid_date) <= new Date(i.due_date)).length;
  const lateCount = paidCount - onTimeCount;
  const onTimeRate = paidCount > 0 ? Math.round((onTimeCount / paidCount) * 100) : 0;

  const pct = (n) => (total > 0 ? Math.round((n / total) * 100) : 0);

  const recent = invoices.slice(0, 8);

  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="eyebrow">§ 01 · Painel</span>
          <h1 className="font-heading text-xl font-bold text-ink mt-1">Faturas pagas através da Gestão+</h1>
        </div>
      </div>

      {/* KPIs — pagamento primeiro, envio secundário */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Faturas pagas via Gestão+" value={paidCount} highlight />
        <Kpi label="Dias médios até ao pagamento" value={`${avgDays} dias`} />
        <Kpi label="Pagamento no prazo" value={`${onTimeRate}%`} />
        <Kpi label="Faturas enviadas (total)" value={total} />
      </div>

      {/* Recent invoices */}
      <div className="bg-surface border border-line rounded-talao overflow-hidden shadow-soft">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-line">
          <h2 className="font-heading font-semibold text-[15px] text-ink">Faturas recentes</h2>
        </div>
        {recent.length === 0 ? (
          <p className="px-5 py-10 text-sm text-muted-2 text-center">Nenhuma fatura emitida.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-2 border-b border-line">
                  <th className="px-5 py-2.5 font-medium text-[11px]">NIF</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]">Cliente</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]">Valor</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]">Vencimento</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]">Estado</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((inv) => (
                  <tr key={inv.id} className="border-b border-line/50 last:border-0">
                    <td className="px-5 py-3 font-mono text-[12px] text-muted-foreground">{inv.user_nif || '—'}</td>
                    <td className="px-5 py-3 text-ink font-medium">{inv.issuer_name || '—'}</td>
                    <td className="px-5 py-3 font-mono text-ink">{formatKz(inv.amount)}</td>
                    <td className="px-5 py-3 text-muted-foreground text-[12px]">{formatDate(inv.due_date)}</td>
                    <td className="px-5 py-3">
                      <span className={`${statusPill(inv.status)} text-[10.5px] font-bold px-2.5 py-0.5 rounded-full`}>
                        {statusLabel(inv.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment volumetry — replaces "estado da integração" */}
      <div className="bg-surface border border-line rounded-talao p-5 shadow-soft">
        <h2 className="font-heading font-semibold text-[15px] text-ink mb-4">Volumetria de pagamento</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] text-muted-foreground">Pagas no prazo</span>
              <span className="font-mono text-[13px] font-bold text-ok">{pct(onTimeCount)}%</span>
            </div>
            <div className="track-v5"><i style={{ width: `${pct(onTimeCount)}%`, background: 'hsl(var(--primary))' }} /></div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] text-muted-foreground">Pagas atrasadas</span>
              <span className="font-mono text-[13px] font-bold text-[#9a6a16]">{pct(lateCount)}%</span>
            </div>
            <div className="track-v5"><i style={{ width: `${pct(lateCount)}%`, background: 'hsl(var(--accent))' }} /></div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] text-muted-foreground">Pendentes</span>
              <span className="font-mono text-[13px] font-bold text-brandblue">{pct(pendingCount)}%</span>
            </div>
            <div className="track-v5"><i style={{ width: `${pct(pendingCount)}%`, background: '#3a64a8' }} /></div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] text-muted-foreground">Vencidas</span>
              <span className="font-mono text-[13px] font-bold text-destructive">{pct(overdueCount)}%</span>
            </div>
            <div className="track-v5"><i style={{ width: `${pct(overdueCount)}%`, background: 'hsl(var(--destructive))' }} /></div>
          </div>
        </div>
        <p className="text-[11.5px] text-muted-2 mt-4">
          {consents.length} NIF(s) ligados a esta empresa. A receita nasce da fatura paga — o envio é gratuito e ilimitado.
        </p>
      </div>
    </div>
  );
}