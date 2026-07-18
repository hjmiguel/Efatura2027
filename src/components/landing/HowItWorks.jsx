import React from 'react';
import { Camera, Bell, Smartphone, CheckCircle2 } from 'lucide-react';
import { useInView } from '@/hooks/useAnimations';

const steps = [
  { num: 1, icon: Camera, title: 'Liga a AGT e as empresas', text: 'As faturas eletrónicas chegam sozinhas. As empresas ligadas enviam com a referência de pagamento. As de papel entram por foto.' },
  { num: 2, icon: Bell, title: 'Recebe o aviso', text: 'Antes do prazo, na app e por WhatsApp.' },
  { num: 3, icon: Smartphone, title: 'Paga por Multicaixa Express', text: 'Direto nas empresas ligadas, com a referência que elas enviaram.' },
  { num: 4, icon: CheckCircle2, title: 'A app concilia', text: 'A fatura fica como paga, sem tratares de comprovativos.' },
];

const bounceDelays = [0.3, 0.62, 0.94, 1.26];

export default function HowItWorks() {
  const [ref, inView] = useInView();

  return (
    <section id="como-funciona" ref={ref} className="py-16 sm:py-24 bg-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <p className="text-center text-sm font-semibold uppercase tracking-wider text-muted-2 mb-3">
          Como funciona
        </p>
        <h2 className="text-center font-heading text-2xl sm:text-3xl font-bold text-ink mb-12 max-w-xl mx-auto">
          Quatro passos e estás a usar.
        </h2>
        <p className="text-center text-xs text-muted-foreground max-w-2xl mx-auto mb-10">
          A AGT verifica que a fatura existe sob o teu NIF. As empresas dão a referência que permite pagar. A foto cobre o que ainda é papel. Só a empresa tem a referência de pagamento.
        </p>

        <div className="relative">
          <div
            className={`hidden lg:block absolute top-7 left-[10%] h-0.5 bg-gradient-to-r from-primary to-gold z-0 steps-line ${inView ? 'grow' : ''}`}
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {steps.map((s, i) => (
              <div key={s.num} className="relative">
                <div className="relative flex flex-col items-center text-center">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-talao z-10 steps-circle ${inView ? 'bounce' : ''}`}
                    style={{ animationDelay: `${bounceDelays[i]}s` }}
                  >
                    <s.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-mono text-xs font-bold text-muted-2 mb-1">
                    PASSO {s.num}
                  </span>
                  <h3 className="font-heading font-bold text-ink mb-2 leading-tight">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-[14rem]">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}