import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import BottomSheetSelect from '@/components/app/BottomSheetSelect';

export default function TransactionForm({ open, onClose, onSaved, transaction, accounts, categories }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    account_id: '',
    category_id: '',
    notes: '',
  });

  useEffect(() => {
    if (!open) return;
    if (transaction) {
      setForm({
        description: transaction.description || '',
        amount: Math.abs(transaction.amount || 0).toString(),
        date: transaction.date || new Date().toISOString().split('T')[0],
        type: transaction.type || 'expense',
        account_id: transaction.account_id || '',
        category_id: transaction.category_id || '',
        notes: transaction.notes || '',
      });
    } else {
      setForm({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        account_id: accounts[0]?.id || '',
        category_id: '',
        notes: '',
      });
    }
  }, [transaction, open, accounts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const amount = parseFloat(form.amount) || 0;
      const signedAmount = form.type === 'income' ? amount : -amount;

      const data = {
        description: form.description,
        amount: signedAmount,
        date: form.date,
        type: form.type,
        account_id: form.account_id,
        category_id: form.category_id || undefined,
        notes: form.notes || undefined,
      };

      if (transaction) {
        const updated = await base44.entities.Transaction.update(transaction.id, data);
        onSaved(updated);
      } else {
        const created = await base44.entities.Transaction.create(data);
        onSaved(created);
      }
      onClose();
    } catch (err) {
      console.error('Erro ao guardar transação:', err);
    } finally {
      setSaving(false);
    }
  };

  const typeButtons = [
    { value: 'income', label: 'Entrada', activeClass: 'bg-green-soft text-ok' },
    { value: 'expense', label: 'Saída', activeClass: 'bg-danger-soft text-destructive' },
    { value: 'transfer', label: 'Transferência', activeClass: 'bg-muted text-ink' },
  ];

  const filteredCategories = categories.filter((c) =>
    form.type === 'income' ? c.type === 'income' : c.type === 'expense'
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{transaction ? 'Editar transação' : 'Nova transação'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {typeButtons.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setForm({ ...form, type: t.value, category_id: '' })}
                className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  form.type === t.value ? t.activeClass : 'bg-muted/50 text-muted-foreground'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Ex: Supermercado Kero"
              required
              className="mt-1.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="amount">Montante (Kz)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0"
                required
                className="mt-1.5 font-mono"
              />
            </div>
            <div>
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="account">Conta</Label>
            <BottomSheetSelect
              id="account"
              value={form.account_id}
              onChange={(v) => setForm({ ...form, account_id: v })}
              options={[
                { value: '', label: 'Selecionar conta' },
                ...accounts.map((a) => ({ value: a.id, label: `${a.bank_name} — ${a.name}` })),
              ]}
              placeholder="Selecionar conta"
              label="Conta"
            />
          </div>

          <div>
            <Label htmlFor="category">Categoria</Label>
            <BottomSheetSelect
              id="category"
              value={form.category_id}
              onChange={(v) => setForm({ ...form, category_id: v })}
              options={[
                { value: '', label: 'Sem categoria' },
                ...filteredCategories.map((c) => ({ value: c.id, label: c.name })),
              ]}
              placeholder="Sem categoria"
              label="Categoria"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>Cancelar</Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'A guardar...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}