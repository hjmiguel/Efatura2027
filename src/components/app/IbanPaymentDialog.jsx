import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, Upload, FileCheck2, Loader2, ShieldCheck } from 'lucide-react';
import { formatKz, formatDate } from '@/lib/format';
import { base44 } from '@/api/base44Client';

export default function IbanPaymentDialog({ invoice, open, onOpenChange, onPaid }) {
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  React.useEffect(() => {
    if (open) {
      setStep(1);
      setFile(null);
    }
  }, [open]);

  if (!invoice) return null;

  const copyIban = () => {
    navigator.clipboard?.writeText(invoice.iban);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const confirmPaid = async () => {
    setUploading(true);
    try {
      if (file) {
        await base44.integrations.Core.UploadFile({ file });
      }
      await new Promise((r) => setTimeout(r, 800));
      setStep(4);
      onPaid?.(invoice);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const steps = [
    { n: 1, label: 'Dados' },
    { n: 2, label: 'Transferir' },
    { n: 3, label: 'Comprovativo' },
    { n: 4, label: 'Conciliado' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pagar por transferência (IBAN)</DialogTitle>
          <DialogDescription>
            {invoice.issuer_name} · {invoice.document_number || 'Sem nº'}
          </DialogDescription>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center gap-1 mb-4">
          {steps.map((s, i) => (
            <React.Fragment key={s.n}>
              <div
                className={`flex-1 h-1.5 rounded-full ${step >= s.n ? 'bg-primary' : 'bg-muted'}`}
              />
              {i < steps.length - 1 && <div className="w-1" />}
            </React.Fragment>
          ))}
        </div>
        <p className="text-xs text-muted-2 text-center -mt-2 mb-4">
          Passo {step} de 4 · {steps[step - 1].label}
        </p>

        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Montante</span>
                <span className="font-mono font-semibold text-ink">{formatKz(invoice.amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vencimento</span>
                <span className="text-ink">{formatDate(invoice.due_date)}</span>
              </div>
            </div>
            <div className="bg-surface border border-line rounded-xl px-4 py-3">
              <p className="text-xs text-muted-2 mb-1">Beneficiário</p>
              <p className="text-sm font-medium text-ink">{invoice.issuer_name}</p>
            </div>
            {invoice.iban && (
              <div className="flex items-center justify-between gap-3 bg-surface border border-line rounded-xl px-4 py-3">
                <div className="min-w-0">
                  <p className="text-xs text-muted-2 mb-0.5">IBAN</p>
                  <p className="font-mono text-sm text-ink break-all">{invoice.iban}</p>
                </div>
                <button
                  onClick={copyIban}
                  className="shrink-0 p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-ok" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            )}
            <Button onClick={() => setStep(2)} className="w-full h-12">
              Já tenho os dados
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 text-center py-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-2">
              <Upload className="w-7 h-7 text-primary" />
            </div>
            <p className="font-medium text-ink">Faz a transferência</p>
            <p className="text-sm text-muted-foreground">
              Abre a app do teu banco e transfere {formatKz(invoice.amount)} para o IBAN acima.
              Depois anexa o comprovativo no passo seguinte.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Voltar
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1">
                Já transferi
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-ink mb-2">Anexa o comprovativo</p>
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-line rounded-xl py-8 cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-colors">
                {file ? (
                  <>
                    <FileCheck2 className="w-8 h-8 text-ok" />
                    <span className="text-sm text-ink font-medium">{file.name}</span>
                    <span className="text-xs text-muted-2">Toca para trocar</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-muted-2" />
                    <span className="text-sm text-muted-foreground">Toca para escolher ficheiro</span>
                    <span className="text-xs text-muted-2">PDF ou imagem</span>
                  </>
                )}
                <input type="file" accept="image/*,application/pdf" onChange={handleFile} className="hidden" />
              </label>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Voltar
              </Button>
              <Button onClick={confirmPaid} disabled={!file || uploading} className="flex-1">
                {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Confirmar
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 text-center py-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-soft mb-2">
              <ShieldCheck className="w-7 h-7 text-ok" />
            </div>
            <p className="font-heading text-lg font-bold text-ink">Comprovativo recebido</p>
            <p className="text-sm text-muted-foreground">
              A fatura foi marcada como paga. A conciliação final acontece quando o banco confirmar a transferência.
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