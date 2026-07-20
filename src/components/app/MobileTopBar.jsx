import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function MobileTopBar({ title }) {
  return (
    <div className="md:hidden flex items-center gap-2.5 pb-1">
      <Link
        to="/app"
        className="w-9 h-9 rounded-lg border border-line bg-surface flex items-center justify-center text-ink shrink-0 active:scale-95 transition-transform"
      >
        <ChevronLeft className="w-5 h-5" />
      </Link>
      <span className="font-heading font-semibold text-[15px] text-ink truncate">{title}</span>
    </div>
  );
}