import React from 'react';
import { Receipt, Camera, PieChart, Target, Sparkles, MessageCircle } from 'lucide-react';

const features = [
  { icon: Receipt, title: 'Faturas da AGT', text: 'As tuas faturas chegam sozinhas, sem tirar foto. Liga o teu NIF e deixa o resto connosco.' },
  { icon: Camera, title: 'Leitura por foto', text: 'Aponta a câmara e a app lê os dados da fatura. Sem digitar, sem errar.' },
  { icon: PieChart, title: 'Orçamento por categoria', text: 'Vê para onde vai o teu dinheiro todos os meses. Luz, água, escola, mercado.' },
  { icon: Target, title: 'Metas de poupança', text: 'Define objetivos e acompanha o teu progresso. A app lembra-te onde queres chegar.' },
  { icon: Sparkles, title: 'Assistente de IA', text: 'Pergunta sobre o teu dinheiro e recebe respostas. "Quanto gastei em luz este mês?"' },
  { icon: MessageCircle, title: 'Avisos por WhatsApp', text: 'Recebe lembretes antes dos prazos das faturas. Nunca mais pagues uma multa.' },
];

export default function Features() {
  return (
    <section className="py-16 sm:py-24 border-t-2 border-ink">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <p className="kicker text-center mb-3">Secção · Funcionalidades</p>
        <h2 className="text-center font-heading text-3xl sm:text-5xl font-bold text-ink mb-3 leading-tight max-w-2xl mx-auto">
          Tudo o que precisas para gerir o teu dinheiro.
        </h2>
        <p className="text-center font-body italic text-muted-foreground mb-12 max-w-xl mx-auto">
          Seis ferramentas, uma só app. Pensada para o dia-a-dia em Angola.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-line">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-surface p-6 border-r border-b border-line hover:bg-secondary/30 transition-colors"
            >
              <div className="w-11 h-11 rounded-none border-2 border-primary flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-bold text-ink mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-body">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}