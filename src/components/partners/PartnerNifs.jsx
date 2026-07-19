import React from 'react';
import { Download, Info } from 'lucide-react';
import { formatDate } from '@/lib/format';

export default function PartnerNifs({ consents }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <span className="eyebrow">§ 04 · NIFs ligados</span>
          <h1 className="font-heading text-xl font-bold text-ink mt-1">NIFs que autorizaram a tua empresa</h1>
        </div>
        <span className="mark">JUL · 2026</span>
      </div>

      <div className="flex items-center justify-end">
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-line rounded-lg text-[12px] font-medium text-ink hover:bg-muted transition-colors">
          <Download className="w-3.5 h-3.5" /> Exportar
        </button>
      </div>

      <div className="bg-surface border border-line rounded-talao overflow-hidden shadow-soft">
        {consents.length === 0 ? (
          <p className="px-5 py-10 text-sm text-muted-2 text-center">Nenhum NIF ligado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-2 border-b border-line">
                  <th className="px-5 py-2.5 font-medium text-[11px]">NIF</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]">Parceiro</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]">Autorizado em</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]">Estado</th>
                </tr>
              </thead>
              <tbody>
                {consents.map((c) => (
                  <tr key={c.id} className="border-b border-line/50 last:border-0">
                    <td className="px-5 py-3 font-mono text-[12px] text-ink">{c.partner_nif || '—'}</td>
                    <td className="px-5 py-3 text-ink font-medium">{c.partner_name || '—'}</td>
                    <td className="px-5 py-3 text-muted-foreground text-[12px]">{formatDate(c.consent_date)}</td>
                    <td className="px-5 py-3">
                      <span className={`${c.consent_status === 'active' ? 'pill-paid' : 'pill-late'} text-[10.5px] font-bold px-2.5 py-0.5 rounded-full`}>
                        {c.consent_status === 'active' ? 'Ativo' : 'Revogado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-start gap-2.5 bg-[#e7eef9] border border-[#c3d5ee] rounded-talao p-4">
        <Info className="w-4 h-4 text-brandblue shrink-0 mt-0.5" />
        <p className="text-[12px] text-brandblue leading-relaxed">
          O utilizador autoriza e revoga na app. Quando revoga, a tua empresa deixa de poder enviar faturas a esse NIF.
        </p>
      </div>
    </div>
  );
}