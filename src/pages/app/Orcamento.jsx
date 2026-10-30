import React, { useState, useEffect } from 'react';
import { appApi } from '@/api/appClient';
import {
  PieChart, Plus, AlertTriangle, Lightbulb, Loader2, Pencil, X, Target, BarChart3, Download, FileText, TrendingUp,
  ShoppingCart, Car, Heart, GraduationCap, Home, CreditCard, Wallet, UtensilsCrossed, Bus, Pill, BookOpen, House,
  Smartphone, Zap, Droplet, ShoppingBag, Plane, Gift, Dumbbell, Coffee, Film, Gamepad2, PawPrint, Baby,
} from 'lucide-react';

const ICON_MAP = {
  ShoppingCart, Car, Heart, GraduationCap, Home, CreditCard, Wallet, UtensilsCrossed, Bus, Pill, BookOpen, House,
  Smartphone, Zap, Droplet, ShoppingBag, Plane, Gift, Dumbbell, Coffee, Film, Gamepad2, PawPrint, Baby,
};

function CategoryIcon({ name, className = 'w-[18px] h-[18px]' }) {
  const Icon = ICON_MAP[name] || CreditCard;
  return <Icon className={className} strokeWidth={1.8} />;
}
import { formatKz } from '@/lib/format';
import Seo from '@/components/Seo';
import ConfirmDeleteDialog from '@/components/app/ConfirmDeleteDialog';
import GoalRing from '@/components/app/ui/GoalRing';

const mockGoals = [
  { id: 1, name: 'Fundo de emergência', current: 310000, target: 500000, pct: 62, deadline: 'dezembro', suggestion: 32000, color: '#E68F33' },
  { id: 2, name: 'Viagem em família', current: 140000, target: 500000, pct: 28, deadline: 'abril', suggestion: 45000, color: '#4C7A53' },
];

const CURRENT_MONTH = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const tabs = [
  { id: 'orcamento', label: 'Orçamento' },
  { id: 'metas', label: 'Metas' },
  { id: 'relatorios', label: 'Relatórios' },
];

