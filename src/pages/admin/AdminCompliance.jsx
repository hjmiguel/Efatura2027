import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, Check, Clock, FileText, Trash2, Pencil } from 'lucide-react';
import { formatDate } from '@/lib/format';

const typeLabels = {
  export: 'Exportação de dados',
  delete: 'Eliminação de conta',
  rectification: 'Retificação',
};

const typeIcons = {
  export: Download,
  delete: Trash2,
  rectification: Pencil,
};

export default function AdminCompliance() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const data = await base44.entities.DataRequest.list('-requested_date', 50);
      setRequests(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function handleRequest(id, action) {
    if (action === 'complete') {
      try {
        await base44.entities.DataRequest.update(id, {
          status: 'completed',
          completed_date: new Date().toISOString().split('T')[0],
          handled_by: 'admin',
        });
        load();
      } catch (err) { console.error(err); }
    }
  }

  const pending = requests.filter((r) => r.status === 'pending');
  const completed = requests.filter((r) => r.status === 'completed');

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
          <span className="eyebrow">§ 06 · Conformidade</span>
          <h1 className="font-heading text-xl font-bold text-ink mt-1">Pedidos de dados (Lei 22/11)</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">Direitos de acesso, retificação e oposição</p>
        </div>
        <span className="mark">JUL · 2026</span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface border border-line rounded-talao p-4 shadow-soft">
          <p className="text-[11px] text-muted-2">Pendentes</p>
          <p className="font-mono text-[22px] font-bold text-[#9a6a16] mt-1.5">{pending.length}</p>
        </div>
        <div className="bg-surface border border-line rounded-talao p-4 shadow-soft">
          <p className="text-[11px] text-muted-2">Concluídos</p>
          <p className="font-mono text-[22px] font-bold text-ok mt-1.5">{completed.length}</p>
        </div>
        <div className="bg-surface border border-line rounded-talao p-4 shadow-soft">
          <p className="text-[11px] text-muted-2">Total</p>
          <p className="font-mono text-[22px] font-bold text-ink mt-1.5">{requests.length}</p>
        </div>
      </div>

      {/* Data requests table */}
      <div className="bg-surface border border-line rounded-talao overflow-hidden shadow-soft">
        <div className="px-5 py-3.5 border-b border-line">
          <h2 className="font-heading font-semibold text-[15px] text-ink">Pedidos de dados</h2>
        </div>
        {requests.length === 0 ? (
          <p className="px-5 py-10 text-sm text-muted-2 text-center">Nenhum pedido registado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-2 border-b border-line">
                  <th className="px-5 py-2.5 font-medium text-[11px]">Utilizador</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]">Tipo</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]">Pedido em</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]">Prazo</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]">Estado</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]">Ações</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => {
                  const TypeIcon = typeIcons[r.request_type] || FileText;
                  const daysLeft = r.deadline_date ? Math.ceil((new Date(r.deadline_date) - new Date()) / (1000 * 60 * 60 * 24)) : null;
                  return (
                    <tr key={r.id} className="border-b border-line/50 last:border-0">
                      <td className="px-5 py-3">
                        <div className="text-ink font-medium">{r.user_name}</div>
                        <div className="text-[11px] text-muted-2">{r.user_email}</div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
                          <TypeIcon className="w-3.5 h-3.5" /> {typeLabels[r.request_type] || r.request_type}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[12px] text-muted-foreground">{formatDate(r.requested_date)}</td>
                      <td className="px-5 py-3 text-[12px]">
                        {r.deadline_date ? (
                          <span className={daysLeft !== null && daysLeft < 2 ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                            {formatDate(r.deadline_date)}{daysLeft !== null && daysLeft >= 0 ? ` (${daysLeft}d)` : ''}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`${r.status === 'completed' ? 'pill-paid' : 'pill-pend'} text-[10.5px] font-bold px-2.5 py-0.5 rounded-full`}>
                          {r.status === 'completed' ? 'Concluído' : 'Pendente'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {r.status === 'pending' ? (
                          <button onClick={() => handleRequest(r.id, 'complete')} className="text-[12px] font-semibold text-primary hover:underline">
                            Tratar
                          </button>
                        ) : (
                          <span className="text-[11px] text-muted-2">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-start gap-2.5 bg-[#e7eef9] border border-[#c3d5ee] rounded-talao p-4">
        <Clock className="w-4 h-4 text-brandblue shrink-0 mt-0.5" />
        <p className="text-[12px] text-brandblue leading-relaxed">
          Conformidade com a Lei n.º 22/11 e as orientações da APD: minimização, consentimento e direitos de acesso, retificação e oposição.
        </p>
      </div>
    </div>
  );
}