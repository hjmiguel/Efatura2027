import React from 'react';
import { Files, Clock, Copy } from 'lucide-react';

const problems = [
  {
    icon: Files,
    title: 'Faturas espalhadas',
    text: 'Papel, email e WhatsApp — nunca sabes onde está cada uma.',
  },
  {
    icon: Clock,
    title: 'Prazos que passam',
    text: 'Multas que aparecem porque te esqueceste da data limite.',
  },
  {
    icon: Copy,
    title: 'Referências à mão',
    text: 'Copiar números longos e depois perder o comprovativo.',
  },
];

export default function Problem() {
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <p className="text-center text-sm font-semibold uppercase tracking-wider text-muted-2 mb-3">
          O problema
        </p>
        <h2 className="text-center font-heading text-2xl sm:text-3xl font-bold text-ink mb-12 max-w-xl mx-auto">
          Hoje, gerir as tuas contas é uma dor de cabeça.
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {problems.map((p, i) => (
            <div key={i} className="bg-surface rounded-talao p-6 border border-line text-center">
              <div className="w-12 h-12 rounded-xl bg-danger-soft flex items-center justify-center mx-auto mb-4">
                <p.icon className="w-5 h-5 text-destructive" />
              </div>
              <h3 className="font-heading font-bold text-ink mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}