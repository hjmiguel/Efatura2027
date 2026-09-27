import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appApi } from '@/api/appClient';
import PartnerShell from '@/components/partners/PartnerShell';
import PartnerDashboard from '@/components/partners/PartnerDashboard';
import PartnerInvoices from '@/components/partners/PartnerInvoices';
import PartnerNifs from '@/components/partners/PartnerNifs';
import PartnerApiKeys from '@/components/partners/PartnerApiKeys';
import PartnerSandbox from '@/components/partners/PartnerSandbox';
import PartnerImport from '@/components/partners/PartnerImport';

export default function PartnerPortal() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('painel');
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [consents, setConsents] = useState([]);
  const [user, setUser] = useState(null);
  const [generatedKey, setGeneratedKey] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const me = await appApi.auth.me();
      if (me?.app_role !== 'partner') { navigate('/app'); return; }
      const [inv, cons] = await Promise.all([
        appApi.entities.Invoice.list('-created_date', 50),
        appApi.entities.PartnerConsent.list(),
      ]);
      setUser(me);
      setInvoices(inv.filter((i) => i.source === 'partner'));
      setConsents(cons);
    } catch (err) {
      console.error(err);
      navigate('/parceiros/entrar');
      return;
    }
    finally { setLoading(false); }
  }

  async function generateApiKey(name, nif) {
    if (!name.trim() || !nif.trim()) return;
    try {
      const key = 'gmais_live_' + Math.random().toString(36).substring(2, 18) + Math.random().toString(36).substring(2, 18);
      await appApi.functions.invoke('partnerApi', {
        action: 'create_key',
        partner_name: name,
        partner_nif: nif,
        raw_key: key,
      });
      setGeneratedKey(key);
      load();
    } catch (err) { console.error(err); }
  }

  async function revokeConsent(id) {
    if (!confirm('Revogar este consentimento?')) return;
    try {
      await appApi.entities.PartnerConsent.update(id, {
        consent_status: 'revoked',
        revoked_date: new Date().toISOString(),
      });
      await appApi.entities.AuditLog.create({
        action: 'api_key_revoke',
        actor_id: user?.id,
        actor_name: user?.full_name || user?.email,
        actor_role: 'partner',
        target_entity: 'PartnerConsent',
        target_id: id,
        module: 'partner',
      });
      load();
    } catch (err) { console.error(err); }
  }

  function copyKey() {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-line border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PartnerShell
        active={tab}
        onChange={setTab}
        partnerName={user?.full_name}
        verified={consents.length > 0}
      />
      <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-8 max-w-5xl">
        {tab === 'painel' && <PartnerDashboard invoices={invoices} consents={consents} />}
        {tab === 'faturas' && <PartnerInvoices invoices={invoices} />}
        {tab === 'importar' && <PartnerImport onDone={() => setTab('faturas')} />}
        {tab === 'nifs' && <PartnerNifs consents={consents} />}
        {tab === 'api' && (
          <PartnerApiKeys
            consents={consents}
            onGenerate={generateApiKey}
            onRevoke={revokeConsent}
            generatedKey={generatedKey}
            copied={copied}
            onCopy={copyKey}
          />
        )}
        {tab === 'sandbox' && <PartnerSandbox />}
      </main>
    </div>
  );
}