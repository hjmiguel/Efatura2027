import React, { useState, useEffect, useMemo } from 'react';
import { appApi } from '@/api/appClient';
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
        appApi.entities.Invoice.list(),
        appApi.entities.Dependent.list(),
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
    try { await appApi.entities.Dependent.delete(id); setDependents(dependents.filter(d => d.id !== id)); }
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="eyebrow">§ 07 · Deduções</span>
          <h1 className="font-heading text-2xl font-bold text-ink mt-1">Dedutíveis IRPS</h1>
        </div>
        <button onClick={handleExportCSV} disabled={deductibleInvoices.length === 0}
          className="inline-flex items-center gap-1.5 bg-surface border border-line hover:border-primary/30 text-ink font-medium px-3 py-2 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <Download className="w-4 h-4" /> Exportar
        </button>
      </div>

      {/* Gold summary card (discreet) */}
      <div className="rounded-talao p-3.5 bg-gold-soft/60 border border-gold/20 shadow-soft flex items-center justify-between">
        <div>
          <p className="text-[11px] text-ink/60 font-medium">Acumulado · IRPS {new Date().getFullYear() + 1}</p>
          <p className="font-mono text-xl font-bold text-ink mt-0.5">{formatKz(totalDeductible)}</p>
          <p className="text-[10.5px] text-ink/50 mt-1">Apenas faturas pagas com o teu NIF.</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-gold/15 flex items-center justify-center shrink-0">
          <FileText className="w-4.5 h-4.5 text-gold" />
        </div>
      </div>

      {/* Without NIF warning */}
      {withoutNif.length > 0 && (
        <div className="flex items-start gap-3 bg-danger-soft rounded-talao border border-destructive/20 p-4">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-semibold text-destructive">{withoutNif.length} {withoutNif.length === 1 ? 'fatura sem' : 'faturas sem'} NIF</p>
            <p className="text-[11.5px] text-destructive/80 mt-0.5">Faturas sem o teu NIF não contam para o acumulado dedutível.</p>
          </div>
        </div>
      )}

      {/* Breakdown by category */}
      <div className="bg-surface rounded-talao border border-line p-4 shadow-soft">
        <span className="eyebrow">Por categoria</span>
        <div className="mt-3 space-y-3">
          {Object.entries(deductibleLabels).map(([key, info]) => {
            const data = byCategory[key] || { total: 0, count: 0 };
            const pct = totalDeductible > 0 ? (data.total / totalDeductible) * 100 : 0;
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: info.color }} />
                    <span className="text-[13px] font-medium text-ink">{info.label}</span>
                    {data.count > 0 && <span className="text-[11px] text-muted-2">({data.count})</span>}
                  </div>
                  <span className="font-mono text-[13px] font-semibold text-ink">{formatKz(data.total)}</span>
                </div>
                <div className="track-v5">
                  <i style={{ width: `${pct}%`, backgroundColor: info.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deductible invoices list (flush) */}
      {deductibleInvoices.length > 0 && (
        <div className="bg-surface rounded-talao border border-line shadow-soft px-3 pb-2">
          <div className="px-1 pt-3 pb-1">
            <span className="eyebrow">Faturas dedutíveis</span>
          </div>
          <div className="ed-list">
            {deductibleInvoices.slice(0, 10).map(inv => (
              <div key={inv.id} className="it">
                <div className="w-[34px] h-[34px] rounded-[10px] bg-gold-soft text-gold flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="nm truncate flex items-center gap-1.5">
                    {inv.issuer_name}
                    {inv.agt_status !== 'none' && <AgtSeal status={inv.agt_status} size={14} />}
                  </div>
                  <div className="sb">{deductibleLabels[inv.deductible_type]?.label} · {inv.paid_date ? formatDate(inv.paid_date) : formatDate(inv.issue_date)}</div>
                </div>
                <span className="vl">{formatKz(inv.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Family aggregate */}
      <div className="bg-surface rounded-talao border border-line p-4 shadow-soft">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-[13px] font-semibold text-ink">Agregado familiar</span>
          </div>
          <button onClick={handleAddDep} className="inline-flex items-center gap-1 text-[13px] font-medium text-primary hover:text-primary-2">
            <Plus className="w-3.5 h-3.5" /> Adicionar
          </button>
        </div>
        {dependents.length === 0 ? (
          <p className="text-[12.5px] text-muted-2 text-center py-5">Sem dependentes registados. Adiciona o teu cônjuge, filhos ou outros para o cálculo do IRPS.</p>
        ) : (
          <div className="ed-list">
            {dependents.map(dep => (
              <div key={dep.id} className="it">
                <div className="w-[34px] h-[34px] rounded-[10px] bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="nm">{dep.name}</div>
                  <div className="sb">{relationshipLabels[dep.relationship] || dep.relationship}{dep.nif && ` · NIF ${dep.nif}`}</div>
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