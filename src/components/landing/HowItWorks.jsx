import React from 'react';
import { Camera, Bell, Smartphone, CheckCircle2 } from 'lucide-react';

const steps = [
  { num: 1, icon: Camera, title: 'Liga a AGT ou tira foto', text: 'A app organiza tudo automaticamente.' },
  { num: 2, icon: Bell, title: 'Recebe o aviso', text: 'Antes do prazo, na app e por WhatsApp.' },
  { num: 3, icon: Smartphone, title: 'Paga por Multicaixa Express', text: 'Direto nas empresas ligadas.' },
  { num: 4, icon: CheckCircle2, title: 'A app concilia', text: 'A fatura fica como paga, sozinha.' },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-16 sm:py-24 bg-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <p className="text-center text-sm font-semibold uppercase tracking-wider text-muted-2 mb-3">
          Como funciona
        </p>
        <h2 className="text-center font-heading text-2xl sm:text-3xl font-bold text-ink mb-12 max-w-xl mx-auto">
          Quatro passos e estás a usar.
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={s.num} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-7 left-[calc(50%+2.5rem)] right-[-2.5rem] h-px border-t-2 border-dashed border-line" />
              )}
              <div className="relative flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-talao z-10">
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
    </section>
  );
}