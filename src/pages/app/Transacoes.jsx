import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { formatKz, formatDateShort, formatDate } from '@/lib/format';
import TransactionForm from '@/components/app/TransactionForm';
import { Plus, Search, ArrowDownLeft, ArrowUpRight, Trash2, Pencil } from 'lucide-react';

export default function Transacoes() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [accountFilter, setAccountFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [txns, accts, cats] = await Promise.all([
        base44.entities.Transaction.list('-date', 200),
        base44.entities.Account.list(),
        base44.entities.Category.list(),
      ]);
      setTransactions(txns);
      setAccounts(accts);
      setCategories(cats);
    } catch (err) {
      console.error('Erro ao carregar:', err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (search && !t.description?.toLowerCase().includes(search.toLowerCase())) return false;
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (accountFilter !== 'all' && t.account_id !== accountFilter) return false;
      if (categoryFilter !== 'all' && t.category_id !== categoryFilter) return false;
      return true;
    });
  }, [transactions, search, typeFilter, accountFilter, categoryFilter]);

  const summary = useMemo(() => {
    const income = filtered.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const expense = filtered.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
    return { income, expense, balance: income - expense };
  }, [filtered]);

  const accountName = (id) => accounts.find((a) => a.id === id)?.bank_name || '—';
  const categoryName = (id) => categories.find((c) => c.id === id)?.name || '';

  function handleEdit(txn) {
    setEditing(txn);
    setFormOpen(true);
  }

  function handleAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  async function handleDelete(id) {
    if (!confirm('Eliminar esta transação?')) return;
    try {
      await base44.entities.Transaction.delete(id);
      setTransactions(transactions.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Erro ao eliminar:', err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-line border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-ink">Transações</h1>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-2 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface rounded-talao border border-line p-4">
          <p className="text-xs text-muted-2 mb-1">Entradas</p>
          <p className="font-mono text-base sm:text-lg font-semibold text-ok">{formatKz(summary.income)}</p>
        </div>
        <div className="bg-surface rounded-talao border border-line p-4">
          <p className="text-xs text-muted-2 mb-1">Saídas</p>
          <p className="font-mono text-base sm:text-lg font-semibold text-destructive">{formatKz(summary.expense)}</p>
        </div>
        <div className="bg-surface rounded-talao border border-line p-4">
          <p className="text-xs text-muted-2 mb-1">Saldo</p>
          <p className="font-mono text-base sm:text-lg font-semibold text-ink">{formatKz(summary.balance)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-talao border border-line p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-2" />
          <input
            type="text"
            placeholder="Pesquisar por descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm"
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
            <option value="all">Todos os tipos</option>
            <option value="income">Entradas</option>
            <option value="expense">Saídas</option>
            <option value="transfer">Transferências</option>
          </select>
          <select value={accountFilter} onChange={(e) => setAccountFilter(e.target.value)} className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
            <option value="all">Todas as contas</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.bank_name}</option>
            ))}
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="h-10 rounded-lg border border-input bg-background px-3 text-sm col-span-2 sm:col-span-1">
            <option value="all">Todas as categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-surface rounded-talao border border-line overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-line">
              <th className="text-left text-xs font-semibold text-muted-2 uppercase tracking-wide px-5 py-3">Data</th>
              <th className="text-left text-xs font-semibold text-muted-2 uppercase tracking-wide px-5 py-3">Descrição</th>
              <th className="text-left text-xs font-semibold text-muted-2 uppercase tracking-wide px-5 py-3">Categoria</th>
              <th className="text-left text-xs font-semibold text-muted-2 uppercase tracking-wide px-5 py-3">Conta</th>
              <th className="text-right text-xs font-semibold text-muted-2 uppercase tracking-wide px-5 py-3">Montante</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-sm text-muted-2 text-center">Sem transações para mostrar.</td>
              </tr>
            ) : (
              filtered.map((txn) => {
                const isIncome = txn.amount > 0;
                return (
                  <tr key={txn.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 text-sm text-muted-foreground">{formatDateShort(txn.date)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isIncome ? 'bg-green-soft' : 'bg-muted'}`}>
                          {isIncome ? <ArrowDownLeft className="w-3.5 h-3.5 text-ok" /> : <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />}
                        </div>
                        <span className="text-sm font-medium text-ink">{txn.description}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{categoryName(txn.category_id) || '—'}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{accountName(txn.account_id)}</td>
                    <td className={`px-5 py-3 text-right font-mono text-sm font-semibold ${isIncome ? 'text-ok' : 'text-ink'}`}>
                      {isIncome ? '+' : ''}{formatKz(txn.amount)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(txn)} className="p-1.5 rounded-lg text-muted-2 hover:text-ink hover:bg-muted">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(txn.id)} className="p-1.5 rounded-lg text-muted-2 hover:text-destructive hover:bg-danger-soft">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile list */}
      <div className="md:hidden bg-surface rounded-talao border border-line divide-y divide-line">
        {filtered.length === 0 ? (
          <p className="px-5 py-12 text-sm text-muted-2 text-center">Sem transações para mostrar.</p>
        ) : (
          filtered.map((txn) => {
            const isIncome = txn.amount > 0;
            return (
              <div key={txn.id} className="flex items-center gap-3 px-4 py-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isIncome ? 'bg-green-soft' : 'bg-muted'}`}>
                  {isIncome ? <ArrowDownLeft className="w-4 h-4 text-ok" /> : <ArrowUpRight className="w-4 h-4 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{txn.description}</p>
                  <p className="text-xs text-muted-2">{formatDate(txn.date)} · {accountName(txn.account_id)}</p>
                </div>
                <div className="text-right">
                  <p className={`font-mono text-sm font-semibold ${isIncome ? 'text-ok' : 'text-ink'}`}>
                    {isIncome ? '+' : ''}{formatKz(txn.amount)}
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    <button onClick={() => handleEdit(txn)} className="p-1 rounded text-muted-2 hover:text-ink">
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button onClick={() => handleDelete(txn.id)} className="p-1 rounded text-muted-2 hover:text-destructive">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

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