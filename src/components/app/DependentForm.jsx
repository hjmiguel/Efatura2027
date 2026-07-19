import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';

const relationshipLabels = {
  conjuge: 'Cônjuge', filho: 'Filho(a)', pai: 'Pai', mae: 'Mãe', outro: 'Outro',
};

export default function DependentForm({ open, onClose, onSaved, dependent }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', relationship: 'filho', nif: '', birth_date: '' });

  useEffect(() => {
    if (!open) return;
    if (dependent) {
      setForm({
        name: dependent.name || '',
        relationship: dependent.relationship || 'filho',
        nif: dependent.nif || '',
        birth_date: dependent.birth_date || '',
      });
    } else {
      setForm({ name: '', relationship: 'filho', nif: '', birth_date: '' });
    }
  }, [dependent, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        name: form.name,
        relationship: form.relationship,
        nif: form.nif || undefined,
        birth_date: form.birth_date || undefined,
      };
      if (dependent) {
        await base44.entities.Dependent.update(dependent.id, data);
      } else {
        await base44.entities.Dependent.create(data);
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error('Erro ao guardar dependente:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dependent ? 'Editar dependente' : 'Adicionar dependente'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="dep-name">Nome</Label>
            <Input id="dep-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="dep-rel">Grau de parentesco</Label>
            <select id="dep-rel" value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} className="mt-1.5 w-full h-10 rounded-lg border border-input bg-surface px-3 text-sm">
              {Object.entries(relationshipLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="dep-nif">NIF</Label>
              <Input id="dep-nif" value={form.nif} onChange={(e) => setForm({ ...form, nif: e.target.value })} className="mt-1.5 font-mono" />
            </div>
            <div>
              <Label htmlFor="dep-birth">Nascimento</Label>
              <Input id="dep-birth" type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} className="mt-1.5" />
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