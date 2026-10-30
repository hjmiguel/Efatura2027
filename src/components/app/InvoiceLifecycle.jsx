import React from 'react';
import { FileText, CheckCircle, Award } from 'lucide-react';
import { fiscalStats, isAgtVerified } from '@/lib/business/fiscalStats';

export default function InvoiceLifecycle({ invoices }) {
  const { emitted, paid, verified } = fiscalStats(invoices);
  const unverified = invoices.filter(i => !isAgtVerified(i) && i.document_number).length;

  const stages = [
    { label: 'Emitida', count: emitted, icon: FileText, color: 'text-brandblue', bg: 'bg-brandblue/10' },
    { label: 'Paga', count: paid, icon: CheckCircle, color: 'text-ok', bg: 'bg-ok/10' },
    { label: 'Verificada', count: verified, icon: Award, color: 'text-gold', bg: 'bg-gold/10' },
  ];

  return (
    <div className="bg-surface rounded-talao border border-line p-5">
      <h2 className="font-heading font-bold text-ink mb-4">Ciclo de vida da fatura</h2>
      <div className="flex items-center gap-2 sm:gap-4">
        {stages.map((stage, idx) => (
          <React.Fragment key={stage.label}>
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className={`w-12 h-12 rounded-2xl ${stage.bg} flex items-center justify-center`}>
                <stage.icon className={`w-5 h-5 ${stage.color}`} />
              </div>
              <div className="text-center">
                <p className="font-mono text-lg font-bold text-ink">{stage.count}</p>
                <p className="text-xs text-muted-2">{stage.label}</p>
              </div>
            </div>
            {idx < stages.length - 1 && (
              <div className="h-0.5 flex-1 bg-line rounded-full min-w-[12px]" />
            )}
          </React.Fragment>
        ))}
      </div>
      {unverified > 0 && (
        <p className="text-xs text-muted-2 mt-4 text-center">
          {unverified} {unverified === 1 ? 'fatura aguarda' : 'faturas aguardam'} sincronização com a AGT
        </p>
      )}
    </div>
  );
}