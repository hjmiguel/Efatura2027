import React from 'react';
import { useInView } from '@/hooks/useAnimations';
import Reveal from './Reveal';

const invoices = [
  { issuer: 'ENDE', category: 'Energia junho', amount: '18.450', deductible: false },
  { issuer: 'Clínica Sagrada Esperança', category: 'Saúde dedutível no IRPS', amount: '22.400', deductible: true },
  { issuer: 'Escola Portuguesa', category: 'Educação dedutível no IRPS', amount: '96.000', deductible: true },
];

const delays = [0.3, 1.5, 2.7];

export default function DemoBand() {
  const [ref, inView] = useInView();

  return (
    <section className="py-16 sm:py-24 bg-surface">
      <div ref={ref} className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <Reveal variant="left">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-soft text-ok text-xs font-semibold mb-4">
              Sem esforço
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-ink mb-4 leading-tight">
              As faturas entram sozinhas.
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-5">
              Ligas a AGT e as empresas uma vez. A partir daí, as faturas aparecem aqui sozinhas e já classificadas. As de saúde e educação ficam marcadas como dedutíveis, e as das empresas ligadas trazem a referência para pagares num toque.
            </p>
            <div className="inline-flex items-center gap-2">
              <span className="relative w-2 h-2 rounded-full bg-ok pulse-dot" />
              <span className="text-sm font-medium text-muted-foreground">A receber em tempo real</span>
            </div>
          </Reveal>

          <Reveal variant="right" delay={0.09}>
            <div className="bg-surface rounded-talao border border-line shadow-talao overflow-hidden">
              <div className="bg-ink px-5 py-3">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/60">
                  A chegar agora
                </p>
              </div>
              <div className="divide-y divide-line">
                {invoices.map((f, i) => (
                  <div
                    key={i}
                    className={`invoice-row ${inView ? 'fall' : ''} ${f.deductible ? 'bg-gold-soft' : 'bg-surface'}`}
                    style={{ animationDelay: `${delays[i]}s` }}
                  >
                    <div className="px-5 py-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-ink">{f.issuer}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{f.category}</p>
                      </div>
                      <p className="font-mono text-sm font-bold text-ink tabular-nums">{f.amount} Kz</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}