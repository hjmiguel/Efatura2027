import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  PieChart, Plus, TrendingUp, AlertTriangle, Lightbulb, Loader2, Pencil, X,
} from 'lucide-react';
import { formatKz } from '@/lib/format';
import Seo from '@/components/Seo';

const CURRENT_MONTH = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function Orcamento() {
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [insight, setInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [editing, setEditing] = useState(null); // category_id being edited
  const [newLimit, setNewLimit] = useState('');

  const month = CURRENT_MONTH();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const [budgetsData, cats, txns] = await Promise.all([
        base44.entities.Budget.filter({ month }),
        base44.entities.Category.list(),
        base44.entities.Transaction.list('-date', 200),
      ]);
      setCategories(cats.filter((c) => c.type === 'expense'));
      setTransactions(txns);

      // Calculate spent per category for current month
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
          category_id: categoryId,
          category_name: categoryName,
          month,
          limit,
          spent: 0,
        });
      }
      setEditing(null);
      setNewLimit('');
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const removeBudget = async (budgetId) => {
    try {
      await base44.entities.Budget.delete(budgetId);
      setBudgets((prev) => prev.filter((b) => b.id !== budgetId));
    } catch (err) {
      console.error(err);
    }
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInsight(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-line border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const unbudgetedCats = categories.filter((c) => !budgets.some((b) => b.category_id === c.id));

  return (
    <div className="space-y-6">
      <Seo title="Orçamento" description="Define limites mensais por categoria e acompanha os teus gastos." path="/app/orcamento" />

      <div>
        <h1 className="font-heading text-2xl font-bold text-ink">Orçamento</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {new Date().toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Total progress */}
      <div className="bg-surface border border-line rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary" />
            <span className="font-medium text-ink">Total do mês</span>
          </div>
          <span className={`text-sm font-medium ${totalPct > 90 ? 'text-destructive' : totalPct > 75 ? 'text-gold' : 'text-ok'}`}>
            {totalPct}%
          </span>
        </div>
        <Progress value={totalPct} className="h-3" />
        <div className="flex justify-between mt-2">
          <span className="font-mono text-sm text-ink">{formatKz(totalSpent)}</span>
          <span className="font-mono text-sm text-muted-2">{formatKz(totalLimit)}</span>
        </div>
      </div>

      {/* AI Insight */}
      <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            {insight ? (
              <p className="text-sm text-ink leading-relaxed">{insight}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Gera um insight personalizado sobre os teus gastos deste mês.
              </p>
            )}
          </div>
          <Button size="sm" variant="outline" onClick={generateInsight} disabled={loadingInsight || budgets.length === 0}>
            {loadingInsight ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Category budgets */}
      <div className="space-y-3">
        {budgets.length === 0 && unbudgetedCats.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">Sem categorias de despesa. Cria categorias na página de Transações.</p>
          </div>
        )}

        {budgets.map((b) => {
          const pct = b.limit > 0 ? Math.round((b.spent / b.limit) * 100) : 0;
          const over = pct > 100;
          return (
            <div key={b.id} className="bg-surface border border-line rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-ink">{b.category_name}</span>
                  {over && <AlertTriangle className="w-4 h-4 text-destructive" />}
                </div>
                <div className="flex items-center gap-2">
                  {editing === b.category_id ? (
                    <>
                      <input
                        type="number"
                        value={newLimit}
                        onChange={(e) => setNewLimit(e.target.value)}
                        className="w-28 px-2 py-1 text-sm border border-line rounded-lg font-mono"
                        placeholder="Novo limite"
                        autoFocus
                      />
                      <Button size="sm" className="h-7 px-2" onClick={() => saveLimit(b.category_id, b.category_name)}>
                        OK
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setEditing(null)}>
                        <X className="w-3 h-3" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="font-mono text-sm text-muted-2">{formatKz(b.spent)} / {formatKz(b.limit)}</span>
                      <button onClick={() => { setEditing(b.category_id); setNewLimit(String(b.limit)); }} className="p-1 text-muted-2 hover:text-primary">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => removeBudget(b.id)} className="p-1 text-muted-2 hover:text-destructive">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <Progress value={Math.min(pct, 100)} className={`h-2 ${over ? '[&>div]:bg-destructive' : pct > 75 ? '[&>div]:bg-gold' : ''}`} />
              <p className={`text-xs mt-1 ${over ? 'text-destructive' : 'text-muted-2'}`}>
                {over ? `Ultrapassado em ${formatKz(b.spent - b.limit)}` : `Restam ${formatKz(b.limit - b.spent)}`}
              </p>
            </div>
          );
        })}

        {/* Add new budget */}
        {unbudgetedCats.length > 0 && (
          <div className="bg-surface border border-dashed border-line rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Plus className="w-4 h-4 text-muted-2" />
              <span className="text-sm font-medium text-ink">Definir limite para categoria</span>
            </div>
            <div className="flex gap-2">
              <select
                id="new-budget-cat"
                className="flex-1 px-3 py-2 text-sm border border-line rounded-lg bg-surface"
                defaultValue=""
              >
                <option value="" disabled>Escolhe uma categoria</option>
                {unbudgetedCats.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <input
                type="number"
                id="new-budget-limit"
                className="w-32 px-3 py-2 text-sm border border-line rounded-lg font-mono"
                placeholder="Limite Kz"
              />
              <Button
                onClick={() => {
                  const sel = document.getElementById('new-budget-cat');
                  const lim = document.getElementById('new-budget-limit');
                  const cat = unbudgetedCats.find((c) => c.id === sel.value);
                  if (cat) {
                    setNewLimit(lim.value);
                    saveLimit(cat.id, cat.name);
                  }
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}