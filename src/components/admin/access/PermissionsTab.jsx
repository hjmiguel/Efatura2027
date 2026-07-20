import React, { useState } from 'react';
import { Check, Lock, Save } from 'lucide-react';

const PERMISSIONS = [
  { id: 'view_metrics', label: 'Ver métricas do painel', roles: { admin: true, operador: true, suporte: true, auditor: false } },
  { id: 'approve_companies', label: 'Aprovar e rejeitar empresas', roles: { admin: true, operador: true, suporte: false, auditor: false } },
  { id: 'suspend_user', label: 'Suspender utilizador final', roles: { admin: true, operador: true, suporte: false, auditor: false } },
  { id: 'view_financial_detail', label: 'Ver detalhe financeiro', roles: { admin: true, operador: false, suporte: false, auditor: false } },
  { id: 'manage_plans', label: 'Gerir planos e preços', roles: { admin: true, operador: false, suporte: false, auditor: false } },
  { id: 'export_audit', label: 'Exportar registo de auditoria', roles: { admin: true, operador: false, suporte: false, auditor: true } },
];

const ROLE_LABELS = [
  { id: 'admin', label: 'Administrador' },
  { id: 'operador', label: 'Operador' },
  { id: 'suporte', label: 'Suporte' },
  { id: 'auditor', label: 'Auditor' },
];

const LOCKED_ROLES = ['admin'];

export default function PermissionsTab() {
  const [perms, setPerms] = useState(PERMISSIONS);
  const [saved, setSaved] = useState(false);

  const toggle = (permId, roleId) => {
    if (LOCKED_ROLES.includes(roleId)) return;
    setPerms((prev) => prev.map((p) => p.id === permId ? { ...p, roles: { ...p.roles, [roleId]: !p.roles[roleId] } } : p));
  };

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-semibold text-[15px] text-ink">Permissões por papel, equipa interna</h2>
          <p className="text-[12px] text-muted-foreground mt-0.5">Toca para ativar ou desativar. As permissões a cinzento estão bloqueadas por política.</p>
        </div>
        <button onClick={save} className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-lg text-[13px] font-medium hover:bg-primary-2 transition-colors">
          <Save className="w-3.5 h-3.5" /> {saved ? 'Guardado!' : 'Guardar alterações'}
        </button>
      </div>

      <div className="bg-surface border border-line rounded-talao overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="px-5 py-3 text-left text-[11px] font-medium text-muted-2">PERMISSÃO</th>
                {ROLE_LABELS.map((r) => (
                  <th key={r.id} className="px-3 py-3 text-center text-[11px] font-medium text-muted-2">{r.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {perms.map((p) => (
                <tr key={p.id} className="border-b border-line/50 last:border-0">
                  <td className="px-5 py-3.5 text-[13px] font-medium text-ink">{p.label}</td>
                  {ROLE_LABELS.map((r) => {
                    const locked = LOCKED_ROLES.includes(r.id);
                    const checked = p.roles[r.id];
                    return (
                      <td key={r.id} className="px-3 py-3.5 text-center">
                        <button onClick={() => toggle(p.id, r.id)} disabled={locked} className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-colors ${locked ? 'bg-muted cursor-not-allowed' : checked ? 'bg-primary text-white' : 'bg-muted/50 text-transparent hover:bg-muted'}`}>
                          {checked && (locked ? <Lock className="w-3.5 h-3.5" /> : <Check className="w-4 h-4" />)}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}