import { createClientFromRequest } from 'npm:@base44/sdk@0.8.39';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 });

    const invoices = await base44.entities.Invoice.list();
    const divergences = [];

    for (const inv of invoices) {
      // Only check invoices tracked by AGT
      if (inv.agt_status === 'none') continue;

      const appPaid = inv.status === 'paid';
      const agtPaid = inv.agt_status === 'paid';
      const agtEmitted = inv.agt_status === 'emitted';

      // App paid, AGT only emitted — payment not yet confirmed by AGT
      if (appPaid && agtEmitted) {
        divergences.push({
          type: 'app_paid_agt_emitted',
          severity: 'info',
          invoice_id: inv.id,
          issuer_name: inv.issuer_name,
          document_number: inv.document_number,
          amount: inv.amount,
          due_date: inv.due_date,
          explanation: 'Pagaste esta fatura, mas a AGT ainda não confirmou a liquidação. Pode demorar alguns dias úteis.'
        });
      }

      // App pending/overdue, AGT paid — AGT says paid but app doesn't register it
      if (!appPaid && agtPaid) {
        divergences.push({
          type: 'app_pending_agt_paid',
          severity: 'warning',
          invoice_id: inv.id,
          issuer_name: inv.issuer_name,
          document_number: inv.document_number,
          amount: inv.amount,
          due_date: inv.due_date,
          explanation: 'A AGT confirma pagamento desta fatura, mas a app não tem registo. Verifica se pagaste por outro meio.'
        });
      }

      // Overdue in app, AGT shows emitted (not paid)
      if (inv.status === 'overdue' && agtEmitted) {
        divergences.push({
          type: 'overdue_not_paid',
          severity: 'warning',
          invoice_id: inv.id,
          issuer_name: inv.issuer_name,
          document_number: inv.document_number,
          amount: inv.amount,
          due_date: inv.due_date,
          explanation: 'Fatura em atraso na app, mas a AGT regista como emitida (não paga). Regulariza o quanto antes.'
        });
      }
    }

    return Response.json({
      divergences,
      total: divergences.length,
      warnings: divergences.filter(d => d.severity === 'warning').length,
      infos: divergences.filter(d => d.severity === 'info').length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});