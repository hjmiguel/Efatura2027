import { createClientFromRequest } from 'npm:@base44/sdk@0.8.39';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 });

    // Check AGT consent — explicit and revocable
    if (!user.agt_consent) {
      return Response.json({
        error: 'Consentimento AGT necessário. Autoriza o acesso ao feed de faturação eletrónica.',
        code: 'NO_CONSENT'
      }, { status: 403 });
    }

    // Get user's invoices (user-scoped)
    let invoices = await base44.entities.Invoice.list();

    // Phase 0: Import partner-created invoices (service-role) into user's view
    let imported = 0;
    if (user.nif) {
      const partnerInvoices = await base44.asServiceRole.entities.Invoice.filter({
        user_nif: user.nif,
        source: 'partner'
      });

      for (const pInv of partnerInvoices) {
        // Check if user already has this invoice (duplicate detection)
        const existing = invoices.find(ui =>
          ui.document_number && pInv.document_number &&
          ui.document_number === pInv.document_number &&
          ui.issuer_nif === pInv.issuer_nif &&
          ui.amount === pInv.amount
        );

        if (!existing) {
          const newInv = await base44.entities.Invoice.create({
            issuer_name: pInv.issuer_name,
            issuer_nif: pInv.issuer_nif || '',
            document_number: pInv.document_number || '',
            amount: pInv.amount,
            issue_date: pInv.issue_date,
            due_date: pInv.due_date,
            entity: pInv.entity || '',
            reference: pInv.reference || '',
            status: pInv.status || 'pending',
            source: 'partner',
            has_nif: pInv.has_nif !== false,
            deductible_type: pInv.deductible_type || 'none',
            agt_status: pInv.agt_status || 'none',
            user_nif: pInv.user_nif
          });
          invoices.push(newInv);
          imported++;
        } else if (pInv.agt_status && pInv.agt_status !== 'none' && existing.agt_status === 'none') {
          // Sync AGT status from partner version
          await base44.entities.Invoice.update(existing.id, { agt_status: pInv.agt_status });
        }
      }
    }

    let synced = 0;
    let duplicatesFound = 0;
    let alreadyVerified = 0;
    const duplicatesRemoved = [];

    // Phase 1: Duplicate detection
    // Match by document_number + issuer_nif + amount
    const groups = {};
    for (const inv of invoices) {
      if (!inv.document_number || !inv.issuer_nif) continue;
      const key = `${inv.document_number}|${inv.issuer_nif}|${inv.amount}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(inv);
    }

    const deletedIds = new Set();
    for (const [key, groupInvoices] of Object.entries(groups)) {
      if (groupInvoices.length > 1) {
        // Keep oldest, delete rest
        groupInvoices.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
        const dups = groupInvoices.slice(1);

        for (const dup of dups) {
          duplicatesRemoved.push({
            document_number: dup.document_number,
            issuer_name: dup.issuer_name,
            amount: dup.amount,
            source: dup.source
          });
          await base44.entities.Invoice.delete(dup.id);
          deletedIds.add(dup.id);
          duplicatesFound++;
        }
      }
    }

    // Phase 2: Update AGT status for remaining invoices
    for (const inv of invoices) {
      if (deletedIds.has(inv.id)) continue;
      if (!inv.document_number || !inv.issuer_nif) continue;

      const newAgtStatus = inv.status === 'paid' ? 'paid' : 'emitted';

      if (inv.agt_status === 'none') {
        await base44.entities.Invoice.update(inv.id, { agt_status: newAgtStatus });
        synced++;
      } else if (inv.agt_status === 'emitted' && newAgtStatus === 'paid') {
        await base44.entities.Invoice.update(inv.id, { agt_status: 'paid' });
        synced++;
      } else {
        alreadyVerified++;
      }
    }

    return Response.json({
      success: true,
      synced,
      duplicates_found: duplicatesFound,
      already_verified: alreadyVerified,
      duplicates_removed: duplicatesRemoved,
      imported_from_partners: imported,
      total_processed: invoices.length - deletedIds.size
    });
  } catch (error) {
    // Independence: if the feed fails, the app continues usable
    return Response.json({
      success: false,
      error: error.message,
      code: 'FEED_ERROR'
    }, { status: 500 });
  }
});