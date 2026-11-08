import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { appApi } from '@/api/appClient';
import { formatKz } from '@/lib/format';
import GoalRing from '@/components/app/ui/GoalRing';
import ConfirmDeleteDialog from '@/components/app/ConfirmDeleteDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const empty = { name: '', target: '', current: '', deadline: '' };

export default function GoalsTab() {
  const [goals, setGoals] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const load = async () => setGoals(await appApi.entities.Goal.list('-created_date', 100));
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = { name: form.name.trim(), target: Number(form.target), current: Number(form.current) || 0 };
    if (form.deadline) data.deadline = form.deadline;
    await appApi.entities.Goal.create(data);
    setSaving(false);
    setOpen(false);
    setForm(empty);
    load();
  };

  const remove = async () => {
    await appApi.entities.Goal.delete(toDelete.id);
    setToDelete(null);
    load();
  };

  const inputCls = 'w-full bg-surface border border-line rounded-lg px-3 py-2 text-sm';

  return (
    <div className="space-y-3.5">
      {goals.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">Ainda não tens metas. Cria a primeira.</p>
      )}
      {goals.map((g) => {
        const pct = g.target > 0 ? Math.round(((g.current || 0) / g.target) * 100) : 0;
        return (
          <div key={g.id} className="bg-surface border border-line rounded-talao p-4 shadow-soft flex items-center gap-4">
            <GoalRing pct={pct} color="#E68F33" label={`${pct}%`} />
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-bold text-[15px] text-ink">{g.name}</h3>
              <p className="text-[12.5px] text-muted-foreground mt-0.5">
                {formatKz(g.current || 0)} / {formatKz(g.target)}{g.deadline ? ` · até ${g.deadline}` : ''}
              </p>
            </div>
            <button onClick={() => setToDelete(g)} aria-label="Apagar meta" className="p-1.5 rounded text-muted-2 hover:text-destructive hover:bg-danger-soft">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      })}
      <button onClick={() => setOpen(true)} className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-talao text-sm font-medium btn-hover btn-primary-hover">
        <Plus className="w-4 h-4" /> Nova meta
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova meta</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-3">
            <input required value={form.name} onChange={set('name')} placeholder="Nome (ex: Fundo de emergência)" className={inputCls} />
            <input required type="number" min="1" value={form.target} onChange={set('target')} placeholder="Valor alvo (Kz)" className={inputCls} />
            <input type="number" min="0" value={form.current} onChange={set('current')} placeholder="Já poupado (Kz)" className={inputCls} />
            <input type="date" value={form.deadline} onChange={set('deadline')} className={inputCls} aria-label="Data limite" />
            <button disabled={saving} className="w-full bg-primary text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50">
              {saving ? 'A guardar...' : 'Guardar meta'}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!toDelete}
        title="Apagar meta?"
        description={toDelete ? `Vais apagar a meta "${toDelete.name}".` : ''}
        onCancel={() => setToDelete(null)}
        onConfirm={remove}
      />
    </div>
  );
}