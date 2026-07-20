import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { formatKz, formatDate } from '@/lib/format';
import AgtSeal from '@/components/app/AgtSeal';
import DivergenceCard from '@/components/app/DivergenceCard';
import InvoiceLifecycle from '@/components/app/InvoiceLifecycle';
import FiscalSummary from '@/components/app/FiscalSummary';
import AgtSyncButton from '@/components/app/AgtSyncButton';
import PartnerConsentManager from '@/components/app/PartnerConsentManager';
import { AlertTriangle, FileText, Landmark } from 'lucide-react';
import MobileTopBar from '@/components/app/MobileTopBar';

const sourceLabels = { manual: 'Manual', photo_ocr: 'Foto/OCR', partner: 'Parceiro', agt: 'AGT' };

export default function Fiscal() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [divergences, setDivergences] = useState([]);
  const [consents, setConsents] = useState([]);
  const [syncKey, setSyncKey] = useState(0);

  useEffect(() => { loadData(); }, [syncKey]);

  async function loadData() {
    try {
      const [me, inv] = await Promise.all([
        base44.auth.me(),
        base44.entities.Invoice.list()
      ]);
      setUser(me);
      setInvoices(inv);
      try {
        const divRes = await base44.functions.invoke('detectDivergences', {});
        setDivergences(divRes.data?.divergences || []);
      } catch { setDivergences([]); }
      try {
        const cons = await base44.entities.PartnerConsent.list();
        setConsents(cons);
      } catch { setConsents([]); }
    } catch (err) { console.error('Erro:', err); }
    finally { setLoading(false); }
  }

  const verifiedCount = useMemo(() => invoices.filter(i => i.agt_status === 'paid').length, [invoices]);
  const deductibleTotal = useMemo(() =>
    invoices
      .filter(i => i.deductible_type && i.deductible_type !== 'none' && i.has_nif !== false && i.status === 'paid')
      .reduce((s, i) => s + (i.amount || 0), 0), [invoices]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-line border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <MobileTopBar title="Situação fiscal" />

      {/* Header */}
      <div>
        <span className="eyebrow">§ 08 · Fiscal</span>
        <h1 className="font-heading text-2xl font-bold text-ink mt-1">Situação fiscal</h1>
        <p className="text-[12.5px] text-muted-foreground mt-0.5">Faturas sob o teu NIF, verificação AGT e divergências</p>
      </div>

      {/* AGT consent + sync */}
      <AgtSyncButton user={user} onSyncComplete={() => setSyncKey(k => k + 1)} />

      {/* Summary */}
      <FiscalSummary
        totalInvoices={invoices.filter(i => i.document_number).length}
        verifiedCount={verifiedCount}
        deductibleTotal={deductibleTotal}
        lastSync={user?.agt_consent_date ? formatDate(user.agt_consent_date) : null}
      />

      {/* Invoice lifecycle */}
      <InvoiceLifecycle invoices={invoices} />

      {/* Divergences */}
      {divergences.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-gold" />
            <span className="text-[13px] font-semibold text-ink">
              {divergences.length} {divergences.length === 1 ? 'divergência' : 'divergências'} detetada{divergences.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="space-y-2">
            {divergences.map((d, idx) => (
              <DivergenceCard key={idx} divergence={d} />
            ))}
          </div>
        </div>
      )}

      {/* Invoices under NIF (flush list) */}
      <div className="bg-surface rounded-talao border border-line shadow-soft px-3 pb-2">
        <div className="px-1 pt-3 pb-1 flex items-center justify-between">
          <span className="eyebrow">Faturas sob o NIF</span>
          <span className="text-[10px] font-mono text-muted-2 bg-muted px-2 py-0.5 rounded-full">{invoices.length}</span>
        </div>
        {invoices.length === 0 ? (
          <p className="px-2 py-8 text-[13px] text-muted-2 text-center">Sem faturas registadas.</p>
        ) : (
          <div className="ed-list">
            {invoices.map(inv => (
              <div key={inv.id} className="it">
                <div className="w-[34px] h-[34px] rounded-[10px] bg-[#e9f3ee] text-primary flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="nm truncate flex items-center gap-1.5">
                    {inv.issuer_name}
                    {inv.agt_status !== 'none' && <AgtSeal status={inv.agt_status} size={14} />}
                  </div>
                  <div className="sb">
                    {inv.document_number && <span className="font-mono">#{inv.document_number} · </span>}
                    {sourceLabels[inv.source] || inv.source} · {formatDate(inv.issue_date || inv.due_date)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="vl">{formatKz(inv.amount)}</div>
                  <div className={`text-[11px] font-medium ${inv.status === 'paid' ? 'text-ok' : inv.status === 'overdue' ? 'text-destructive' : 'text-muted-2'}`}>
                    {inv.status === 'paid' ? 'Paga' : inv.status === 'overdue' ? 'Atrasada' : 'Pendente'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Partner consents */}
      <PartnerConsentManager
        consents={consents}
        userNif={user?.nif}
        onChanged={() => setSyncKey(k => k + 1)}
      />

      {/* Disclaimer */}
      <div className="flex items-start gap-3 bg-muted/30 rounded-talao p-4">
        <Landmark className="w-4 h-4 text-muted-2 shrink-0 mt-0.5" />
        <p className="text-[11.5px] text-muted-2 leading-relaxed">
          O selo de "emitida" prova que a fatura foi registada sob o teu NIF na AGT, mas não prova pagamento.
          "Verificada" significa que a AGT confirmou a liquidação. Nenhum escalão, taxa ou limite de IRPS é calculado na app.
        </p>
      </div>
    </div>
  );
}