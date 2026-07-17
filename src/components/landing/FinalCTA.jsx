import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="py-16 sm:py-24 bg-ink border-t-2 border-ink">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <p className="kicker text-gold mb-4"> Não esperes </p>
        <h2 className="font-heading text-4xl sm:text-6xl font-bold text-surface mb-4 leading-tight">
          Começa a guardar as tuas faturas <span className="italic">hoje.</span>
        </h2>
        <p className="font-body italic text-surface/70 text-lg mb-8 max-w-lg mx-auto">
          As despesas de 2027 contam para a declaração de 2028. Quanto mais cedo começas, mais organizas.
        </p>
        <Link
          to="/registo"
          className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold/90 text-ink font-heading font-bold text-sm uppercase tracking-wider px-8 py-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
        >
          Criar conta grátis
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}