import React from 'react';
import { Receipt, Camera, PieChart, Target, Sparkles, MessageCircle } from 'lucide-react';
import Reveal from './Reveal';

const features = [
  { icon: Receipt, title: 'Faturas da AGT', text: 'As tuas faturas chegam sozinhas, sem tirar foto.' },
  { icon: Camera, title: 'Leitura por foto', text: 'Aponta a câmara e a app lê os dados da fatura.' },
  { icon: PieChart, title: 'Orçamento por categoria', text: 'Vê para onde vai o teu dinheiro todos os meses.' },
  { icon: Target, title: 'Metas de poupança', text: 'Define objetivos e acompanha o teu progresso.' },
  { icon: Sparkles, title: 'Assistente de IA', text: 'Pergunta sobre o teu dinheiro e recebe respostas.' },
  { icon: MessageCircle, title: 'Avisos por WhatsApp', text: 'Recebe lembretes antes dos prazos das faturas.' },
];

export default function Features() {
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <p className="text-center text-sm font-semibold uppercase tracking-wider text-muted-2 mb-3">
          Funcionalidades
        </p>
        <h2 className="text-center font-heading text-2xl sm:text-3xl font-bold text-ink mb-12 max-w-xl mx-auto">
          Tudo o que precisas para gerir o teu dinheiro.
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <Reveal
              key={i}
              delay={0.09 * (i + 1)}
              className="bg-surface rounded-talao p-6 border border-line card-hover"
            >
              <div className="w-11 h-11 rounded-xl bg-green-soft flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-heading font-bold text-ink mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}