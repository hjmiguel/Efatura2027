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

      // Load divergences (may fail if function has issues — independence)
      try {
        const divRes = await base44.functions.invoke('detectDivergences', {});
        setDivergences(divRes.data?.divergences || []);
      } catch {
        setDivergences([]);
      }

      // Load partner consents
      try {
        const cons = await base44.entities.PartnerConsent.list();
        setConsents(cons);
      } catch {
        setConsents([]);
      }
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  }

  const agtInvoices = useMemo(() => invoices.filter(i => i.agt_status !== 'none'), [invoices]);
  const verifiedCount = useMemo(() => invoices.filter(i => i.agt_status === 'paid').length, [invoices]);
  const deductibleTotal = useMemo(() =>
    invoices
      .filter(i => i.deductible_type && i.deductible_type !== 'none' && i.has_nif !== false && i.status === 'paid')
      .reduce((s, i) => s + (i.amount || 0), 0), [invoices]);

  const sourceLabels = {
    manual: 'Manual',
    photo_ocr: 'Foto/OCR',
    partner: 'Parceiro',
    agt: 'AGT'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-line border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-ink">Situação fiscal</h1>
        <p className="text-sm text-muted-2 mt-1">Faturas sob o teu NIF, verificação AGT e divergências</p>
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
            <AlertTriangle className="w-5 h-5 text-gold" />
            <h2 className="font-heading font-bold text-ink">
              {divergences.length} {divergences.length === 1 ? 'divergência' : 'divergências'} detetada{divergences.length === 1 ? '' : 's'}
            </h2>
          </div>
          <div className="space-y-2">
            {divergences.map((d, idx) => (
              <DivergenceCard key={idx} divergence={d} />
            ))}
          </div>
        </div>
      )}

      {/* Invoices under NIF */}
      <div className="bg-surface rounded-talao border border-line divide-y divide-line">
        <div className="px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <h2 className="font-heading font-bold text-ink">Faturas sob o NIF</h2>
          </div>
          <span className="text-xs text-muted-2 bg-muted px-2 py-0.5 rounded-full">{invoices.length}</span>
        </div>
        {invoices.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted-2 text-center">Sem faturas registadas.</p>
        ) : (
          invoices.map(inv => (
            <div key={inv.id} className="flex items-center gap-3 px-5 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-ink truncate">{inv.issuer_name}</p>
                  {inv.agt_status !== 'none' && <AgtSeal status={inv.agt_status} size={16} />}
                </div>
                <p className="text-xs text-muted-2">
                  {inv.document_number && <span className="font-mono">#{inv.document_number} · </span>}
                  {sourceLabels[inv.source] || inv.source} · {formatDate(inv.issue_date || inv.due_date)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm font-semibold text-ink">{formatKz(inv.amount)}</p>
                <p className={`text-xs ${inv.status === 'paid' ? 'text-ok' : inv.status === 'overdue' ? 'text-destructive' : 'text-muted-2'}`}>
                  {inv.status === 'paid' ? 'Paga' : inv.status === 'overdue' ? 'Atrasada' : 'Pendente'}
                </p>
              </div>
            </div>
          ))
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
        <p className="text-xs text-muted-2 leading-relaxed">
          O selo de "emitida" prova que a fatura foi registada sob o teu NIF na AGT, mas não prova pagamento.
          "Verificada" significa que a AGT confirmou a liquidação. Nenhum escalão, taxa ou limite de IRPS é calculado na app.
        </p>
      </div>
    </div>
  );
}