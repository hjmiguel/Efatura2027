import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { appApi } from '@/api/appClient';
import ManualInvoiceForm from '@/components/app/ManualInvoiceForm';
import {
  CheckCircle2, CalendarDays, Crown,
  Smartphone, Landmark, Receipt, ChevronRight, FileText, AlertCircle,
} from 'lucide-react';
import { formatKz, formatDate, daysUntil } from '@/lib/format';
import Seo from '@/components/Seo';
import AgtSeal from '@/components/app/AgtSeal';
import McxPaymentDialog from '@/components/app/McxPaymentDialog';
import IbanPaymentDialog from '@/components/app/IbanPaymentDialog';
import RupePaymentDialog from '@/components/app/RupePaymentDialog';
import PremiumModal from '@/components/app/PremiumModal';
import PaymentReceipt from '@/components/app/PaymentReceipt';
import EmpresasTab from '@/components/app/payments/EmpresasTab';
import CompromissosView from '@/components/app/payments/CompromissosView';
import { filterVisibleInvoices } from '@/lib/business/partnerVisibility';
import StatusConfirmDialog from '@/components/app/payments/StatusConfirmDialog';

const tabs = [
  { id: 'pendente', label: 'Pendente' },
  { id: 'pagos', label: 'Pagos' },
  { id: 'compromissos', label: 'Compromissos' },
  { id: 'empresas', label: 'Empresas' },
];

