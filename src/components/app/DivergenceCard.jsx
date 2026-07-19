import React from 'react';
import { AlertTriangle, Info, ArrowRight } from 'lucide-react';
import { formatKz } from '@/lib/format';

export default function DivergenceCard({ divergence }) {
  const isWarning = divergence.severity === 'warning';
  const Icon = isWarning ? AlertTriangle : Info;

  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 ${
      isWarning ? 'bg-danger-soft border-destructive/20' : 'bg-gold-soft/50 border-gold/20'
    }`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
        isWarning ? 'bg-destructive/10' : 'bg-gold/10'
      }`}>
        <Icon className={`w-4 h-4 ${isWarning ? 'text-destructive' : 'text-gold'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-ink">{divergence.issuer_name}</p>
          {divergence.document_number && (
            <span className="text-xs font-mono text-muted-2">#{divergence.document_number}</span>
          )}
          <span className="font-mono text-sm font-semibold text-ink ml-auto">{formatKz(divergence.amount)}</span>
        </div>
        <p className="text-xs text-ink/70 mt-1 leading-relaxed">{divergence.explanation}</p>
      </div>
    </div>
  );
}