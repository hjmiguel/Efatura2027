import React from 'react';
import { formatKz } from '@/lib/format';
import { TrendingUp } from 'lucide-react';

export default function PatrimonioHero({ patrimonio, monthDelta }) {
  const isPositive = monthDelta >= 0;
  return (
    <div className="bg-ink rounded-talao p-6 sm:p-8 shadow-talao relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-gold" />
      <p className="text-sm text-white/60 font-medium mb-2">Património total</p>
      <p className="font-mono text-3xl sm:text-4xl font-bold text-white tracking-tight">
        {formatKz(patrimonio)}
      </p>
      <div className="flex items-center gap-2 mt-3">
        <span className={`inline-flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-soft' : 'text-danger-soft'}`}>
          <TrendingUp className={`w-4 h-4 ${!isPositive && 'rotate-180'}`} />
          {isPositive ? '+' : ''}{formatKz(monthDelta)} este mês
        </span>
      </div>
    </div>
  );
}