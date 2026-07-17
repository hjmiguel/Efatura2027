import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

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
    <section id="precos" className="py-16 sm:py-24 bg-surface border-t-2 border-ink">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <p className="kicker text-center mb-3">Quadro · Preços</p>
        <h2 className="text-center font-heading text-3xl sm:text-5xl font-bold text-ink mb-3 leading-tight">
          Começa grátis. Subscreve quando precisares.
        </h2>
        <p className="text-center font-body italic text-muted-foreground mb-12 max-w-xl mx-auto">
          Sem letras miúdas. Cancela quando quiseres.
        </p>

        <div className="grid sm:grid-cols-2 gap-0 max-w-3xl mx-auto border-2 border-ink">
          {plans.map((plan, i) => (
            <React.Fragment key={plan.name}>
              {i > 0 && <div className="hidden sm:block border-l-2 border-ink" />}
              <div
                className={`p-7 ${plan.highlighted ? 'bg-ink text-surface' : 'bg-surface text-ink'}`}
              >
                {plan.highlighted && (
                  <span className="inline-block bg-gold text-ink text-xs font-heading font-bold uppercase tracking-wider px-3 py-1 mb-4">
                    Recomendado
                  </span>
                )}
                <h3 className={`font-heading text-2xl font-bold mb-1 ${plan.highlighted ? 'text-surface' : 'text-ink'}`}>{plan.name}</h3>
                <p className={`text-sm mb-5 font-body italic ${plan.highlighted ? 'text-surface/60' : 'text-muted-foreground'}`}>{plan.description}</p>
                <div className="flex items-baseline gap-1.5 mb-6 pb-6 border-b border-line">
                  <span className="font-mono text-4xl font-bold tabular-nums">{plan.price}</span>
                  <span className={`text-sm font-medium ${plan.highlighted ? 'text-surface/70' : 'text-muted-foreground'}`}>Kz</span>
                  <span className={`text-sm ml-1 font-body italic ${plan.highlighted ? 'text-surface/50' : 'text-muted-2'}`}>{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-7">
                  {plan.features.map((f, j) => (
                    <li key={j} className={`flex items-start gap-2.5 text-sm font-body ${plan.highlighted ? 'text-surface/85' : 'text-ink/80'}`}>
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlighted ? 'text-gold' : 'text-ok'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.href}
                  className={`block text-center font-heading font-bold text-sm uppercase tracking-wider py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                    plan.highlighted
                      ? 'bg-primary hover:bg-primary-2 text-surface'
                      : 'bg-ink hover:bg-ink/90 text-surface'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}