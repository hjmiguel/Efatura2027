import React from 'react';
import { TrendingUp, AlertCircle, Receipt, PiggyBank } from 'lucide-react';

const suggestions = [
  { icon: TrendingUp, text: 'Quanto gastei este mês?', key: 'month_summary' },
  { icon: AlertCircle, text: 'Que faturas tenho por pagar?', key: 'pending_invoices' },
  { icon: Receipt, text: 'Quanto acumulei em dedutíveis de saúde?', key: 'health_deductible' },
  { icon: PiggyBank, text: 'Onde posso poupar?', key: 'savings_tips' },
];

export default function ChatSuggestions({ onPick }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {suggestions.map((s) => (
        <button
          key={s.key}
          onClick={() => onPick(s.text)}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-surface border border-line text-left text-xs font-medium text-muted-foreground hover:border-primary/30 hover:text-ink transition-colors"
        >
          <s.icon className="w-4 h-4 shrink-0 text-primary" />
          <span className="leading-tight">{s.text}</span>
        </button>
      ))}
    </div>
  );
}