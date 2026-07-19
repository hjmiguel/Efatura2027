import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Landmark, Calendar } from 'lucide-react';
import { formatKz } from '@/lib/format';

export default function CorporateFiscal() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const data = await base44.entities.Invoice.list();
      setInvoices(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  // Simplified VAT calculation (Lei 7/19)
  const VAT_RATE = 0.14;
  const paidInvoices = invoices.filter(i => i.status === 'paid');
  const totalPaid = paidInvoices.reduce((s, i) => s + (i.amount || 0), 0);
  const vatSupported = totalPaid * VAT_RATE / (1 + VAT_RATE); // VAT included in invoices
  const vatLiquidated = vatSupported; // Simplified: same as supported for paid invoices
  const vatCaptive = invoices
    .filter(i => i.status === 'pending' || i.status === 'overdue')
    .reduce((s, i) => s + (i.amount || 0), 0) * VAT_RATE / (1 + VAT_RATE);

  // AGT calendar dates (simplified)
  const now = new Date();
  const currentMonth = now.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
  const nextDeadline = new Date(now.getFullYear(), now.getMonth() + 1, 15);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-line border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Landmark className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">Fiscal</h1>
          <p className="text-sm text-muted-2">IVA suportado, liquidado e cativo (Lei 7/19)</p>
        </div>
      </div>

      <div className="bg-gold-soft border border-gold/30 rounded-xl p-4 flex items-center gap-3">
        <Calendar className="w-5 h-5 text-gold shrink-0" />
        <div>
          <p className="text-sm text-ink font-medium">Declaração de IVA — {currentMonth}</p>
          <p className="text-xs text-muted-foreground">Prazo: {nextDeadline.toLocaleDateString('pt-PT', { day: '2-digit', month: 'long' })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface border border-line rounded-xl p-4">
          <p className="text-xs text-muted-2 uppercase tracking-wide mb-2">IVA suportado</p>
          <p className="text-xl font-heading font-bold text-ink font-mono">{formatKz(vatSupported)}</p>
          <p className="text-xs text-muted-2 mt-1">Faturas pagas (inclui IVA 14%)</p>
        </div>
        <div className="bg-surface border border-line rounded-xl p-4">
          <p className="text-xs text-muted-2 uppercase tracking-wide mb-2">IVA liquidado</p>
          <p className="text-xl font-heading font-bold text-ink font-mono">{formatKz(vatLiquidated)}</p>
          <p className="text-xs text-muted-2 mt-1">IVA cobrado sobre vendas</p>
        </div>
        <div className="bg-surface border border-line rounded-xl p-4">
          <p className="text-xs text-muted-2 uppercase tracking-wide mb-2">IVA cativo</p>
          <p className="text-xl font-heading font-bold text-gold font-mono">{formatKz(vatCaptive)}</p>
          <p className="text-xs text-muted-2 mt-1">Faturas por pagar (a recuperar)</p>
        </div>
      </div>

      <div className="bg-surface border border-line rounded-xl p-5">
        <h2 className="font-heading font-bold text-ink mb-2">Calendário AGT</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-line/50">
            <span className="text-muted-foreground">Declaração periódica de IVA</span>
            <span className="text-ink font-mono">Dia 15 do mês seguinte</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-line/50">
            <span className="text-muted-foreground">Retenção na fonte (IRT/IRPC)</span>
            <span className="text-ink font-mono">Dia 20 do mês seguinte</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground">Declaração anual</span>
            <span className="text-ink font-mono">Até 31 de março</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-2 italic">
        Estes valores são indicativos e baseados nas faturas registadas. Consulta um contabilista certificado para a declaração oficial à AGT.
      </p>
    </div>
  );
}