import React, { useState } from 'react';
import { Lock, KeyRound, Fingerprint, Smartphone, Shield, Loader2, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ProfileSecurity({ user }) {
  const [pinEnabled, setPinEnabled] = useState(false);
  const [biometryEnabled, setBiometryEnabled] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handlePasswordReset() {
    if (!user?.email) return;
    setSendingReset(true);
    try {
      await base44.auth.resetPasswordRequest(user.email);
      setResetSent(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSendingReset(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Change password */}
      <div className="bg-surface rounded-xl border border-line p-4">
        <div className="flex items-center gap-2 mb-3">
          <Lock className="w-4 h-4 text-primary" />
          <h3 className="font-heading font-semibold text-ink text-sm">Palavra-passe</h3>
        </div>
        <p className="text-xs text-muted-2 mb-3">
          Para alterar a tua palavra-passe, enviamos um link de redefinição para o teu email.
        </p>
        {resetSent ? (
          <div className="flex items-center gap-2 text-sm text-ok bg-green-soft rounded-lg px-3 py-2">
            <Check className="w-4 h-4" /> Link enviado. Verifica o teu email.
          </div>
        ) : (
          <button
            onClick={handlePasswordReset}
            disabled={sendingReset || !user?.email}
            className="inline-flex items-center gap-2 border border-line hover:border-primary/30 text-ink font-medium px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {sendingReset ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
            Enviar link de redefinição
          </button>
        )}
      </div>

      {/* PIN */}
      <div className="bg-surface rounded-xl border border-line p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-primary" />
            <div>
              <h3 className="font-heading font-semibold text-ink text-sm">PIN de acesso</h3>
              <p className="text-xs text-muted-2">Pedir PIN ao abrir a aplicação</p>
            </div>
          </div>
          <button
            onClick={() => setPinEnabled(!pinEnabled)}
            className={`relative w-11 h-6 rounded-full transition-colors ${pinEnabled ? 'bg-primary' : 'bg-muted-2/30'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${pinEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Biometry */}
      <div className="bg-surface rounded-xl border border-line p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-primary" />
            <div>
              <h3 className="font-heading font-semibold text-ink text-sm">Biometria</h3>
              <p className="text-xs text-muted-2">Impressão digital ou Face ID</p>
            </div>
          </div>
          <button
            onClick={() => setBiometryEnabled(!biometryEnabled)}
            className={`relative w-11 h-6 rounded-full transition-colors ${biometryEnabled ? 'bg-primary' : 'bg-muted-2/30'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${biometryEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Sessions */}
      <div className="bg-surface rounded-xl border border-line p-4">
        <div className="flex items-center gap-2 mb-3">
          <Smartphone className="w-4 h-4 text-primary" />
          <h3 className="font-heading font-semibold text-ink text-sm">Sessões e dispositivos</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2.5">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-muted-2" />
              <div>
                <p className="text-sm font-medium text-ink">Este dispositivo</p>
                <p className="text-xs text-muted-2">Sessão ativa</p>
              </div>
            </div>
            <span className="text-xs font-medium text-ok bg-green-soft px-2 py-0.5 rounded">Ativa</span>
          </div>
        </div>
        <p className="text-xs text-muted-2 mt-2">
          Para terminar sessões noutros dispositivos, sai da conta e volta a entrar.
        </p>
      </div>

      {/* Data protection note */}
      <div className="flex items-start gap-2 bg-muted/30 rounded-xl p-3">
        <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Os teus dados são protegidos ao abrigo da Lei 22/11 (Proteção de Dados). O acesso à AGT é controlado por ti e pode ser revogado a qualquer momento.
        </p>
      </div>
    </div>
  );
}