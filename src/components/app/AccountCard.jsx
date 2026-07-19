import React from 'react';
import { formatKz } from '@/lib/format';
import { Landmark, Plus } from 'lucide-react';

export default function AccountCard({ accounts }) {
  return (
    <div className="bg-surface rounded-talao border border-line shadow-soft">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <h3 className="font-heading font-bold text-ink">Contas</h3>
        <button className="text-muted-foreground hover:text-primary p-1.5 rounded-lg hover:bg-muted transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="divide-y divide-line">
        {accounts.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted-2 text-center">Sem contas registadas.</p>
        ) : (
          accounts.map((acct) => (
            <div key={acct.id} className="flex items-center gap-3 px-5 py-3.5">
              <div className="w-9 h-9 rounded-xl bg-green-soft flex items-center justify-center shrink-0">
                <Landmark className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">{acct.bank_name}</p>
                <p className="text-xs text-muted-2 truncate">{acct.name}</p>
              </div>
              <p className="font-mono text-sm font-semibold text-ink">
                {formatKz(acct.balance)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}