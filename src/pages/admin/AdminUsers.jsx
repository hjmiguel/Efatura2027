import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { UserPlus, X, Loader2, CheckCircle2, Shield, Users, Search } from 'lucide-react';
import { formatDate } from '@/lib/format';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [reason, setReason] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const data = await base44.entities.User.list();
      setUsers(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function handleInvite(e) {
    e?.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setInviteResult(null);
    try {
      await base44.users.inviteUser(inviteEmail.trim(), inviteRole);
      setInviteResult({ ok: true, message: `Convite enviado para ${inviteEmail.trim()}` });
      setInviteEmail('');
      load();
    } catch (err) {
      setInviteResult({ ok: false, message: err.message || 'Erro ao enviar convite.' });
    } finally { setInviting(false); }
  }

  function closeInvite() {
    setShowInvite(false);
    setInviteEmail('');
    setInviteRole('user');
    setInviteResult(null);
  }

  function viewDetail(user) {
    setSelectedUser(user);
    setShowDetail(true);
  }

  async function confirmViewDetail() {
    if (!reason.trim() || !selectedUser) return;
    try {
      await base44.entities.AuditLog.create({
        action: 'view_user_detail',
        actor_id: selectedUser.id,
        actor_name: selectedUser.full_name || selectedUser.email,
        actor_role: 'admin',
        target_entity: 'User',
        target_id: selectedUser.id,
        reason: reason.trim(),
        module: 'admin',
      });
      setShowDetail(false);
      setReason('');
      load();
    } catch (err) { console.error(err); }
  }

  const filtered = users.filter((u) =>
    !search ||
    (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.nif || '').includes(search)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-line border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <span className="eyebrow">§ 04 · Acessos e papéis</span>
          <h1 className="font-heading text-xl font-bold text-ink mt-1">Utilizadores finais</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">Consulta de detalhe requer motivo e fica registada</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary text-white rounded-xl text-[13px] font-medium hover:bg-primary-2 transition-colors"
        >
          <UserPlus className="w-4 h-4" /> Convidar
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-muted-2 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Procurar por nome, email ou NIF..."
          className="w-full pl-9 pr-4 py-2.5 bg-surface border border-line rounded-xl text-sm focus:outline-none focus:border-primary/40"
        />
      </div>

      {/* Users table */}
      <div className="bg-surface border border-line rounded-talao overflow-hidden shadow-soft">
        {filtered.length === 0 ? (
          <p className="px-5 py-10 text-sm text-muted-2 text-center">Nenhum utilizador encontrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-2 border-b border-line">
                  <th className="px-5 py-2.5 font-medium text-[11px]">Utilizador</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]">NIF</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]">Papel</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]">Registo</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-line/50 last:border-0 hover:bg-[#f8fbf9]">
                    <td className="px-5 py-3">
                      <div className="text-ink font-medium">{u.full_name || '—'}</div>
                      <div className="text-[11px] text-muted-2">{u.email}</div>
                    </td>
                    <td className="px-5 py-3 font-mono text-[12px] text-muted-foreground">{u.nif || '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`${u.role === 'admin' ? 'pill-part' : 'bg-muted text-muted-foreground'} text-[10.5px] font-bold px-2.5 py-0.5 rounded-full`}>
                        {u.role === 'admin' ? 'Admin' : 'Utilizador'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground text-[12px]">{formatDate(u.created_date)}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => viewDetail(u)} className="text-[12px] font-semibold text-primary hover:underline">
                        Ver detalhe
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-start gap-2.5 bg-gold-soft border border-[#e6cfa0] rounded-talao p-4">
        <Shield className="w-4 h-4 text-[#9a6a16] shrink-0 mt-0.5" />
        <p className="text-[12px] text-[#8a6420] leading-relaxed">
          Ver o detalhe financeiro de um utilizador exige indicar um motivo e fica registado na auditoria com o nome de quem viu. Suspender é gerível; ler os dados não é um ato livre.
        </p>
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeInvite}>
          <div className="bg-surface border border-line rounded-talao p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                <h3 className="font-heading font-bold text-ink">Convidar utilizador</h3>
              </div>
              <button onClick={closeInvite} className="text-muted-2 hover:text-ink"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-[13px] text-muted-foreground mb-4">O convite é enviado por email com um link para definir palavra-passe.</p>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="text-[11px] text-muted-2 block mb-1">Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="nome@exemplo.ao"
                  autoFocus
                  className="w-full px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:border-primary/40"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-2 block mb-1">Papel</label>
                <div className="flex gap-2">
                  {['user', 'admin'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setInviteRole(r)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        inviteRole === r ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/70'
                      }`}
                    >
                      {r === 'user' ? 'Utilizador' : 'Admin'}
                    </button>
                  ))}
                </div>
              </div>
              {inviteResult && (
                <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${inviteResult.ok ? 'bg-green-soft text-ok' : 'bg-danger-soft text-destructive'}`}>
                  {inviteResult.ok && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />}
                  <span>{inviteResult.message}</span>
                </div>
              )}
              <div className="flex gap-2">
                <button type="button" onClick={closeInvite} className="flex-1 px-4 py-2 rounded-lg border border-line text-muted-foreground text-sm hover:bg-muted">
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={inviting || !inviteEmail.trim()}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-40 inline-flex items-center justify-center gap-2"
                >
                  {inviting ? (<><Loader2 className="w-4 h-4 animate-spin" /> A enviar...</>) : 'Enviar convite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail reason modal */}
      {showDetail && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDetail(false)}>
          <div className="bg-surface border border-line rounded-talao p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-[#9a6a16]" />
              <h3 className="font-heading font-bold text-ink">Consulta de detalhe financeiro</h3>
            </div>
            <p className="text-[13px] text-muted-foreground mb-4">
              Vais aceder ao detalhe financeiro de <span className="text-ink font-medium">{selectedUser.full_name || selectedUser.email}</span>. Esta ação fica registada na trilha de auditoria.
            </p>
            <label className="text-[11px] text-muted-2 block mb-1.5">Motivo (obrigatório)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Ex: Auditoria de rotina, a pedido do utilizador..."
              className="w-full px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:border-primary/40"
            />
            <div className="flex gap-2 mt-4">
              <button onClick={() => { setShowDetail(false); setReason(''); }} className="flex-1 px-4 py-2 rounded-lg border border-line text-muted-foreground text-sm hover:bg-muted">
                Cancelar
              </button>
              <button onClick={confirmViewDetail} disabled={!reason.trim()} className="flex-1 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-40">
                Confirmar e registar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}