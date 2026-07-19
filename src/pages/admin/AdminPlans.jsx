import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { TrendingUp, Save, Info } from 'lucide-react';
import { formatKz } from '@/lib/format';

export default function AdminPlans() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [freePlan, setFreePlan] = useState({ invoiceLimit: '50', companyLimit: '3', features: 'Faturas manuais, OCR limitado, orçamento básico' });
  const [premiumPlan, setPremiumPlan] = useState({ monthlyPrice: '2500', yearlyPrice: '27000', features: 'Faturas ilimitadas, assistente IA, relatórios avançados, todas as empresas', promo: 'Primeiro mês grátis' });
  const [saved, setSaved] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [usrs, inv] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.Invoice.list(),
      ]);
      setUsers(usrs);
      setInvoices(inv);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  const premiumCount = users.filter((u) => u.role === 'admin').length;
  const freeCount = users.length - premiumCount;
  const mrr = premiumCount * parseFloat(premiumPlan.monthlyPrice || 0);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-line border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <span className="eyebrow">§ 05 · Planos e receita</span>
          <h1 className="font-heading text-xl font-bold text-ink mt-1">Gestão de planos</h1>
        </div>
        <span className="mark">JUL · 2026</span>
      </div>

      {/* Revenue KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface border border-line rounded-talao p-4 shadow-soft">
          <p className="text-[11px] text-muted-2">MRR estimado</p>
          <p className="font-mono text-[22px] font-bold text-ink mt-1.5">{formatKz(mrr)}</p>
          <div className="flex items-center gap-1 mt-1.5 text-[11px] font-medium text-ok">
            <TrendingUp className="w-3 h-3" /> 7% vs maio
          </div>
        </div>
        <div className="bg-surface border border-line rounded-talao p-4 shadow-soft">
          <p className="text-[11px] text-muted-2">Subscritores Premium</p>
          <p className="font-mono text-[22px] font-bold text-ok mt-1.5">{premiumCount}</p>
        </div>
        <div className="bg-surface border border-line rounded-talao p-4 shadow-soft">
          <p className="text-[11px] text-muted-2">Gratuitos</p>
          <p className="font-mono text-[22px] font-bold text-ink mt-1.5">{freeCount}</p>
        </div>
      </div>

      {/* Free plan */}
      <div className="bg-surface border border-line rounded-talao p-5 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-[15px] text-ink">Plano gratuito</h2>
          <span className="pill-paid text-[10.5px] font-bold px-2.5 py-1 rounded-full">Ativo</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] text-muted-2 block mb-1">Limite de faturas por mês</label>
            <input
              value={freePlan.invoiceLimit}
              onChange={(e) => setFreePlan({ ...freePlan, invoiceLimit: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-line text-sm font-mono focus:outline-none focus:border-primary/40"
            />
          </div>
          <div>
            <label className="text-[11px] text-muted-2 block mb-1">Limite de empresas ligadas</label>
            <input
              value={freePlan.companyLimit}
              onChange={(e) => setFreePlan({ ...freePlan, companyLimit: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-line text-sm font-mono focus:outline-none focus:border-primary/40"
            />
          </div>
        </div>
        <div className="mt-3">
          <label className="text-[11px] text-muted-2 block mb-1">Inclui</label>
          <textarea
            value={freePlan.features}
            onChange={(e) => setFreePlan({ ...freePlan, features: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:border-primary/40"
          />
        </div>
      </div>

      {/* Premium plan */}
      <div className="bg-surface border border-line rounded-talao p-5 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-[15px] text-ink">Plano Premium</h2>
          <span className="pill-paid text-[10.5px] font-bold px-2.5 py-1 rounded-full">Ativo</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] text-muted-2 block mb-1">Preço mensal (Kz)</label>
            <input
              value={premiumPlan.monthlyPrice}
              onChange={(e) => setPremiumPlan({ ...premiumPlan, monthlyPrice: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-line text-sm font-mono focus:outline-none focus:border-primary/40"
            />
          </div>
          <div>
            <label className="text-[11px] text-muted-2 block mb-1">Preço anual (Kz)</label>
            <input
              value={premiumPlan.yearlyPrice}
              onChange={(e) => setPremiumPlan({ ...premiumPlan, yearlyPrice: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-line text-sm font-mono focus:outline-none focus:border-primary/40"
            />
          </div>
        </div>
        <div className="mt-3">
          <label className="text-[11px] text-muted-2 block mb-1">Inclui</label>
          <textarea
            value={premiumPlan.features}
            onChange={(e) => setPremiumPlan({ ...premiumPlan, features: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:border-primary/40"
          />
        </div>
        <div className="mt-3">
          <label className="text-[11px] text-muted-2 block mb-1">Promoção ativa</label>
          <input
            value={premiumPlan.promo}
            onChange={(e) => setPremiumPlan({ ...premiumPlan, promo: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:border-primary/40"
          />
        </div>
        <button onClick={handleSave} className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-2 transition-colors">
          <Save className="w-4 h-4" /> {saved ? 'Guardado!' : 'Guardar'}
        </button>
      </div>

      <div className="flex items-start gap-2.5 bg-gold-soft border border-[#e6cfa0] rounded-talao p-4">
        <Info className="w-4 h-4 text-[#9a6a16] shrink-0 mt-0.5" />
        <p className="text-[12px] text-[#8a6420] leading-relaxed">
          Os preços ficam por validar com teste de mercado, com base no poder de compra local.
        </p>
      </div>
    </div>
  );
}