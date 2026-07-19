import React from 'react';

export default function KpiCard({ icon: Icon, label, value, sublabel, accent = 'gold' }) {
  const accentColors = {
    gold: 'text-gold bg-gold/10',
    green: 'text-emerald-400 bg-emerald-400/10',
    blue: 'text-sky-400 bg-sky-400/10',
    red: 'text-red-400 bg-red-400/10',
  };

  return (
    <div className="bg-[hsl(163_30%_13%)] border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-500 uppercase tracking-wide">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accentColors[accent]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-heading font-bold text-white font-mono">{value}</p>
      {sublabel && <p className="text-xs text-slate-500 mt-1">{sublabel}</p>}
    </div>
  );
}