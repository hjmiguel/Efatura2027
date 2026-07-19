import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, Shield, ScrollText, UserPlus, X, Loader2, CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/lib/format';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [reason, setReason] = useState('');
  const [showDetail, setShowDetail] = useState(false);

  // Invite state
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState(null);

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
    } finally {
      setInviting(false);
    }
  }

  function closeInvite() {
    setShowInvite(false);
    setInviteEmail('');
    setInviteRole('user');
    setInviteResult(null);
  }

  async function viewDetail(user) {
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
        module: 'admin'
      });
      setShowDetail(false);
      setReason('');
      load();
    } catch (err) { console.error(err); }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center">
          <Users className="w-5 h-5 text-gold" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Utilizadores</h1>
          <p className="text-sm text-slate-500">Consulta de detalhe requer motivo</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold text-ink text-sm font-medium hover:bg-gold/90 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Convidar utilizador
        </button>
      </div>

      <div className="bg-[hsl(163_30%_13%)] border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-800">
                <th className="px-5 py-2.5 font-medium">Nome</th>
                <th className="px-5 py-2.5 font-medium">Email</th>
                <th className="px-5 py-2.5 font-medium">Papel</th>
                <th className="px-5 py-2.5 font-medium">NIF</th>
                <th className="px-5 py-2.5 font-medium">Registado</th>
                <th className="px-5 py-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="px-5 py-3 text-white">{u.full_name || '—'}</td>
                  <td className="px-5 py-3 text-slate-400">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      u.role === 'admin' ? 'bg-gold/15 text-gold' : 'bg-slate-700 text-slate-300'
                    }`}>{u.role || 'user'}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-400 font-mono">{u.nif || '—'}</td>
                  <td className="px-5 py-3 text-slate-500">{formatDate(u.created_date)}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => viewDetail(u)} className="text-gold hover:underline text-xs">
                      Ver detalhe
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showInvite && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={closeInvite}>
          <div className="bg-[hsl(163_30%_13%)] border border-slate-800 rounded-xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-gold" />
                <h3 className="font-heading font-bold text-white">Convidar utilizador</h3>
              </div>
              <button onClick={closeInvite} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              O convite é enviado por email com um link para definir palavra-passe.
            </p>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 block">Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="nome@exemplo.ao"
                  autoFocus
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-gold/40"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 block">Papel</label>
                <div className="flex gap-2">
                  {['user', 'admin'].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setInviteRole(r)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        inviteRole === r
                          ? 'bg-gold text-ink'
                          : 'bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {r === 'user' ? 'Utilizador' : 'Admin'}
                    </button>
                  ))}
                </div>
              </div>
              {inviteResult && (
                <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                  inviteResult.ok ? 'bg-green-950/40 text-green-300' : 'bg-red-950/40 text-red-300'
                }`}>
                  {inviteResult.ok && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />}
                  <span>{inviteResult.message}</span>
                </div>
              )}
              <div className="flex gap-2">
                <button type="button" onClick={closeInvite} className="flex-1 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 text-sm hover:bg-slate-800">
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={inviting || !inviteEmail.trim()}
                  className="flex-1 px-4 py-2 rounded-lg bg-gold text-ink text-sm font-medium disabled:opacity-40 inline-flex items-center justify-center gap-2"
                >
                  {inviting ? (<><Loader2 className="w-4 h-4 animate-spin" /> A enviar...</>) : 'Enviar convite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetail && selectedUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowDetail(false)}>
          <div className="bg-[hsl(163_30%_13%)] border border-slate-800 rounded-xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-gold" />
              <h3 className="font-heading font-bold text-white">Consulta de detalhe financeiro</h3>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Vais aceder ao detalhe financeiro de <span className="text-white font-medium">{selectedUser.full_name || selectedUser.email}</span>.
              Esta ação fica registada na trilha de auditoria.
            </p>
            <label className="text-xs text-slate-500 block mb-1.5">Motivo (obrigatório)</label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              placeholder="Ex: Auditoria de rotina, a pedido do utilizador..."
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-gold/40"
            />
            <div className="flex gap-2 mt-4">
              <button onClick={() => { setShowDetail(false); setReason(''); }} className="flex-1 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 text-sm hover:bg-slate-800">
                Cancelar
              </button>
              <button onClick={confirmViewDetail} disabled={!reason.trim()} className="flex-1 px-4 py-2 rounded-lg bg-gold text-ink text-sm font-medium disabled:opacity-40">
                Confirmar e registar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}