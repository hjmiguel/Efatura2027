import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { UserPlus, X, Loader2, CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/lib/format';

export default function InternalTeamTab({ users }) {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [result, setResult] = useState(null);

  async function handleInvite(e) {
    e?.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setResult(null);
    try {
      await base44.users.inviteUser(inviteEmail.trim(), 'admin');
      setResult({ ok: true, message: `Convite enviado para ${inviteEmail.trim()}` });
      setInviteEmail('');
    } catch (err) {
      setResult({ ok: false, message: err.message || 'Erro ao enviar convite.' });
    } finally { setInviting(false); }
  }

  function closeInvite() {
    setShowInvite(false);
    setInviteEmail('');
    setResult(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-semibold text-[15px] text-ink">Equipa interna ({users.length})</h2>
        <button onClick={() => setShowInvite(true)} className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-xl text-[13px] font-medium hover:bg-primary-2 transition-colors">
          <UserPlus className="w-4 h-4" /> Convidar
        </button>
      </div>

      <div className="bg-surface border border-line rounded-talao overflow-hidden shadow-soft">
        {users.length === 0 ? (
          <p className="px-5 py-10 text-sm text-muted-2 text-center">Sem membros na equipa interna.</p>
        ) : (
          <div className="ed-list px-5">
            {users.map((u) => (
              <div key={u.id} className="it">
                <div className="w-9 h-9 rounded-full bg-gold-soft text-[#9a6a16] flex items-center justify-center font-bold text-[12px] shrink-0">
                  {(u.full_name || 'A').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="nm">{u.full_name || '—'}</div>
                  <div className="sb">{u.email}</div>
                </div>
                <span className="pill-part text-[10.5px] font-bold px-2.5 py-0.5 rounded-full">Admin</span>
                <span className="vl text-[11px] font-normal text-muted-2">{formatDate(u.created_date)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showInvite && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeInvite}>
          <div className="bg-surface border border-line rounded-talao p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                <h3 className="font-heading font-bold text-ink">Convidar administrador</h3>
              </div>
              <button onClick={closeInvite} className="text-muted-2 hover:text-ink"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-[13px] text-muted-foreground mb-4">O convite é enviado por email com um link para definir palavra-passe.</p>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="text-[11px] text-muted-2 block mb-1">Email</label>
                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="nome@exemplo.ao" autoFocus className="w-full px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:border-primary/40" required />
              </div>
              {result && (
                <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${result.ok ? 'bg-green-soft text-ok' : 'bg-danger-soft text-destructive'}`}>
                  {result.ok && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />}
                  <span>{result.message}</span>
                </div>
              )}
              <div className="flex gap-2">
                <button type="button" onClick={closeInvite} className="flex-1 px-4 py-2 rounded-lg border border-line text-muted-foreground text-sm hover:bg-muted">Fechar</button>
                <button type="submit" disabled={inviting || !inviteEmail.trim()} className="flex-1 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-40 inline-flex items-center justify-center gap-2">
                  {inviting ? (<><Loader2 className="w-4 h-4 animate-spin" /> A enviar...</>) : 'Enviar convite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}