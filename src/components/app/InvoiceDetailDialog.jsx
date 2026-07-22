import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle2, Clock, AlertTriangle, Info } from 'lucide-react';
import { formatKz, formatDate } from '@/lib/format';
import AgtSeal from '@/components/app/AgtSeal';

const paymentInfo = {
  pending: { label: 'Pendente', icon: Clock, cls: 'pill-pend' },
  paid: { label: 'Paga', icon: CheckCircle2, cls: 'pill-paid' },
  overdue: { label: 'Vencida', icon: AlertTriangle, cls: 'pill-late' },
};

const agtInfo = {
  none: 'Desconhecido pela AGT',
  emitted: 'Emitida sob o teu NIF',
  paid: 'Confirmada como paga pela AGT',
};

export default function InvoiceDetailDialog({ invoice, open, onOpenChange }) {
  if (!invoice) return null;
  const pay = paymentInfo[invoice.status] || paymentInfo.pending;
  const PayIcon = pay.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">{invoice.issuer_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="font-mono text-2xl font-bold text-ink">{formatKz(invoice.amount)}</p>
            <p className="text-[12.5px] text-muted-foreground mt-0.5">
              {invoice.document_number || 'Sem nº'} · emitida {formatDate(invoice.issue_date)}
            </p>
          </div>

          {/* Two independent status axes */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="border border-line rounded-xl p-3">
              <span className="eyebrow">Pagamento · tu controlas</span>
              <div className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-[11.5px] font-bold ${pay.cls}`}>
                <PayIcon className="w-3.5 h-3.5" /> {pay.label}
              </div>
            </div>
            <div className="border border-line rounded-xl p-3">
              <span className="eyebrow">AGT · a fonte comunica</span>
              <div className="flex items-center gap-1.5 mt-2">
                <AgtSeal status={invoice.agt_status} size={18} />
                <span className="text-[11.5px] font-medium text-ink">
                  {invoice.agt_status && invoice.agt_status !== 'none' ? (invoice.agt_status === 'paid' ? 'Paga' : 'Emitida') : 'Nenhum'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-muted rounded-xl p-3">
            <Info className="w-4 h-4 text-muted-2 shrink-0 mt-0.5" />
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              {agtInfo[invoice.agt_status] || agtInfo.none}. A ausência de confirmação da AGT não significa que a fatura não esteja paga — o teu registo de pagamento é sempre a fonte de verdade sobre o que já pagaste.
            </p>
          </div>

          <div className="space-y-2 text-[13px]">
            {invoice.due_date && (
              <Row label="Vencimento" value={formatDate(invoice.due_date)} />
            )}
            {invoice.paid_date && (
              <Row label="Pago em" value={formatDate(invoice.paid_date)} />
            )}
            {invoice.issuer_nif && (
              <Row label="NIF do emitente" value={invoice.issuer_nif} mono />
            )}
            {invoice.reference && (
              <Row label="Referência MCX" value={invoice.reference} mono />
            )}
            {invoice.iban && (
              <Row label="IBAN" value={invoice.iban} mono />
            )}
            {invoice.deductible_type && invoice.deductible_type !== 'none' && (
              <Row label="Dedutível" value={invoice.deductible_type} />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between border-t border-line pt-2 first:border-t-0 first:pt-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={`text-ink font-medium ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}