export default function Orcamento() {
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState([]);
  const [budgetToDelete, setBudgetToDelete] = useState(null);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [insight, setInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [editing, setEditing] = useState(null);
  const [newLimit, setNewLimit] = useState('');
  const [activeTab, setActiveTab] = useState('orcamento');

  const month = CURRENT_MONTH();

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [budgetsData, cats, txns] = await Promise.all([
        appApi.entities.Budget.filter({ month }),
        appApi.entities.Category.list(),
        appApi.entities.Transaction.list('-date', 200),
      ]);
      setCategories(cats.filter((c) => c.type === 'expense'));
      setTransactions(txns);

      const now = new Date();
      const monthTxns = txns.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && t.amount < 0;
      });

      const spentByCat = {};
      monthTxns.forEach((t) => {
        const catId = t.category_id || 'sem_categoria';
        spentByCat[catId] = (spentByCat[catId] || 0) + Math.abs(t.amount);
      });

      const enriched = budgetsData.map((b) => ({
        ...b,
        spent: spentByCat[b.category_id] || 0,
        category_name: b.category_name || cats.find((c) => c.id === b.category_id)?.name || 'Categoria',
        category_icon: cats.find((c) => c.id === b.category_id)?.icon || '💳',
      }));
      setBudgets(enriched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const totalLimit = budgets.reduce((s, b) => s + (b.limit || 0), 0);
  const totalSpent = budgets.reduce((s, b) => s + (b.spent || 0), 0);
  const totalPct = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

  const saveLimit = async (categoryId, categoryName) => {
    const limit = parseFloat(newLimit);
    if (!limit || limit <= 0) return;
    try {
      const existing = budgets.find((b) => b.category_id === categoryId);
      if (existing) {
        await appApi.entities.Budget.update(existing.id, { limit });
      } else {
        await appApi.entities.Budget.create({
          category_id: categoryId, category_name: categoryName, month, limit, spent: 0,
        });
      }
      setEditing(null);
      setNewLimit('');
      load();
    } catch (err) { console.error(err); }
  };

  const removeBudget = async () => {
    const budgetId = budgetToDelete?.id;
    setBudgetToDelete(null);
    try {
      await appApi.entities.Budget.delete(budgetId);
      setBudgets((prev) => prev.filter((b) => b.id !== budgetId));
    } catch (err) { console.error(err); }
  };

  const generateInsight = async () => {
    setLoadingInsight(true);
    try {
      const budgetSummary = budgets
        .map((b) => `${b.category_name}: gastou ${formatKz(b.spent)} de ${formatKz(b.limit)} (${Math.round((b.spent / b.limit) * 100)}%)`)
        .join('; ');
      const prompt = `És um assistente financeiro para um utilizador angolano. Analisa este orçamento mensal e dá UM insight curto (máx 2 frases) em português de Angola, direto e útil. Não inventes valores nem prometas poupança fiscal. Dados: ${budgetSummary}. Total gasto: ${formatKz(totalSpent)} de ${formatKz(totalLimit)}.`;
      const res = await appApi.integrations.Core.InvokeLLM({ prompt });
      setInsight(typeof res === 'string' ? res : res?.response || '');
    } catch (err) { console.error(err); }
    finally { setLoadingInsight(false); }
  };

  const exportCsv = () => {
    const now = new Date();
    const monthTxns = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const rows = [['Categoria', 'Gasto (Kz)', 'Limite (Kz)', 'Percentagem']];
    budgets.forEach((b) => {
      const pct = b.limit > 0 ? Math.round((b.spent / b.limit) * 100) : 0;
      rows.push([b.category_name, b.spent.toFixed(2), b.limit.toFixed(2), `${pct}%`]);
    });
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orcamento-${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-line border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const unbudgetedCats = categories.filter((c) => !budgets.some((b) => b.category_id === c.id));

  // Report data: spending by category
  const now = new Date();
  const monthExpenses = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && t.amount < 0;
  });
  const byCategory = {};
  monthExpenses.forEach((t) => {
    const catName = categories.find((c) => c.id === t.category_id)?.name || 'Sem categoria';
    byCategory[catName] = (byCategory[catName] || 0) + Math.abs(t.amount);
  });
  const reportRows = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const maxReportAmount = reportRows.length > 0 ? reportRows[0][1] : 1;
  const actualMonthExpense = monthExpenses.reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div className="space-y-4">
      <Seo title="Orçamento" description="Define limites mensais por categoria e acompanha os teus gastos." path="/app/orcamento" />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="eyebrow">§ 03 · Limites e metas</span>
          <h1 className="font-heading text-2xl font-bold text-ink mt-1">Planeamento</h1>
          <p className="text-sm text-muted-foreground mt-0.5 capitalize">
            {now.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary text-white rounded-full text-sm font-medium btn-hover btn-primary-hover shrink-0">
          <Plus className="w-4 h-4" /> Novo
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-surface border border-line rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
              activeTab === tab.id ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== Tab: Orçamento ===== */}
      {activeTab === 'orcamento' && (
        <div className="space-y-3.5">
          {/* Total card */}
          <div className="bg-surface border border-line rounded-talao p-4 shadow-soft">
            <div className="flex items-start justify-between mb-2.5">
              <div>
                <p className="text-[13px] text-muted-foreground">Gasto de {formatKz(totalLimit)} orçamentados</p>
                <p className="font-mono text-[26px] font-bold text-ink mt-0.5 leading-tight">{formatKz(totalSpent)}</p>
              </div>
              <span className={`text-[15px] font-bold ${totalPct > 100 ? 'text-destructive' : totalPct > 75 ? 'text-[#9a6a16]' : 'text-ok'}`}>
                {totalPct}%
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${Math.min(totalPct, 100)}%`, background: totalPct > 100 ? 'hsl(var(--destructive))' : totalPct > 75 ? 'hsl(var(--accent))' : 'hsl(var(--primary))' }} />
            </div>
          </div>

          {/* Category cards */}
          {budgets.length === 0 && unbudgetedCats.length === 0 && (
            <div className="bg-surface border border-line rounded-talao p-6 text-center text-sm text-muted-foreground">
              Sem categorias de despesa. Cria categorias na página de Transações.
            </div>
          )}
          {budgets.map((b) => {
            const pct = b.limit > 0 ? Math.round((b.spent / b.limit) * 100) : 0;
            const over = pct > 100;
            const barColor = over ? 'hsl(var(--destructive))' : pct > 75 ? 'hsl(var(--accent))' : 'hsl(var(--primary))';
            return (
              <div key={b.id} className="bg-surface border border-line rounded-talao p-4 shadow-soft">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-[38px] h-[38px] rounded-[11px] bg-[#EDF2F2] flex items-center justify-center shrink-0 text-ink">
                    <CategoryIcon name={b.category_icon} />
                  </div>
                  <span className="flex-1 font-semibold text-sm text-ink">{b.category_name}</span>
                  {over && <AlertTriangle className="w-3.5 h-3.5 text-destructive" />}
                  {editing === b.category_id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={newLimit}
                        onChange={(e) => setNewLimit(e.target.value)}
                        className="w-24 px-2 py-1 text-xs border border-line rounded-lg font-mono"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && saveLimit(b.category_id, b.category_name)}
                      />
                      <button onClick={() => saveLimit(b.category_id, b.category_name)} className="p-1 text-primary">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setEditing(null)} className="p-1 text-muted-2">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{formatKz(b.spent)} / {formatKz(b.limit)}</span>
                      <button onClick={() => { setEditing(b.category_id); setNewLimit(String(b.limit)); }} className="p-1 text-muted-2 hover:text-primary">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setBudgetToDelete(b)} className="p-1 text-muted-2 hover:text-destructive">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: barColor }} />
                </div>
                <p className={`text-[11.5px] mt-2 ${over ? 'text-destructive' : 'text-muted-2'}`}>
                  {over ? `Ultrapassado em ${formatKz(b.spent - b.limit)}` : `Restam ${formatKz(b.limit - b.spent)}`}
                </p>
              </div>
            );
          })}

          {/* Add budget */}
          {unbudgetedCats.length > 0 && (
            <div className="bg-surface border border-dashed border-line rounded-talao p-4">
              <div className="flex items-center gap-2 mb-3">
                <Plus className="w-4 h-4 text-muted-2" />
                <span className="text-sm font-medium text-ink">Definir limite para categoria</span>
              </div>
              <div className="flex gap-2">
                <select id="new-budget-cat" className="flex-1 px-3 py-2 text-sm border border-line rounded-lg bg-surface" defaultValue="">
                  <option value="" disabled>Escolhe uma categoria</option>
                  {unbudgetedCats.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
                <input type="number" id="new-budget-limit" className="w-32 px-3 py-2 text-sm border border-line rounded-lg font-mono" placeholder="Limite Kz" />
                <button onClick={() => {
                  const sel = document.getElementById('new-budget-cat');
                  const lim = document.getElementById('new-budget-limit');
                  const cat = unbudgetedCats.find((c) => c.id === sel.value);
                  if (cat) { setNewLimit(lim.value); saveLimit(cat.id, cat.name); }
                }} className="px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* AI Insight */}
          <div className="bg-surface border border-line rounded-talao p-4 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-bold text-ink">Insights IA</span>
              <button onClick={generateInsight} disabled={loadingInsight || budgets.length === 0} className="text-[12px] font-medium text-primary hover:underline disabled:opacity-50">
                {loadingInsight ? <Loader2 className="w-3.5 h-3.5 animate-spin inline" /> : 'Assistente'}
              </button>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                {insight ? (
                  <p className="text-[13px] text-ink leading-relaxed">{insight}</p>
                ) : (
                  <p className="text-[13px] text-muted-foreground leading-relaxed">Gera um insight personalizado sobre os teus gastos deste mês.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Tab: Metas ===== */}
      {activeTab === 'metas' && (
        <div className="space-y-3.5">
          {mockGoals.map((goal) => (
            <div key={goal.id} className="bg-surface border border-line rounded-talao p-4 shadow-soft flex items-center gap-4">
              <GoalRing pct={goal.pct} color={goal.color} label={`${goal.pct}%`} />
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-bold text-[15px] text-ink">{goal.name}</h3>
                <p className="text-[12.5px] text-muted-foreground mt-0.5">
                  {formatKz(goal.current)} / {formatKz(goal.target)} Kz · até {goal.deadline}
                </p>
                <p className="text-[12px] text-ink mt-1.5">
                  Sugestão: poupa <span className="font-mono font-bold text-ink">{formatKz(goal.suggestion)}</span> por mês
                </p>
              </div>
            </div>
          ))}
          <button className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-talao text-sm font-medium btn-hover btn-primary-hover">
            <Plus className="w-4 h-4" /> Nova meta
          </button>
        </div>
      )}

      {/* ===== Tab: Relatórios ===== */}
      {activeTab === 'relatorios' && (
        <div className="space-y-3.5">
          <div className="bg-surface border border-line rounded-talao p-4 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="eyebrow">Gasto por categoria</span>
                <h3 className="font-heading font-semibold text-ink mt-0.5 capitalize">{now.toLocaleDateString('pt-PT', { month: 'long' })}</h3>
              </div>
              <BarChart3 className="w-5 h-5 text-muted-2" />
            </div>
            {reportRows.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">Sem despesas registadas este mês.</div>
            ) : (
              <div className="space-y-3">
                {reportRows.map(([name, amount]) => (
                  <div key={name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-medium text-ink">{name}</span>
                      <span className="font-mono text-[13px] text-muted-foreground">{formatKz(amount)}</span>
                    </div>
                    <div className="track-v5">
                      <i style={{ width: `${(amount / maxReportAmount) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nota comparativa */}
          <div className="bg-surface border border-line rounded-talao p-4 shadow-soft">
            <div className="flex items-center gap-2.5 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-[13px] font-semibold text-ink">Comparativo</span>
            </div>
            <p className="text-[12.5px] text-muted-foreground leading-relaxed">
              Total gasto este mês: <b className="font-mono text-ink">{formatKz(actualMonthExpense)}</b>.
              {' '}{totalLimit > 0 && (totalPct > 100
                ? `Ultrapassaste o orçamento em ${formatKz(totalSpent - totalLimit)}.`
                : `Estás a ${100 - totalPct}% do teu limite total de ${formatKz(totalLimit)}.`
              )}
            </p>
          </div>

          {/* Export buttons */}
          <div className="flex gap-2.5">
            <button onClick={exportCsv} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-surface border border-line rounded-xl text-sm font-medium text-ink hover:bg-muted transition-colors">
              <Download className="w-4 h-4" /> CSV
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-surface border border-line rounded-xl text-sm font-medium text-muted-2">
              <FileText className="w-4 h-4" /> PDF
            </button>
          </div>
        </div>
      )}

      <ConfirmDeleteDialog
        open={!!budgetToDelete}
        title="Apagar orçamento?"
        description={budgetToDelete ? `Vais apagar o orçamento "${budgetToDelete.category_name}" de ${formatKz(budgetToDelete.limit)}. Esta ação não pode ser desfeita.` : ''}
        onCancel={() => setBudgetToDelete(null)}
        onConfirm={removeBudget}
      />
    </div>
  );
}