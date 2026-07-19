import React from 'react';

/**
 * Circular progress ring using conic-gradient.
 * @param {number} pct - percentage 0-100
 * @param {string} color - hex color for the progress arc
 * @param {string} label - text inside the ring (e.g. "62%")
 */
export default function GoalRing({ pct, color, label, size = 72 }) {
  const clamped = Math.min(Math.max(pct, 0), 100);
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 relative"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${color} 0% ${clamped}%, #eef2f0 ${clamped}% 100%)`,
      }}
    >
      <div
        className="rounded-full bg-white flex items-center justify-center"
        style={{ width: size - 14, height: size - 14 }}
      >
        <span className="font-mono text-[13px] font-bold text-ink">{label}</span>
      </div>
    </div>
  );
}