export default function Pagamentos() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [patrimonio, setPatrimonio] = useState(0);
  const [tab, setTab] = useState('pendente');
  const [payDialog, setPayDialog] = useState(null);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [statusAction, setStatusAction] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [manualFormOpen, setManualFormOpen] = useState(searchParams.get('adicionar') === '1');

  useEffect(() => { load(); }, []);

  const closeManualForm = () => {
    setManualFormOpen(false);
    searchParams.delete('adicionar');
    setSearchParams(searchParams, { replace: true });
  };

  async function load() {
    try {
      const [me, data, accounts, consents, subs] = await Promise.all([
        appApi.auth.me(),
        appApi.entities.Invoice.list(),
        appApi.entities.Account.list(),
        appApi.entities.PartnerConsent.list(),
        appApi.entities.Subscription.filter({ status: 'active' }),
      ]);
      setInvoices(filterVisibleInvoices(data, {
        consents,
        hasActiveSubscription: subs.some((s) => s.user_id === me.id),
      }));
      setAccounts(accounts);
      setPatrimonio(accounts.reduce((s, a) => s + (a.balance || 0), 0));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  const revertToPending = async (invoice) => {
    try {
      const txs = await appApi.entities.Transaction.filter({ invoice_id: invoice.id });
      for (const tx of txs) {
        const acc = accounts.find((a) => a.id === tx.account_id);
        if (acc) {
          const newBalance = (acc.balance || 0) - (tx.amount || 0);
          await appApi.entities.Account.update(acc.id, { balance: newBalance });
        }
        await appApi.entities.Transaction.delete(tx.id);
      }
      await appApi.entities.Invoice.update(invoice.id, { status: 'pending', paid_date: '' });
      await load();
    } catch (err) { console.error(err); }
  };

  const confirmStatusAction = async () => {
    const { kind, invoice } = statusAction;
    setStatusAction(null);
    if (kind === 'paid') await markPaid(invoice, true);
    else await revertToPending(invoice);
  };

  const markPaid = async (invoice, manual = false) => {
    try {
      if (invoice.status === 'paid') return;
      const paidDate = new Date().toISOString().slice(0, 10);
      await appApi.entities.Invoice.update(invoice.id, { status: 'paid', paid_date: paidDate });
      setInvoices((prev) => prev.map((i) => (i.id === invoice.id ? { ...i, status: 'paid', paid_date: paidDate } : i)));

      const existing = await appApi.entities.Transaction.filter({ invoice_id: invoice.id });
      const account = existing.length === 0 ? accounts[0] : null;
      if (account) {
        await appApi.entities.Transaction.create({
          description: invoice.issuer_name,
          amount: -Math.abs(invoice.amount || 0),
          date: paidDate,
          type: 'expense',
          account_id: account.id,
          category_id: invoice.category_id || undefined,
          invoice_id: invoice.id,
          notes: invoice.document_number ? `Fatura ${invoice.document_number}` : undefined,
        });

        const newBalance = (account.balance || 0) - Math.abs(invoice.amount || 0);
        await appApi.entities.Account.update(account.id, { balance: newBalance });
        setAccounts((prev) => prev.map((a) => (a.id === account.id ? { ...a, balance: newBalance } : a)));
        setPatrimonio((prev) => prev - Math.abs(invoice.amount || 0));
      }
      setPayDialog(null);
      if (!manual) setReceipt({ invoice, paidDate });
    } catch (err) { console.error(err); }
  };

  const pending = invoices
    .filter((i) => i.status === 'pending' || i.status === 'overdue')
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  const paid = invoices
    .filter((i) => i.status === 'paid')
    .sort((a, b) => new Date(b.paid_date || b.due_date) - new Date(a.paid_date || a.due_date));

  const totalPending = pending.reduce((s, i) => s + (i.amount || 0), 0);
  const overdueCount = pending.filter((i) => i.due_date && daysUntil(i.due_date) < 0).length;
  const now = new Date();
  const paidThisMonth = paid.filter((i) => {
    const d = new Date(i.paid_date || i.due_date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const paidThisMonthAmount = paidThisMonth.reduce((s, i) => s + (i.amount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-line border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Seo title="Pagamentos" description="Gere os teus pagamentos: faturas pendentes, pagas, compromissos e autorizações." path="/app/pagamentos" />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="eyebrow">§ 04 · Contas a pagar</span>
          <h1 className="font-heading text-2xl font-bold text-ink mt-1">Pagamentos</h1>
        </div>
        <button onClick={() => setPremiumOpen(true)} className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 border border-gold/40 text-[#9a6a16] rounded-xl text-sm font-medium hover:bg-gold-soft transition-colors">
          <Crown className="w-4 h-4" /> Premium
        </button>
      </div>

      {/* Two stats */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-surface border border-line rounded-talao p-4 shadow-soft">
          <div className="font-mono text-[20px] font-bold text-ink">{formatKz(totalPending)}</div>
          <div className="text-[12px] text-muted-foreground mt-0.5">Pendente (Kz)</div>
        </div>
        <div className="bg-surface border border-line rounded-talao p-4 shadow-soft">
          <div className="font-mono text-[20px] font-bold text-ink">{formatKz(paidThisMonthAmount)}</div>
          <div className="text-[12px] text-muted-foreground mt-0.5">Pago este mês</div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-surface border border-line rounded-xl p-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors border ${
              t.id === 'compromissos' ? 'hidden' : ''
            } ${
              tab === t.id ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ===== Pendente ===== */}
      {tab === 'pendente' && (
        <div className="space-y-2.5">
          {pending.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="Nada por pagar" text="Não tens faturas pendentes. Bom trabalho!" />
          ) : (
            pending.map((inv) => (
              <BillCard key={inv.id} invoice={inv} onPay={(type) => setPayDialog({ type, invoice: inv })} onMarkPaid={() => setStatusAction({ kind: 'paid', invoice: inv })} />
            ))
          )}
        </div>
      )}

      {/* ===== Pagos ===== */}
      {tab === 'pagos' && (
        <div className="space-y-2.5">
          {paid.length === 0 ? (
            <EmptyState icon={Receipt} title="Sem faturas pagas" text="As faturas que pagares aparecem aqui com o selo AGT." />
          ) : (
            paid.map((inv) => <PaidRow key={inv.id} invoice={inv} />)
          )}
        </div>
      )}

      {/* ===== Compromissos ===== */}
      {tab === 'compromissos' && <CompromissosView invoices={invoices} patrimonio={patrimonio} />}

      {/* ===== Empresas ===== */}
      {tab === 'empresas' && <EmpresasTab />}

      {/* Payment dialogs */}
      {payDialog?.type === 'mcx' && (
        <McxPaymentDialog invoice={payDialog.invoice} open={!!payDialog} onOpenChange={(v) => !v && setPayDialog(null)} onPaid={markPaid} />
      )}
      {payDialog?.type === 'iban' && (
        <IbanPaymentDialog invoice={payDialog.invoice} open={!!payDialog} onOpenChange={(v) => !v && setPayDialog(null)} onPaid={markPaid} />
      )}
      {payDialog?.type === 'rupe' && (
        <RupePaymentDialog invoice={payDialog.invoice} open={!!payDialog} onOpenChange={(v) => !v && setPayDialog(null)} onPaid={markPaid} />
      )}

      <StatusConfirmDialog action={statusAction} onCancel={() => setStatusAction(null)} onConfirm={confirmStatusAction} />

      <PremiumModal open={premiumOpen} onOpenChange={setPremiumOpen} />

      {receipt && <PaymentReceipt invoice={receipt.invoice} paidDate={receipt.paidDate} onClose={() => setReceipt(null)} />}

      <ManualInvoiceForm open={manualFormOpen} onClose={closeManualForm} onSaved={load} />
    </div>
  );
}

function BillCard({ invoice, onPay, onMarkPaid }) {
  const overdue = invoice.due_date && daysUntil(invoice.due_date) < 0;
  const days = invoice.due_date ? daysUntil(invoice.due_date) : null;

  const hasMcx = invoice.payment_method === 'mcx_reference' || (invoice.entity && invoice.reference);
  const hasIban = invoice.payment_method === 'iban' || invoice.iban;
  const hasRupe = invoice.payment_method === 'rupe';

  const payRef = invoice.reference || invoice.iban || '';

  return (
    <div className="bg-surface border border-line rounded-talao p-4 shadow-soft">
      <div className="flex items-start gap-3">
        <div className={`w-[42px] h-[42px] rounded-[12px] flex items-center justify-center shrink-0 ${overdue ? 'bg-danger-soft' : 'bg-muted'}`}>
          <Receipt className={`w-5 h-5 ${overdue ? 'text-destructive' : 'text-muted-foreground'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-[14px] text-ink truncate">{invoice.issuer_name}</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                {invoice.document_number || 'Sem nº'}
                {payRef && <span className="font-mono"> · {payRef.slice(0, 20)}{payRef.length > 20 ? '…' : ''}</span>}
              </p>
            </div>
            <p className="font-mono font-semibold text-[15px] text-ink shrink-0">{formatKz(invoice.amount)}</p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {overdue ? (
              <span className="pill-late text-[11px] font-bold px-2.5 py-1 rounded-full">{Math.abs(days)} dias de atraso</span>
            ) : days !== null && days <= 7 ? (
              <span className="pill-pend text-[11px] font-bold px-2.5 py-1 rounded-full">
                {days === 0 ? 'Hoje' : days === 1 ? 'Amanhã' : `Em ${days} dias`}
              </span>
            ) : (
              <span className="text-[11px] text-muted-2">Vence {formatDate(invoice.due_date)}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-2.5">
            {hasMcx && (
              <button onClick={() => onPay('mcx')} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-primary text-white rounded-lg text-[12px] font-medium">
                <Smartphone className="w-3 h-3" /> Pagar MCX
              </button>
            )}
            {hasIban && (
              <button onClick={() => onPay('iban')} className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-line text-ink rounded-lg text-[12px] font-medium">
                <Landmark className="w-3 h-3" /> IBAN
              </button>
            )}
            {hasRupe && (
              <button onClick={() => onPay('rupe')} className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-primary/30 text-primary rounded-lg text-[12px] font-medium">
                <Landmark className="w-3 h-3" /> RUPE
              </button>
            )}
            {!hasMcx && !hasIban && !hasRupe && (
              <span className="text-[12px] text-muted-2">Sem dados de pagamento</span>
            )}
            <button onClick={onMarkPaid} className="ml-auto inline-flex items-center gap-1 px-2.5 py-1.5 border border-ok/40 text-ok rounded-lg text-[12px] font-medium hover:bg-green-soft transition-colors">
              <CheckCircle2 className="w-3 h-3" /> Marcar como paga
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaidRow({ invoice }) {
  return (
    <div className="bg-surface border border-line rounded-talao p-4 shadow-soft flex items-center gap-3">
      <div className="w-[42px] h-[42px] rounded-[12px] bg-green-soft flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-5 h-5 text-ok" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[14px] text-ink truncate">{invoice.issuer_name}</p>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          {invoice.document_number || 'Sem nº'} · paga {formatDate(invoice.paid_date)}
        </p>
      </div>
      <div className="flex items-center gap-2.5 shrink-0">
        {invoice.agt_status && invoice.agt_status !== 'none' && <AgtSeal status={invoice.agt_status} size={18} />}
        <p className="font-mono font-semibold text-[15px] text-ink">{formatKz(invoice.amount)}</p>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, text }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
        <Icon className="w-7 h-7 text-muted-2" />
      </div>
      <p className="font-medium text-ink">{title}</p>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">{text}</p>
    </div>
  );
}