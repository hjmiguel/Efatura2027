import React from 'react';
import { RefreshCw, X } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export default function PwaUpdateToast() {
  const { updateAvailable, applyUpdate } = usePWA();

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 md:bottom-6 md:right-6 md:left-auto md:w-80 z-50 animate-fade-up">
      <div className="bg-ink text-white rounded-2xl shadow-talao-lg p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
          <RefreshCw className="w-4 h-4 text-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Nova versão disponível</p>
          <p className="text-xs text-white/60">Atualiza para a versão mais recente.</p>
        </div>
        <button
          onClick={applyUpdate}
          className="px-3 py-1.5 rounded-lg bg-gold text-ink text-xs font-semibold hover:bg-gold/90 transition-colors shrink-0"
        >
          Atualizar
        </button>
      </div>
    </div>
  );
}