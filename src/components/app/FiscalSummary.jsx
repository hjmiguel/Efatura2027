import React from 'react';
import { Landmark, FileText, TrendingUp } from 'lucide-react';
import { formatKzShort } from '@/lib/format';

export default function FiscalSummary({ totalInvoices, verifiedCount, deductibleTotal, lastSync }) {
  return (
    <div className="bg-surface rounded-talao border border-line p-5">
      <div className="flex items-center gap-2 mb-4">
        <Landmark className="w-5 h-5 text-primary" />
        <h2 className="font-heading font-bold text-ink">Resumo fiscal</h2>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <p className="font-mono text-xl font-bold text-ink">{totalInvoices}</p>
          <p className="text-xs text-muted-2">Faturas no NIF</p>
        </div>
        <div>
          <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mb-2">
            <TrendingUp className="w-4 h-4 text-gold" />
          </div>
          <p className="font-mono text-xl font-bold text-ink">{verifiedCount}</p>
          <p className="text-xs text-muted-2">Verificadas AGT</p>
        </div>
        <div>
          <div className="w-10 h-10 rounded-xl bg-ok/10 flex items-center justify-center mb-2">
            <FileText className="w-4 h-4 text-ok" />
          </div>
          <p className="font-mono text-sm font-bold text-ink leading-tight">{formatKzShort(deductibleTotal)}</p>
          <p className="text-xs text-muted-2">Dedutível IRPS</p>
        </div>
      </div>
      {lastSync && (
        <p className="text-xs text-muted-2 mt-4">Última sincronização: {lastSync}</p>
      )}
    </div>
  );
}