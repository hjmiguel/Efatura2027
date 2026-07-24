import React from 'react';
import { CalendarDays, ChevronRight, AlertTriangle } from 'lucide-react';
import { formatKz, daysUntil } from '@/lib/format';

export default function CompromissosView({ invoices, patrimonio }) {
  const future = invoices
    .filter((i) => i.status === 'pending' && i.due_date && daysUntil(i.due_date) >= 0)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  const total = future.reduce((s, i) => s + (i.amount || 0), 0);

  if (future.length === 0) {
    return <EmptyState icon={CalendarDays} title="Sem compromissos" text="Não tens pagamentos futuros agendados." />;
  }

  // Previsão de tesouraria: saldo projetado após cada compromisso, por ordem de vencimento
  let running = patrimonio;
  const rows = future.map((inv) => {
    running -= inv.amount || 0;
    return { ...inv, projected: running };
  });
  const firstShortfall = rows.find((r) => r.projected < 0);
  const projected = patrimonio - total;

  return (
    <div className="space-y-3">
      {/* Semáforo de tesouraria */}
      <div className={`rounded-talao p-4 border shadow-soft ${projected < 0 ? 'bg-danger-soft border-[#f0c9c2]' : 'bg-green-soft border-[#c3e6d5]'}`}>
        <div className="grid grid-cols-3 gap-1 text-center">
          <div>
            <span className="eyebrow">Tens</span>
            <p className="font-mono text-[14px] font-bold text-ink mt-1">{formatKz(patrimonio)}</p>
          </div>
          <div className="border-x border-ink/10">
            <span className="eyebrow">Vais pagar</span>
            <p className="font-mono text-[14px] font-bold text-ink mt-1">{formatKz(total)}</p>
          </div>
          <div>
            <span className="eyebrow">{projected < 0 ? 'Faltam' : 'Sobram'}</span>
            <p className={`font-mono text-[14px] font-bold mt-1 ${projected < 0 ? 'text-destructive' : 'text-ok'}`}>{formatKz(Math.abs(projected))}</p>
          </div>
        </div>
      </div>

      {firstShortfall && (
        <div className="flex items-center gap-2.5 bg-danger-soft border border-[#f0c9c2] rounded-talao p-3.5">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
          <p className="text-[12.5px] text-destructive leading-snug">
            <b>Saldo pode ficar negativo</b> após pagar {firstShortfall.issuer_name}, a {new Date(firstShortfall.due_date).toLocaleDateString('pt-PT')}.
          </p>
        </div>
      )}

      {rows.map((inv) => {
        const days = daysUntil(inv.due_date);
        const negative = inv.projected < 0;
        return (
          <div key={inv.id} className="bg-surface border border-line rounded-talao p-3.5 shadow-soft flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-muted flex flex-col items-center justify-center shrink-0">
              <span className="text-[9px] uppercase text-muted-2">{new Date(inv.due_date).toLocaleDateString('pt-PT', { month: 'short' })}</span>
              <span className="font-heading font-bold text-ink text-sm leading-none">{new Date(inv.due_date).getDate()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[14px] text-ink truncate">{inv.issuer_name}</p>
              <p className="text-[12px] text-muted-foreground">{days === 0 ? 'Hoje' : days === 1 ? 'Amanhã' : `Em ${days} dias`}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-mono font-semibold text-[14px] text-ink">{formatKz(inv.amount)}</p>
              <p className={`font-mono text-[11px] mt-0.5 ${negative ? 'text-destructive font-semibold' : 'text-muted-2'}`}>
                saldo {formatKz(inv.projected)}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-2 shrink-0" />
          </div>
        );
      })}
    </div>
  );
}

function EmptyState({ icon: Icon, title, text }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
        <Icon className="w-7 h-7 text-muted-2" />
      </div>
      <p className="font-medium text-ink">{title}</p>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">{text}</p>
    </div>
  );
}