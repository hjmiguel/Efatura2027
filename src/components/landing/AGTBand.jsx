import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function AGTBand() {
  return (
    <section className="bg-primary py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">
            As tuas faturas chegam sozinhas.
          </h2>
          <p className="text-white/80 leading-relaxed">
            Com a tua autorização, a Gestão+ mostra as faturas eletrónicas emitidas sob o teu NIF. Sem tirar foto, sem digitar. Tu autorizas, e podes revogar quando quiseres.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            com dados da AGT, mediante consentimento
          </div>
        </div>
      </div>
    </section>
  );
}