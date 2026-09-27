import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { appApi } from '@/api/appClient';

export default function ManualInvoiceForm({ open, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ issuer_name: '', amount: '', due_date: new Date().toISOString().split('T')[0] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await appApi.entities.Invoice.create({
        issuer_name: form.issuer_name,
        amount: parseFloat(form.amount) || 0,
        due_date: form.due_date,
        status: 'pending',
        source: 'manual',
        payment_method: 'manual',
      });
      setForm({ issuer_name: '', amount: '', due_date: new Date().toISOString().split('T')[0] });
      onSaved();
      onClose();
    } catch (err) {
      console.error('Erro ao criar fatura:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova fatura manual</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="issuer_name">Emissor</Label>
            <Input
              id="issuer_name"
              value={form.issuer_name}
              onChange={(e) => setForm({ ...form, issuer_name: e.target.value })}
              placeholder="Ex: ENDE"
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
              <Label htmlFor="due_date">Vencimento</Label>
              <Input
                id="due_date"
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                required
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'A guardar...' : 'Guardar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}