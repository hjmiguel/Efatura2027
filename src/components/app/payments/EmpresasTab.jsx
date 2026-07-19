import React, { useState } from 'react';
import { Shield, Zap, Smartphone, Bell, Plus, Building2, Droplet, Tv } from 'lucide-react';
import ConnectCompanyModal from './ConnectCompanyModal';
import AuthConfirmModal from './AuthConfirmModal';

const availableCompanies = [
  { name: 'AGT', nif: '540000000', icon: Building2 },
  { name: 'ENDE', nif: '540000001', icon: Zap },
  { name: 'EPAL', nif: '540000002', icon: Droplet },
  { name: 'Africell', nif: '540000003', icon: Smartphone },
  { name: 'ZAP', nif: '540000004', icon: Tv },
  { name: 'DStv', nif: '540000005', icon: Tv },
];

const connectedCompanies = [
  { name: 'ENDE — Energia', icon: Zap, hasNotification: true },
  { name: 'Unitel — Telecom', icon: Smartphone, hasNotification: false },
];

export default function EmpresasTab() {
  const [connectOpen, setConnectOpen] = useState(false);
  const [authModal, setAuthModal] = useState(null);

  return (
    <div className="space-y-4">
      {/* AGT Card */}
      <div className="bg-[#16604E] rounded-talao p-4 text-white shadow-talao relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-heading font-bold text-[14px]">AGT — Faturação eletrónica</p>
              <p className="text-[11.5px] text-white/70">Ligada · verifica as tuus faturas</p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-white text-[#16604E] rounded-full text-[11px] font-bold shrink-0">Ligada</span>
        </div>

        {/* Pills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="px-2.5 py-1 bg-white/10 rounded-full text-[11px] font-medium">14 verificadas este mês</span>
          <span className="px-2.5 py-1 bg-white/10 rounded-full text-[11px] font-medium">Sem duplicados</span>
          <span className="px-2.5 py-1 bg-white/10 rounded-full text-[11px] font-medium">Sem foto</span>
        </div>

        {/* Consent text */}
        <p className="text-[12px] text-white/70 leading-relaxed mb-4">
          Autorizaste a Gestão+ a consultar as faturas emitidas sob o teu NIF. Podes revogar quando quiseres.
        </p>

        {/* Buttons */}
        <div className="flex gap-2">
          <button className="flex-1 py-2.5 border border-[#F2994A] text-[#F2994A] rounded-xl text-[13px] font-medium hover:bg-[#F2994A]/10 transition-colors">
            Ver situação fiscal
          </button>
          <button className="flex-1 py-2.5 border border-white/30 text-white rounded-xl text-[13px] font-medium hover:bg-white/10 transition-colors">
            Revogar
          </button>
        </div>
      </div>

      {/* Descriptive text */}
      <p className="text-[12.5px] text-muted-foreground leading-relaxed">
        As empresas enviam a fatura com a referência de pagamento, para poderes pagar. A AGT verifica que a fatura existe
        sob o teu NIF. São papéis diferentes na mesma fatura, por isso não há duplicados.
      </p>

      {/* Connected company cards */}
      {connectedCompanies.map((c) => (
        <div
          key={c.name}
          className="bg-surface border border-line rounded-talao p-3.5 shadow-soft flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
            <c.icon className="w-5 h-5 text-ink" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[13.5px] text-ink">{c.name}</p>
            <p className="text-[11.5px] text-muted-foreground mt-0.5">Conectada via NIF</p>
          </div>
          {c.hasNotification && (
            <button className="p-1.5 rounded-lg text-gold hover:bg-gold-soft transition-colors">
              <Bell className="w-4 h-4" />
            </button>
          )}
          <button className="text-[12px] font-medium text-muted-foreground hover:text-destructive transition-colors">
            Revogar
          </button>
        </div>
      ))}

      {/* Connect new company */}
      <button
        onClick={() => setConnectOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3 bg-surface border border-line rounded-talao text-sm font-medium text-ink hover:bg-muted transition-colors"
      >
        <Plus className="w-4 h-4" /> Conectar nova empresa
      </button>

      {/* Modals */}
      <ConnectCompanyModal
        open={connectOpen}
        onClose={() => setConnectOpen(false)}
        onSelect={(company) => {
          setConnectOpen(false);
          setAuthModal(company);
        }}
        companies={availableCompanies}
      />
      <AuthConfirmModal data={authModal} onClose={() => setAuthModal(null)} onAuthorize={() => setAuthModal(null)} />
    </div>
  );
}