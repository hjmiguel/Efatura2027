import React from 'react';
import { Check } from 'lucide-react';

/**
 * Selo da AGT com dois estados:
 * - "emitida": rosácea em contorno. Fatura registada sob o NIF, conta para a dedução.
 * - "paga": rosácea preenchida. A AGT confirmou a liquidação.
 */
export default function RosetteSeal({ status = 'emitida', size = 48, className = '' }) {
  const isPaid = status === 'paga';

  const cx = 50, cy = 50;
  const outerR = 47, innerR = 36;
  const points = [];
  for (let i = 0; i < 24; i++) {
    const angle = (i * Math.PI) / 12 - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    points.push(`${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`);
  }
  const path = `M${points.join(' L')} Z`;

  return (
    <div className={`relative flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path
          d={path}
          fill={isPaid ? '#E8A23D' : 'none'}
          stroke="#E8A23D"
          strokeWidth={isPaid ? 0 : 5}
          strokeLinejoin="round"
        />
      </svg>
      <Check
        className="absolute"
        style={{
          width: size * 0.42,
          height: size * 0.42,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: isPaid ? '#10211C' : '#E8A23D',
        }}
        strokeWidth={3}
      />
    </div>
  );
}