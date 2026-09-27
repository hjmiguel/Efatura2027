import React from 'react';
import { formatKz, formatDateShort } from '@/lib/format';
import CategoryIcon from '@/components/app/CategoryIcon';

export default function RecentTransactions({ transactions, categories = [] }) {
  return (
    <div className="bg-surface rounded-talao border border-line shadow-soft">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <h3 className="font-heading font-bold text-ink">Movimentos recentes</h3>
      </div>
      <div className="divide-y divide-line">
        {transactions.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted-2 text-center">Sem movimentos registados.</p>
        ) : (
          transactions.slice(0, 6).map((txn) => {
            const isIncome = txn.amount > 0;
            const category = categories.find((c) => c.id === txn.category_id);
            return (
              <div key={txn.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isIncome ? 'bg-green-soft text-ok' : 'bg-muted text-muted-foreground'}`}>
                  <CategoryIcon category={category} isIncome={isIncome} className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{txn.description}</p>
                  <p className="text-xs text-muted-2">{formatDateShort(txn.date)}</p>
                </div>
                <p className={`font-mono text-sm font-semibold ${isIncome ? 'text-ok' : 'text-ink'}`}>
                  {isIncome ? '+' : ''}{formatKz(txn.amount)}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}