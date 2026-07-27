import React, { useState, useEffect } from 'react';
import { appApi } from '@/api/appClient';
import { Search, Store, X } from 'lucide-react';
import { formatDate } from '@/lib/format';

export default function AdminCompanies() {
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const data = await appApi.entities.PartnerConsent.list('-created_date');
      setConsents(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function revoke(consent) {
    try {
      await appApi.entities.PartnerConsent.update(consent.id, { consent_status: 'revoked', revoked_date: new Date().toISOString() });
      await appApi.entities.AuditLog.create({
        action: 'revoke_consent',
        actor_id: 'admin',
        actor_name: 'Admin',
        actor_role: 'admin',
        target_entity: 'PartnerConsent',
        target_id: consent.id,
        reason: `Revogação do consentimento de ${consent.partner_name}`,
        module: 'admin',
      });
      setSelected(null);
      load();
    } catch (err) { console.error(err); }
  }

  const filtered = consents
    .filter((c) => filter === 'all' || c.consent_status === filter)
    .filter((c) => !search || (c.partner_name || '').toLowerCase().includes(search.toLowerCase()) || (c.partner_nif || '').includes(search));

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-line border-t-primary rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-5">
      <div>
        <span className="eyebrow">§ 02 · Empresas</span>
        <h1 className="font-heading text-xl font-bold text-ink mt-1">Empresas parceiras</h1>
        <p className="text-[12px] text-muted-foreground mt-0.5">Aprovação, validação e gestão de consentimentos</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface border border-line rounded-talao p-4 shadow-soft">
          <p className="font-mono text-[20px] font-bold text-ink">{consents.filter((c) => c.consent_status === 'active').length}</p>
          <p className="text-[11px] text-muted-2 mt-0.5">Ativas</p>
        </div>
        <div className="bg-surface border border-line rounded-talao p-4 shadow-soft">
          <p className="font-mono text-[20px] font-bold text-ink">{consents.filter((c) => c.consent_status === 'revoked').length}</p>
          <p className="text-[11px] text-muted-2 mt-0.5">Revogadas</p>
        </div>
        <div className="bg-surface border border-line rounded-talao p-4 shadow-soft">
          <p className="font-mono text-[20px] font-bold text-ink">{consents.length}</p>
          <p className="text-[11px] text-muted-2 mt-0.5">Total</p>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-2 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Procurar por nome ou NIF..." className="w-full pl-9 pr-4 py-2.5 bg-surface border border-line rounded-xl text-sm focus:outline-none focus:border-primary/40" />
        </div>
        <div className="flex gap-1 bg-surface border border-line rounded-xl p-1">
          {[{ id: 'all', label: 'Todas' }, { id: 'active', label: 'Ativas' }, { id: 'revoked', label: 'Revogadas' }].map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)} className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${filter === f.id ? 'bg-primary text-white' : 'text-muted-foreground hover:text-ink'}`}>{f.label}</button>
          ))}
        </div>
      </div>

      <div className="bg-surface border border-line rounded-talao overflow-hidden shadow-soft">
        {filtered.length === 0 ? (
          <p className="px-5 py-10 text-sm text-muted-2 text-center">Nenhuma empresa encontrada.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-2 border-b border-line">
                  <th className="px-5 py-2.5 font-medium text-[11px]">Empresa</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]">NIF</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]">Scopes</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]">Estado</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]">Consentimento</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-line/50 last:border-0 hover:bg-[#f8fbf9]">
                    <td className="px-5 py-3 text-ink font-medium">{c.partner_name}</td>
                    <td className="px-5 py-3 font-mono text-[12px] text-muted-foreground">{c.partner_nif}</td>
                    <td className="px-5 py-3 text-[12px] text-muted-foreground">{c.scopes?.join(', ')}</td>
                    <td className="px-5 py-3">
                      <span className={`${c.consent_status === 'active' ? 'pill-paid' : 'pill-late'} text-[10.5px] font-bold px-2.5 py-0.5 rounded-full`}>{c.consent_status === 'active' ? 'Ativa' : 'Revogada'}</span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground text-[12px]">{formatDate(c.consent_date)}</td>
                    <td className="px-5 py-3"><button onClick={() => setSelected(c)} className="text-[12px] font-semibold text-primary hover:underline">Ver</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-surface border border-line rounded-talao p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-primary" />
                <h3 className="font-heading font-bold text-ink">{selected.partner_name}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="text-muted-2 hover:text-ink"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">NIF</span><span className="font-mono text-ink">{selected.partner_nif}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">API Key</span><span className="font-mono text-ink">{selected.api_key_preview || '—'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Scopes</span><span className="text-ink">{selected.scopes?.join(', ')}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Estado</span><span className={selected.consent_status === 'active' ? 'text-ok' : 'text-destructive'}>{selected.consent_status === 'active' ? 'Ativa' : 'Revogada'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Consentimento</span><span className="text-ink">{formatDate(selected.consent_date)}</span></div>
              {selected.revoked_date && <div className="flex justify-between"><span className="text-muted-foreground">Revogada</span><span className="text-ink">{formatDate(selected.revoked_date)}</span></div>}
            </div>
            {selected.consent_status === 'active' && (
              <button onClick={() => revoke(selected)} className="w-full mt-5 px-4 py-2.5 bg-danger-soft text-destructive rounded-lg text-sm font-semibold hover:bg-destructive/10 transition-colors">Revogar consentimento</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}