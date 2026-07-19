import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Clock, CheckCircle2, CalendarDays, Building2, Crown,
  Smartphone, Landmark, Receipt, AlertCircle, ChevronRight, FileText,
} from 'lucide-react';
import { formatKz, formatDate, daysUntil } from '@/lib/format';
import Seo from '@/components/Seo';
import AgtSeal from '@/components/app/AgtSeal';
import PartnerConsentManager from '@/components/app/PartnerConsentManager';
import McxPaymentDialog from '@/components/app/McxPaymentDialog';
import IbanPaymentDialog from '@/components/app/IbanPaymentDialog';
import RupePaymentDialog from '@/components/app/RupePaymentDialog';
import PremiumModal from '@/components/app/PremiumModal';

export default function Pagamentos() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [tab, setTab] = useState('pendente');
  const [payDialog, setPayDialog] = useState(null); // { type: 'mcx'|'iban', invoice }
  const [premiumOpen, setPremiumOpen] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await base44.entities.Invoice.list();
      setInvoices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const markPaid = async (invoice) => {
    try {
      await base44.entities.Invoice.update(invoice.id, {
        status: 'paid',
        paid_date: new Date().toISOString().slice(0, 10),
      });
      setInvoices((prev) =>
        prev.map((i) => (i.id === invoice.id ? { ...i, status: 'paid', paid_date: new Date().toISOString().slice(0, 10) } : i))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const pending = invoices
    .filter((i) => i.status === 'pending' || i.status === 'overdue')
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  const paid = invoices
    .filter((i) => i.status === 'paid')
    .sort((a, b) => new Date(b.paid_date || b.due_date) - new Date(a.paid_date || a.due_date));

  const totalPending = pending.reduce((s, i) => s + (i.amount || 0), 0);
  const overdueCount = pending.filter((i) => i.due_date && daysUntil(i.due_date) < 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-line border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Seo title="Pagamentos" description="Gere os teus pagamentos: faturas pendentes, pagas, compromissos e autorizações." path="/app/pagamentos" />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">Pagamentos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Faturas, compromissos e autorizações</p>
        </div>
        <Button onClick={() => setPremiumOpen(true)} variant="outline" className="shrink-0 border-gold/40 text-gold hover:bg-gold-soft">
          <Crown className="w-4 h-4 mr-1.5" />
          Premium
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <SummaryCard icon={Clock} label="Por pagar" value={formatKz(totalPending)} sub={`${pending.length} faturas`} tone="default" />
        <SummaryCard
          icon={AlertCircle}
          label="Vencidas"
          value={String(overdueCount)}
          sub={overdueCount > 0 ? 'Atenção' : 'Tudo em dia'}
          tone={overdueCount > 0 ? 'danger' : 'ok'}
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Pagas (mês)"
          value={String(paid.length)}
          sub="faturas liquidadas"
          tone="ok"
          className="col-span-2 md:col-span-1"
        />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="pendente" className="text-xs sm:text-sm">Pendente</TabsTrigger>
          <TabsTrigger value="pagos" className="text-xs sm:text-sm">Pagos</TabsTrigger>
          <TabsTrigger value="compromissos" className="text-xs sm:text-sm">Compromissos</TabsTrigger>
          <TabsTrigger value="estado" className="text-xs sm:text-sm">Estado</TabsTrigger>
          <TabsTrigger value="empresas" className="text-xs sm:text-sm">Empresas</TabsTrigger>
        </TabsList>

        {/* Pendente */}
        <TabsContent value="pendente" className="mt-4 space-y-3">
          {pending.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="Nada por pagar" text="Não tens faturas pendentes. Bom trabalho!" />
          ) : (
            pending.map((inv) => (
              <PendingRow key={inv.id} invoice={inv} onPay={(type) => setPayDialog({ type, invoice: inv })} />
            ))
          )}
        </TabsContent>

        {/* Pagos */}
        <TabsContent value="pagos" className="mt-4 space-y-3">
          {paid.length === 0 ? (
            <EmptyState icon={Receipt} title="Sem faturas pagas" text="As faturas que pagares aparecem aqui com o selo AGT." />
          ) : (
            paid.map((inv) => <PaidRow key={inv.id} invoice={inv} />)
          )}
        </TabsContent>

        {/* Compromissos */}
        <TabsContent value="compromissos" className="mt-4">
          <CompromissosView invoices={invoices} />
        </TabsContent>

        {/* Estado (RUPE) */}
        <TabsContent value="estado" className="mt-4">
          <EstadoView invoices={invoices} onPay={(inv) => setPayDialog({ type: 'rupe', invoice: inv })} />
        </TabsContent>

        {/* Empresas */}
        <TabsContent value="empresas" className="mt-4">
          <PartnerConsentManager />
        </TabsContent>
      </Tabs>

      {/* Payment dialogs */}
      {payDialog?.type === 'mcx' && (
        <McxPaymentDialog
          invoice={payDialog.invoice}
          open={!!payDialog}
          onOpenChange={(v) => !v && setPayDialog(null)}
          onPaid={markPaid}
        />
      )}
      {payDialog?.type === 'iban' && (
        <IbanPaymentDialog
          invoice={payDialog.invoice}
          open={!!payDialog}
          onOpenChange={(v) => !v && setPayDialog(null)}
          onPaid={markPaid}
        />
      )}
      {payDialog?.type === 'rupe' && (
        <RupePaymentDialog
          invoice={payDialog.invoice}
          open={!!payDialog}
          onOpenChange={(v) => !v && setPayDialog(null)}
          onPaid={markPaid}
        />
      )}

      <PremiumModal open={premiumOpen} onOpenChange={setPremiumOpen} />
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, sub, tone = 'default', className = '' }) {
  const tones = {
    default: 'text-ink',
    ok: 'text-ok',
    danger: 'text-destructive',
  };
  return (
    <div className={`bg-surface border border-line rounded-2xl p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${tones[tone]}`} />
        <span className="text-xs text-muted-2">{label}</span>
      </div>
      <p className={`font-mono text-lg font-bold ${tones[tone]}`}>{value}</p>
      <p className="text-xs text-muted-2 mt-0.5">{sub}</p>
    </div>
  );
}

function PendingRow({ invoice, onPay }) {
  const overdue = invoice.due_date && daysUntil(invoice.due_date) < 0;
  const days = invoice.due_date ? daysUntil(invoice.due_date) : null;

  const hasMcx = invoice.payment_method === 'mcx_reference' || (invoice.entity && invoice.reference);
  const hasIban = invoice.payment_method === 'iban' || invoice.iban;
  const hasRupe = invoice.payment_method === 'rupe';

  return (
    <div className="bg-surface border border-line rounded-2xl p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${overdue ? 'bg-danger-soft' : 'bg-muted'}`}>
        <Receipt className={`w-5 h-5 ${overdue ? 'text-destructive' : 'text-muted-foreground'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-ink truncate">{invoice.issuer_name}</p>
        <p className="text-xs text-muted-2">
          {invoice.document_number || 'Sem nº'} · vence {formatDate(invoice.due_date)}
          {overdue ? ` · ${Math.abs(days)} dias de atraso` : days !== null && days <= 3 ? ` · em ${days} dias` : ''}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-mono font-semibold text-ink">{formatKz(invoice.amount)}</p>
        <div className="flex items-center gap-1.5 mt-1">
          {hasMcx && (
            <Button size="sm" onClick={() => onPay('mcx')} className="h-7 text-xs px-2.5">
              <Smartphone className="w-3 h-3 mr-1" />
              MCX
            </Button>
          )}
          {hasIban && (
            <Button size="sm" variant="outline" onClick={() => onPay('iban')} className="h-7 text-xs px-2.5">
              <Landmark className="w-3 h-3 mr-1" />
              IBAN
            </Button>
          )}
          {hasRupe && (
            <Button size="sm" variant="outline" onClick={() => onPay('rupe')} className="h-7 text-xs px-2.5 border-primary/30 text-primary">
              <Landmark className="w-3 h-3 mr-1" />
              RUPE
            </Button>
          )}
          {!hasMcx && !hasIban && !hasRupe && (
            <span className="text-xs text-muted-2">Sem dados de pagamento</span>
          )}
        </div>
      </div>
    </div>
  );
}

function PaidRow({ invoice }) {
  return (
    <div className="bg-surface border border-line rounded-2xl p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-green-soft flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-5 h-5 text-ok" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-ink truncate">{invoice.issuer_name}</p>
        <p className="text-xs text-muted-2">
          {invoice.document_number || 'Sem nº'} · paga {formatDate(invoice.paid_date)}
        </p>
      </div>
      <div className="text-right shrink-0 flex items-center gap-3">
        {invoice.agt_status && invoice.agt_status !== 'none' && <AgtSeal status={invoice.agt_status} size={18} />}
        <p className="font-mono font-semibold text-ink">{formatKz(invoice.amount)}</p>
      </div>
    </div>
  );
}

function CompromissosView({ invoices }) {
  // Future-dated pending invoices grouped by week
  const future = invoices
    .filter((i) => i.status === 'pending' && i.due_date && daysUntil(i.due_date) >= 0)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  const total = future.reduce((s, i) => s + (i.amount || 0), 0);

  if (future.length === 0) {
    return <EmptyState icon={CalendarDays} title="Sem compromissos" text="Não tens pagamentos futuros agendados." />;
  }

  return (
    <div className="space-y-4">
      <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Total comprometido</p>
          <p className="font-mono text-xl font-bold text-primary">{formatKz(total)}</p>
        </div>
        <CalendarDays className="w-8 h-8 text-primary/30" />
      </div>
      {future.map((inv) => {
        const days = daysUntil(inv.due_date);
        return (
          <div key={inv.id} className="bg-surface border border-line rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-muted flex flex-col items-center justify-center shrink-0">
              <span className="text-[10px] uppercase text-muted-2">
                {new Date(inv.due_date).toLocaleDateString('pt-PT', { month: 'short' })}
              </span>
              <span className="font-heading font-bold text-ink leading-none">
                {new Date(inv.due_date).getDate()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-ink truncate">{inv.issuer_name}</p>
              <p className="text-xs text-muted-2">
                {days === 0 ? 'Hoje' : days === 1 ? 'Amanhã' : `Em ${days} dias`}
              </p>
            </div>
            <p className="font-mono font-semibold text-ink shrink-0">{formatKz(inv.amount)}</p>
            <ChevronRight className="w-4 h-4 text-muted-2 shrink-0" />
          </div>
        );
      })}
    </div>
  );
}

function EstadoView({ invoices, onPay }) {
  const rupeInvoices = invoices.filter(
    (i) => (i.status === 'pending' || i.status === 'overdue') && i.payment_method === 'rupe'
  );

  if (rupeInvoices.length === 0) {
    return (
      <EmptyState
        icon={Landmark}
        title="Sem pagamentos ao Estado"
        text="As faturas com RUPE (Referência Única de Pagamento) emitidas pela AGT aparecem aqui."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Total ao Estado</p>
          <p className="font-mono text-xl font-bold text-primary">
            {formatKz(rupeInvoices.reduce((s, i) => s + (i.amount || 0), 0))}
          </p>
        </div>
        <Landmark className="w-8 h-8 text-primary/30" />
      </div>
      <div className="bg-gold-soft/40 border border-gold/20 rounded-xl p-3 flex gap-2">
        <FileText className="w-4 h-4 text-gold shrink-0 mt-0.5" />
        <p className="text-xs text-ink leading-relaxed">
          O pagamento de RUPE gera um <strong>DAR</strong> (Documento de Arrecadação de Receitas). A app não gera a RUPE — paga uma referência já emitida pela AGT. Não há conciliação automática.
        </p>
      </div>
      {rupeInvoices.map((inv) => (
        <div key={inv.id} className="bg-surface border border-line rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Landmark className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-ink truncate">{inv.issuer_name}</p>
            <p className="text-xs text-muted-2 font-mono">RUPE: {inv.reference || '—'}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-mono font-semibold text-ink">{formatKz(inv.amount)}</p>
            <Button size="sm" onClick={() => onPay(inv)} className="h-7 text-xs px-2.5 mt-1">
              <Landmark className="w-3 h-3 mr-1" />
              Pagar
            </Button>
          </div>
        </div>
      ))}
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