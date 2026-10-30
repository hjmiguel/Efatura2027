import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { appApi } from '@/api/appClient';
import { formatKz, formatDateShort, formatDate } from '@/lib/format';
import TransactionForm from '@/components/app/TransactionForm';
import { Plus, Search, Trash2, Pencil } from 'lucide-react';
import CategoryIcon from '@/components/app/CategoryIcon';
import ConfirmDeleteDialog from '@/components/app/ConfirmDeleteDialog';
import { toast } from '@/components/ui/use-toast';

const typeTabs = [
  { id: 'all', label: 'Todas' },
  { id: 'income', label: 'Receitas' },
  { id: 'expense', label: 'Despesas' },
];

export default function Transacoes() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [accountFilter, setAccountFilter] = useState('all');
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (searchParams.get('adicionar') === '1') {
      setEditing(null);
      setFormOpen(true);
      searchParams.delete('adicionar');
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  async function loadData() {
    try {
      const [txns, accts, cats] = await Promise.all([
        appApi.entities.Transaction.list('-date', 200),
        appApi.entities.Account.list(),
        appApi.entities.Category.list(),
      ]);
      setTransactions(txns);
      setAccounts(accts);
      setCategories(cats);
    } catch (err) { console.error('Erro ao carregar:', err); }
    finally { setLoading(false); }
  }

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (search && !t.description?.toLowerCase().includes(search.toLowerCase())) return false;
      if (typeFilter === 'income' && !(t.amount > 0)) return false;
      if (typeFilter === 'expense' && !(t.amount < 0)) return false;
      if (categoryFilter !== 'all' && t.category_id !== categoryFilter) return false;
      if (accountFilter !== 'all' && t.account_id !== accountFilter) return false;
      return true;
    });
  }, [transactions, search, typeFilter, categoryFilter, accountFilter]);

  const summary = useMemo(() => {
    const income = filtered.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const expense = filtered.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
    return { income, expense, balance: income - expense };
  }, [filtered]);

  const accountName = (id) => accounts.find((a) => a.id === id)?.bank_name || '—';
  const categoryName = (id) => categories.find((c) => c.id === id)?.name || '';

  function handleEdit(txn) { setEditing(txn); setFormOpen(true); }

  function handleDelete(id) { setToDelete(transactions.find((t) => t.id === id) || null); }

  async function confirmDelete() {
    const txn = toDelete;
    setToDelete(null);
    if (!txn) return;
    try {
      await appApi.entities.Transaction.delete(txn.id);
      if (txn.type !== 'transfer') {
        const account = accounts.find((a) => a.id === txn.account_id);
        if (account) {
          await appApi.entities.Account.update(account.id, { balance: (account.balance || 0) - txn.amount });
        }
      }
      toast({ description: 'Transação apagada' });
      await loadData();
    } catch (err) { console.error('Erro ao eliminar:', err); }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-line border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="eyebrow">§ 02 · Movimentos</span>
          <h1 className="font-heading text-2xl font-bold text-ink mt-1">Transações</h1>
        </div>
        <button type="button" onClick={() => { setEditing(null); setFormOpen(true); }} className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-xl text-sm font-medium btn-hover btn-primary-hover">
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-surface border border-line rounded-talao p-3 shadow-soft">
          <p className="eyebrow mb-1">Entradas</p>
          <p className="font-mono text-[14px] font-semibold text-ok">{formatKz(summary.income)}</p>
        </div>
        <div className="bg-surface border border-line rounded-talao p-3 shadow-soft">
          <p className="eyebrow mb-1">Saídas</p>
          <p className="font-mono text-[14px] font-semibold text-destructive">{formatKz(summary.expense)}</p>
        </div>
        <div className="bg-surface border border-line rounded-talao p-3 shadow-soft">
          <p className="eyebrow mb-1">Balanço do período</p>
          <p className="font-mono text-[14px] font-semibold text-ink">{formatKz(summary.balance)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-2" />
        <input
          type="text"
          aria-label="Pesquisar transações"
          placeholder="Pesquisar por descrição..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-line bg-surface text-sm focus:border-primary/40 focus:outline-none"
        />
      </div>

      {/* Category chips (horizontal scroll) */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-3 py-1.5 rounded-full text-[12.5px] font-medium whitespace-nowrap transition-colors ${
            categoryFilter === 'all' ? 'bg-primary text-white' : 'bg-surface border border-line text-muted-foreground'
          }`}
        >
          Todas
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoryFilter(c.id)}
            className={`px-3 py-1.5 rounded-full text-[12.5px] font-medium whitespace-nowrap transition-colors ${
              categoryFilter === c.id ? 'bg-primary text-white' : 'bg-surface border border-line text-muted-foreground'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Type tabbar */}
      <div className="flex gap-1 bg-surface border border-line rounded-xl p-1">
        {typeTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTypeFilter(t.id)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              typeFilter === t.id ? 'bg-primary text-white' : 'text-muted-foreground hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-surface rounded-talao border border-line overflow-hidden shadow-soft">
        <table className="w-full">
          <thead>
            <tr className="border-b border-line">
              <th className="text-left text-[10px] font-bold uppercase tracking-wider text-muted-2 px-5 py-3">Data</th>
              <th className="text-left text-[10px] font-bold uppercase tracking-wider text-muted-2 px-5 py-3">Descrição</th>
              <th className="text-left text-[10px] font-bold uppercase tracking-wider text-muted-2 px-5 py-3">Categoria</th>
              <th className="text-left text-[10px] font-bold uppercase tracking-wider text-muted-2 px-5 py-3">Conta</th>
              <th className="text-right text-[10px] font-bold uppercase tracking-wider text-muted-2 px-5 py-3">Montante</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-12 text-sm text-muted-2 text-center">Sem transações para mostrar.</td></tr>
            ) : (
              filtered.map((txn) => {
                const isIncome = txn.amount > 0;
                const category = categories.find((c) => c.id === txn.category_id);
                return (
                  <tr key={txn.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 text-sm text-muted-foreground font-mono">{formatDateShort(txn.date)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isIncome ? 'bg-green-soft text-ok' : 'bg-muted text-muted-foreground'}`}>
                          <CategoryIcon category={category} isIncome={isIncome} className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm font-medium text-ink">{txn.description}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{categoryName(txn.category_id) || '—'}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{accountName(txn.account_id)}</td>
                    <td className={`px-5 py-3 text-right whitespace-nowrap font-mono text-sm font-semibold ${isIncome ? 'text-ok' : 'text-ink'}`}>
                      {isIncome ? '+' : ''}{formatKz(txn.amount)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(txn)} aria-label="Editar transação" className="p-1.5 rounded-lg text-muted-2 hover:text-ink hover:bg-muted"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(txn.id)} aria-label="Apagar transação" className="p-1.5 rounded-lg text-muted-2 hover:text-destructive hover:bg-danger-soft"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile flush list */}
      <div className="md:hidden bg-surface rounded-talao border border-line shadow-soft px-3 pb-2">
        {filtered.length === 0 ? (
          <p className="px-2 py-12 text-sm text-muted-2 text-center">Sem transações para mostrar.</p>
        ) : (
          <div className="ed-list">
            {filtered.map((txn) => {
              const isIncome = txn.amount > 0;
              const category = categories.find((c) => c.id === txn.category_id);
              return (
                <div key={txn.id} className="it">
                  <div className={`w-[34px] h-[34px] rounded-[10px] flex items-center justify-center shrink-0 ${isIncome ? 'bg-green-soft text-ok' : 'bg-muted text-muted-foreground'}`}>
                    <CategoryIcon category={category} isIncome={isIncome} className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="nm truncate">{txn.description}</div>
                    <div className="sb">{formatDate(txn.date)} · {categoryName(txn.category_id) || accountName(txn.account_id)}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`vl ${isIncome ? 'text-ok' : 'text-ink'}`}>{isIncome ? '+' : ''}{formatKz(txn.amount)}</span>
                    <button onClick={() => handleEdit(txn)} aria-label="Editar transação" className="p-1 text-muted-2 hover:text-ink"><Pencil className="w-3 h-3" /></button>
                    <button onClick={() => handleDelete(txn.id)} aria-label="Apagar transação" className="p-1 text-muted-2 hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDeleteDialog
        open={!!toDelete}
        title="Apagar transação?"
        description={toDelete ? `Vais apagar "${toDelete.description}" de ${formatKz(Math.abs(toDelete.amount))}. Esta ação não pode ser desfeita.` : ''}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />

      <TransactionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={loadData}
        transaction={editing}
        accounts={accounts}
        categories={categories}
      />
    </div>
  );
}