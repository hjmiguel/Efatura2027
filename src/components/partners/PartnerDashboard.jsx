import React from 'react';
import { formatKz, formatDate } from '@/lib/format';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

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
  const paidCount = invoices.filter((i) => i.status === 'paid').length;
  const totalAmount = invoices.reduce((s, i) => s + (i.amount || 0), 0);
  const paidRate = total > 0 ? Math.round((paidCount / total) * 100) : 0;

  const recent = invoices.slice(0, 8);

  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="eyebrow">§ 01 · Painel</span>
          <h1 className="font-heading text-xl font-bold text-ink mt-1">Faturas enviadas, este mês</h1>
        </div>
        <span className="mark">JUL · 2026</span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Faturas enviadas" value={total} delta="6% vs mês anterior" trend="up" />
        <Kpi label="Taxa de sucesso da API" value="99,2%" delta="estável" trend="flat" />
        <Kpi label="NIFs ligados" value={consents.length} delta="312 este mês" trend="up" />
        <Kpi label="Pagas após envio" value={`${paidRate}%`} delta="3 pontos" trend="up" />
      </div>

      {/* Recent invoices */}
      <div className="bg-surface border border-line rounded-talao overflow-hidden shadow-soft">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-line">
          <h2 className="font-heading font-semibold text-[15px] text-ink">Faturas recentes</h2>
          <button className="text-[12px] font-semibold text-primary">Ver todas</button>
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
                  <th className="px-5 py-2.5 font-medium text-[11px]">Canal</th>
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
                    <td className="px-5 py-3 text-[11px] text-muted-2 uppercase">{inv.source || 'API'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Integration status */}
      <div className="bg-surface border border-line rounded-talao p-5 shadow-soft">
        <h2 className="font-heading font-semibold text-[15px] text-ink mb-4">Estado da integração</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] text-muted-foreground">Sucesso</span>
              <span className="font-mono text-[13px] font-bold text-ok">99,2%</span>
            </div>
            <div className="track-v5"><i style={{ width: '99.2%', background: 'hsl(var(--primary))' }} /></div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] text-muted-foreground">Reentregas</span>
              <span className="font-mono text-[13px] font-bold text-[#9a6a16]">0,7%</span>
            </div>
            <div className="track-v5"><i style={{ width: '4%', background: 'hsl(var(--accent))' }} /></div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] text-muted-foreground">Falhas</span>
              <span className="font-mono text-[13px] font-bold text-destructive">0,1%</span>
            </div>
            <div className="track-v5"><i style={{ width: '1%', background: 'hsl(var(--destructive))' }} /></div>
          </div>
        </div>
        <p className="text-[11.5px] text-muted-2 mt-4">
          Último envio há 2 minutos. Webhook de estado ativo. Ambiente de produção.
        </p>
      </div>
    </div>
  );
}