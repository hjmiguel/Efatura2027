import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PlayCircle, Smartphone } from 'lucide-react';
import PhoneMockup from './PhoneMockup';
import TalaoCard, { TalaoField } from './TalaoCard';

export default function Hero() {
  return (
    <section className="relative pt-36 sm:pt-44 pb-16 sm:pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Kicker */}
        <p className="kicker text-center mb-4">Edição Especial · Finanças Pessoais</p>

        {/* Masthead headline */}
        <h1 className="font-heading text-center text-5xl sm:text-7xl lg:text-8xl font-black text-ink leading-[0.95] tracking-tight mb-3">
          O teu dinheiro,
          <span className="block italic font-medium">em dia.</span>
        </h1>

        {/* Deck / subtitle */}
        <p className="text-center font-body italic text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
          Junta as tuas faturas, paga por Multicaixa Express e sabe sempre quanto te sobra. Feito para Angola.
        </p>

        <div className="rule-thin max-w-3xl mx-auto mb-10" />

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-10 items-center">
          {/* Left: article text + CTAs */}
          <div className="order-2 lg:order-1">
            <p className="kicker mb-3">A história</p>
            <div className="news-columns-2 text-sm sm:text-base text-ink/85 leading-relaxed font-body">
              <p className="drop-cap mb-3">
                Em Angola, as faturas chegam por todo o lado — papel, email, WhatsApp — e os prazos passam sem aviso. As multas acumulam, as referências perdem-se, e no fim do mês ninguém sabe ao certo para onde foi o dinheiro.
              </p>
              <p>
                A Gestão+ junta tudo num só lugar. Liga à AGT e as tuas faturas chegam sozinhas. Recebes avisos antes do prazo. Pagas por Multicaixa Express, direto. E a app concilia tudo por ti — porque a partir de 2027, cada fatura com o teu NIF vale dinheiro no IRPS.
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/registo"
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-2 text-surface font-heading font-bold text-sm uppercase tracking-wider px-6 py-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Criar conta grátis
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#como-funciona"
                className="inline-flex items-center justify-center gap-2 bg-surface hover:bg-secondary text-ink font-heading font-bold text-sm uppercase tracking-wider px-6 py-3.5 border-2 border-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <PlayCircle className="w-4 h-4" />
                Ver como funciona
              </a>
            </div>
          </div>

          {/* Right: phone + talao */}
          <div className="order-1 lg:order-2 relative flex justify-center lg:justify-end">
            <div className="relative w-fit">
              <PhoneMockup />
              <div className="mt-[-2rem] mx-auto w-[210px] z-20 relative lg:mt-0 lg:absolute lg:top-1/2 lg:-translate-y-1/2 lg:right-[-2.5rem] lg:w-[260px] lg:rotate-[6deg]">
                <TalaoCard
                  issuer="ENDE"
                  amountLabel="Fatura"
                  amount="18.450"
                  notchColor="#F5F0E6"
                  footer={
                    <button className="w-full flex items-center justify-center gap-2 bg-ink hover:bg-ink/90 text-surface font-heading font-bold py-3 text-xs uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                      <Smartphone className="w-4 h-4" />
                      Pagar Multicaixa Express
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
    </section>
  );
}