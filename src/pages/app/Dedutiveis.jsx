import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { formatKz, formatDate } from '@/lib/format';
import DependentForm from '@/components/app/DependentForm';
import { Plus, Download, AlertTriangle, Pencil, Trash2, Users, FileText } from 'lucide-react';
import AgtSeal from '@/components/app/AgtSeal';

const deductibleLabels = {
  saude: { label: 'Saúde', color: '#DC2626' },
  educacao: { label: 'Educação', color: '#3a64a8' },
  habitacao: { label: 'Habitação', color: '#12715C' },
  pensao_alimentos: { label: 'Pensão de alimentos', color: '#E8A23D' },
  previdencia: { label: 'Previdência', color: '#7C3AED' },
};

const relationshipLabels = { conjuge: 'Cônjuge', filho: 'Filho(a)', pai: 'Pai', mae: 'Mãe', outro: 'Outro' };

export default function Dedutiveis() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [dependents, setDependents] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDep, setEditingDep] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [inv, deps] = await Promise.all([
        base44.entities.Invoice.list(),
        base44.entities.Dependent.list(),
      ]);
      setInvoices(inv);
      setDependents(deps);
    } catch (err) { console.error('Erro:', err); }
    finally { setLoading(false); }
  }

  const deductibleInvoices = useMemo(() => {
    return invoices.filter(i => i.deductible_type && i.deductible_type !== 'none' && i.has_nif !== false && i.status === 'paid');
  }, [invoices]);

  const totalDeductible = useMemo(() => deductibleInvoices.reduce((s, i) => s + (i.amount || 0), 0), [deductibleInvoices]);

  const byCategory = useMemo(() => {
    const result = {};
    Object.keys(deductibleLabels).forEach(key => { result[key] = { total: 0, count: 0 }; });
    deductibleInvoices.forEach(inv => {
      if (result[inv.deductible_type]) {
        result[inv.deductible_type].total += inv.amount || 0;
        result[inv.deductible_type].count += 1;
      }
    });
    return result;
  }, [deductibleInvoices]);

  const withoutNif = useMemo(() => invoices.filter(i => i.has_nif === false), [invoices]);

  function handleExportCSV() {
    const headers = ['Emissor', 'NIF Emissor', 'Documento', 'Montante (Kz)', 'Data emissão', 'Data pagamento', 'Categoria', 'NIF presente'];
    const rows = deductibleInvoices.map(i => [
      i.issuer_name || '', i.issuer_nif || '', i.document_number || '',
      (i.amount || 0).toFixed(2), i.issue_date || '', i.paid_date || '',
      deductibleLabels[i.deductible_type]?.label || i.deductible_type, i.has_nif !== false ? 'Sim' : 'Não',
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `dedutiveis-irps-${new Date().getFullYear()}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  function handleAddDep() { setEditingDep(null); setFormOpen(true); }
  function handleEditDep(dep) { setEditingDep(dep); setFormOpen(true); }

  async function handleDeleteDep(id) {
    if (!confirm('Eliminar este dependente?')) return;
    try { await base44.entities.Dependent.delete(id); setDependents(dependents.filter(d => d.id !== id)); }
    catch (err) { console.error('Erro:', err); }
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
        <h1 className="font-heading text-2xl font-bold text-ink">Dedutíveis IRPS</h1>
        <button onClick={handleExportCSV} disabled={deductibleInvoices.length === 0}
          className="inline-flex items-center gap-2 bg-surface border border-line hover:border-primary/30 text-ink font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
      </div>

      {/* Gold hero card */}
      <div className="bg-gradient-to-br from-gold-soft to-gold/20 rounded-talao border border-gold/30 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-ink/70 font-medium">Total acumulado para dedução IRPS {new Date().getFullYear() + 1}</p>
            <p className="font-mono text-3xl font-bold text-ink mt-1">{formatKz(totalDeductible)}</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gold/20 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-gold" />
          </div>
        </div>
        <p className="text-xs text-ink/60 mt-3">Apenas faturas pagas com o teu NIF são contabilizadas.</p>
      </div>

      {/* Without NIF warning */}
      {withoutNif.length > 0 && (
        <div className="flex items-start gap-3 bg-danger-soft rounded-talao border border-destructive/20 p-4">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">{withoutNif.length} {withoutNif.length === 1 ? 'fatura sem' : 'faturas sem'} NIF</p>
            <p className="text-xs text-destructive/80 mt-0.5">Faturas sem o teu NIF não são dedutíveis. Contacta o fornecedor para emitir nova fatura.</p>
          </div>
        </div>
      )}

      {/* Breakdown by category */}
      <div className="bg-surface rounded-talao border border-line p-5">
        <h2 className="font-heading font-bold text-ink mb-4">Por categoria</h2>
        <div className="space-y-4">
          {Object.entries(deductibleLabels).map(([key, info]) => {
            const data = byCategory[key] || { total: 0, count: 0 };
            const pct = totalDeductible > 0 ? (data.total / totalDeductible) * 100 : 0;
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: info.color }} />
                    <span className="text-sm font-medium text-ink">{info.label}</span>
                    {data.count > 0 && <span className="text-xs text-muted-2">({data.count})</span>}
                  </div>
                  <span className="font-mono text-sm font-semibold text-ink">{formatKz(data.total)}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: info.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deductible invoices list */}
      {deductibleInvoices.length > 0 && (
        <div className="bg-surface rounded-talao border border-line divide-y divide-line">
          <div className="px-5 py-3">
            <h2 className="font-heading font-bold text-ink">Faturas dedutíveis</h2>
          </div>
          {deductibleInvoices.slice(0, 10).map(inv => (
            <div key={inv.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium text-ink">{inv.issuer_name}</p>
                  {inv.agt_status !== 'none' && <AgtSeal status={inv.agt_status} size={14} />}
                </div>
                <p className="text-xs text-muted-2">{deductibleLabels[inv.deductible_type]?.label} · {inv.paid_date ? formatDate(inv.paid_date) : formatDate(inv.issue_date)}</p>
              </div>
              <p className="font-mono text-sm font-semibold text-ink">{formatKz(inv.amount)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Family aggregate */}
      <div className="bg-surface rounded-talao border border-line p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-bold text-ink">Agregado familiar</h2>
          </div>
          <button onClick={handleAddDep} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-2">
            <Plus className="w-4 h-4" /> Adicionar
          </button>
        </div>
        {dependents.length === 0 ? (
          <p className="text-sm text-muted-2 text-center py-6">Sem dependentes registados. Adiciona o teu cônjuge, filhos ou outros para o cálculo do IRPS.</p>
        ) : (
          <div className="space-y-2">
            {dependents.map(dep => (
              <div key={dep.id} className="flex items-center justify-between bg-muted/30 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{dep.name}</p>
                  <p className="text-xs text-muted-2">{relationshipLabels[dep.relationship] || dep.relationship}{dep.nif && ` · NIF ${dep.nif}`}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEditDep(dep)} className="p-1.5 rounded text-muted-2 hover:text-ink"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDeleteDep(dep.id)} className="p-1.5 rounded text-muted-2 hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DependentForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={loadData} dependent={editingDep} />
    </div>
  );
}