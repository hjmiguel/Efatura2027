import React from 'react';
import { Camera, Bell, Smartphone, CheckCircle2 } from 'lucide-react';

const steps = [
  { num: 'I', icon: Camera, title: 'Liga a AGT ou tira foto', text: 'A app organiza tudo automaticamente. Sem digitar, sem procurar.' },
  { num: 'II', icon: Bell, title: 'Recebe o aviso', text: 'Antes do prazo, na app e por WhatsApp. Nunca mais perdes uma data.' },
  { num: 'III', icon: Smartphone, title: 'Paga por Multicaixa Express', text: 'Direto nas empresas ligadas. Sem sair de casa, sem filas.' },
  { num: 'IV', icon: CheckCircle2, title: 'A app concilia', text: 'A fatura fica como paga, sozinha. Tudo registado para o IRPS.' },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-16 sm:py-24 bg-surface border-t-2 border-ink">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <p className="kicker text-center mb-3">Guia prático</p>
        <h2 className="text-center font-heading text-3xl sm:text-5xl font-bold text-ink mb-3 leading-tight">
          Quatro passos e estás a usar.
        </h2>
        <p className="text-center font-body italic text-muted-foreground mb-12 max-w-xl mx-auto">
          Da fatura ao pagamento, sem complicações.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0">
          {steps.map((s, i) => (
            <React.Fragment key={s.num}>
              {i > 0 && <div className="hidden lg:block border-l border-line" />}
              <div className="relative flex flex-col items-center text-center px-4 py-6 border-b lg:border-b-0 border-line">
                <span className="font-heading text-5xl font-black text-ink/15 mb-2 leading-none">{s.num}</span>
                <div className="w-12 h-12 rounded-none border-2 border-primary flex items-center justify-center mb-4">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-bold text-ink mb-2 leading-tight">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-body max-w-[16rem]">{s.text}</p>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}