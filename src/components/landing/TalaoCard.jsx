import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function TalaoCard({
  issuer,
  amountLabel,
  amount,
  amountSuffix = 'Kz',
  variant = 'default',
  notchColor = '#F5F0E6',
  children,
  footer,
}) {
  const isGold = variant === 'gold';
  const headerClass = isGold
    ? 'bg-gold text-ink'
    : 'bg-primary text-surface';

  return (
    <div
      className="talao-serrated-top rounded-b-talao shadow-talao overflow-hidden bg-surface border border-line"
      style={{ '--talao-notch-bg': notchColor }}
    >
      <div className={`${headerClass} px-5 pt-7 pb-4`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[0.65rem] font-heading font-bold uppercase tracking-[0.14em] opacity-80">
            {issuer}
          </span>
          {amountLabel && (
            <span className="text-[0.6rem] font-heading font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/10">
              {amountLabel}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-3xl font-bold tabular-nums leading-none">{amount}</span>
          <span className="text-sm font-medium opacity-70">{amountSuffix}</span>
        </div>
      </div>

      <div className="talao-perforation" />

      <div className="px-5 py-4 space-y-2.5">
        {children}
      </div>

      {footer && (
        <div className="px-5 pb-5 pt-1">{footer}</div>
      )}
    </div>
  );
}

export function TalaoField({ label, value, copyable = false }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!copyable) return;
    navigator.clipboard?.writeText(value.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-muted-2 font-body font-medium">{label}</span>
      <button
        type="button"
        onClick={handleCopy}
        className={`flex items-center gap-1.5 ${copyable ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <span className="font-mono text-sm font-medium text-ink tabular-nums tracking-wide">{value}</span>
        {copyable && (
          copied
            ? <Check className="w-3 h-3 text-ok" />
            : <Copy className="w-3 h-3 text-muted-2" />
        )}
      </button>
    </div>
  );
}