import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ScrollText } from 'lucide-react';
import { formatDate } from '@/lib/format';

const actionLabels = {
  login: 'Início de sessão',
  view_user_detail: 'Consulta de detalhe financeiro',
  update_user: 'Atualização de utilizador',
  delete_user: 'Eliminação de utilizador',
  create_invoice: 'Criação de fatura',
  update_invoice: 'Atualização de fatura',
  revoke_consent: 'Revogação de consentimento',
  api_key_create: 'Criação de API Key',
  api_key_revoke: 'Revogação de API Key',
  approval_grant: 'Aprovação concedida',
  approval_reject: 'Aprovação rejeitada',
  export_data: 'Exportação de dados',
  settings_change: 'Alteração de configurações',
};

export default function AdminAudit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const data = await base44.entities.AuditLog.list('-created_date', 100);
      setLogs(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
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
          <ScrollText className="w-5 h-5 text-gold" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Trilha de auditoria</h1>
          <p className="text-sm text-slate-500">Registo imutável de todas as ações</p>
        </div>
      </div>

      <div className="bg-[hsl(163_30%_13%)] border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-800">
                <th className="px-5 py-2.5 font-medium">Data</th>
                <th className="px-5 py-2.5 font-medium">Ação</th>
                <th className="px-5 py-2.5 font-medium">Ator</th>
                <th className="px-5 py-2.5 font-medium">Papel</th>
                <th className="px-5 py-2.5 font-medium">Módulo</th>
                <th className="px-5 py-2.5 font-medium">Motivo</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-slate-500 text-center">Sem registos.</td></tr>
              ) : logs.map(log => (
                <tr key={log.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="px-5 py-3 text-slate-400">{formatDate(log.created_date)}</td>
                  <td className="px-5 py-3 text-white">{actionLabels[log.action] || log.action}</td>
                  <td className="px-5 py-3 text-slate-300">{log.actor_name}</td>
                  <td className="px-5 py-3 text-slate-400">{log.actor_role}</td>
                  <td className="px-5 py-3 text-slate-400">{log.module}</td>
                  <td className="px-5 py-3 text-gold text-xs">{log.reason || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}