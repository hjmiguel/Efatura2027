import React from 'react';
import { formatKz, formatDate } from '@/lib/format';
import { Banknote } from 'lucide-react';

export default function PartnerFees({ fees }) {
  const totalPending = fees.filter((f) => f.billed_status === 'pending').reduce((s, f) => s + (f.fee_amount || 0), 0);
  const totalBilled = fees.filter((f) => f.billed_status === 'billed').reduce((s, f) => s + (f.fee_amount || 0), 0);

  const byPeriod = fees.reduce((acc, f) => {
    const key = f.billing_period || '—';
    acc[key] = (acc[key] || 0) + (f.fee_amount || 0);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <span className="eyebrow">§ 06 · Honorários</span>
          <h1 className="font-heading text-xl font-bold text-ink mt-1">Honorário por fatura paga</h1>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface border border-line rounded-talao p-4 shadow-soft">
          <p className="text-[11px] text-muted-2">A faturar</p>
          <p className="font-mono text-[22px] font-bold text-ink mt-1.5">{formatKz(totalPending)}</p>
        </div>
        <div className="bg-surface border border-line rounded-talao p-4 shadow-soft">
          <p className="text-[11px] text-muted-2">Já faturado</p>
          <p className="font-mono text-[22px] font-bold text-ok mt-1.5">{formatKz(totalBilled)}</p>
        </div>
      </div>

      <div className="bg-surface border border-line rounded-talao overflow-hidden shadow-soft">
        <div className="px-5 py-3.5 border-b border-line flex items-center gap-2">
          <Banknote className="w-4 h-4 text-primary" />
          <h2 className="font-heading font-semibold text-[15px] text-ink">Detalhe por fatura paga</h2>
        </div>
        {fees.length === 0 ? (
          <p className="px-5 py-10 text-sm text-muted-2 text-center">
            Nenhum honorário registado ainda. Gera-se automaticamente quando uma fatura tua é paga através da Gestão+.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-2 border-b border-line">
                  <th className="px-5 py-2.5 font-medium text-[11px]">Data</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]">Período</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]">Valor</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]">Estado</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((f) => (
                  <tr key={f.id} className="border-b border-line/50 last:border-0">
                    <td className="px-5 py-3 text-muted-foreground text-[12px]">{formatDate(f.fee_date)}</td>
                    <td className="px-5 py-3 font-mono text-[12px] text-muted-foreground">{f.billing_period || byPeriod[f.billing_period]}</td>
                    <td className="px-5 py-3 font-mono text-ink">{formatKz(f.fee_amount)}</td>
                    <td className="px-5 py-3">
                      <span className={`${f.billed_status === 'billed' ? 'pill-paid' : 'pill-pend'} text-[10.5px] font-bold px-2.5 py-0.5 rounded-full`}>
                        {f.billed_status === 'billed' ? 'Faturado' : 'Pendente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}