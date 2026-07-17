import React from 'react';
import TalaoCard from './TalaoCard';

function Tag({ children }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/60 text-ink text-xs font-semibold">
      {children}
    </span>
  );
}

export default function IRPSBand() {
  return (
    <section id="irps" className="py-16 sm:py-24 bg-gold-soft">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-gold mb-3">
              IRPS 2027
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-ink mb-4 leading-tight">
              A partir de 2027, guardar a fatura vale dinheiro.
            </h2>
            <p className="text-ink/70 leading-relaxed mb-4">
              O novo IRPS deixa deduzir despesas de saúde, educação e renda de habitação. Mas só contam as faturas com o teu NIF. A Gestão+ guarda-as por ti e avisa quando falta o NIF.
            </p>
            <p className="text-xs text-ink/50 leading-relaxed">
              O IRPS entra em vigor a 1 de janeiro de 2027. A primeira declaração é em 2028. Os limites de dedução ainda não estão confirmados em Diário da República.
            </p>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-[280px] rotate-[-3deg]">
              <TalaoCard
                issuer="Dedutível no IRPS"
                amountLabel="2027"
                amount="128.400"
                variant="gold"
                notchColor="#F6E2BC"
              >
                <p className="text-xs text-ink/60 mb-3 font-medium">Despesas com NIF organizadas</p>
                <div className="flex flex-wrap gap-2">
                  <Tag>Saúde</Tag>
                  <Tag>Educação</Tag>
                  <Tag>Renda</Tag>
                </div>
              </TalaoCard>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}