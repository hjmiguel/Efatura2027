import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Check, Loader2, Sparkles, Smartphone, Copy, ExternalLink } from 'lucide-react';
import { formatKz } from '@/lib/format';
import { base44 } from '@/api/base44Client';

const PREMIUM_PRICE = 2500;
const MCX_DEEP_LINK = 'multicaixaexpress://';

export default function PremiumModal({ open, onOpenChange }) {
  const [step, setStep] = useState('info');
  const [processing, setProcessing] = useState(false);
  const [payment, setPayment] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const pollRef = useRef(null);

  useEffect(() => {
    if (open) {
      setStep('info');
      setPayment(null);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
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
    try {
      const res = await base44.functions.invoke('createSubscription', { plan: 'monthly' });
      setPayment(res.data);
      setStep('payment');
      startPolling(res.data.subscription_id);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const startPolling = (subscriptionId) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const sub = await base44.entities.Subscription.get(subscriptionId);
        if (sub.status === 'active') {
          clearInterval(pollRef.current);
          pollRef.current = null;
          setStep('done');
        }
      } catch (err) {
        console.error(err);
      }
    }, 5000);
    setTimeout(() => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } }, 300000);
  };

  const copy = (value, field) => {
    navigator.clipboard?.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const openMcx = () => {
    window.location.href = MCX_DEEP_LINK;
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
                  A gerar referência...
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

        {step === 'payment' && payment && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Montante</span>
                <span className="font-mono font-semibold text-ink">{formatKz(payment.amount)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                A aguardar confirmação do pagamento...
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 bg-surface border border-line rounded-xl px-4 py-3">
              <div className="min-w-0">
                <p className="text-xs text-muted-2 mb-0.5">Entidade</p>
                <p className="font-mono text-lg font-bold text-ink">{payment.entity}</p>
              </div>
              <button onClick={() => copy(payment.entity, 'entity')} className="shrink-0 p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors">
                {copiedField === 'entity' ? <Check className="w-4 h-4 text-ok" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 bg-surface border border-line rounded-xl px-4 py-3">
              <div className="min-w-0">
                <p className="text-xs text-muted-2 mb-0.5">Referência</p>
                <p className="font-mono text-lg font-bold text-ink tracking-wide break-all">{payment.reference}</p>
              </div>
              <button onClick={() => copy(payment.reference, 'ref')} className="shrink-0 p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors">
                {copiedField === 'ref' ? <Check className="w-4 h-4 text-ok" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <Button onClick={openMcx} className="w-full h-12 font-medium btn-hover btn-primary-hover">
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir Multicaixa Express
            </Button>
            <p className="text-xs text-muted-2 text-center">
              Introduz a entidade e referência na app Multicaixa Express. A subscrição ativa-se automaticamente após o pagamento.
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