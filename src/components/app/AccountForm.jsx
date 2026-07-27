import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { appApi } from '@/api/appClient';

const COLORS = ['#12715C', '#E8A23D', '#3a64a8', '#1C8A6A', '#DC2626', '#7C3AED'];
const typeLabels = { checking: 'Conta à ordem', savings: 'Poupança', cash: 'Numerário' };

export default function AccountForm({ open, onClose, onSaved, account }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', bank_name: '', iban: '', balance: '', type: 'checking', color: '#12715C', is_active: true,
  });

  useEffect(() => {
    if (!open) return;
    if (account) {
      setForm({
        name: account.name || '',
        bank_name: account.bank_name || '',
        iban: account.iban || '',
        balance: (account.balance || 0).toString(),
        type: account.type || 'checking',
        color: account.color || '#12715C',
        is_active: account.is_active !== false,
      });
    } else {
      setForm({ name: '', bank_name: '', iban: '', balance: '', type: 'checking', color: '#12715C', is_active: true });
    }
  }, [account, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        name: form.name,
        bank_name: form.bank_name,
        iban: form.iban || undefined,
        balance: parseFloat(form.balance) || 0,
        type: form.type,
        color: form.color,
        is_active: form.is_active,
      };
      if (account) {
        await appApi.entities.Account.update(account.id, data);
      } else {
        await appApi.entities.Account.create(data);
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error('Erro ao guardar conta:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{account ? 'Editar conta' : 'Nova conta'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="bank_name">Banco</Label>
            <Input id="bank_name" value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} placeholder="BFA, BIC, BNI..." required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="acc-name">Nome da conta</Label>
            <Input id="acc-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Conta principal" required className="mt-1.5" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="acc-balance">Saldo (Kz)</Label>
              <Input id="acc-balance" type="number" step="0.01" value={form.balance} onChange={(e) => setForm({ ...form, balance: e.target.value })} placeholder="0" required className="mt-1.5 font-mono" />
            </div>
            <div>
              <Label htmlFor="acc-type">Tipo</Label>
              <select id="acc-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="mt-1.5 w-full h-10 rounded-lg border border-input bg-surface px-3 text-sm">
                {Object.entries(typeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="acc-iban">IBAN</Label>
            <Input id="acc-iban" value={form.iban} onChange={(e) => setForm({ ...form, iban: e.target.value })} placeholder="AO06 0000 0000 0000 0000 0000 0" className="mt-1.5 font-mono text-sm" />
          </div>
          <div>
            <Label>Cor de identificação</Label>
            <div className="flex gap-2 mt-1.5">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                  className={`w-8 h-8 rounded-lg transition-transform ${form.color === c ? 'ring-2 ring-offset-2 ring-ink scale-110' : ''}`}
                  style={{ backgroundColor: c }} />
              ))}
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