import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appApi } from '@/api/appClient';
import { formatKz, formatKzShort, getFirstName, formatDateShort } from '@/lib/format';
import { Plus, FileText, CreditCard, Building2, AlertTriangle } from 'lucide-react';
import { filterVisibleInvoices } from '@/lib/business/partnerVisibility';
import CategoryIcon from '@/components/app/CategoryIcon';

const dedLabels = {
  saude: { label: 'Saúde', emoji: '🏥' },
  educacao: { label: 'Educação', emoji: '🎓' },
  habitacao: { label: 'Renda', emoji: '🏠' },
  pensao_alimentos: { label: 'Pensão', emoji: '👨‍👩‍👧' },
  previdencia: { label: 'Previdência', emoji: '🛡️' },
};

const accountEmoji = (acct) => {
  const name = (acct.bank_name || acct.name || '').toLowerCase();
  if (acct.type === 'cash' || name.includes('numerário') || name.includes('cash')) return '💵';
  if (name.includes('express') || name.includes('mcx')) return '📲';
  if (name.includes('unitel') || name.includes('money')) return '📶';
  return '🏦';
};

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pendingInvoices, setPendingInvoices] = useState([]);
  const [deductibleTotal, setDeductibleTotal] = useState(0);
  const [deductibleBreakdown, setDeductibleBreakdown] = useState([]);
  const [invoicesWithoutNif, setInvoicesWithoutNif] = useState(0);
  const [monthIncome, setMonthIncome] = useState(0);
  const [monthExpense, setMonthExpense] = useState(0);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [me, accts, txns, rawInvoices, consents, subs, cats] = await Promise.all([
        appApi.auth.me(),
        appApi.entities.Account.list(),
        appApi.entities.Transaction.list('-date', 50),
        appApi.entities.Invoice.list(),
        appApi.entities.PartnerConsent.list(),
        appApi.entities.Subscription.filter({ status: 'active' }),
        appApi.entities.Category.list(),
      ]);

      setUser(me);
      setAccounts(accts);
      setTransactions(txns.slice(0, 5));
      setCategories(cats);

      const allInvoices = filterVisibleInvoices(rawInvoices, {
        consents,
        hasActiveSubscription: subs.some((s) => s.user_id === me.id),
      });

      const pending = allInvoices
        .filter((i) => i.status === 'pending' || i.status === 'overdue')
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
      setPendingInvoices(pending);

      const deductibles = allInvoices.filter(
        (i) => i.deductible_type && i.deductible_type !== 'none' && i.has_nif !== false && i.status === 'paid'
      );
      const total = deductibles.reduce((sum, i) => sum + (i.amount || 0), 0);
      setDeductibleTotal(total);

      const breakdown = Object.keys(dedLabels).map((key) => ({
        key,
        ...dedLabels[key],
        amount: deductibles.filter((i) => i.deductible_type === key).reduce((s, i) => s + (i.amount || 0), 0),
      })).filter((b) => b.amount > 0);
      setDeductibleBreakdown(breakdown);

      setInvoicesWithoutNif(allInvoices.filter((i) => i.has_nif === false).length);

      const now = new Date();
      const monthTxns = txns.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
      setMonthIncome(monthTxns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0));
      setMonthExpense(monthTxns.filter((t) => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0));
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }

  const patrimonio = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  const pendingTotal = pendingInvoices.reduce((s, i) => s + (i.amount || 0), 0);
  const urgentCount = pendingInvoices.filter((i) => i.status === 'overdue').length;
  const disponibilidade = patrimonio - pendingTotal;
  const monthName = new Date().toLocaleDateString('pt-PT', { month: 'long' });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-line border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {/* ===== Balance hero ===== */}
      <div className="rounded-[22px] p-[18px] bg-gradient-to-br from-primary to-primary-2 text-[#eafff7] shadow-talao relative overflow-hidden">
        <div className="absolute -right-8 -top-10 w-[150px] h-[150px] rounded-full bg-white/10" />
        <div className="relative">
          <div className="text-[12.5px] text-[#bfe9db]">
            Património · {accounts.length} {accounts.length === 1 ? 'conta' : 'contas'}
          </div>
          <div className="font-mono text-[30px] font-semibold tracking-tight mt-1">
            {Math.round(patrimonio).toLocaleString('pt-AO')} Kz
          </div>
          <div className="flex gap-2.5 mt-4">
            <div className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2.5">
              <div className="text-[11px] text-[#cdeee2]">Recebido em {monthName}</div>
              <div className="font-mono text-[15px] font-semibold mt-0.5">
                +{Math.round(monthIncome).toLocaleString('pt-AO')}
              </div>
            </div>
            <div className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2.5">
              <div className="text-[11px] text-[#cdeee2]">Gasto em {monthName}</div>
              <div className="font-mono text-[15px] font-semibold mt-0.5">
                {Math.round(monthExpense).toLocaleString('pt-AO')}
              </div>
            </div>
          </div>
          {pendingInvoices.length > 0 && (
            <div
              className={`flex items-center gap-2 mt-3 rounded-xl px-3 py-2 ${
                disponibilidade >= 0 ? 'bg-white/10' : 'bg-danger-soft/90'
              }`}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${disponibilidade >= 0 ? 'bg-green-soft' : 'bg-destructive'}`} />
              <span className={`text-[12.5px] font-medium ${disponibilidade >= 0 ? 'text-[#cdeee2]' : 'text-destructive'}`}>
                {disponibilidade >= 0
                  ? 'Contas deste mês cobertas'
                  : `Faltam ${Math.round(Math.abs(disponibilidade)).toLocaleString('pt-AO')} Kz para as contas deste mês`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ===== A pagar ===== */}
      {pendingInvoices.length > 0 && (
        <Link
          to="/app/pagamentos"
          className={`block rounded-talao p-4 shadow-soft border ${
            urgentCount > 0 ? 'bg-danger-soft border-[#f0c9c2]' : 'bg-gold-soft border-[#f0dcb4]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading text-[15px] font-semibold">A pagar</h3>
            <span className="eyebrow ml-auto mr-2">Prazo mais próximo</span>
            <span className="text-[12.5px] font-semibold text-primary">Ver</span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <div className="font-mono text-[23px] font-semibold text-destructive">
                {Math.round(pendingTotal).toLocaleString('pt-AO')} Kz
              </div>
              <div className="text-[12.5px] text-muted-foreground mt-0.5">
                {pendingInvoices.length} {pendingInvoices.length === 1 ? 'fatura' : 'faturas'}
                {urgentCount > 0 && ' · em atraso'}
              </div>
            </div>
            {urgentCount > 0 && (
              <span className="pill-late text-[11px] font-bold px-2.5 py-1 rounded-full">
                {urgentCount} {urgentCount === 1 ? 'urgente' : 'urgentes'}
              </span>
            )}
          </div>
        </Link>
      )}

      {/* ===== Accounts horizontal scroll ===== */}
      <div className="flex gap-2.5 overflow-x-auto pb-1 pt-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {accounts.map((acct) => (
          <div
            key={acct.id}
            className="shrink-0 bg-surface border border-line rounded-[14px] px-3.5 py-3 min-w-[118px] shadow-soft"
          >
            <div className="text-[15px]">{accountEmoji(acct)}</div>
            <div className="text-[11.5px] text-muted-foreground mt-1.5 truncate">
              {acct.name || acct.bank_name}
            </div>
            <div className="font-mono text-sm font-semibold mt-0.5">
              {Math.round(acct.balance || 0).toLocaleString('pt-AO')}
            </div>
          </div>
        ))}
        <Link
          to="/app/contas"
          className="shrink-0 bg-surface border border-line rounded-[14px] min-w-[52px] flex items-center justify-center text-primary text-xl shadow-soft"
        >
          +
        </Link>
      </div>

      {/* ===== Quick actions ===== */}
      <div className="flex gap-2.5">
        <QuickAction to="/app/adicionar" icon={Plus} label="Registar" />
        <QuickAction to="/app/documentos" icon={FileText} label="Documento" />
        <QuickAction to="/app/pagamentos" icon={CreditCard} label="Pagar" />
        <QuickAction to="/app/pagamentos" icon={Building2} label="Conectar" />
      </div>

      {/* ===== Dedutível IRPS ===== */}
      <div className="bg-gold-soft border border-[#e6cfa0] rounded-talao p-4 shadow-soft">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading text-[15px] font-semibold">💰 Dedutível no IRPS</h3>
          <Link to="/app/dedutiveis" className="text-[12.5px] font-semibold text-[#8a6420]">
            Ver
          </Link>
        </div>
        <div className="font-mono text-[23px] font-semibold text-[#7a5210]">
          {Math.round(deductibleTotal).toLocaleString('pt-AO')} Kz
        </div>
        <div className="text-[12.5px] text-[#8a6420] mt-0.5 leading-relaxed">
          Guardaste em despesas dedutíveis este ano. Conta para a declaração de {new Date().getFullYear() + 1}.
        </div>
        {deductibleBreakdown.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {deductibleBreakdown.map((b) => (
              <span
                key={b.key}
                className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-surface text-[#8a6420]"
              >
                {b.emoji} {b.label} {Math.round(b.amount).toLocaleString('pt-AO')}
              </span>
            ))}
          </div>
        )}
        {invoicesWithoutNif > 0 && (
          <div className="flex items-center gap-2 bg-surface rounded-[11px] px-3 py-2.5 mt-2.5">
            <AlertTriangle className="w-4 h-4 text-[#8a6420] shrink-0" />
            <div className="text-[12px] text-[#8a6420] leading-snug flex-1">
              <b>{invoicesWithoutNif} {invoicesWithoutNif === 1 ? 'fatura sem' : 'faturas sem'} o teu NIF.</b> Sem NIF não contam.
            </div>
            <Link to="/app/dedutiveis" className="text-[12.5px] font-semibold text-[#8a6420]">
              Rever
            </Link>
          </div>
        )}
      </div>

      {/* ===== Movimentos recentes ===== */}
      <div className="bg-surface border border-line rounded-talao overflow-hidden shadow-soft">
        <div className="flex items-center justify-between px-4 pt-4 pb-1">
          <h3 className="font-heading text-[15px] font-semibold">Movimentos recentes</h3>
          <span className="eyebrow ml-auto mr-2">Últimos 7 dias</span>
          <Link to="/app/transacoes" className="text-[12.5px] font-semibold text-primary">
            Tudo
          </Link>
        </div>
        <div className="px-3 pb-2">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Sem movimentos recentes.
            </div>
          ) : (
            transactions.map((t) => {
              const isIncome = t.amount > 0;
              const category = categories.find((c) => c.id === t.category_id);
              return (
                <div
                  key={t.id}
                  className="flex items-center gap-3 py-3 border-t border-line first:border-t-0"
                >
                  <div
                    className={`w-[42px] h-[42px] rounded-full flex items-center justify-center shrink-0 ${
                      isIncome ? 'bg-green-soft text-ok' : 'bg-danger-soft text-destructive'
                    }`}
                  >
                    <CategoryIcon category={category} isIncome={isIncome} className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-ink truncate">{t.description}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-muted-foreground">{formatDateShort(t.date)}</span>
                    </div>
                  </div>
                  <div
                    className={`font-mono font-semibold text-[15px] text-right shrink-0 ${
                      isIncome ? 'text-ok' : 'text-destructive'
                    }`}
                  >
                    {isIncome ? '+' : '−'}{Math.round(Math.abs(t.amount)).toLocaleString('pt-AO')}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function QuickAction({ to, icon: Icon, label }) {
  return (
    <Link
      to={to}
      className="flex-1 bg-surface border border-line rounded-[14px] py-3 px-1.5 text-center shadow-soft"
    >
      <div className="w-[38px] h-[38px] rounded-[11px] bg-[#e9f3ee] text-primary flex items-center justify-center mx-auto mb-1.5">
        <Icon className="w-[18px] h-[18px]" />
      </div>
      <div className="text-[11.5px] font-semibold">{label}</div>
    </Link>
  );
}