import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="py-16 sm:py-24 bg-surface">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-ink mb-4 leading-tight">
          Começa a guardar as tuas faturas hoje.
        </h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
          As despesas de 2027 contam para a declaração de 2028. Quanto mais cedo começas, mais organizas.
        </p>
        <Link
          to="/registo"
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-2 text-white font-semibold px-8 py-4 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Criar conta grátis
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}