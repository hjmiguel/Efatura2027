import React from 'react';
import TalaoCard from './TalaoCard';

function Tag({ children }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 border border-ink/20 text-ink text-xs font-heading font-semibold uppercase tracking-wider">
      {children}
    </span>
  );
}

export default function IRPSBand() {
  return (
    <section id="irps" className="py-16 sm:py-24 bg-gold-soft border-t-2 border-ink">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Editorial article */}
          <div>
            <p className="kicker text-gold mb-3">Análise · IRPS 2027</p>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-ink mb-5 leading-tight">
              A partir de 2027, guardar a fatura vale dinheiro.
            </h2>
            <div className="news-columns-2 text-sm text-ink/75 leading-relaxed font-body">
              <p className="mb-3">
                O novo IRPS deixa deduzir despesas de saúde, educação e renda de habitação. Mas só contam as faturas com o teu NIF — sem NIF, sem dedução.
              </p>
              <p>
                A Gestão+ guarda-as por ti e avisa quando falta o NIF. Assim, quando chegar 2028 e for altura de declarar, tens tudo pronto — organizado, somado e à mão.
              </p>
            </div>
            <p className="text-xs text-ink/50 leading-relaxed mt-5 pt-4 border-t border-ink/15 italic font-body">
              O IRPS entra em vigor a 1 de janeiro de 2027. A primeira declaração é em 2028. Os limites de dedução ainda não estão confirmados em Diário da República.
            </p>
          </div>

          {/* Sidebar box */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-[280px] rotate-[-3deg]">
              <TalaoCard
                issuer="Dedutível no IRPS"
                amountLabel="2027"
                amount="128.400"
                variant="gold"
                notchColor="#F5E8C8"
              >
                <p className="text-xs text-ink/60 mb-3 font-heading font-semibold uppercase tracking-wider">Despesas com NIF</p>
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