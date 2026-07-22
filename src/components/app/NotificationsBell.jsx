import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, AlertTriangle, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { formatKz, daysUntil } from '@/lib/format';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

const WARNING_DAYS_BEFORE = 3;

export default function NotificationsBell() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    base44.entities.Invoice.filter({ status: 'pending' }).then((invoices) => {
      const relevant = invoices
        .filter((inv) => inv.due_date)
        .map((inv) => ({ ...inv, days: daysUntil(inv.due_date) }))
        // Apenas dois avisos por fatura: um antes do prazo, outro no dia do prazo
        .filter((inv) => inv.days === WARNING_DAYS_BEFORE || inv.days === 0)
        .sort((a, b) => a.days - b.days);
      setAlerts(relevant);
    }).catch(() => {});
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button aria-label="Notificações" className="relative w-10 h-10 rounded-[11px] border border-line bg-surface flex items-center justify-center text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
          <Bell className="w-5 h-5" />
          {alerts.length > 0 && (
            <span className="absolute top-[7px] right-2 w-2 h-2 rounded-full bg-destructive border-2 border-surface" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-line">
          <p className="font-heading font-semibold text-ink text-sm">Notificações</p>
        </div>
        {alerts.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            Sem avisos de prazo por agora.
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {alerts.map((inv) => (
              <Link
                key={inv.id}
                to="/app/pagamentos"
                className="flex items-start gap-2.5 px-4 py-3 border-t border-line first:border-t-0 hover:bg-muted/40 transition-colors"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${inv.days === 0 ? 'bg-danger-soft text-destructive' : 'bg-gold-soft text-[#8a6420]'}`}>
                  {inv.days === 0 ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-ink truncate">{inv.issuer_name}</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    {inv.days === 0 ? 'Vence hoje' : `Vence em ${inv.days} dias`} · {formatKz(inv.amount)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}