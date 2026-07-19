import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Check, Loader2, Sparkles } from 'lucide-react';
import { formatKz } from '@/lib/format';

const PREMIUM_PRICE = 2500;

export default function PremiumModal({ open, onOpenChange }) {
  const [step, setStep] = useState('info');
  const [processing, setProcessing] = useState(false);

  React.useEffect(() => {
    if (open) setStep('info');
  }, [open]);

  const benefits = [
    'Sincronização automática com a AGT',
    'Selos de verificação em tempo real',
    'Assistente IA com insights personalizados',
    'Exportação de relatórios para o IRPS',
    'Agenda de pagamentos e lembretes',
  ];

  const subscribe = async () => {
    setProcessing(true);
    // Simulated EMIS subscription flow
    await new Promise((r) => setTimeout(r, 1500));
    setProcessing(false);
    setStep('done');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-gold" />
            Gestão+ Premium
          </DialogTitle>
          <DialogDescription>
            Desbloqueia todo o potencial da tua gestão financeira.
          </DialogDescription>
        </DialogHeader>

        {step === 'info' && (
          <div className="space-y-4">
            <div className="text-center py-2">
              <p className="font-mono text-3xl font-bold text-ink">
                {formatKz(PREMIUM_PRICE)}
                <span className="text-base font-normal text-muted-2">/mês</span>
              </p>
            </div>
            <ul className="space-y-2.5">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm">
                  <Check className="w-4 h-4 text-ok shrink-0 mt-0.5" />
                  <span className="text-ink">{b}</span>
                </li>
              ))}
            </ul>
            <Button onClick={subscribe} disabled={processing} className="w-full h-12 btn-hover btn-gold-hover bg-gold text-ink hover:bg-gold/90">
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  A processar...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Subscrever agora
                </>
              )}
            </Button>
            <p className="text-xs text-muted-2 text-center">
              Pagamento via Multicaixa Express. Cancela quando quiseres.
            </p>
          </div>
        )}

        {step === 'done' && (
          <div className="space-y-4 text-center py-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold-soft mb-2">
              <Crown className="w-7 h-7 text-gold" />
            </div>
            <p className="font-heading text-lg font-bold text-ink">Bem-vinda ao Premium!</p>
            <p className="text-sm text-muted-foreground">
              A tua subscrição está ativa. Todas as funcionalidades Premium já estão disponíveis.
            </p>
            <Button onClick={() => onOpenChange(false)} className="w-full h-12">
              Começar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}