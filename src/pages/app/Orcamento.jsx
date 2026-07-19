import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  PieChart, Plus, AlertTriangle, Lightbulb, Loader2, Pencil, X, Target, BarChart3, Download, FileText, TrendingUp,
} from 'lucide-react';
import { formatKz } from '@/lib/format';
import Seo from '@/components/Seo';

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
        base44.entities.Budget.filter({ month }),
        base44.entities.Category.list(),
        base44.entities.Transaction.list('-date', 200),
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
        await base44.entities.Budget.update(existing.id, { limit });
      } else {
        await base44.entities.Budget.create({
          category_id: categoryId, category_name: categoryName, month, limit, spent: 0,
        });
      }
      setEditing(null);
      setNewLimit('');
      load();
    } catch (err) { console.error(err); }
  };

  const removeBudget = async (budgetId) => {
    try {
      await base44.entities.Budget.delete(budgetId);
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
      const res = await base44.integrations.Core.InvokeLLM({ prompt });
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

  return (
    <div className="space-y-4">
      <Seo title="Orçamento" description="Define limites mensais por categoria e acompanha os teus gastos." path="/app/orcamento" />

      {/* Header */}
      <div>
        <span className="eyebrow">§ 03 · Limites e metas</span>
        <h1 className="font-heading text-2xl font-bold text-ink mt-1">Orçamento</h1>
        <p className="text-sm text-muted-foreground mt-0.5 capitalize">
          {now.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-surface border border-line rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-primary text-white' : 'text-muted-foreground hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== Tab: Orçamento ===== */}
      {activeTab === 'orcamento' && (
        <div className="space-y-3.5">
          {/* Total card soft-gold */}
          <div className="bg-gold-soft border border-[#f0dcb4] rounded-talao p-4 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <span className="eyebrow">Total do mês</span>
              <span className={`text-sm font-bold ${totalPct > 90 ? 'text-destructive' : totalPct > 75 ? 'text-[#9a6a16]' : 'text-ok'}`}>
                {totalPct}%
              </span>
            </div>
            <div className="flex items-end justify-between mb-3">
              <div>
                <div className="font-mono text-[23px] font-semibold text-ink">{formatKz(totalSpent)}</div>
                <div className="text-[12.5px] text-muted-foreground mt-0.5">de {formatKz(totalLimit)}</div>
              </div>
            </div>
            <div className="track-v5">
              <i style={{ width: `${Math.min(totalPct, 100)}%`, background: totalPct > 90 ? 'hsl(var(--destructive))' : totalPct > 75 ? 'hsl(var(--accent))' : 'hsl(var(--primary))' }} />
            </div>
          </div>

          {/* Budget bars */}
          <div className="bg-surface border border-line rounded-talao overflow-hidden shadow-soft">
            <div className="px-4 pt-4 pb-1">
              <span className="eyebrow">Por categoria</span>
            </div>
            <div className="px-4 pb-3">
              {budgets.length === 0 && unbudgetedCats.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Sem categorias de despesa. Cria categorias na página de Transações.
                </div>
              )}
              {budgets.map((b) => {
                const pct = b.limit > 0 ? Math.round((b.spent / b.limit) * 100) : 0;
                const over = pct > 100;
                return (
                  <div key={b.id} className="py-3 border-t border-line first:border-t-0">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="text-base">{b.category_icon || '💳'}</span>
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
                          <button onClick={() => removeBudget(b.id)} className="p-1 text-muted-2 hover:text-destructive">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="track-v5">
                      <i style={{ width: `${Math.min(pct, 100)}%`, background: over ? 'hsl(var(--destructive))' : pct > 75 ? 'hsl(var(--accent))' : 'hsl(var(--primary))' }} />
                    </div>
                    <p className={`text-[11.5px] mt-1.5 ${over ? 'text-destructive' : 'text-muted-2'}`}>
                      {over ? `Ultrapassado em ${formatKz(b.spent - b.limit)}` : `Restam ${formatKz(b.limit - b.spent)}`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

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
          <div className="bg-[#e9f3ee] border border-[#c8e6d5] rounded-talao p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Lightbulb className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-primary mb-1">Insights IA</div>
                {insight ? (
                  <p className="text-sm text-ink leading-relaxed">{insight}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Gera um insight personalizado sobre os teus gastos deste mês.</p>
                )}
              </div>
              <button onClick={generateInsight} disabled={loadingInsight || budgets.length === 0} className="px-3 py-1.5 border border-primary/20 rounded-lg text-xs font-medium text-primary hover:bg-primary/5 disabled:opacity-50">
                {loadingInsight ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Gerar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Tab: Metas ===== */}
      {activeTab === 'metas' && (
        <div className="space-y-3.5">
          <div className="bg-surface border border-dashed border-line rounded-talao p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-gold-soft flex items-center justify-center mx-auto mb-3">
              <Target className="w-7 h-7 text-[#9a6a16]" />
            </div>
            <h3 className="font-heading font-semibold text-ink">Sem metas ativas</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
              Define um objetivo de poupança — como um fundo de emergência — e acompanha o teu progresso mensal.
            </p>
            <button className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium">
              <Plus className="w-4 h-4" /> Nova meta
            </button>
          </div>
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
              Total gasto este mês: <b className="font-mono text-ink">{formatKz(totalSpent)}</b>.
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
    </div>
  );
}