import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Pencil, X } from 'lucide-react';
import { formatKz } from '@/lib/format';

export default function CorporateCostCenters() {
  const [loading, setLoading] = useState(true);
  const [centers, setCenters] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ code: '', name: '', budget_monthly: '', budget_yearly: '', responsible_name: '' });

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [ccs, txns] = await Promise.all([
        base44.entities.CostCenter.list(),
        base44.entities.Transaction.list(),
      ]);
      setCenters(ccs);
      setTransactions(txns);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  const now = new Date();
  const monthSpend = {};
  const yearSpend = {};
  for (const t of transactions) {
    if (t.amount >= 0) continue;
    const d = new Date(t.date);
    const isThisMonth = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    const isThisYear = d.getFullYear() === now.getFullYear();
    if (isThisMonth) monthSpend[t.category_id] = (monthSpend[t.category_id] || 0) + Math.abs(t.amount);
    if (isThisYear) yearSpend[t.category_id] = (yearSpend[t.category_id] || 0) + Math.abs(t.amount);
  }

  function openNew() {
    setEditing(null);
    setForm({ code: '', name: '', budget_monthly: '', budget_yearly: '', responsible_name: '' });
    setShowForm(true);
  }

  function openEdit(c) {
    setEditing(c);
    setForm({ code: c.code || '', name: c.name || '', budget_monthly: c.budget_monthly || '', budget_yearly: c.budget_yearly || '', responsible_name: c.responsible_name || '' });
    setShowForm(true);
  }

  async function submit(e) {
    e.preventDefault();
    try {
      const payload = {
        code: form.code,
        name: form.name,
        budget_monthly: parseFloat(form.budget_monthly) || 0,
        budget_yearly: parseFloat(form.budget_yearly) || 0,
        responsible_name: form.responsible_name
      };
      if (editing) await base44.entities.CostCenter.update(editing.id, payload);
      else await base44.entities.CostCenter.create(payload);
      setShowForm(false);
      load();
    } catch (err) { console.error(err); }
  }

  async function remove(id) {
    if (!confirm('Eliminar este centro de custo?')) return;
    try { await base44.entities.CostCenter.delete(id); load(); }
    catch (err) { console.error(err); }
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
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">Centros de custo</h1>
          <p className="text-sm text-muted-2">Orçamento, gasto e restante</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-2 transition-colors">
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-surface border border-line rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-heading font-bold text-ink">{editing ? 'Editar' : 'Novo'} centro de custo</h2>
            <button type="button" onClick={() => setShowForm(false)} className="p-1 text-muted-2 hover:text-ink"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-2 block mb-1">Código *</label>
              <input value={form.code} onChange={e => setForm({...form, code: e.target.value})} required className="w-full px-3 py-2 rounded-lg border border-line text-sm font-mono focus:outline-none focus:border-primary/40" />
            </div>
            <div>
              <label className="text-xs text-muted-2 block mb-1">Nome *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:border-primary/40" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-2 block mb-1">Orçamento mensal (Kz)</label>
              <input type="number" step="0.01" value={form.budget_monthly} onChange={e => setForm({...form, budget_monthly: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-line text-sm font-mono focus:outline-none focus:border-primary/40" />
            </div>
            <div>
              <label className="text-xs text-muted-2 block mb-1">Orçamento anual (Kz)</label>
              <input type="number" step="0.01" value={form.budget_yearly} onChange={e => setForm({...form, budget_yearly: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-line text-sm font-mono focus:outline-none focus:border-primary/40" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-2 block mb-1">Responsável</label>
            <input value={form.responsible_name} onChange={e => setForm({...form, responsible_name: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:border-primary/40" />
          </div>
          <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-2 transition-colors">
            {editing ? 'Guardar' : 'Adicionar'}
          </button>
        </form>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {centers.length === 0 ? (
          <p className="text-sm text-muted-2 text-center py-8 col-span-2">Nenhum centro de custo registado.</p>
        ) : centers.map(c => {
          const spent = yearSpend[c.id] || 0;
          const budget = c.budget_yearly || 0;
          const remaining = budget - spent;
          const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
          return (
            <div key={c.id} className="bg-surface border border-line rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-mono text-muted-2">{c.code}</p>
                  <p className="text-sm font-medium text-ink">{c.name}</p>
                  {c.responsible_name && <p className="text-xs text-muted-2 mt-0.5">{c.responsible_name}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded text-muted-2 hover:text-ink hover:bg-muted"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => remove(c.id)} className="p-1.5 rounded text-destructive hover:bg-danger-soft"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              {budget > 0 && (
                <>
                  <div className="flex justify-between text-xs text-muted-2 mb-1">
                    <span>Gasto: {formatKz(spent)}</span>
                    <span>{pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                    <div className={`h-full rounded-full ${pct > 90 ? 'bg-destructive' : pct > 75 ? 'bg-gold' : 'bg-primary'}`} style={{width: `${pct}%`}} />
                  </div>
                  <p className="text-xs text-muted-2">Restante: {formatKz(remaining)}</p>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}