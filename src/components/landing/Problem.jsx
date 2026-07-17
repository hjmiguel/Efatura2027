import React from 'react';
import { Files, Clock, Copy } from 'lucide-react';

const problems = [
  {
    icon: Files,
    title: 'Faturas espalhadas',
    text: 'Papel, email e WhatsApp — nunca sabes onde está cada uma. Quando precisas, não aparecem. Quando aparecem, já venceu.',
  },
  {
    icon: Clock,
    title: 'Prazos que passam',
    text: 'Multas que aparecem porque te esqueceste da data limite. O dinheiro sai duas vezes sem ganhares nada com isso.',
  },
  {
    icon: Copy,
    title: 'Referências à mão',
    text: 'Copiar números longos, digitar mal, perder o comprovativo. Depois tens de provar que pagaste aquilo que já pagaste.',
  },
];

export default function Problem() {
  return (
    <section className="py-16 sm:py-24 border-t-2 border-ink">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <p className="kicker text-center mb-3">O problema</p>
        <h2 className="text-center font-heading text-3xl sm:text-5xl font-bold text-ink mb-3 leading-tight">
          Hoje, gerir as tuas contas é uma dor de cabeça.
        </h2>
        <p className="text-center font-body italic text-muted-foreground mb-12 max-w-xl mx-auto">
          Três frustrações que todos conhecemos — e que a Gestão+ veio resolver.
        </p>

        <div className="grid sm:grid-cols-3 gap-0 sm:gap-8">
          {problems.map((p, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div className="hidden sm:block border-l border-line" />}
              <div className="text-center sm:text-left py-6 sm:py-0 border-b sm:border-b-0 border-line">
                <div className="inline-flex w-12 h-12 rounded-none border-2 border-ink items-center justify-center mb-4">
                  <p.icon className="w-5 h-5 text-ink" />
                </div>
                <h3 className="font-heading text-xl font-bold text-ink mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-body">{p.text}</p>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}