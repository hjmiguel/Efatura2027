import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Users, Loader2 } from 'lucide-react';
import { appApi } from '@/api/appClient';
import { formatDate } from '@/lib/format';
import DependentForm from '@/components/app/DependentForm';

const relationshipLabels = {
  conjuge: 'Cônjuge', filho: 'Filho(a)', pai: 'Pai', mae: 'Mãe', outro: 'Outro',
};

export default function ProfileDependents() {
  const [dependents, setDependents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDep, setEditingDep] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const data = await appApi.entities.Dependent.list();
      setDependents(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Remover este dependente?')) return;
    try {
      await appApi.entities.Dependent.delete(id);
      load();
    } catch (err) { console.error(err); }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-heading font-semibold text-ink">Agregado familiar</h3>
        </div>
        <button
          onClick={() => { setEditingDep(null); setShowForm(true); }}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-2"
        >
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      </div>

      <p className="text-xs text-muted-2">
        Os dependentes do teu agregado familiar são considerados no cálculo de deduções do IRPS.
      </p>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 text-muted-2 animate-spin" />
        </div>
      ) : dependents.length === 0 ? (
        <div className="text-center py-8 bg-muted/20 rounded-xl">
          <Users className="w-8 h-8 text-muted-2/50 mx-auto mb-2" />
          <p className="text-sm text-muted-2">Sem dependentes registados.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {dependents.map((dep) => (
            <div key={dep.id} className="flex items-center justify-between bg-surface border border-line rounded-xl px-4 py-3">
              <div>
                <p className="text-sm font-medium text-ink">{dep.name}</p>
                <p className="text-xs text-muted-2">
                  {relationshipLabels[dep.relationship] || dep.relationship}
                  {dep.nif && ` · NIF ${dep.nif}`}
                  {dep.birth_date && ` · ${formatDate(dep.birth_date)}`}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setEditingDep(dep); setShowForm(true); }}
                  className="p-1.5 rounded text-muted-2 hover:text-primary hover:bg-muted transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(dep.id)}
                  className="p-1.5 rounded text-muted-2 hover:text-destructive hover:bg-danger-soft transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <DependentForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSaved={load}
        dependent={editingDep}
      />
    </div>
  );
}