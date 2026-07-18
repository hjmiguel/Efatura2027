import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import Reveal from './Reveal';

const plans = [
  {
    name: 'Gratuito',
    price: '0',
    period: 'para sempre',
    description: 'Para começar a organizar as tuas contas.',
    features: [
      'Registo de despesas',
      'Orçamento por categoria',
      'Faturas da AGT',
      'Até 10 faturas manuais por mês',
    ],
    cta: 'Criar conta grátis',
    href: '/registo',
    highlighted: false,
  },
  {
    name: 'Premium',
    price: '2.500',
    period: 'por mês',
    description: 'Para quem quer ir mais longe.',
    features: [
      'Assistente de IA sem limites',
      'Relatórios avançados',
      'Alertas proativos',
      'Faturas manuais ilimitadas',
    ],
    cta: 'Subscrever',
    href: '/registo',
    highlighted: true,
  },
];

export default function Pricing() {
  return (
    <section id="precos" className="py-16 sm:py-24 bg-surface">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <p className="text-center text-sm font-semibold uppercase tracking-wider text-muted-2 mb-3">
          Preços
        </p>
        <h2 className="text-center font-heading text-2xl sm:text-3xl font-bold text-ink mb-12">
          Começa grátis. Subscreve quando precisares.
        </h2>

        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan, i) => (
            <Reveal
              key={plan.name}
              variant={i === 0 ? 'left' : 'right'}
              delay={i === 0 ? 0 : 0.09}
              className={`relative rounded-talao p-7 border-2 card-hover ${
                plan.highlighted
                  ? 'border-primary bg-surface shadow-talao'
                  : 'border-line bg-surface'
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-ink text-xs font-bold px-3 py-1 rounded-full">
                  Recomendado
                </span>
              )}
              <h3 className="font-heading font-bold text-ink text-lg mb-1">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
              <div className="flex items-baseline gap-1.5 mb-6">
                <span className="font-mono text-4xl font-bold text-ink tabular-nums">{plan.price}</span>
                <span className="text-sm font-medium text-muted-foreground">Kz</span>
                <span className="text-sm text-muted-2 ml-1">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-7">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-ink/80">
                    <Check className="w-4 h-4 text-ok mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to={plan.href}
                className={`block text-center font-semibold py-3 rounded-xl btn-hover ${
                  plan.highlighted
                    ? 'bg-primary hover:bg-primary-2 text-white btn-primary-hover'
                    : 'bg-line hover:bg-line/70 text-ink'
                }`}
              >
                {plan.cta}
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}