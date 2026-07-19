import React from 'react';
import { formatKz, formatDate } from '@/lib/format';
import { Plus, Upload, FileSpreadsheet } from 'lucide-react';

function statusPill(status) {
  if (status === 'paid') return 'pill-paid';
  if (status === 'overdue') return 'pill-late';
  return 'pill-pend';
}

function statusLabel(status) {
  if (status === 'paid') return 'Paga';
  if (status === 'overdue') return 'Vencida';
  return 'Pendente';
}

export default function PartnerInvoices({ invoices }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <span className="eyebrow">§ 02 · Faturas</span>
          <h1 className="font-heading text-xl font-bold text-ink mt-1">Faturas enviadas</h1>
        </div>
        <span className="mark">JUL · 2026</span>
      </div>

      <div className="flex items-center gap-2.5">
        <button className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-surface border border-line rounded-xl text-[13px] font-medium text-ink hover:bg-muted transition-colors">
          <FileSpreadsheet className="w-4 h-4 text-[#1C8A6A]" /> Importar Excel/CSV
        </button>
        <button className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary text-white rounded-xl text-[13px] font-medium hover:bg-primary-2 transition-colors">
          <Plus className="w-4 h-4" /> Enviar fatura
        </button>
      </div>

      <div className="bg-surface border border-line rounded-talao overflow-hidden shadow-soft">
        {invoices.length === 0 ? (
          <p className="px-5 py-10 text-sm text-muted-2 text-center">Nenhuma fatura emitida.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-2 border-b border-line">
                  <th className="px-5 py-2.5 font-medium text-[11px]">Nº</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]">NIF</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]">Cliente</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]">Valor</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]">Vencimento</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]">Estado</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]">Canal</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-line/50 last:border-0">
                    <td className="px-5 py-3 font-mono text-[12px] text-ink">{inv.document_number || '—'}</td>
                    <td className="px-5 py-3 font-mono text-[12px] text-muted-foreground">{inv.user_nif || '—'}</td>
                    <td className="px-5 py-3 text-ink font-medium">{inv.issuer_name || '—'}</td>
                    <td className="px-5 py-3 font-mono text-ink">{formatKz(inv.amount)}</td>
                    <td className="px-5 py-3 text-muted-foreground text-[12px]">{formatDate(inv.due_date)}</td>
                    <td className="px-5 py-3">
                      <span className={`${statusPill(inv.status)} text-[10.5px] font-bold px-2.5 py-0.5 rounded-full`}>
                        {statusLabel(inv.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[11px] text-muted-2 uppercase">{inv.source || 'API'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-gold-soft border border-[#e6cfa0] rounded-talao p-4">
        <p className="text-[12px] text-[#8a6420] leading-relaxed">
          Só podes enviar faturas a um NIF que tenha ligado a tua empresa na app. A correspondência entre o NIF e o destinatário é validada no envio.
        </p>
      </div>
    </div>
  );
}