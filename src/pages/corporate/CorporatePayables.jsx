import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatKz, formatDate } from '@/lib/format';

const APPROVAL_LIMIT = 200000;

export default function CorporatePayables() {
  const [loading, setLoading] = useState(true);
  const [approvals, setApprovals] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    entity_description: '', amount: '', supplier_name: '', cost_center_id: ''
  });

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [me, apprs, sups, ccs] = await Promise.all([
        base44.auth.me(),
        base44.entities.Approval.list('-created_date', 50),
        base44.entities.Supplier.list(),
        base44.entities.CostCenter.list(),
      ]);
      setUser(me);
      setApprovals(apprs);
      setSuppliers(sups);
      setCostCenters(ccs);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function submitRequest(e) {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) return;

    try {
      const supplier = suppliers.find(s => s.id === form.cost_center_id);
      await base44.entities.Approval.create({
        entity_type: 'payment',
        entity_description: form.entity_description,
        amount,
        supplier_name: form.supplier_name || undefined,
        cost_center_id: form.cost_center_id || undefined,
        status: 'pending',
        requested_by_id: user?.id,
        requested_by_name: user?.full_name || user?.email,
        requires_reason: amount > APPROVAL_LIMIT,
      });
      setShowForm(false);
      setForm({ entity_description: '', amount: '', supplier_name: '', cost_center_id: '' });
      load();
    } catch (err) { console.error(err); }
  }

  async function decide(approval, decision) {
    const note = decision === 'rejected' ? prompt('Motivo da rejeição (opcional):') || '' : '';
    if (amountRequiresReason(approval) && decision === 'approved') {
      const reason = prompt('Esta aprovação requer motivo justificado:');
      if (!reason) return;
      await logAudit(approval, reason);
    }
    try {
      await base44.entities.Approval.update(approval.id, {
        status: decision,
        approved_by_id: user?.id,
        approved_by_name: user?.full_name || user?.email,
        decision_date: new Date().toISOString(),
        decision_note: note
      });
      await base44.entities.AuditLog.create({
        action: decision === 'approved' ? 'approval_grant' : 'approval_reject',
        actor_id: user?.id,
        actor_name: user?.full_name || user?.email,
        actor_role: 'corporate_approver',
        target_entity: 'Approval',
        target_id: approval.id,
        module: 'corporate',
        details: `${approval.entity_description} — ${formatKz(approval.amount)}`
      });
      load();
    } catch (err) { console.error(err); }
  }

  function amountRequiresReason(approval) {
    return approval.amount > APPROVAL_LIMIT || approval.requires_reason;
  }

  async function logAudit(approval, reason) {
    await base44.entities.AuditLog.create({
      action: 'approval_grant',
      actor_id: user?.id,
      actor_name: user?.full_name || user?.email,
      actor_role: 'corporate_approver',
      target_entity: 'Approval',
      target_id: approval.id,
      reason,
      module: 'corporate'
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-line border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const pending = approvals.filter(a => a.status === 'pending');
  const decided = approvals.filter(a => a.status !== 'pending');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">Contas a pagar</h1>
          <p className="text-sm text-muted-2">Aprovações acima de {formatKz(APPROVAL_LIMIT)} requerem motivo</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-2 transition-colors">
          {showForm ? 'Cancelar' : 'Novo pedido'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submitRequest} className="bg-surface border border-line rounded-xl p-5 space-y-3">
          <div>
            <label className="text-xs text-muted-2 block mb-1">Descrição</label>
            <input value={form.entity_description} onChange={e => setForm({...form, entity_description: e.target.value})} required className="w-full px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:border-primary/40" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-2 block mb-1">Montante (Kz)</label>
              <input type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required className="w-full px-3 py-2 rounded-lg border border-line text-sm font-mono focus:outline-none focus:border-primary/40" />
            </div>
            <div>
              <label className="text-xs text-muted-2 block mb-1">Fornecedor</label>
              <select value={form.supplier_name} onChange={e => setForm({...form, supplier_name: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:border-primary/40">
                <option value="">—</option>
                {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-2 block mb-1">Centro de custo</label>
            <select value={form.cost_center_id} onChange={e => setForm({...form, cost_center_id: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:border-primary/40">
              <option value="">—</option>
              {costCenters.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
            </select>
          </div>
          <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-2 transition-colors">
            Submeter pedido
          </button>
        </form>
      )}

      {/* Pending */}
      <div className="bg-surface border border-line rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-line flex items-center gap-2">
          <Clock className="w-4 h-4 text-gold" />
          <h2 className="font-heading font-bold text-ink">Pendentes ({pending.length})</h2>
        </div>
        {pending.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted-2 text-center">Sem pedidos pendentes.</p>
        ) : (
          <div className="divide-y divide-line">
            {pending.map(a => (
              <div key={a.id} className="px-5 py-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-ink font-medium">{a.entity_description}</p>
                  <p className="text-sm font-mono text-ink">{formatKz(a.amount)}</p>
                </div>
                <p className="text-xs text-muted-2">
                  {a.supplier_name && `${a.supplier_name} · `}
                  Pedido por {a.requested_by_name} · {formatDate(a.created_date)}
                  {amountRequiresReason(a) && <span className="text-gold ml-1">· requer motivo</span>}
                </p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => decide(a, 'approved')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-soft text-ok text-xs font-medium hover:bg-ok/10">
                    <CheckCircle className="w-3.5 h-3.5" /> Aprovar
                  </button>
                  <button onClick={() => decide(a, 'rejected')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-danger-soft text-destructive text-xs font-medium hover:bg-destructive/10">
                    <XCircle className="w-3.5 h-3.5" /> Rejeitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Decided */}
      {decided.length > 0 && (
        <div className="bg-surface border border-line rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-line">
            <h2 className="font-heading font-bold text-ink">Decididas</h2>
          </div>
          <div className="divide-y divide-line">
            {decided.slice(0, 15).map(a => (
              <div key={a.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-ink font-medium">{a.entity_description}</p>
                  <p className="text-xs text-muted-2">
                    {a.supplier_name && `${a.supplier_name} · `}
                    {a.approved_by_name} · {formatDate(a.decision_date || a.created_date)}
                    {a.decision_note && ` · ${a.decision_note}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-ink">{formatKz(a.amount)}</p>
                  <span className={`text-xs font-medium ${a.status === 'approved' ? 'text-ok' : 'text-destructive'}`}>{a.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}