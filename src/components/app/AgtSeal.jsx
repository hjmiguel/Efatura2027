import React from 'react';
import RosetteSeal from '@/components/landing/RosetteSeal';

export default function AgtSeal({ status = 'none', size = 20, showLabel = false }) {
  if (status === 'none') return null;

  const agtStatus = status === 'paid' ? 'paga' : 'emitida';
  const label = agtStatus === 'paga' ? 'AGT verificada' : 'AGT emitida';

  if (!showLabel) return <RosetteSeal status={agtStatus} size={size} />;

  return (
    <div className="inline-flex items-center gap-1.5" title={label}>
      <RosetteSeal status={agtStatus} size={size} />
      <span className="text-xs font-medium text-ink/70">{label}</span>
    </div>
  );
}