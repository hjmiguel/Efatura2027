import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function AGTBand() {
  return (
    <section className="bg-ink py-12 sm:py-16 border-y-2 border-ink">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl">
          <p className="kicker text-gold mb-3"> urgente </p>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-surface mb-4 leading-tight">
            As tuas faturas chegam <span className="italic">sozinhas.</span>
          </h2>
          <p className="text-surface/70 leading-relaxed font-body text-base sm:text-lg max-w-2xl">
            Com a tua autorização, a Gestão+ mostra as faturas eletrónicas emitidas sob o teu NIF. Sem tirar foto, sem digitar. Tu autorizas, e podes revogar quando quiseres.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 border border-gold/40 text-gold/90 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            Dados da AGT, mediante consentimento
          </div>
        </div>
      </div>
    </section>
  );
}