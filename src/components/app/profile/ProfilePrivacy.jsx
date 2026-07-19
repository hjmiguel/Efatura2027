import React, { useState } from 'react';
import { Download, Trash2, Shield, Loader2, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

function toCSV(rows, headers) {
  const head = headers.join(',');
  const body = rows.map(r => headers.map(h => {
    const val = r[h];
    if (val === null || val === undefined) return '';
    const str = String(val).replace(/"/g, '""');
    return /[",\n]/.test(str) ? `"${str}"` : str;
  }).join(',')).join('\n');
  return `${head}\n${body}`;
}

function downloadCSV(filename, csv) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ProfilePrivacy() {
  const [exporting, setExporting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const [transactions, invoices, accounts] = await Promise.all([
        base44.entities.Transaction.list('-date', 500),
        base44.entities.Invoice.list('-issue_date', 500),
        base44.entities.Account.list(),
      ]);

      downloadCSV('gestao-transacoes.csv', toCSV(transactions, ['description', 'amount', 'date', 'type', 'account_id', 'category_id', 'notes']));
      downloadCSV('gestao-faturas.csv', toCSV(invoices, ['issuer_name', 'issuer_nif', 'document_number', 'amount', 'issue_date', 'due_date', 'status', 'payment_method', 'deductible_type', 'has_nif']));
      downloadCSV('gestao-contas.csv', toCSV(accounts, ['name', 'bank_name', 'iban', 'balance', 'type', 'is_active']));
    } catch (err) {
      console.error('Erro ao exportar:', err);
    } finally {
      setExporting(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== 'ELIMINAR') return;
    setDeleting(true);
    try {
      // Delete user data
      const [transactions, invoices, accounts, dependents] = await Promise.all([
        base44.entities.Transaction.list('-date', 500),
        base44.entities.Invoice.list('-issue_date', 500),
        base44.entities.Account.list(),
        base44.entities.Dependent.list(),
      ]);

      await base44.entities.Transaction.deleteMany({ id: { $in: transactions.map(t => t.id) } });
      await base44.entities.Invoice.deleteMany({ id: { $in: invoices.map(i => i.id) } });
      await base44.entities.Account.deleteMany({ id: { $in: accounts.map(a => a.id) } });
      await base44.entities.Dependent.deleteMany({ id: { $in: dependents.map(d => d.id) } });

      await base44.auth.logout('/entrar');
    } catch (err) {
      console.error('Erro ao eliminar conta:', err);
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Export data */}
      <div className="bg-surface rounded-xl border border-line p-4">
        <div className="flex items-center gap-2 mb-3">
          <Download className="w-4 h-4 text-primary" />
          <h3 className="font-heading font-semibold text-ink text-sm">Exportar os meus dados</h3>
        </div>
        <p className="text-xs text-muted-2 mb-3">
          Descarrega todas as tuas transações, faturas e contas em formato CSV. Podes usar nouttras aplicações ou guardar como cópia de segurança.
        </p>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center gap-2 border border-line hover:border-primary/30 text-ink font-medium px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {exporting ? 'A exportar...' : 'Exportar dados (CSV)'}
        </button>
      </div>

      {/* Privacy info */}
      <div className="bg-surface rounded-xl border border-line p-4">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <p>• Os teus dados são protegidos ao abrigo da Lei 22/11 (Proteção de Dados de Angola).</p>
            <p>• O consentimento para acesso à AGT é explícito e revogável a qualquer momento.</p>
            <p>• A Gestão+ não intermedeia pagamentos — todo o pagamento é feito diretamente ao fornecedor.</p>
            <p>• Não partilhamos os teus dados financeiros com terceiros sem o teu consentimento.</p>
          </div>
        </div>
      </div>

      {/* Delete account */}
      <div className="bg-danger-soft/30 rounded-xl border border-destructive/20 p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <h3 className="font-heading font-semibold text-destructive text-sm">Eliminar conta</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Esta ação é irreversível. Todas as tuas transações, faturas, contas e dependentes serão permanentemente eliminados.
        </p>
        <button
          onClick={() => setShowDelete(true)}
          className="inline-flex items-center gap-2 bg-destructive hover:bg-destructive/90 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Trash2 className="w-4 h-4" /> Eliminar a minha conta
        </button>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={showDelete} onOpenChange={(v) => !v && setShowDelete(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Confirmar eliminação da conta</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="flex items-start gap-2 bg-danger-soft/50 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Vais perder <strong>todas</strong> as transações, faturas, contas e dependentes associados a esta conta. Esta ação não pode ser desfeita.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Escreve <strong className="font-mono">ELIMINAR</strong> para confirmar:
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm font-mono focus:outline-none focus:border-destructive/40"
              placeholder="ELIMINAR"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDelete(false)} disabled={deleting}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirm !== 'ELIMINAR' || deleting}
            >
              {deleting ? 'A eliminar...' : 'Eliminar conta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}