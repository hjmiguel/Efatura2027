import React from 'react';
import { formatKz } from '@/lib/format';
import { Receipt, AlertCircle } from 'lucide-react';

export default function DeductibleCard({ total, invoicesWithoutNif }) {
  return (
    <div className="bg-gold-soft rounded-talao border border-gold/30 shadow-soft p-5 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-1 bg-gold" />
      <div className="flex items-center gap-2 mb-1">
        <Receipt className="w-4 h-4 text-gold" />
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">Dedutível no IRPS</p>
      </div>
      <p className="font-mono text-2xl font-bold text-ink mb-3">{formatKz(total)}</p>

      {invoicesWithoutNif > 0 && (
        <div className="flex items-start gap-2 bg-white/60 rounded-xl p-3 mb-3">
          <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
          <p className="text-xs text-ink/80 leading-relaxed">
            {invoicesWithoutNif} {invoicesWithoutNif === 1 ? 'fatura sem' : 'faturas sem'} o teu NIF. Sem NIF não contam para a dedução.
          </p>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Despesas de 2027 contam para a declaração de 2028.
      </p>
    </div>
  );
}