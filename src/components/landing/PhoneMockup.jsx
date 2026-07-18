import React from 'react';
import CountUp from './CountUp';

export default function PhoneMockup() {
  const faturas = [
    { issuer: 'ENDE', amount: '18.450', status: 'Pagar', cls: 'bg-danger-soft text-destructive' },
    { issuer: 'ELISAL', amount: '8.200', status: 'Pago', cls: 'bg-green-soft text-ok' },
    { issuer: 'TV Cabo', amount: '15.000', status: 'Pago', cls: 'bg-green-soft text-ok' },
  ];

  return (
    <div className="relative w-[230px] h-[480px] bg-ink rounded-[2.5rem] p-2.5 shadow-talao-lg">
      <div className="w-full h-full bg-background rounded-[2rem] overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-ink rounded-b-2xl z-10" />

        <div className="pt-8 px-3 pb-3 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[0.6rem] text-muted-2">Olá, Ana</p>
              <p className="font-heading text-sm font-bold text-ink">As minhas faturas</p>
            </div>
            <div className="w-7 h-7 rounded-full bg-gold-soft flex items-center justify-center">
              <span className="text-[0.6rem] font-bold text-ink">A</span>
            </div>
          </div>

          <div className="bg-primary rounded-xl p-3 mb-4">
            <p className="text-[0.55rem] text-white/70 uppercase tracking-wider mb-0.5">Disponível</p>
            <p className="font-mono text-lg font-bold text-white tabular-nums">
              <CountUp value={247300} /> <span className="text-xs font-medium">Kz</span>
            </p>
          </div>

          <div className="space-y-2 flex-1">
            {faturas.map((f, i) => (
              <div key={i} className="bg-surface rounded-lg p-2.5 flex items-center justify-between shadow-soft">
                <div>
                  <p className="text-xs font-semibold text-ink">{f.issuer}</p>
                  <p className="font-mono text-[0.65rem] text-muted-2 tabular-nums">{f.amount} Kz</p>
                </div>
                <span className={`text-[0.55rem] font-semibold px-1.5 py-0.5 rounded ${f.cls}`}>
                  {f.status}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-2">
            <div className="w-16 h-1 bg-ink/20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}