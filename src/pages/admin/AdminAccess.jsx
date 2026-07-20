import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import PermissionsTab from '@/components/admin/access/PermissionsTab';
import InternalTeamTab from '@/components/admin/access/InternalTeamTab';
import CorporateSupervisionTab from '@/components/admin/access/CorporateSupervisionTab';
import EndUsersTab from '@/components/admin/access/EndUsersTab';
import AuditTab from '@/components/admin/access/AuditTab';

const tabs = [
  { id: 'papeis', label: 'Papéis e permissões' },
  { id: 'equipa', label: 'Equipa interna' },
  { id: 'empresas', label: 'Supervisão de empresas' },
  { id: 'finais', label: 'Utilizadores finais' },
  { id: 'auditoria', label: 'Auditoria' },
];

export default function AdminAccess() {
  const [tab, setTab] = useState('papeis');
  const [users, setUsers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [u, s] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.Supplier.list(),
      ]);
      setUsers(u);
      setSuppliers(s);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-line border-t-primary rounded-full animate-spin"></div></div>;
  }

  const endUsers = users.filter((u) => u.role !== 'admin');
  const internalUsers = users.filter((u) => u.role === 'admin');

  return (
    <div className="space-y-5">
      <div>
        <span className="eyebrow">§ 04 · Acessos e papéis</span>
        <h1 className="font-heading text-xl font-bold text-ink mt-1">Acessos e papéis</h1>
        <p className="text-[12px] text-muted-foreground mt-0.5 max-w-2xl">O sistema tem três populações de utilizadores que nunca se misturam. Cada uma é gerida de forma diferente. Tudo o que um administrador faz fica registado na auditoria.</p>
      </div>

      {/* Population cards */}
      <div className="grid md:grid-cols-3 gap-3">
        <div className="bg-surface border border-line rounded-talao p-4 shadow-soft">
          <p className="font-mono text-[22px] font-bold text-ink">{endUsers.length.toLocaleString('pt-PT')}</p>
          <p className="text-[13px] font-semibold text-ink mt-1">Utilizadores finais</p>
          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">Pessoas que usam a app. Geridos em massa, nunca editados ao detalhe.</p>
          <span className="inline-block mt-2 text-[10px] font-medium text-muted-2 bg-muted px-2 py-0.5 rounded-full">Gestão em massa</span>
        </div>
        <div className="bg-surface border border-line rounded-talao p-4 shadow-soft">
          <p className="font-mono text-[22px] font-bold text-ink">{suppliers.length}</p>
          <p className="text-[13px] font-semibold text-ink mt-1">Utilizadores de empresa</p>
          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">Nas empresas do módulo corporativo. Cada empresa gere os seus.</p>
          <span className="inline-block mt-2 text-[10px] font-medium text-ok bg-green-soft px-2 py-0.5 rounded-full">Autonomia da empresa</span>
        </div>
        <div className="bg-surface border border-line rounded-talao p-4 shadow-soft">
          <p className="font-mono text-[22px] font-bold text-ink">{internalUsers.length}</p>
          <p className="text-[13px] font-semibold text-ink mt-1">Equipa interna</p>
          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">Quem opera o backoffice. Poucos, muito poder. O risco é maior aqui.</p>
          <span className="inline-block mt-2 text-[10px] font-medium text-brandblue bg-[#e7eef9] px-2 py-0.5 rounded-full">Controlo apertado</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface border border-line rounded-xl p-1 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-3 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors ${tab === t.id ? 'bg-ink text-white' : 'text-muted-foreground hover:text-ink hover:bg-muted'}`}>{t.label}</button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'papeis' && <PermissionsTab />}
      {tab === 'equipa' && <InternalTeamTab users={internalUsers} />}
      {tab === 'empresas' && <CorporateSupervisionTab suppliers={suppliers} />}
      {tab === 'finais' && <EndUsersTab users={endUsers} />}
      {tab === 'auditoria' && <AuditTab />}
    </div>
  );
}