import React, { useState } from 'react';
import { Building2, Trash2, Plus, Copy, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { formatDate } from '@/lib/format';

async function sha256Browser(message) {
  const buf = new TextEncoder().encode(message);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateApiKey() {
  const chars = 'abcdef0123456789';
  let key = 'gpa_';
  for (let i = 0; i < 32; i++) key += chars[Math.floor(Math.random() * chars.length)];
  return key;
}

export default function PartnerConsentManager({ consents, userNif, onChanged }) {
  const [showForm, setShowForm] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [partnerNif, setPartnerNif] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!partnerName || !partnerNif) return;
    setSaving(true);
    try {
      const apiKey = generateApiKey();
      const hash = await sha256Browser(apiKey);
      await base44.entities.PartnerConsent.create({
        partner_name: partnerName,
        partner_nif: partnerNif,
        api_key_hash: hash,
        api_key_preview: apiKey.substring(0, 8) + '...',
        consent_status: 'active',
        consent_date: new Date().toISOString(),
        scopes: ['emit', 'status', 'list'],
        user_nif: userNif || ''
      });
      setGeneratedKey(apiKey);
      setPartnerName('');
      setPartnerNif('');
      setSaving(false);
      onChanged();
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  }

  async function handleRevoke(id) {
    if (!confirm('Revogar consentimento? A empresa perde acesso imediatamente.')) return;
    try {
      await base44.entities.PartnerConsent.update(id, {
        consent_status: 'revoked',
        revoked_date: new Date().toISOString()
      });
      onChanged();
    } catch (err) { console.error(err); }
  }

  function copyKey() {
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const activeConsents = consents.filter(c => c.consent_status === 'active');
  const revokedConsents = consents.filter(c => c.consent_status === 'revoked');

  return (
    <div className="bg-surface rounded-talao border border-line p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          <h2 className="font-heading font-bold text-ink">Empresas e autorizações</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-2"
        >
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      </div>

      {generatedKey && (
        <div className="mb-4 bg-gold-soft/50 border border-gold/30 rounded-xl p-4">
          <p className="text-sm font-medium text-ink mb-2">API Key gerada — partilha com a empresa</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-xs bg-surface rounded-lg px-3 py-2 border border-line break-all">
              {generatedKey}
            </code>
            <button onClick={copyKey} className="p-2 rounded-lg bg-surface border border-line hover:border-primary/30 shrink-0">
              {copied ? <Check className="w-4 h-4 text-ok" /> : <Copy className="w-4 h-4 text-muted-2" />}
            </button>
          </div>
          <p className="text-xs text-muted-2 mt-2">Guarda esta chave. Não voltará a ser mostrada.</p>
          <button onClick={() => setGeneratedKey('')} className="mt-2 text-xs text-primary font-medium hover:underline">
            OK, entendi
          </button>
        </div>
      )}

      {showForm && !generatedKey && (
        <div className="mb-4 bg-muted/30 rounded-xl p-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-2 mb-1 block">Nome da empresa</label>
            <input
              value={partnerName}
              onChange={e => setPartnerName(e.target.value)}
              placeholder="Ex: ENDE, Unitel..."
              className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/30"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-2 mb-1 block">NIF da empresa</label>
            <input
              value={partnerNif}
              onChange={e => setPartnerNif(e.target.value)}
              placeholder="NIF"
              className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/30"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={!partnerName || !partnerNif || saving}
              className="bg-primary hover:bg-primary-2 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {saving ? 'A criar...' : 'Autorizar'}
            </button>
            <button onClick={() => setShowForm(false)} className="text-sm text-muted-2 hover:text-ink px-4 py-2">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {activeConsents.length === 0 && !showForm ? (
        <p className="text-sm text-muted-2 text-center py-6">
          Sem empresas autorizadas. Adiciona uma empresa para permitir a emissão de faturas via API.
        </p>
      ) : (
        <div className="space-y-2">
          {activeConsents.map(c => (
            <div key={c.id} className="flex items-center justify-between bg-muted/30 rounded-xl px-4 py-3">
              <div>
                <p className="text-sm font-medium text-ink">{c.partner_name}</p>
                <p className="text-xs text-muted-2">
                  NIF {c.partner_nif} · Autorizada {c.consent_date ? formatDate(c.consent_date) : ''}
                  {c.api_key_preview && ` · ${c.apiKey_preview || c.api_key_preview}`}
                </p>
              </div>
              <button
                onClick={() => handleRevoke(c.id)}
                className="p-1.5 rounded text-muted-2 hover:text-destructive hover:bg-danger-soft transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {revokedConsents.length > 0 && (
            <div className="pt-2">
              <p className="text-xs text-muted-2 mb-1">Revogadas:</p>
              {revokedConsents.map(c => (
                <div key={c.id} className="flex items-center justify-between opacity-50 px-4 py-2">
                  <div>
                    <p className="text-sm font-medium text-ink line-through">{c.partner_name}</p>
                    <p className="text-xs text-muted-2">Revogada {c.revoked_date ? formatDate(c.revoked_date) : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}