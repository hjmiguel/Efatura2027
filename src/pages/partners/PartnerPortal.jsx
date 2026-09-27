import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appApi } from '@/api/appClient';
import PartnerShell from '@/components/partners/PartnerShell';
import PartnerDashboard from '@/components/partners/PartnerDashboard';
import PartnerInvoices from '@/components/partners/PartnerInvoices';
import PartnerNifs from '@/components/partners/PartnerNifs';
import PartnerApiKeys from '@/components/partners/PartnerApiKeys';
import PartnerFees from '@/components/partners/PartnerFees';
import PartnerSandbox from '@/components/partners/PartnerSandbox';
import PartnerImport from '@/components/partners/PartnerImport';

export default function PartnerPortal() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('painel');
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [consents, setConsents] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [fees, setFees] = useState([]);
  const [user, setUser] = useState(null);
  const [generatedKey, setGeneratedKey] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const me = await appApi.auth.me();
      if (me?.app_role !== 'partner') { navigate('/app'); return; }
      // RLS already scopes each of these to this partner (owner_user_id / partner_nif) — no manual filtering needed.
      const [inv, cons, keys, feeRecords] = await Promise.all([
        appApi.entities.Invoice.list('-created_date', 200),
        appApi.entities.PartnerConsent.list(),
        appApi.entities.PartnerApiKey.list(),
        appApi.entities.PartnerFee.list('-fee_date', 200),
      ]);
      setUser(me);
      setInvoices(inv.filter((i) => i.source === 'partner'));
      setConsents(cons);
      setApiKeys(keys);
      setFees(feeRecords);
    } catch (err) {
      console.error(err);
      navigate('/parceiros/entrar');
      return;
    }
    finally { setLoading(false); }
  }

  async function generateApiKey(name, nif, feePerInvoice) {
    if (!name.trim() || !nif.trim()) return;
    try {
      const bytes = new Uint8Array(24);
      crypto.getRandomValues(bytes);
      const key = 'gmais_live_' + Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
      await appApi.functions.invoke('partnerApi', {
        action: 'create_key',
        partner_name: name,
        partner_nif: nif,
        raw_key: key,
        fee_per_invoice: feePerInvoice || 0,
      });
      setGeneratedKey(key);
      load();
    } catch (err) { console.error(err); }
  }

  async function revokeApiKey(id) {
    if (!confirm('Revogar esta chave de API?')) return;
    try {
      await appApi.entities.PartnerApiKey.update(id, {
        status: 'revoked',
        revoked_date: new Date().toISOString(),
      });
      await appApi.entities.AuditLog.create({
        action: 'api_key_revoke',
        actor_id: user?.id,
        actor_name: user?.full_name || user?.email,
        actor_role: 'partner',
        target_entity: 'PartnerApiKey',
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
        verified={apiKeys.some((k) => k.status === 'active')}
      >
        {tab === 'painel' && <PartnerDashboard invoices={invoices} consents={consents} />}
        {tab === 'faturas' && <PartnerInvoices invoices={invoices} />}
        {tab === 'importar' && <PartnerImport onDone={() => setTab('faturas')} />}
        {tab === 'nifs' && <PartnerNifs consents={consents} />}
        {tab === 'api' && (
          <PartnerApiKeys
            apiKeys={apiKeys}
            onGenerate={generateApiKey}
            onRevoke={revokeApiKey}
            generatedKey={generatedKey}
            copied={copied}
            onCopy={copyKey}
          />
        )}
        {tab === 'honorarios' && <PartnerFees fees={fees} />}
        {tab === 'sandbox' && <PartnerSandbox />}
      </PartnerShell>
    </div>
  );
}