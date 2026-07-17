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
    <section className="py-16 sm:py-20 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-ink mb-3">
            A Gestão+ nunca recebe o teu dinheiro.
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Tu pagas, a app organiza. Construída com segurança e confiança em cada passo.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {items.map((item, i) => (
            <div key={i} className="text-center">
              <div className="w-11 h-11 rounded-xl bg-green-soft flex items-center justify-center mx-auto mb-3">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-ink text-sm mb-1.5">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}