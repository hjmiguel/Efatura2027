import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

const DISMISS_KEY = 'gestao_plus_install_dismissed';

export default function InstallPromptToast() {
  const { installAvailable, promptInstall } = usePWA();
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Já está instalada (standalone)? Não mostrar.
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (standalone) return;

    // Utilizador já dispensou? Não voltar a mostrar nesta sessão.
    if (sessionStorage.getItem(DISMISS_KEY) === '1') return;

    if (installAvailable) {
      // Pequeno delay para não aparecer imediatamente a seguir ao load
      const t = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(t);
    }
  }, [installAvailable]);

  const handleInstall = async () => {
    setInstalling(true);
    const accepted = await promptInstall();
    setInstalling(false);
    if (accepted) {
      setVisible(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 md:bottom-6 md:right-6 md:left-auto md:w-96 z-50 animate-fade-up">
      <div className="bg-ink text-white rounded-talao shadow-talao-lg p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
          <Smartphone className="w-5 h-5 text-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Instalar a app Gestão+</p>
          <p className="text-xs text-white/60 mt-0.5 leading-snug">
            Acesso rápido pelo ecrã principal e funciona offline. É grátis.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleInstall}
              disabled={installing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold text-ink text-xs font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {installing ? 'A instalar…' : 'Instalar'}
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 rounded-lg text-white/70 text-xs font-medium hover:text-white transition-colors"
            >
              Agora não
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 rounded-lg text-white/40 hover:text-white/80 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}