import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { User, Mail, Hash, LogOut, Save, Shield } from 'lucide-react';

export default function Perfil() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [nif, setNif] = useState('');

  useEffect(() => { loadUser(); }, []);

  async function loadUser() {
    try {
      const me = await base44.auth.me();
      setUser(me);
      setNif(me.nif || '');
    } catch (err) { console.error('Erro:', err); }
    finally { setLoading(false); }
  }

  async function handleSaveNif() {
    setSaving(true);
    try {
      await base44.auth.updateMe({ nif });
      setUser({ ...user, nif });
    } catch (err) { console.error('Erro:', err); }
    finally { setSaving(false); }
  }

  async function handleLogout() {
    await base44.auth.logout('/entrar');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-line border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-ink">Perfil</h1>

      {/* User card */}
      <div className="bg-surface rounded-talao border border-line p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shrink-0">
            <User className="w-7 h-7 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-heading text-lg font-bold text-ink truncate">{user?.full_name || 'Utilizador'}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{user?.email}</span></p>
            {user?.role && <span className="inline-block mt-1 text-[10px] font-medium uppercase tracking-wide text-primary bg-green-soft px-2 py-0.5 rounded">{user.role}</span>}
          </div>
        </div>
      </div>

      {/* NIF section */}
      <div className="bg-surface rounded-talao border border-line p-5">
        <div className="flex items-center gap-2 mb-4">
          <Hash className="w-5 h-5 text-primary" />
          <h2 className="font-heading font-bold text-ink">NIF</h2>
        </div>
        <p className="text-xs text-muted-2 mb-3">O teu NIF é usado para validar faturas dedutíveis no IRPS.</p>
        <div className="flex gap-2">
          <input type="text" value={nif} onChange={(e) => setNif(e.target.value)} placeholder="000000000" maxLength={14}
            className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm font-mono" />
          <button onClick={handleSaveNif} disabled={saving}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-2 text-white font-semibold px-4 rounded-lg text-sm transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? '...' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Privacy info */}
      <div className="bg-surface rounded-talao border border-line p-5">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="font-heading font-bold text-ink">Privacidade e segurança</h2>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• Os teus dados são protegidos ao abrigo da Lei 22/11 (Proteção de Dados).</p>
          <p>• O acesso à AGT é controlado por ti e pode ser revogado a qualquer momento.</p>
          <p>• A Gestão+ não intermedeia pagamentos — todo o pagamento é feito diretamente ao fornecedor.</p>
        </div>
      </div>

      {/* Logout */}
      <button onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 bg-surface border border-line hover:border-destructive/30 text-destructive font-semibold py-3 rounded-talao text-sm transition-colors">
        <LogOut className="w-4 h-4" /> Sair da conta
      </button>
    </div>
  );
}