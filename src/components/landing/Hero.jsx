import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PlayCircle, Smartphone } from 'lucide-react';
import PhoneMockup from './PhoneMockup';
import TalaoCard, { TalaoField } from './TalaoCard';
import Reveal from './Reveal';

export default function Hero() {
  return (
    <section className="relative pt-28 pb-16 sm:pt-32 sm:pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="text-center lg:text-left">
            <Reveal delay={0}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-soft text-ok text-xs font-medium mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-ok" />
                Feito para Angola
              </div>
            </Reveal>
            <Reveal delay={0.09}>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl max-[420px]:text-3xl font-bold text-ink leading-[1.05] tracking-tight">
                O teu dinheiro,<br />em dia.
              </h1>
            </Reveal>
            <Reveal delay={0.18}>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-md mx-auto lg:mx-0">
                Junta as tuas faturas, paga por Multicaixa Express e sabe sempre quanto te sobra. Feito para Angola.
              </p>
            </Reveal>
            <Reveal delay={0.27}>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  to="/registo"
                  className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-2 text-white font-semibold px-6 py-3.5 rounded-xl btn-hover btn-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Criar conta grátis
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/onboarding"
                  className="inline-flex items-center justify-center gap-2 bg-surface hover:bg-line text-ink font-semibold px-6 py-3.5 rounded-xl border border-line btn-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <PlayCircle className="w-4 h-4" />
                  Ver como funciona
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.36}>
              <p className="mt-4 text-xs text-muted-2 text-center lg:text-left">Grátis para começar. Sem cartão de crédito.</p>
            </Reveal>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-fit">
              <div className="hero-phone">
                <PhoneMockup />
              </div>
              <div className="mt-[-2rem] mx-auto w-[210px] z-20 relative lg:mt-0 lg:absolute lg:top-1/2 lg:-translate-y-1/2 lg:right-[-2.5rem] lg:w-[260px] lg:rotate-[6deg]">
                <div className="hero-talao">
                  <div className="hero-talao-inner">
                    <TalaoCard
                      issuer="ENDE"
                      amountLabel="Fatura"
                      amount="18.450"
                      notchColor="#EAEEEC"
                      footer={
                        <button className="w-full flex items-center justify-center gap-2 bg-ink hover:bg-ink/90 text-white font-semibold py-3 rounded-xl text-sm btn-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                          <Smartphone className="w-4 h-4" />
                          Pagar com Multicaixa Express
                        </button>
                      }
                    >
                      <TalaoField label="Entidade" value="00556" copyable />
                      <TalaoField label="Referência" value="123 456 789" copyable />
                      <TalaoField label="Vencimento" value="30/07/2026" />
                    </TalaoCard>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}