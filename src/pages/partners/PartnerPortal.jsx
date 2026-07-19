import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Briefcase, Receipt, Key, Plus, Trash2, Copy, Check } from 'lucide-react';
import { formatKz, formatDate } from '@/lib/format';

export default function PartnerPortal() {
  const [tab, setTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [consents, setConsents] = useState([]);
  const [user, setUser] = useState(null);

  // Emit form
  const [form, setForm] = useState({
    issuer_name: '', issuer_nif: '', document_number: '',
    amount: '', due_date: '', user_nif: '',
    entity: '', reference: ''
  });
  const [emitting, setEmitting] = useState(false);
  const [emitResult, setEmitResult] = useState(null);

  // API Key
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyNif, setNewKeyNif] = useState('');
  const [generatedKey, setGeneratedKey] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [me, inv, cons] = await Promise.all([
        base44.auth.me(),
        base44.entities.Invoice.list('-created_date', 50),
        base44.entities.PartnerConsent.list(),
      ]);
      setUser(me);
      setInvoices(inv.filter(i => i.source === 'partner'));
      setConsents(cons);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function handleEmit(e) {
    e.preventDefault();
    setEmitting(true);
    setEmitResult(null);
    try {
      const res = await base44.functions.invoke('partnerApi', {
        action: 'emit',
        issuer_name: form.issuer_name,
        issuer_nif: form.issuer_nif,
        document_number: form.document_number,
        amount: parseFloat(form.amount),
        due_date: form.due_date,
        user_nif: form.user_nif,
        entity: form.entity,
        reference: form.reference
      });
      const data = res.data || res;
      setEmitResult(data);
      if (data.success !== false) {
        setForm({ issuer_name: '', issuer_nif: '', document_number: '', amount: '', due_date: '', user_nif: '', entity: '', reference: '' });
        load();
      }
    } catch (err) {
      setEmitResult({ success: false, error: err.message });
    } finally { setEmitting(false); }
  }

  async function generateApiKey() {
    if (!newKeyName.trim() || !newKeyNif.trim()) return;
    try {
      const key = 'gpa_' + Math.random().toString(36).substring(2, 18) + Math.random().toString(36).substring(2, 18);
      const res = await base44.functions.invoke('partnerApi', {
        action: 'create_key',
        partner_name: newKeyName,
        partner_nif: newKeyNif,
        raw_key: key
      });
      const data = res.data || res;
      if (data.success !== false) {
        setGeneratedKey(key);
        setNewKeyName('');
        setNewKeyNif('');
        load();
      }
    } catch (err) { console.error(err); }
  }

  async function revokeConsent(id) {
    if (!confirm('Revogar este consentimento?')) return;
    try {
      await base44.entities.PartnerConsent.update(id, {
        consent_status: 'revoked',
        revoked_date: new Date().toISOString()
      });
      await base44.entities.AuditLog.create({
        action: 'api_key_revoke',
        actor_id: user?.id,
        actor_name: user?.full_name || user?.email,
        actor_role: 'partner',
        target_entity: 'PartnerConsent',
        target_id: id,
        module: 'partner'
      });
      load();
    } catch (err) { console.error(err); }
  }

  const totalEmitido = invoices.reduce((s, i) => s + (i.amount || 0), 0);
  const paidCount = invoices.filter(i => i.status === 'paid').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-line border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Briefcase },
    { id: 'emit', label: 'Emitir fatura', icon: Receipt },
    { id: 'keys', label: 'API Keys', icon: Key },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-surface border-b border-line">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-ink">Portal de Parceiros</span>
          </div>
          <a href="/app" className="text-sm text-muted-foreground hover:text-ink">Voltar à app</a>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-xl mb-6 w-fit">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id ? 'bg-surface text-ink shadow-soft' : 'text-muted-foreground hover:text-ink'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {tab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-surface border border-line rounded-xl p-4">
                <p className="text-xs text-muted-2 uppercase tracking-wide">Faturas emitidas</p>
                <p className="text-2xl font-heading font-bold text-ink mt-1">{invoices.length}</p>
              </div>
              <div className="bg-surface border border-line rounded-xl p-4">
                <p className="text-xs text-muted-2 uppercase tracking-wide">Pagas</p>
                <p className="text-2xl font-heading font-bold text-ok mt-1">{paidCount}</p>
              </div>
              <div className="bg-surface border border-line rounded-xl p-4">
                <p className="text-xs text-muted-2 uppercase tracking-wide">Total emitido</p>
                <p className="text-xl font-heading font-bold text-ink mt-1 font-mono">{formatKz(totalEmitido)}</p>
              </div>
            </div>

            <div className="bg-surface border border-line rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-line">
                <h2 className="font-heading font-bold text-ink">Faturas recentes</h2>
              </div>
              {invoices.length === 0 ? (
                <p className="px-5 py-8 text-sm text-muted-2 text-center">Nenhuma fatura emitida.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted-2 border-b border-line">
                        <th className="px-5 py-2.5 font-medium">Documento</th>
                        <th className="px-5 py-2.5 font-medium">Destinatário (NIF)</th>
                        <th className="px-5 py-2.5 font-medium">Montante</th>
                        <th className="px-5 py-2.5 font-medium">Vencimento</th>
                        <th className="px-5 py-2.5 font-medium">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.slice(0, 15).map(inv => (
                        <tr key={inv.id} className="border-b border-line/50">
                          <td className="px-5 py-3 text-ink font-mono">{inv.document_number || '—'}</td>
                          <td className="px-5 py-3 text-muted-foreground font-mono">{inv.user_nif || '—'}</td>
                          <td className="px-5 py-3 text-ink font-mono">{formatKz(inv.amount)}</td>
                          <td className="px-5 py-3 text-muted-foreground">{formatDate(inv.due_date)}</td>
                          <td className="px-5 py-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              inv.status === 'paid' ? 'bg-green-soft text-ok' :
                              inv.status === 'overdue' ? 'bg-danger-soft text-destructive' :
                              'bg-muted text-muted-foreground'
                            }`}>{inv.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Emit */}
        {tab === 'emit' && (
          <div className="max-w-lg">
            <h2 className="font-heading text-lg font-bold text-ink mb-4">Emitir fatura</h2>
            {emitResult && (
              <div className={`mb-4 p-3 rounded-xl text-sm ${
                emitResult.success === false ? 'bg-danger-soft text-destructive' : 'bg-green-soft text-ok'
              }`}>
                {emitResult.success === false ? emitResult.error : 'Fatura emitida com sucesso.'}
              </div>
            )}
            <form onSubmit={handleEmit} className="space-y-3 bg-surface border border-line rounded-xl p-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-2 block mb-1">Nome do emissor</label>
                  <input value={form.issuer_name} onChange={e => setForm({...form, issuer_name: e.target.value})} required className="w-full px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:border-primary/40" />
                </div>
                <div>
                  <label className="text-xs text-muted-2 block mb-1">NIF do emissor</label>
                  <input value={form.issuer_nif} onChange={e => setForm({...form, issuer_nif: e.target.value})} required className="w-full px-3 py-2 rounded-lg border border-line text-sm font-mono focus:outline-none focus:border-primary/40" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-2 block mb-1">Nº do documento</label>
                  <input value={form.document_number} onChange={e => setForm({...form, document_number: e.target.value})} required className="w-full px-3 py-2 rounded-lg border border-line text-sm font-mono focus:outline-none focus:border-primary/40" />
                </div>
                <div>
                  <label className="text-xs text-muted-2 block mb-1">NIF do cliente</label>
                  <input value={form.user_nif} onChange={e => setForm({...form, user_nif: e.target.value})} required className="w-full px-3 py-2 rounded-lg border border-line text-sm font-mono focus:outline-none focus:border-primary/40" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-2 block mb-1">Montante (Kz)</label>
                  <input type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required className="w-full px-3 py-2 rounded-lg border border-line text-sm font-mono focus:outline-none focus:border-primary/40" />
                </div>
                <div>
                  <label className="text-xs text-muted-2 block mb-1">Vencimento</label>
                  <input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} required className="w-full px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:border-primary/40" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-2 block mb-1">Entidade MCX (opcional)</label>
                  <input value={form.entity} onChange={e => setForm({...form, entity: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-line text-sm font-mono focus:outline-none focus:border-primary/40" />
                </div>
                <div>
                  <label className="text-xs text-muted-2 block mb-1">Referência MCX (opcional)</label>
                  <input value={form.reference} onChange={e => setForm({...form, reference: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-line text-sm font-mono focus:outline-none focus:border-primary/40" />
                </div>
              </div>
              <button type="submit" disabled={emitting} className="w-full px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-40 hover:bg-primary-2 transition-colors">
                {emitting ? 'A emitir...' : 'Emitir fatura'}
              </button>
            </form>
          </div>
        )}

        {/* API Keys */}
        {tab === 'keys' && (
          <div className="space-y-6 max-w-lg">
            <div className="bg-surface border border-line rounded-xl p-5">
              <h2 className="font-heading font-bold text-ink mb-3">Gerar nova API Key</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-2 block mb-1">Nome da empresa</label>
                  <input value={newKeyName} onChange={e => setNewKeyName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:border-primary/40" />
                </div>
                <div>
                  <label className="text-xs text-muted-2 block mb-1">NIF da empresa</label>
                  <input value={newKeyNif} onChange={e => setNewKeyNif(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-line text-sm font-mono focus:outline-none focus:border-primary/40" />
                </div>
                <button onClick={generateApiKey} disabled={!newKeyName.trim() || !newKeyNif.trim()} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-40 hover:bg-primary-2 transition-colors">
                  <Plus className="w-4 h-4" /> Gerar chave
                </button>
              </div>
              {generatedKey && (
                <div className="mt-4 p-3 rounded-lg bg-gold-soft border border-gold/30">
                  <p className="text-xs text-gold font-medium mb-1">Guarda esta chave — não voltará a ser mostrada:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs font-mono text-ink break-all">{generatedKey}</code>
                    <button onClick={() => { navigator.clipboard.writeText(generatedKey); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="p-1.5 rounded text-gold hover:bg-gold/10">
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-surface border border-line rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-line">
                <h2 className="font-heading font-bold text-ink">Chaves e consentimentos</h2>
              </div>
              {consents.length === 0 ? (
                <p className="px-5 py-8 text-sm text-muted-2 text-center">Nenhuma chave registada.</p>
              ) : consents.map(c => (
                <div key={c.id} className="px-5 py-3 border-b border-line/50 last:border-0 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-ink font-medium">{c.partner_name}</p>
                    <p className="text-xs text-muted-2 font-mono">NIF: {c.partner_nif} · {c.api_key_preview || '••••'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      c.consent_status === 'active' ? 'bg-green-soft text-ok' : 'bg-muted text-muted-2'
                    }`}>{c.consent_status === 'active' ? 'ativo' : 'revogado'}</span>
                    {c.consent_status === 'active' && (
                      <button onClick={() => revokeConsent(c.id)} className="p-1.5 rounded text-destructive hover:bg-danger-soft">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}