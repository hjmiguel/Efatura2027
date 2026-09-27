import React, { useState } from 'react';
import { Plus, Trash2, Copy, Check, KeyRound, ShieldCheck } from 'lucide-react';

export default function PartnerApiKeys({ apiKeys, onGenerate, onRevoke, generatedKey, copied, onCopy }) {
  const [newName, setNewName] = useState('');
  const [newNif, setNewNif] = useState('');
  const [newFee, setNewFee] = useState('');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <span className="eyebrow">§ 05 · API e chaves</span>
          <h1 className="font-heading text-xl font-bold text-ink mt-1">Credenciais</h1>
        </div>
      </div>

      {generatedKey && (
        <div className="bg-surface border border-line rounded-talao p-5 shadow-soft">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-ok" />
            <h2 className="font-heading font-semibold text-[15px] text-ink">Chave gerada — copia agora</h2>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2.5 bg-muted rounded-lg font-mono text-[12px] text-ink break-all">{generatedKey}</code>
            <button onClick={onCopy} className="p-2.5 rounded-lg border border-line text-muted-2 hover:text-ink hover:bg-muted transition-colors">
              {copied ? <Check className="w-4 h-4 text-ok" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-muted-2 mt-3 leading-relaxed">
            Esta chave só é mostrada uma vez. Guarda-a em segredo — move faturas reais.
          </p>
        </div>
      )}

      {/* Generate new key */}
      <div className="bg-surface border border-line rounded-talao p-5 shadow-soft">
        <h2 className="font-heading font-semibold text-[15px] text-ink mb-3">Gerar nova chave</h2>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] text-muted-2 block mb-1">Nome da empresa</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:border-primary/40"
            />
          </div>
          <div>
            <label className="text-[11px] text-muted-2 block mb-1">NIF da empresa</label>
            <input
              value={newNif}
              onChange={(e) => setNewNif(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-line text-sm font-mono focus:outline-none focus:border-primary/40"
            />
          </div>
          <div>
            <label className="text-[11px] text-muted-2 block mb-1">Honorário por fatura paga (Kz)</label>
            <input
              type="number"
              value={newFee}
              onChange={(e) => setNewFee(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-line text-sm font-mono focus:outline-none focus:border-primary/40"
            />
          </div>
        </div>
        <button
          onClick={() => { onGenerate(newName, newNif, parseFloat(newFee) || 0); setNewName(''); setNewNif(''); setNewFee(''); }}
          disabled={!newName.trim() || !newNif.trim()}
          className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-40 hover:bg-primary-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Gerar chave
        </button>
      </div>

      {/* Existing keys */}
      <div className="bg-surface border border-line rounded-talao overflow-hidden shadow-soft">
        <div className="px-5 py-3.5 border-b border-line">
          <h2 className="font-heading font-semibold text-[15px] text-ink">Chaves da tua empresa</h2>
        </div>
        {apiKeys.length === 0 ? (
          <p className="px-5 py-10 text-sm text-muted-2 text-center">Nenhuma chave registada.</p>
        ) : (
          apiKeys.map((k) => (
            <div key={k.id} className="px-5 py-3.5 border-b border-line/50 last:border-0 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-muted-2" />
                </div>
                <div>
                  <p className="text-sm text-ink font-medium">{k.partner_name}</p>
                  <p className="text-[11px] text-muted-2 font-mono">
                    NIF: {k.partner_nif} · {k.api_key_preview || '••••'} · honorário {k.fee_per_invoice || 0} Kz/fatura
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`${k.status === 'active' ? 'pill-paid' : 'pill-late'} text-[10.5px] font-bold px-2.5 py-1 rounded-full`}>
                  {k.status === 'active' ? 'ativa' : 'revogada'}
                </span>
                {k.status === 'active' && (
                  <button onClick={() => onRevoke(k.id)} className="p-1.5 rounded-lg text-destructive hover:bg-danger-soft transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}