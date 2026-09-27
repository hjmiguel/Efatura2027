import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { secrets } from 'base44:runtime';

async function sha256Hex(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hmacHex(message, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function timingSafeEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export default async function (req) {
  try {
    const rawBody = await req.text();
    const body = rawBody ? JSON.parse(rawBody) : {};
    const { action } = body;
    const base44 = createClientFromRequest(req);

    // ---- create_key: called by the logged-in partner from the portal ----
    if (action === 'create_key') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Não autenticado', code: 'UNAUTHENTICATED' }, { status: 401 });

      const { partner_name, partner_nif, raw_key, fee_per_invoice } = body;
      if (!partner_name || !partner_nif || !raw_key) {
        return Response.json({ error: 'Campos obrigatórios: partner_name, partner_nif, raw_key', code: 'MISSING_FIELDS' }, { status: 400 });
      }

      const apiKeyHash = await sha256Hex(raw_key);
      const apiKeyPreview = raw_key.slice(0, 16) + '…';

      const apiKey = await base44.asServiceRole.entities.PartnerApiKey.create({
        partner_name,
        partner_nif,
        api_key_hash: apiKeyHash,
        api_key_preview: apiKeyPreview,
        scopes: ['emit', 'status', 'list'],
        status: 'active',
        owner_user_id: user.id,
        fee_per_invoice: fee_per_invoice || 0,
      });

      // Keep the partner's own NIF on their user record — used by RLS to scope consents to this partner.
      await base44.asServiceRole.entities.User.update(user.id, { partner_nif });

      return Response.json({ success: true, api_key_id: apiKey.id });
    }

    // ---- mcx_webhook: public endpoint, protected by HMAC signature ----
    if (action === 'mcx_webhook') {
      const secret = secrets.get('MCX_WEBHOOK_SECRET');
      const signature = req.headers.get('X-Gestao-Signature') || '';
      const expected = secret ? await hmacHex(rawBody, secret) : null;
      const valid = Boolean(secret) && Boolean(signature) && timingSafeEqual(signature, expected);

      if (!valid) {
        await base44.asServiceRole.entities.AuditLog.create({
          action: 'settings_change',
          actor_id: 'system',
          actor_name: 'mcx_webhook',
          actor_role: 'partner',
          module: 'partner',
          reason: 'mcx_webhook_invalid_signature',
          details: `invoice_id=${body.invoice_id || '—'}`,
        });
        return Response.json({ error: 'Assinatura inválida ou em falta', code: 'INVALID_SIGNATURE' }, { status: 401 });
      }

      const { invoice_id, payment_confirmed } = body;
      if (!invoice_id) {
        return Response.json({ error: 'invoice_id obrigatório', code: 'MISSING_FIELDS' }, { status: 400 });
      }

      const invoice = await base44.asServiceRole.entities.Invoice.get(invoice_id);
      if (!invoice) {
        return Response.json({ error: 'Fatura não encontrada', code: 'NOT_FOUND' }, { status: 404 });
      }

      if (payment_confirmed) {
        await base44.asServiceRole.entities.Invoice.update(invoice_id, {
          status: 'paid',
          paid_date: new Date().toISOString().split('T')[0],
          // agt_status is never touched here — only a real AGT confirmation may change it.
        });

        if (invoice.partner_owner_id) {
          const keys = await base44.asServiceRole.entities.PartnerApiKey.filter({
            owner_user_id: invoice.partner_owner_id,
            status: 'active',
          });
          const partnerKey = keys && keys[0];
          if (partnerKey && partnerKey.fee_per_invoice > 0) {
            await base44.asServiceRole.entities.PartnerFee.create({
              partner_api_key_id: partnerKey.id,
              partner_name: partnerKey.partner_name,
              invoice_id: invoice.id,
              fee_amount: partnerKey.fee_per_invoice,
              fee_date: new Date().toISOString().split('T')[0],
              billing_period: new Date().toISOString().slice(0, 7),
              billed_status: 'pending',
              owner_user_id: partnerKey.owner_user_id,
            });
          }
        }
      }

      return Response.json({ success: true, invoice_id, status: payment_confirmed ? 'paid' : invoice.status });
    }

    // ---- import_batch: called by the logged-in partner from the portal import wizard ----
    if (action === 'import_batch') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Não autenticado', code: 'UNAUTHENTICATED' }, { status: 401 });

      const { rows, dry_run } = body;
      if (!Array.isArray(rows)) {
        return Response.json({ error: 'rows deve ser uma lista', code: 'MISSING_FIELDS' }, { status: 400 });
      }

      const ownKeys = await base44.asServiceRole.entities.PartnerApiKey.filter({ owner_user_id: user.id, status: 'active' });
      const partnerKey = ownKeys && ownKeys[0];
      if (!partnerKey) {
        return Response.json({ error: 'Precisas de uma chave de API ativa para importar faturas', code: 'NO_ACTIVE_KEY' }, { status: 403 });
      }

      const results = [];
      for (const row of rows) {
        const nif = (row.nif || '').toString().trim();
        const valor = parseFloat(row.valor);
        const vencimento = (row.vencimento || '').toString().trim();

        if (!nif || !vencimento || isNaN(valor) || valor <= 0) {
          results.push({ ...row, status: 'error', reason: 'Campos obrigatórios em falta (NIF, valor ou vencimento)' });
          continue;
        }

        // Import succeeds independently of consent — consent (plus subscription) only gates whether
        // the invoice is later shown to the end user, never whether the partner can send it.
        const rowStatus = valor > 100000 ? 'warning' : 'ready';

        if (!dry_run) {
          const invoice = await base44.asServiceRole.entities.Invoice.create({
            issuer_name: partnerKey.partner_name,
            issuer_nif: partnerKey.partner_nif,
            amount: valor,
            due_date: vencimento,
            issue_date: new Date().toISOString().split('T')[0],
            entity: row.entidade || '',
            reference: row.referencia || '',
            payment_method: row.pagamento === 'referencia' ? 'mcx_reference' : (row.pagamento || 'manual'),
            status: 'pending',
            source: 'partner',
            has_nif: true,
            user_nif: nif,
            agt_status: 'none',
            partner_emitted: true,
            partner_owner_id: user.id,
          });
          results.push({ ...row, status: rowStatus, invoice_id: invoice.id });
        } else {
          results.push({ ...row, status: rowStatus });
        }
      }

      return Response.json({ success: true, results });
    }

    // ---- Remaining actions require a Bearer API key ----
    const authHeader = req.headers.get('Authorization') || '';
    const apiKey = authHeader.replace('Bearer ', '');
    if (!apiKey) {
      return Response.json({ error: 'API Key em falta', code: 'NO_API_KEY' }, { status: 401 });
    }

    const apiKeyHash = await sha256Hex(apiKey);
    const keys = await base44.asServiceRole.entities.PartnerApiKey.filter({ api_key_hash: apiKeyHash, status: 'active' });
    if (!keys || keys.length === 0) {
      return Response.json({ error: 'API Key inválida ou revogada', code: 'INVALID_API_KEY' }, { status: 401 });
    }
    const partnerKey = keys[0];

    switch (action) {
      case 'emit': {
        if (!partnerKey.scopes || !partnerKey.scopes.includes('emit')) {
          return Response.json({ error: 'Sem permissão para emitir faturas', code: 'NO_SCOPE' }, { status: 403 });
        }

        const { issuer_name, issuer_nif, document_number, amount, due_date, entity, reference, user_nif } = body;
        if (!issuer_name || amount === undefined || !due_date) {
          return Response.json({ error: 'Campos obrigatórios em falta: issuer_name, amount, due_date', code: 'MISSING_FIELDS' }, { status: 400 });
        }
        if (!user_nif) {
          return Response.json({ error: 'user_nif obrigatório — NIF do utilizador destinatário', code: 'MISSING_USER_NIF' }, { status: 400 });
        }

        const consents = await base44.asServiceRole.entities.PartnerConsent.filter({
          partner_nif: partnerKey.partner_nif,
          user_nif,
          consent_status: 'active',
        });
        if (!consents || consents.length === 0) {
          return Response.json({ error: 'Este NIF não autorizou a tua empresa, ou a autorização foi revogada', code: 'NO_CONSENT' }, { status: 403 });
        }

        if (document_number && issuer_nif) {
          const existing = await base44.asServiceRole.entities.Invoice.filter({ document_number, issuer_nif, amount });
          if (existing && existing.length > 0) {
            return Response.json(
              { error: 'Fatura duplicada — já existe um registo com o mesmo número, NIF e montante', code: 'DUPLICATE', existing_id: existing[0].id },
              { status: 409 }
            );
          }
        }

        const invoice = await base44.asServiceRole.entities.Invoice.create({
          issuer_name,
          issuer_nif: issuer_nif || '',
          document_number: document_number || '',
          amount,
          due_date,
          issue_date: body.issue_date || new Date().toISOString().split('T')[0],
          entity: entity || '',
          reference: reference || '',
          status: 'pending',
          source: 'partner',
          has_nif: true,
          user_nif,
          agt_status: 'none',
          partner_emitted: true,
          partner_owner_id: partnerKey.owner_user_id,
        });

        return Response.json({ success: true, invoice_id: invoice.id, status: 'pending' });
      }

      case 'status': {
        if (!partnerKey.scopes || !partnerKey.scopes.includes('status')) {
          return Response.json({ error: 'Sem permissão de consulta', code: 'NO_SCOPE' }, { status: 403 });
        }

        const { invoice_id } = body;
        if (!invoice_id) {
          return Response.json({ error: 'invoice_id obrigatório', code: 'MISSING_FIELDS' }, { status: 400 });
        }

        const invoice = await base44.asServiceRole.entities.Invoice.get(invoice_id);
        if (!invoice || invoice.partner_owner_id !== partnerKey.owner_user_id) {
          return Response.json({ error: 'Fatura não encontrada', code: 'NOT_FOUND' }, { status: 404 });
        }

        return Response.json({
          invoice_id: invoice.id,
          status: invoice.status,
          agt_status: invoice.agt_status,
          amount: invoice.amount,
          issuer_name: invoice.issuer_name,
          document_number: invoice.document_number,
          due_date: invoice.due_date,
          paid_date: invoice.paid_date,
        });
      }

      case 'list': {
        if (!partnerKey.scopes || !partnerKey.scopes.includes('list')) {
          return Response.json({ error: 'Sem permissão de listagem', code: 'NO_SCOPE' }, { status: 403 });
        }

        const partnerInvoices = await base44.asServiceRole.entities.Invoice.filter({
          partner_owner_id: partnerKey.owner_user_id,
          source: 'partner',
        });

        return Response.json({
          invoices: partnerInvoices.map((inv) => ({
            id: inv.id,
            issuer_name: inv.issuer_name,
            document_number: inv.document_number,
            amount: inv.amount,
            status: inv.status,
            agt_status: inv.agt_status,
            due_date: inv.due_date,
          })),
          total: partnerInvoices.length,
        });
      }

      default:
        return Response.json({ error: 'Ação desconhecida. Use: create_key, emit, status, list, mcx_webhook', code: 'UNKNOWN_ACTION' }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message, code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}