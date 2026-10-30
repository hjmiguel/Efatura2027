import React, { useState, useEffect, useRef } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { appApi } from '@/api/appClient';
import { Sparkles, Loader2 } from 'lucide-react';

const CLASSIFY_TIMEOUT_MS = 8000;

// Rejeita se o sinal for abortado ou ao fim do timeout.
function withAbort(promise, signal) {
  return new Promise((resolve, reject) => {
    const onAbort = () => reject(new Error('aborted'));
    if (signal.aborted) return onAbort();
    signal.addEventListener('abort', onAbort, { once: true });
    promise.then(resolve, reject).finally(() => signal.removeEventListener('abort', onAbort));
  });
}

async function classifyCategory(description, type, categories, signal) {
  const relevant = categories.filter((c) => c.type === type);
  if (relevant.length === 0 || !description) return '';
  try {
    const res = await withAbort(appApi.integrations.Core.InvokeLLM({
      prompt: `Classifica esta transação financeira angolana numa das categorias dadas. Descrição: "${description}". Categorias disponíveis: ${relevant.map((c) => c.name).join(', ')}. Devolve apenas o nome exato da categoria mais adequada.`,
      response_json_schema: {
        type: 'object',
        properties: { category_name: { type: 'string', enum: relevant.map((c) => c.name) } },
        required: ['category_name'],
      },
    }), signal);
    return relevant.find((c) => c.name === res?.category_name)?.id || '';
  } catch (err) {
    if (signal.aborted) throw err;
    console.error('Erro ao classificar categoria:', err);
    return '';
  }
}

export default function TransactionForm({ open, onClose, onSaved, transaction, accounts, categories }) {
  const [saving, setSaving] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [amountError, setAmountError] = useState('');
  const cancelledRef = useRef(false);
  const abortRef = useRef(null);
  const [form, setForm] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    account_id: '',
    category_id: '',
    notes: '',
  });

  useEffect(() => {
    if (!open) return;
    setAmountError('');
    if (transaction) {
      setForm({
        description: transaction.description || '',
        amount: Math.abs(transaction.amount || 0).toString(),
        date: transaction.date || new Date().toISOString().split('T')[0],
        type: transaction.type || 'expense',
        account_id: transaction.account_id || '',
        category_id: transaction.category_id || '',
        notes: transaction.notes || '',
      });
    } else {
      setForm({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        account_id: accounts[0]?.id || '',
        category_id: '',
        notes: '',
      });
    }
  }, [transaction, open, accounts]);

  const handleClose = () => {
    cancelledRef.current = true;
    abortRef.current?.abort();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    const parsed = parseFloat(form.amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setAmountError('Indica um montante maior que zero');
      return;
    }
    setAmountError('');
    cancelledRef.current = false;
    setSaving(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const amount = Math.abs(parsed);
      const signedAmount = form.type === 'expense' ? -amount : amount;

      let categoryId = form.category_id;
      if (!categoryId && form.type !== 'transfer') {
        setClassifying(true);
        const timer = setTimeout(() => controller.abort(), CLASSIFY_TIMEOUT_MS);
        let timedOut = false;
        try {
          categoryId = await classifyCategory(form.description, form.type, categories, controller.signal);
        } catch (err) {
          if (cancelledRef.current) return;
          timedOut = true;
          categoryId = '';
        } finally {
          clearTimeout(timer);
          setClassifying(false);
        }
        if (cancelledRef.current) return;
        if (timedOut || !categoryId) {
          const fallbackName = form.type === 'income' ? 'Outras receitas' : 'Outras despesas';
          const fallback = categories.find((c) => c.type === form.type && c.name === fallbackName);
          categoryId = fallback?.id || '';
          toast({ description: `Não foi possível classificar. Guardado em ${fallbackName}. Podes mudar a categoria.` });
        }
      }
      if (cancelledRef.current) return;

      const data = {
        description: form.description,
        amount: signedAmount,
        date: form.date,
        type: form.type,
        account_id: form.account_id,
        category_id: categoryId || undefined,
        notes: form.notes || undefined,
      };

      if (transaction) {
        await appApi.entities.Transaction.update(transaction.id, data);
      } else {
        await appApi.entities.Transaction.create(data);
      }

      // Refletir o movimento no saldo da conta
      const oldEffect = transaction && transaction.type !== 'transfer' ? transaction.amount : 0;
      const newEffect = form.type !== 'transfer' ? signedAmount : 0;

      if (transaction && transaction.account_id === form.account_id) {
        const account = accounts.find((a) => a.id === form.account_id);
        const delta = newEffect - oldEffect;
        if (account && delta !== 0) {
          await appApi.entities.Account.update(account.id, { balance: (account.balance || 0) + delta });
        }
      } else {
        if (transaction && oldEffect !== 0) {
          const oldAccount = accounts.find((a) => a.id === transaction.account_id);
          if (oldAccount) {
            await appApi.entities.Account.update(oldAccount.id, { balance: (oldAccount.balance || 0) - oldEffect });
          }
        }
        if (newEffect !== 0) {
          const newAccount = accounts.find((a) => a.id === form.account_id);
          if (newAccount) {
            await appApi.entities.Account.update(newAccount.id, { balance: (newAccount.balance || 0) + newEffect });
          }
        }
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error('Erro ao guardar transação:', err);
      if (String(err?.message || err).includes('transaction_amount_sign')) {
        setAmountError('Montante inválido para o tipo escolhido');
      }
    } finally {
      setSaving(false);
    }
  };

  const typeButtons = [
    { value: 'income', label: 'Entrada', activeClass: 'bg-green-soft text-ok' },
    { value: 'expense', label: 'Saída', activeClass: 'bg-danger-soft text-destructive' },
    { value: 'transfer', label: 'Transferência', activeClass: 'bg-muted text-ink' },
  ];

  const filteredCategories = categories.filter((c) =>
    form.type === 'income' ? c.type === 'income' : c.type === 'expense'
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{transaction ? 'Editar transação' : 'Nova transação'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {typeButtons.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setForm({ ...form, type: t.value, category_id: '' })}
                className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  form.type === t.value ? t.activeClass : 'bg-muted/50 text-muted-foreground'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Ex: Supermercado Kero"
              required
              className="mt-1.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="amount">Montante (Kz)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={form.amount}
                onKeyDown={(e) => { if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') e.preventDefault(); }}
                onChange={(e) => setForm({ ...form, amount: e.target.value.replace(/-/g, '') })}
                placeholder="0"
                required
                className="mt-1.5 font-mono"
              />
              {amountError && <p className="text-xs text-destructive mt-1.5">{amountError}</p>}
            </div>
            <div>
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="account">Conta</Label>
            <select
              id="account"
              value={form.account_id}
              onChange={(e) => setForm({ ...form, account_id: e.target.value })}
              required
              className="mt-1.5 w-full h-10 rounded-lg border border-input bg-surface px-3 text-sm"
            >
              <option value="">Selecionar conta</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.bank_name} — {a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="category">Categoria</Label>
            <select
              id="category"
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="mt-1.5 w-full h-10 rounded-lg border border-input bg-surface px-3 text-sm"
            >
              <option value="">Classificar automaticamente com IA</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {form.type !== 'transfer' && (
              <p className="text-xs text-muted-2 mt-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Deixa em branco para a IA escolher a categoria pela descrição.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleClose}>Cancelar</Button>
            <Button type="submit" disabled={saving}>
              {classifying ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> A classificar...</> : saving ? 'A guardar...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}