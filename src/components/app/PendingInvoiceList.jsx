import React from 'react';
import { formatKz, formatDateShort, daysUntil } from '@/lib/format';
import { Bell } from 'lucide-react';

export default function PendingInvoiceList({ invoices }) {
  return (
    <div className="bg-surface rounded-talao border border-line shadow-soft">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <h3 className="font-heading font-bold text-ink">A pagar</h3>
        </div>
        {invoices.length > 0 && (
          <span className="text-xs font-medium text-muted-2 bg-muted px-2 py-0.5 rounded-full">
            {invoices.length}
          </span>
        )}
      </div>
      <div className="divide-y divide-line">
        {invoices.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted-2 text-center">Tudo em dia. Sem faturas pendentes.</p>
        ) : (
          invoices.slice(0, 4).map((inv) => {
            const days = daysUntil(inv.due_date);
            const overdue = days < 0;
            const urgent = days >= 0 && days <= 3;
            return (
              <div key={inv.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className={`w-2 h-2 rounded-full shrink-0 ${overdue ? 'bg-danger' : urgent ? 'bg-gold' : 'bg-muted-2'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{inv.issuer_name}</p>
                  <p className="text-xs text-muted-2">
                    {overdue
                      ? `Atrasada há ${Math.abs(days)} ${Math.abs(days) === 1 ? 'dia' : 'dias'}`
                      : `Vence ${formatDateShort(inv.due_date)}`}
                  </p>
                </div>
                <p className="font-mono text-sm font-semibold text-ink">{formatKz(inv.amount)}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}