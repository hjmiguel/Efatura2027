import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Landmark, Copy, Check, Info, FileText, Loader2, CheckCircle2,
} from 'lucide-react';
import { formatKz, formatDate } from '@/lib/format';

export default function RupePaymentDialog({ invoice, open, onOpenChange, onPaid }) {
  const [copied, setCopied] = useState(false);
  const [stage, setStage] = useState('confirm'); // confirm | processing | done

  const rupeRef = invoice?.reference || '';

  const copyRef = () => {
    navigator.clipboard.writeText(rupeRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = () => {
    setStage('processing');
    // RUPE generates a DAR — no automatic reconciliation like MCX
    setTimeout(() => {
      setStage('done');
    }, 1500);
  };

  const handleClose = () => {
    if (stage === 'done' && onPaid) {
      onPaid(invoice);
    }
    setStage('confirm');
    onOpenChange(false);
  };

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        {stage === 'confirm' && (
          <>
            <DialogHeader>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                <Landmark className="w-6 h-6 text-primary" />
              </div>
              <DialogTitle>Pagamento ao Estado</DialogTitle>
              <DialogDescription>
                Referência Única de Pagamento (RUPE) — gera um DAR, não conciliação automática.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Beneficiary */}
              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-xs text-muted-2 mb-0.5">Beneficiário</p>
                <p className="font-medium text-ink">{invoice.issuer_name}</p>
                {invoice.issuer_nif && <p className="text-xs text-muted-2 font-mono">NIF: {invoice.issuer_nif}</p>}
              </div>

              {/* RUPE Reference */}
              <div className="border border-primary/20 rounded-xl p-3">
                <p className="text-xs text-muted-2 mb-1">Referência RUPE (20 dígitos)</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-lg font-bold text-primary tracking-wider break-all">{rupeRef}</p>
                  <button onClick={copyRef} className="p-2 rounded-lg hover:bg-muted shrink-0">
                    {copied ? <Check className="w-4 h-4 text-ok" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Montante</span>
                <span className="font-mono text-xl font-bold text-ink">{formatKz(invoice.amount)}</span>
              </div>

              {/* Info banner */}
              <div className="bg-gold-soft/50 border border-gold/20 rounded-xl p-3 flex gap-2">
                <Info className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <p className="text-xs text-ink leading-relaxed">
                  A RUPE é emitida pela AGT. Este pagamento gera um <strong>DAR</strong> (Documento de Arrecadação de Receitas) e não concilia automaticamente como o Multicaixa Express. Marca como pago após confirmação.
                </p>
              </div>

              <Button onClick={handleConfirm} className="w-full btn-hover btn-primary-hover">
                <FileText className="w-4 h-4 mr-2" />
                Gerar DAR e continuar
              </Button>
            </div>
          </>
        )}

        {stage === 'processing' && (
          <div className="py-12 text-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
            <p className="font-medium text-ink">A processar DAR...</p>
            <p className="text-sm text-muted-foreground mt-1">A preparar o documento de arrecadação.</p>
          </div>
        )}

        {stage === 'done' && (
          <div className="py-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-green-soft flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-ok" />
            </div>
            <p className="font-heading font-bold text-lg text-ink">DAR gerado</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
              Pagamento registado. Paga a RUPE no portal da AGT ou num balcão autorizado. A fatura fica marcada como paga.
            </p>
            <Button onClick={handleClose} className="w-full mt-6">
              Concluir
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}