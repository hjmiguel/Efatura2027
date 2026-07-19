import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ShieldAlert, ShieldCheck, AlertTriangle, Lock } from 'lucide-react';
import { formatKz } from '@/lib/format';

export default function AdminFraud() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [inv, usrs] = await Promise.all([
        base44.entities.Invoice.list('-created_date', 200),
        base44.entities.User.list(),
      ]);
      setInvoices(inv);
      setUsers(usrs);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  // Fraud detection heuristics
  const avgAmount = invoices.length > 0 ? invoices.reduce((s, i) => s + (i.amount || 0), 0) / invoices.length : 0;

  const quarantined = invoices.filter((i) => {
    if (i.status === 'paid') return false;
    // High amount relative to average
    if (i.amount > avgAmount * 3 && avgAmount > 0) return true;
    // No NIF
    if (i.has_nif === false) return true;
    return false;
  });

  // Risk scoring by issuer
  const issuerMap = {};
  invoices.forEach((i) => {
    const name = i.issuer_name || 'Desconhecido';
    if (!issuerMap[name]) issuerMap[name] = { count: 0, noNif: 0, highAmount: 0, total: 0 };
    issuerMap[name].count++;
    issuerMap[name].total += i.amount || 0;
    if (i.has_nif === false) issuerMap[name].noNif++;
    if (avgAmount > 0 && i.amount > avgAmount * 3) issuerMap[name].highAmount++;
  });

  const riskScores = Object.entries(issuerMap)
    .map(([name, data]) => {
      let score = 0;
      if (data.noNif > 0) score += 30;
      if (data.highAmount > 0) score += 25;
      if (data.count === 1) score += 15; // new issuer
      if (data.total > 100000) score += 15;
      return { name, score: Math.min(score, 100), ...data };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  const riskColor = (score) => score >= 70 ? 'text-destructive' : score >= 40 ? 'text-[#9a6a16]' : 'text-ok';
  const riskBg = (score) => score >= 70 ? 'bg-danger-soft' : score >= 40 ? 'bg-gold-soft' : 'bg-green-soft';

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
          <span className="eyebrow">§ 03 · Antifraude</span>
          <h1 className="font-heading text-xl font-bold text-ink mt-1">Quarentena e risco</h1>
        </div>
        <span className="mark">JUL · 2026</span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-surface border border-line rounded-talao p-4 shadow-soft">
          <p className="text-[11px] text-muted-2">Em quarentena</p>
          <p className="font-mono text-[22px] font-bold text-destructive mt-1.5">{quarantined.length}</p>
        </div>
        <div className="bg-surface border border-line rounded-talao p-4 shadow-soft">
          <p className="text-[11px] text-muted-2">Emissores em risco</p>
          <p className="font-mono text-[22px] font-bold text-[#9a6a16] mt-1.5">{riskScores.filter(r => r.score >= 40).length}</p>
        </div>
        <div className="bg-surface border border-line rounded-talao p-4 shadow-soft">
          <p className="text-[11px] text-muted-2">Faturas validadas</p>
          <p className="font-mono text-[22px] font-bold text-ok mt-1.5">{invoices.length - quarantined.length}</p>
        </div>
        <div className="bg-surface border border-line rounded-talao p-4 shadow-soft">
          <p className="text-[11px] text-muted-2">Taxa de limpeza</p>
          <p className="font-mono text-[22px] font-bold text-ink mt-1.5">
            {invoices.length > 0 ? Math.round(((invoices.length - quarantined.length) / invoices.length) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Quarantined invoices */}
      <div className="bg-surface border border-line rounded-talao overflow-hidden shadow-soft">
        <div className="px-5 py-3.5 border-b border-line flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <h2 className="font-heading font-semibold text-[15px] text-ink">Faturas em quarentena</h2>
          <span className="mark ml-auto">{quarantined.length} requer revisão</span>
        </div>
        {quarantined.length === 0 ? (
          <p className="px-5 py-10 text-sm text-muted-2 text-center">Nenhuma fatura em quarentena.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-2 border-b border-line">
                  <th className="px-5 py-2.5 font-medium text-[11px]">Emissor</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]">Valor</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]">Motivo</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]">Risco</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]">Ações</th>
                </tr>
              </thead>
              <tbody>
                {quarantined.slice(0, 15).map((inv) => {
                  const reasons = [];
                  if (inv.has_nif === false) reasons.push('Sem NIF');
                  if (avgAmount > 0 && inv.amount > avgAmount * 3) reasons.push('Valor fora do padrão');
                  const isHigh = inv.amount > avgAmount * 5;
                  return (
                    <tr key={inv.id} className="border-b border-line/50 last:border-0">
                      <td className="px-5 py-3 text-ink font-medium">{inv.issuer_name || '—'}</td>
                      <td className="px-5 py-3 font-mono text-ink">{formatKz(inv.amount)}</td>
                      <td className="px-5 py-3 text-[12px] text-muted-foreground">{reasons.join(' · ')}</td>
                      <td className="px-5 py-3">
                        <span className={`${isHigh ? 'pill-late' : 'pill-pend'} text-[10.5px] font-bold px-2.5 py-0.5 rounded-full`}>
                          {isHigh ? 'Alto' : 'Médio'}
                        </span>
                      </td>
                      <td className="px-5 py-3 flex gap-1.5">
                        <button className="text-[11px] font-semibold text-ok hover:underline">Libertar</button>
                        <button className="text-[11px] font-semibold text-destructive hover:underline">Bloquear</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Validation rules */}
      <div className="bg-surface border border-line rounded-talao p-5 shadow-soft">
        <h2 className="font-heading font-semibold text-[15px] text-ink mb-4">Regras de validação</h2>
        <div className="ed-list">
          <div className="it">
            <ShieldCheck className="w-4 h-4 text-ok shrink-0" />
            <div className="flex-1"><div className="nm">Exigir relação NIF–empresa</div><div className="sb">Bloqueia faturas sem autorização prévia</div></div>
            <Lock className="w-3.5 h-3.5 text-muted-2" />
          </div>
          <div className="it">
            <AlertTriangle className="w-4 h-4 text-[#9a6a16] shrink-0" />
            <div className="flex-1"><div className="nm">Alerta de valor fora do padrão</div><div className="sb">Sinaliza acima do habitual do emissor</div></div>
            <Lock className="w-3.5 h-3.5 text-muted-2" />
          </div>
          <div className="it">
            <ShieldAlert className="w-4 h-4 text-destructive shrink-0" />
            <div className="flex-1"><div className="nm">Quarentena de emissores novos</div><div className="sb">Revê os primeiros envios</div></div>
            <Lock className="w-3.5 h-3.5 text-muted-2" />
          </div>
        </div>
      </div>

      {/* Risk scores */}
      <div className="bg-surface border border-line rounded-talao p-5 shadow-soft">
        <h2 className="font-heading font-semibold text-[15px] text-ink mb-4">Pontuação de risco por empresa</h2>
        {riskScores.length === 0 ? (
          <p className="text-sm text-muted-2 text-center py-6">Sem dados de emissores.</p>
        ) : (
          <div className="space-y-3">
            {riskScores.map((r) => (
              <div key={r.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] font-medium text-ink">{r.name}</span>
                  <span className={`font-mono text-[13px] font-bold ${riskColor(r.score)}`}>{r.score}</span>
                </div>
                <div className="track-v5">
                  <i style={{ width: `${r.score}%`, background: r.score >= 70 ? 'hsl(var(--destructive))' : r.score >= 40 ? 'hsl(var(--accent))' : 'hsl(var(--primary))' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}