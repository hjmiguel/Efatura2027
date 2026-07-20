import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, Shield } from 'lucide-react';
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

export default function AuditTab() {
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

  const exportCsv = () => {
    const rows = [['Data', 'Ator', 'Ação', 'Papel', 'Módulo', 'Motivo']];
    logs.forEach((l) => {
      rows.push([formatDate(l.created_date), l.actor_name || '', actionLabels[l.action] || l.action, l.actor_role || '', l.module || '', l.reason || '']);
    });
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-10"><div className="w-8 h-8 border-4 border-line border-t-primary rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-semibold text-[15px] text-ink">Registo de auditoria</h2>
        <button onClick={exportCsv} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-line rounded-lg text-[12px] font-medium text-ink hover:bg-muted transition-colors">
          <Download className="w-3.5 h-3.5" /> Exportar
        </button>
      </div>

      <div className="bg-surface border border-line rounded-talao overflow-hidden shadow-soft">
        {logs.length === 0 ? (
          <p className="px-5 py-10 text-sm text-muted-2 text-center">Sem registos.</p>
        ) : (
          <div className="ed-list px-5">
            {logs.map((log) => (
              <div key={log.id} className="it">
                <div className="flex-1">
                  <div className="nm">{log.actor_name || 'Sistema'}</div>
                  <div className="sb">
                    {actionLabels[log.action] || log.action.replace(/_/g, ' ')} · {log.module}
                    {log.target_id && ` · ${log.target_entity}`}
                    {log.reason && <span className="text-[#9a6a16]"> · motivo: {log.reason}</span>}
                  </div>
                </div>
                <span className="vl text-[11px] font-normal text-muted-2">{formatDate(log.created_date)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-start gap-2.5 bg-[#e7eef9] border border-[#c3d5ee] rounded-talao p-4">
        <Shield className="w-4 h-4 text-brandblue shrink-0 mt-0.5" />
        <p className="text-[12px] text-brandblue leading-relaxed">
          O registo é imutável e não se desliga, nem pelo administrador. Os acessos a dados de utilizadores aparecem assinalados.
        </p>
      </div>
    </div>
  );
}