import React, { useState } from 'react';
import { RefreshCw, CheckCircle, AlertTriangle, ShieldCheck, ShieldOff } from 'lucide-react';
import { appApi } from '@/api/appClient';

export default function AgtSyncButton({ user, onSyncComplete }) {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showConsent, setShowConsent] = useState(false);

  const hasConsent = user?.agt_consent === true;

  async function handleGrantConsent() {
    try {
      await appApi.auth.updateMe({
        agt_consent: true,
        agt_consent_date: new Date().toISOString()
      });
      setShowConsent(false);
      onSyncComplete();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRevokeConsent() {
    if (!confirm('Revogar o acesso AGT? As faturas existentes mantêm-se, mas o feed para de sincronizar.')) return;
    try {
      await appApi.auth.updateMe({ agt_consent: false });
      onSyncComplete();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSync() {
    setSyncing(true);
    setError(null);
    setResult(null);
    try {
      const res = await appApi.functions.invoke('agtFeed', {});
      setResult(res.data);
      onSyncComplete();
    } catch (err) {
      setError(err.message || 'Erro ao sincronizar');
    }
    setSyncing(false);
  }

  if (!hasConsent) {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-talao p-4">
          <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-ink">Autoriza o acesso à AGT</p>
            <p className="text-xs text-ink/70 mt-1">
              O Gestão+ liga-se ao feed de faturação eletrónica da AGT para importar automaticamente as tuas faturas.
              Consentimento expresso e revogável a qualquer momento.
            </p>
            <button
              onClick={handleGrantConsent}
              className="mt-3 inline-flex items-center gap-2 bg-primary hover:bg-primary-2 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              Autorizar acesso
            </button>
          </div>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-2 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'A sincronizar...' : 'Sincronizar AGT'}
        </button>
        <button
          onClick={handleRevokeConsent}
          className="inline-flex items-center gap-1.5 text-sm text-muted-2 hover:text-destructive transition-colors"
        >
          <ShieldOff className="w-3.5 h-3.5" />
          Revogar
        </button>
      </div>

      {result && result.success && (
        <div className="flex items-start gap-3 bg-green-soft border border-ok/20 rounded-talao p-4">
          <CheckCircle className="w-5 h-5 text-ok shrink-0 mt-0.5" />
          <div className="text-sm text-ink">
            <p className="font-medium">Sincronização concluída</p>
            <p className="text-xs text-ink/70 mt-1">
              {result.synced > 0 && `${result.synced} faturas verificadas. `}
              {result.duplicates_found > 0 && `${result.duplicates_found} duplicados removidos. `}
              {result.imported_from_partners > 0 && `${result.imported_from_partners} importadas de parceiros. `}
              {result.already_verified > 0 && `${result.already_verified} já estavam verificadas.`}
              {result.synced === 0 && result.duplicates_found === 0 && result.imported_from_partners === 0 && 'Tudo em dia.'}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 bg-danger-soft border border-destructive/20 rounded-talao p-4">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div className="text-sm text-destructive">
            <p className="font-medium">Erro na sincronização</p>
            <p className="text-xs text-destructive/80 mt-1">{error}</p>
            <p className="text-xs text-ink/60 mt-1">A app continua utilizável. Tenta mais tarde.</p>
          </div>
        </div>
      )}
    </div>
  );
}