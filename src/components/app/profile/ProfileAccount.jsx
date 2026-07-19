import React, { useState } from 'react';
import { User, Mail, Phone, Hash, Save, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ProfileAccount({ user, onUserChange }) {
  const [full_name, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [nif, setNif] = useState(user?.nif || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await base44.auth.updateMe({ full_name, phone, nif });
      onUserChange({ ...user, full_name, phone, nif });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Erro ao guardar:', err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Avatar + email (read-only) */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shrink-0">
          <User className="w-7 h-7 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-2">Email</p>
          <p className="text-sm font-medium text-ink flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 shrink-0 text-muted-2" />
            <span className="truncate">{user?.email}</span>
          </p>
          {user?.role && (
            <span className="inline-block mt-1 text-[10px] font-medium uppercase tracking-wide text-primary bg-green-soft px-2 py-0.5 rounded">
              {user.role}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-2 mb-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> Nome completo
          </label>
          <input
            type="text"
            value={full_name}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:border-primary/40"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-2 mb-1.5 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5" /> Telemóvel
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+244 9XX XXX XXX"
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm font-mono focus:outline-none focus:border-primary/40"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-2 mb-1.5 flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5" /> NIF
          </label>
          <input
            type="text"
            value={nif}
            onChange={(e) => setNif(e.target.value)}
            placeholder="000000000"
            maxLength={14}
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm font-mono focus:outline-none focus:border-primary/40"
          />
          <p className="text-xs text-muted-2 mt-1.5">
            O teu NIF é usado para validar faturas dedutíveis no IRPS. Sem NIF, as tuas faturas não contam para dedução.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-2 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Save className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? 'A guardar...' : saved ? 'Guardado!' : 'Guardar alterações'}
        </button>
      </div>
    </div>
  );
}