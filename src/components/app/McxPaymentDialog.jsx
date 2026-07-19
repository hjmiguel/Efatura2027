import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, ExternalLink, Loader2, ShieldCheck, Smartphone } from 'lucide-react';
import { formatKz, formatDate, daysUntil } from '@/lib/format';

const MCX_DEEP_LINK = 'multicaixaexpress://';

export default function McxPaymentDialog({ invoice, open, onOpenChange, onPaid }) {
  const [step, setStep] = useState('confirm');
  const [copiedField, setCopiedField] = useState(null);
  const [processing, setProcessing] = useState(false);

  React.useEffect(() => {
    if (open) setStep('confirm');
  }, [open]);

  if (!invoice) return null;

  const overdue = invoice.due_date && daysUntil(invoice.due_date) < 0;

  const copy = (value, field) => {
    navigator.clipboard?.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const openMcx = () => {
    window.location.href = MCX_DEEP_LINK;
    setStep('waiting');
  };

  const simulatePaid = async () => {
    setProcessing(true);
    // Simulated conciliation callback (real flow: EMIS webhook)
    await new Promise((r) => setTimeout(r, 1200));
    setProcessing(false);
    setStep('done');
    onPaid?.(invoice);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            Pagar com Multicaixa Express
          </DialogTitle>
          <DialogDescription>
            {invoice.issuer_name} · {invoice.document_number || 'Sem nº'}
          </DialogDescription>
        </DialogHeader>

        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Montante</span>
                <span className="font-mono font-semibold text-ink">{formatKz(invoice.amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vencimento</span>
                <span className={overdue ? 'text-destructive font-medium' : 'text-ink'}>
                  {formatDate(invoice.due_date)}
                  {overdue && ' (vencida)'}
                </span>
              </div>
            </div>

            {invoice.entity && (
              <CopyableRow
                label="Entidade"
                value={invoice.entity}
                copied={copiedField === 'entity'}
                onCopy={() => copy(invoice.entity, 'entity')}
              />
            )}
            {invoice.reference && (
              <CopyableRow
                label="Referência"
                value={invoice.reference}
                copied={copiedField === 'ref'}
                onCopy={() => copy(invoice.reference, 'ref')}
              />
            )}

            <Button onClick={openMcx} className="w-full h-12 font-medium btn-hover btn-primary-hover">
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir Multicaixa Express
            </Button>
            <p className="text-xs text-muted-2 text-center">
              Vais ser redirecionado para a app Multicaixa Express no teu telemóvel.
            </p>
          </div>
        )}

        {step === 'waiting' && (
          <div className="space-y-4 text-center py-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-2">
              <Loader2 className="w-7 h-7 text-primary animate-spin" />
            </div>
            <p className="font-medium text-ink">Aguarda a confirmação</p>
            <p className="text-sm text-muted-foreground">
              Confirma o pagamento de {formatKz(invoice.amount)} na app Multicaixa Express.
              A fatura fecha automaticamente quando recebermos a confirmação.
            </p>
            <Button variant="outline" onClick={simulatePaid} disabled={processing} className="w-full">
              {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Já paguei
            </Button>
            <Button variant="ghost" onClick={() => setStep('confirm')} className="w-full text-sm">
              Voltar
            </Button>
          </div>
        )}

        {step === 'done' && (
          <div className="space-y-4 text-center py-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-soft mb-2">
              <ShieldCheck className="w-7 h-7 text-ok" />
            </div>
            <p className="font-heading text-lg font-bold text-ink">Pagamento confirmado</p>
            <p className="text-sm text-muted-foreground">
              A fatura de {formatKz(invoice.amount)} foi marcada como paga.
              Quando a AGT confirmar, o selo de verificação aparecerá automaticamente.
            </p>
            <Button onClick={() => onOpenChange(false)} className="w-full h-12">
              Fechar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function CopyableRow({ label, value, copied, onCopy }) {
  return (
    <div className="flex items-center justify-between gap-3 bg-surface border border-line rounded-xl px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs text-muted-2 mb-0.5">{label}</p>
        <p className="font-mono text-sm text-ink truncate">{value}</p>
      </div>
      <button
        onClick={onCopy}
        className="shrink-0 p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
      >
        {copied ? <Check className="w-4 h-4 text-ok" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}