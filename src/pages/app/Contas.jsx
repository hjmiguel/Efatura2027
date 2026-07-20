import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { formatKz } from '@/lib/format';
import AccountForm from '@/components/app/AccountForm';
import { Plus, Pencil, Trash2, Wallet } from 'lucide-react';

const typeLabels = { checking: 'Conta à ordem', savings: 'Poupança', cash: 'Numerário' };

export default function Contas() {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => { loadAccounts(); }, []);

  async function loadAccounts() {
    try {
      const accts = await base44.entities.Account.list();
      setAccounts(accts);
    } catch (err) { console.error('Erro:', err); }
    finally { setLoading(false); }
  }

  function handleAdd() { setEditing(null); setFormOpen(true); }
  function handleEdit(acc) { setEditing(acc); setFormOpen(true); }

  async function handleDelete(id) {
    if (!confirm('Eliminar esta conta? As transações associadas não serão removidas.')) return;
    try { await base44.entities.Account.delete(id); setAccounts(accounts.filter(a => a.id !== id)); }
    catch (err) { console.error('Erro:', err); }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-line border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const total = accounts.reduce((s, a) => s + (a.balance || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-ink">Contas</h1>
        <button onClick={handleAdd} className="inline-flex items-center gap-2 bg-primary hover:bg-primary-2 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      </div>

      <div className="bg-surface rounded-talao border border-line p-5">
        <p className="text-xs text-muted-2 mb-1">Património total</p>
        <p className="font-mono text-2xl font-bold text-ink">{formatKz(total)}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {accounts.length === 0 ? (
          <div className="col-span-2 bg-surface rounded-talao border border-line p-12 text-center">
            <Wallet className="w-10 h-10 text-muted-2 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Ainda não tens contas adicionadas.</p>
            <button onClick={handleAdd} className="mt-4 text-sm font-semibold text-primary hover:text-primary-2">Adicionar primeira conta</button>
          </div>
        ) : (
          accounts.map((acc) => (
            <div key={acc.id} className="bg-surface rounded-talao border border-line p-5 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: acc.color || '#12715C' }} />
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-heading font-bold text-ink">{acc.bank_name}</p>
                  <p className="text-sm text-muted-foreground">{acc.name}</p>
                </div>
                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-2 bg-muted px-2 py-1 rounded">{typeLabels[acc.type] || acc.type}</span>
              </div>
              <p className="font-mono text-xl font-bold text-ink mt-4">{formatKz(acc.balance)}</p>
              {acc.iban && <p className="font-mono text-xs text-muted-2 mt-2 truncate">IBAN: {acc.iban}</p>}
              <div className="flex items-center gap-1 mt-4 pt-3 border-t border-line">
                <button onClick={() => handleEdit(acc)} className="flex items-center gap-1.5 text-xs text-muted-2 hover:text-ink px-2 py-1 rounded">
                  <Pencil className="w-3.5 h-3.5" /> Editar
                </button>
                <button onClick={() => handleDelete(acc.id)} className="flex items-center gap-1.5 text-xs text-muted-2 hover:text-destructive px-2 py-1 rounded">
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <AccountForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={loadAccounts} account={editing} />
    </div>
  );
}