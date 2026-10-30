import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { formatKz } from '@/lib/format';
import { filterVisibleInvoices } from '@/lib/business/partnerVisibility';
import { currentYearInvoices, isAgtVerified, isDeductiblePaid } from '@/lib/business/fiscalStats';

const dedLabels = {
  saude: 'Saúde',
  educacao: 'Educação',
  habitacao: 'Habitação',
  pensao_alimentos: 'Pensão',
  previdencia: 'Previdência',
};

export default function RightRail() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.Invoice.list(),
      base44.entities.PartnerConsent.list(),
      base44.entities.Subscription.filter({ status: 'active' }),
    ])
      .then(([me, data, consents, subs]) => {
        setInvoices(filterVisibleInvoices(data, {
          consents,
          hasActiveSubscription: subs.some((s) => s.user_id === me.id),
        }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <aside className="hidden xl:flex fixed inset-y-0 right-0 w-[340px] flex-col bg-surface border-l border-line z-20">
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-[3px] border-line border-t-primary rounded-full animate-spin" />
        </div>
      </aside>
    );
  }

  const pending = invoices
    .filter((i) => i.status === 'pending' || i.status === 'overdue')
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  const pendingTotal = pending.reduce((s, i) => s + (i.amount || 0), 0);

  const yearInvoices = currentYearInvoices(invoices);
  const deductibles = yearInvoices.filter(isDeductiblePaid);
  const deductibleTotal = deductibles.reduce((s, i) => s + (i.amount || 0), 0);
  const breakdown = Object.keys(dedLabels)
    .map((key) => ({
      key,
      label: dedLabels[key],
      amount: deductibles.filter((i) => i.deductible_type === key).reduce((s, i) => s + (i.amount || 0), 0),
    }))
    .filter((b) => b.amount > 0);

  const verified = yearInvoices.filter(isAgtVerified).length;
  const pendingVerification = yearInvoices.filter((i) => i.has_nif !== false && i.status === 'paid' && !isAgtVerified(i)).length;

  return (
    <aside className="hidden xl:flex fixed inset-y-0 right-0 w-[340px] flex-col bg-surface border-l border-line overflow-y-auto z-20">
      <div className="p-5 space-y-3.5">
        {/* A pagar */}
        <div className="border border-line rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-semibold text-[15px] text-ink">A pagar</h3>
            <Link to="/app/pagamentos" className="text-[12px] font-semibold text-primary hover:underline">
              Ver
            </Link>
          </div>
          <div className="font-mono text-[28px] font-semibold text-destructive tracking-tight leading-none">
            {formatKz(pendingTotal)}
          </div>
          <div className="text-[12px] text-muted-foreground mt-1.5">
            {pending.length} {pending.length === 1 ? 'fatura' : 'faturas'}
          </div>
          {pending.length > 0 && (
            <div className="mt-3.5">
              {pending.slice(0, 3).map((inv) => {
                const d = inv.due_date ? new Date(inv.due_date) : null;
                return (
                  <div key={inv.id} className="flex items-center gap-3 py-3 border-t border-line first:border-t-0 first:pt-0">
                    {d && (
                      <div className="w-[38px] text-center shrink-0">
                        <div className="font-mono text-[15px] font-semibold leading-none text-ink">{d.getDate()}</div>
                        <div className="font-mono text-[9px] text-muted-2 tracking-[.1em] mt-1">
                          {d.toLocaleDateString('pt-PT', { month: 'short' }).replace('.', '').toUpperCase()}
                        </div>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[12.5px] text-ink truncate">{inv.issuer_name}</div>
                      <div className="font-mono text-[11px] text-muted-foreground mt-0.5">{formatKz(inv.amount)}</div>
                    </div>
                    <span className="pill-pend text-[9.5px] font-bold px-2 py-1 rounded-full shrink-0">Pendente</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dedutível IRPS */}
        <div className="border border-[#e6cfa0] rounded-2xl p-4 bg-gold-soft">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-semibold text-[15px] text-[#5C3D0A]">Dedutível no IRPS</h3>
            <Link to="/app/dedutiveis" className="text-[12px] font-semibold text-[#7A5210] hover:underline">
              Ver
            </Link>
          </div>
          <div className="font-mono text-[28px] font-semibold text-[#7A5210] tracking-tight leading-none">
            {formatKz(deductibleTotal)}
          </div>
          <div className="text-[12px] text-[#7A5210] mt-2 leading-relaxed">
            Saúde, educação e habitação acumuladas este ano. Conta para a declaração de {new Date().getFullYear() + 1}.
          </div>
          {breakdown.length > 0 && (
            <>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {breakdown.map((b) => (
                  <span
                    key={b.key}
                    className="text-[10.5px] font-bold px-2.5 py-1 rounded-full bg-surface text-[#8A6420]"
                  >
                    {b.label} {Math.round(b.amount).toLocaleString('pt-AO')}
                  </span>
                ))}
              </div>
              <div className="font-mono text-[10px] text-[#8A6420] mt-2.5 pt-2.5 border-t border-dashed border-[#dcc19a]">
                {breakdown.map((b, i) => (
                  <React.Fragment key={b.key}>
                    {i > 0 && ' + '}
                    {Math.round(b.amount).toLocaleString('pt-AO')}
                  </React.Fragment>
                ))}
                {' = '}
                <b>{Math.round(deductibleTotal).toLocaleString('pt-AO')}</b>
              </div>
            </>
          )}
        </div>

        {/* Situação fiscal */}
        <div className="border border-line rounded-2xl p-4">
          <h3 className="font-heading font-semibold text-[15px] text-ink mb-2">Situação fiscal</h3>
          <p className="text-[12.5px] text-muted-foreground leading-relaxed">
            {verified > 0 ? (
              <>
                <b className="text-ink">{verified}</b> {verified === 1 ? 'fatura verificada' : 'faturas verificadas'} pela AGT sob o teu NIF este ano.
                {pendingVerification > 0 && ` ${pendingVerification} ${pendingVerification === 1 ? 'aguarda' : 'aguardam'} confirmação.`}
              </>
            ) : (
              'Sem faturas verificadas pela AGT este ano. Liga o conector da AGT nos Pagamentos.'
            )}
          </p>
        </div>
      </div>
    </aside>
  );
}