import React, { useState, useEffect } from 'react';
import { Shield, Zap, Smartphone, Bell, Plus, Building2, Droplet, Tv, Loader2 } from 'lucide-react';
import { appApi } from '@/api/appClient';
import ConnectCompanyModal from './ConnectCompanyModal';
import AuthConfirmModal from './AuthConfirmModal';

const ICONS = { Building2, Zap, Droplet, Smartphone, Tv };

export default function EmpresasTab() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [consents, setConsents] = useState([]);
  const [connectOpen, setConnectOpen] = useState(false);
  const [authModal, setAuthModal] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [me, allCompanies, allConsents] = await Promise.all([
        appApi.auth.me(),
        appApi.entities.UtilityCompany.filter({ is_active: true }),
        appApi.entities.PartnerConsent.list('-created_date', 200),
      ]);
      setUser(me);
      setCompanies(allCompanies);
      setConsents(allConsents.filter((c) => c.user_nif === me.nif));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const withIcon = (c) => ({ ...c, icon: ICONS[c.icon] || Building2 });
  const availableCompanies = companies.map(withIcon);
  const activeConsents = consents.filter((c) => c.consent_status === 'active');

  async function handleAuthorize(company) {
    if (!user?.nif) { setAuthModal(null); return; }
    try {
      await appApi.entities.PartnerConsent.create({
        partner_name: company.name,
        partner_nif: company.nif,
        user_nif: user.nif,
        consent_status: 'active',
        consent_date: new Date().toISOString(),
      });
      setAuthModal(null);
      load();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleRevoke(consentId) {
    try {
      await appApi.entities.PartnerConsent.update(consentId, {
        consent_status: 'revoked',
        revoked_date: new Date().toISOString(),
      });
      load();
    } catch (err) { console.error(err); }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-muted-2 animate-spin" />
      </div>
    );
  }

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
              <p className="text-[11.5px] text-white/70">
                {user?.agt_consent ? 'Ligada · verifica as tuas faturas' : 'Não ligada'}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-white text-[#16604E] rounded-full text-[11px] font-bold shrink-0">
            {user?.agt_consent ? 'Ligada' : 'Desligada'}
          </span>
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
      {activeConsents.length === 0 ? (
        <p className="text-center text-[12.5px] text-muted-foreground py-4">
          Ainda não autorizaste nenhuma empresa a enviar-te faturas.
        </p>
      ) : (
        activeConsents.map((c) => {
          const catalog = companies.find((co) => co.nif === c.partner_nif);
          const Icon = ICONS[catalog?.icon] || Building2;
          return (
            <div
              key={c.id}
              className="bg-surface border border-line rounded-talao p-3.5 shadow-soft flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-ink" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[13.5px] text-ink">{c.partner_name}</p>
                <p className="text-[11.5px] text-muted-foreground mt-0.5">Conectada via NIF</p>
              </div>
              <button
                onClick={() => handleRevoke(c.id)}
                className="text-[12px] font-medium text-muted-foreground hover:text-destructive transition-colors"
              >
                Revogar
              </button>
            </div>
          );
        })
      )}

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
      <AuthConfirmModal data={authModal} onClose={() => setAuthModal(null)} onAuthorize={() => handleAuthorize(authModal)} />
    </div>
  );
}