import { createClientFromRequest } from 'npm:@base44/sdk@0.8.39';

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    // Validate API key from Authorization header
    const authHeader = req.headers.get('Authorization') || '';
    const apiKey = authHeader.replace('Bearer ', '');

    if (!apiKey) {
      return Response.json({ error: 'API Key em falta', code: 'NO_API_KEY' }, { status: 401 });
    }

    const apiKeyHash = await sha256(apiKey);

    const base44 = createClientFromRequest(req);

    // Find partner consent by API key hash — must be active
    const consents = await base44.asServiceRole.entities.PartnerConsent.filter({
      api_key_hash: apiKeyHash,
      consent_status: 'active'
    });

    if (!consents || consents.length === 0) {
      return Response.json({ error: 'API Key inválida ou consentimento revogado', code: 'INVALID_API_KEY' }, { status: 401 });
    }

    const consent = consents[0];

    switch (action) {
      case 'emit': {
        if (!consent.scopes || !consent.scopes.includes('emit')) {
          return Response.json({ error: 'Sem permissão para emitir faturas', code: 'NO_SCOPE' }, { status: 403 });
        }

        const { issuer_name, issuer_nif, document_number, amount, due_date, entity, reference } = body;
        if (!issuer_name || amount === undefined || !due_date) {
          return Response.json({ error: 'Campos obrigatórios em falta: issuer_name, amount, due_date', code: 'MISSING_FIELDS' }, { status: 400 });
        }

        // Duplicate detection: document_number + issuer_nif + amount
        if (document_number && issuer_nif) {
          const existing = await base44.asServiceRole.entities.Invoice.filter({
            document_number,
            issuer_nif,
            amount
          });
          if (existing && existing.length > 0) {
            return Response.json({
              error: 'Fatura duplicada — já existe um registo com o mesmo número, NIF e montante',
              code: 'DUPLICATE',
              existing_id: existing[0].id
            }, { status: 409 });
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
          user_nif: consent.user_nif || '',
          agt_status: 'emitted'
        });

        return Response.json({ success: true, invoice_id: invoice.id, status: 'pending' });
      }

      case 'status': {
        if (!consent.scopes || !consent.scopes.includes('status')) {
          return Response.json({ error: 'Sem permissão de consulta', code: 'NO_SCOPE' }, { status: 403 });
        }

        const { invoice_id } = body;
        if (!invoice_id) {
          return Response.json({ error: 'invoice_id obrigatório', code: 'MISSING_FIELDS' }, { status: 400 });
        }

        const invoice = await base44.asServiceRole.entities.Invoice.get(invoice_id);
        if (!invoice || (invoice.user_nif !== consent.user_nif && invoice.created_by_id !== consent.created_by_id)) {
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
          paid_date: invoice.paid_date
        });
      }

      case 'list': {
        if (!consent.scopes || !consent.scopes.includes('list')) {
          return Response.json({ error: 'Sem permissão de listagem', code: 'NO_SCOPE' }, { status: 403 });
        }

        const partnerInvoices = await base44.asServiceRole.entities.Invoice.filter({
          user_nif: consent.user_nif,
          source: 'partner'
        });

        return Response.json({
          invoices: partnerInvoices.map(inv => ({
            id: inv.id,
            issuer_name: inv.issuer_name,
            document_number: inv.document_number,
            amount: inv.amount,
            status: inv.status,
            agt_status: inv.agt_status,
            due_date: inv.due_date
          })),
          total: partnerInvoices.length
        });
      }

      case 'mcx_webhook': {
        // MCX payment notification — validates via partner API key
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
            agt_status: 'paid'
          });
        }

        return Response.json({
          success: true,
          invoice_id,
          status: payment_confirmed ? 'paid' : invoice.status
        });
      }

      default:
        return Response.json({ error: 'Ação desconhecida. Use: emit, status, list, mcx_webhook', code: 'UNKNOWN_ACTION' }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message, code: 'INTERNAL_ERROR' }, { status: 500 });
  }
});