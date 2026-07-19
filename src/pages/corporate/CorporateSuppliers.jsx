import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Pencil, X } from 'lucide-react';
import { formatKz } from '@/lib/format';

export default function CorporateSuppliers() {
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '', nif: '', iban: '', category: '',
    payment_terms_days: 30, applies_withholding: true, withholding_rate: 6.5,
    contact_name: '', contact_phone: '', contact_email: ''
  });

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const data = await base44.entities.Supplier.list();
      setSuppliers(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function openNew() {
    setEditing(null);
    setForm({ name: '', nif: '', iban: '', category: '', payment_terms_days: 30, applies_withholding: true, withholding_rate: 6.5, contact_name: '', contact_phone: '', contact_email: '' });
    setShowForm(true);
  }

  function openEdit(s) {
    setEditing(s);
    setForm({
      name: s.name || '', nif: s.nif || '', iban: s.iban || '', category: s.category || '',
      payment_terms_days: s.payment_terms_days || 30, applies_withholding: s.applies_withholding !== false,
      withholding_rate: s.withholding_rate || 6.5, contact_name: s.contact_name || '',
      contact_phone: s.contact_phone || '', contact_email: s.contact_email || ''
    });
    setShowForm(true);
  }

  async function submit(e) {
    e.preventDefault();
    try {
      if (editing) {
        await base44.entities.Supplier.update(editing.id, form);
      } else {
        await base44.entities.Supplier.create(form);
      }
      setShowForm(false);
      load();
    } catch (err) { console.error(err); }
  }

  async function remove(id) {
    if (!confirm('Eliminar este fornecedor?')) return;
    try {
      await base44.entities.Supplier.delete(id);
      load();
    } catch (err) { console.error(err); }
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
          <h1 className="font-heading text-2xl font-bold text-ink">Fornecedores</h1>
          <p className="text-sm text-muted-2">Condições e retenção na fonte de 6,5%</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-2 transition-colors">
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-surface border border-line rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-heading font-bold text-ink">{editing ? 'Editar' : 'Novo'} fornecedor</h2>
            <button type="button" onClick={() => setShowForm(false)} className="p-1 text-muted-2 hover:text-ink"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-2 block mb-1">Nome *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:border-primary/40" />
            </div>
            <div>
              <label className="text-xs text-muted-2 block mb-1">NIF *</label>
              <input value={form.nif} onChange={e => setForm({...form, nif: e.target.value})} required className="w-full px-3 py-2 rounded-lg border border-line text-sm font-mono focus:outline-none focus:border-primary/40" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-2 block mb-1">IBAN</label>
            <input value={form.iban} onChange={e => setForm({...form, iban: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-line text-sm font-mono focus:outline-none focus:border-primary/40" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-2 block mb-1">Categoria</label>
              <input value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:border-primary/40" />
            </div>
            <div>
              <label className="text-xs text-muted-2 block mb-1">Prazo (dias)</label>
              <input type="number" value={form.payment_terms_days} onChange={e => setForm({...form, payment_terms_days: parseInt(e.target.value)})} className="w-full px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:border-primary/40" />
            </div>
            <div>
              <label className="text-xs text-muted-2 block mb-1">Retenção (%)</label>
              <input type="number" step="0.1" value={form.withholding_rate} onChange={e => setForm({...form, withholding_rate: parseFloat(e.target.value)})} className="w-full px-3 py-2 rounded-lg border border-line text-sm font-mono focus:outline-none focus:border-primary/40" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-2 block mb-1">Contacto</label>
              <input value={form.contact_name} onChange={e => setForm({...form, contact_name: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:border-primary/40" />
            </div>
            <div>
              <label className="text-xs text-muted-2 block mb-1">Telefone</label>
              <input value={form.contact_phone} onChange={e => setForm({...form, contact_phone: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-line text-sm font-mono focus:outline-none focus:border-primary/40" />
            </div>
            <div>
              <label className="text-xs text-muted-2 block mb-1">Email</label>
              <input value={form.contact_email} onChange={e => setForm({...form, contact_email: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:border-primary/40" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={form.applies_withholding} onChange={e => setForm({...form, applies_withholding: e.target.checked})} className="rounded" />
            Aplica retenção na fonte
          </label>
          <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-2 transition-colors">
            {editing ? 'Guardar' : 'Adicionar'}
          </button>
        </form>
      )}

      <div className="bg-surface border border-line rounded-xl overflow-hidden">
        {suppliers.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted-2 text-center">Nenhum fornecedor registado.</p>
        ) : (
          <div className="divide-y divide-line">
            {suppliers.map(s => (
              <div key={s.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-ink font-medium">{s.name}</p>
                  <p className="text-xs text-muted-2 font-mono">
                    NIF: {s.nif}
                    {s.iban && ` · IBAN: ${s.iban.substring(0, 8)}...`}
                    {s.applies_withholding !== false && ` · Retenção ${s.withholding_rate || 6.5}%`}
                    {` · Prazo ${s.payment_terms_days || 30}d`}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(s)} className="p-1.5 rounded text-muted-2 hover:text-ink hover:bg-muted">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => remove(s.id)} className="p-1.5 rounded text-destructive hover:bg-danger-soft">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}