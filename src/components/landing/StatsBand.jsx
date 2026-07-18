import React from 'react';
import CountUp from './CountUp';
import Reveal from './Reveal';

const stats = [
  { value: 261, suffix: '', label: 'softwares certificados pela AGT que já emitem fatura eletrónica' },
  { value: 2027, suffix: '', label: 'ano em que o IRPS entra em vigor, com deduções' },
  { value: 3, suffix: ' min', label: 'para ligares a AGT e veres as tuas faturas' },
  { value: 0, suffix: ' Kz', label: 'para começar. O plano gratuito não expira' },
];

export default function StatsBand() {
  return (
    <section className="py-16 sm:py-20 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <Reveal key={i} delay={0.09 * i} className="text-center">
              <p className="font-mono text-3xl sm:text-4xl lg:text-5xl font-bold text-primary tabular-nums mb-2">
                <CountUp value={s.value} />{s.suffix}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-[12rem] mx-auto">
                {s.label}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}