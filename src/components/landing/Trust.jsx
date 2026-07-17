import React from 'react';
import { ShieldCheck, Lock, FileCheck } from 'lucide-react';

const items = [
  {
    icon: ShieldCheck,
    title: 'A app nunca recebe o teu dinheiro',
    text: 'Tu pagas diretamente, a app organiza. Pagamento seguro pela EMIS.',
  },
  {
    icon: Lock,
    title: 'Dados protegidos',
    text: 'Dados pessoais tratados ao abrigo da Lei 22/11 de Angola.',
  },
  {
    icon: FileCheck,
    title: 'Os teus dados fiscais são teus',
    text: 'A app acede à AGT com a tua autorização. Revogas quando quiseres.',
  },
];

export default function Trust() {
  return (
    <section className="py-16 sm:py-20 border-t-2 border-ink">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="kicker mb-3">Compromisso</p>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-ink mb-3 leading-tight">
            A Gestão+ nunca recebe o teu dinheiro.
          </h2>
          <p className="font-body italic text-muted-foreground max-w-xl mx-auto">
            Tu pagas, a app organiza. Construída com segurança e confiança em cada passo.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-0 border-t border-l border-line">
          {items.map((item, i) => (
            <div key={i} className="text-center p-6 border-r border-b border-line">
              <div className="inline-flex w-11 h-11 rounded-none border-2 border-primary items-center justify-center mb-3">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-heading font-bold text-ink text-sm mb-1.5">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-body">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}