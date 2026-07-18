import React from 'react';
import { ShieldCheck, Lock, FileCheck } from 'lucide-react';
import Reveal from './Reveal';
import { useInView } from '@/hooks/useAnimations';

const invoices = [
  { issuer: 'ENDE', amount: '18.450' },
  { issuer: 'ELISAL', amount: '8.200' },
  { issuer: 'TV Cabo', amount: '15.000' },
];

const trustCards = [
  { icon: ShieldCheck, title: 'Seguro', text: 'A app nunca toca no teu dinheiro.' },
  { icon: Lock, title: 'Com consentimento', text: 'Acedes à AGT só se autorizares.' },
  { icon: FileCheck, title: 'Revogável', text: 'Desligas o acesso quando quiseres.' },
];

const invoiceDelays = [0.3, 1.0, 1.7];
const cardDelays = [0.35, 0.55, 0.75];

export default function AGTBand() {
  const [ref, inView] = useInView();

  return (
    <section className="bg-primary py-12 sm:py-16">
      <div ref={ref} className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <Reveal variant="scale" className="max-w-2xl">
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
          </Reveal>

          <div className="bg-white/5 rounded-talao border border-white/10 p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="relative w-2 h-2 rounded-full bg-green-300 pulse-dot" />
              <span className="text-white/80 text-sm font-medium">A receber em tempo real</span>
            </div>
            <div className="space-y-2">
              {invoices.map((f, i) => (
                <div
                  key={i}
                  className={`invoice-row ${inView ? 'fall' : ''}`}
                  style={{ animationDelay: `${invoiceDelays[i]}s` }}
                >
                  <div className="bg-white/10 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">{f.issuer}</p>
                      <p className="font-mono text-xs text-white/60 tabular-nums">{f.amount} Kz</p>
                    </div>
                    <span className="text-[0.6rem] font-semibold px-2 py-0.5 rounded-full bg-green-400/20 text-green-200">
                      Nova
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mt-10">
          {trustCards.map((card, i) => (
            <div
              key={i}
              className={`reveal-right ${inView ? 'reveal-visible' : ''} bg-white/5 rounded-talao border border-white/10 p-5 flex items-center gap-4`}
              style={{ transitionDelay: `${cardDelays[i]}s` }}
            >
              <div
                className={`rosette rosette-in ${inView ? 'pop' : ''} w-12 h-12 flex-shrink-0 bg-gold flex items-center justify-center`}
                style={{ animationDelay: '0.95s' }}
              >
                <card.icon className="w-5 h-5 text-ink" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-white text-sm mb-0.5">{card.title}</h3>
                <p className="text-xs text-white/60 leading-relaxed">{card.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}