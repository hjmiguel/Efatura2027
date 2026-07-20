import { test, assertEqual, assertTrue } from './framework';
import {
  calculateTotalBalance,
  calculateTotalPending,
  calculateMonthlyExpenses,
  calculateMonthlyIncome,
} from '@/lib/business/finance';
import { calculateDeductibleTotal } from '@/lib/business/deductibles';
import { deduplicateInvoices } from '@/lib/business/duplicates';

export default [
  test('App funciona sem feed AGT — cálculos locais intactos', () => {
    const localInvoices = [
      { status: 'pending', amount: 5000, has_nif: true, deductible_type: 'saude', source: 'manual' },
      { status: 'paid', amount: 3000, has_nif: true, deductible_type: 'none', source: 'photo_ocr' },
    ];
    const accounts = [{ balance: 100000 }, { balance: 50000 }];

    assertEqual(calculateTotalBalance(accounts), 150000, 'Património sem AGT');
    assertEqual(calculateTotalPending(localInvoices), 5000, 'Pendentes sem AGT');
    assertEqual(calculateDeductibleTotal(localInvoices), 5000, 'Dedutível sem AGT');
  }),

  test('AGT indisponível não quebra dedutível acumulado', () => {
    const localOnly = [
      { has_nif: true, deductible_type: 'educacao', amount: 20000, source: 'manual' },
      { has_nif: true, deductible_type: 'saude', amount: 15000, source: 'photo_ocr' },
    ];
    assertEqual(calculateDeductibleTotal(localOnly), 35000, 'Dedutível apenas local');
  }),

  test('Lista vazia de AGT não afeta totais', () => {
    assertEqual(calculateDeductibleTotal([]), 0, 'AGT vazio = zero');
    assertEqual(calculateTotalPending([]), 0, 'Pendentes vazios = zero');
  }),

  test('Transações calculam corretamente sem faturas AGT', () => {
    const transactions = [
      { type: 'expense', date: '2026-07-01', amount: -10000, category_id: 'cat1' },
      { type: 'income', date: '2026-07-05', amount: 80000, category_id: 'cat2' },
      { type: 'expense', date: '2026-07-15', amount: -5000, category_id: 'cat1' },
    ];
    assertEqual(calculateMonthlyExpenses(transactions, '2026-07'), 15000, 'Despesas sem AGT');
    assertEqual(calculateMonthlyIncome(transactions, '2026-07'), 80000, 'Receitas sem AGT');
  }),

  test('Deduplicação funciona sem fonte AGT', () => {
    const invoices = [
      { document_number: 'FT 001', issuer_nif: '541700001', amount: 5000, source: 'manual' },
      { document_number: 'FT 001', issuer_nif: '541700001', amount: 5000, source: 'photo_ocr' },
      { document_number: 'FT 002', issuer_nif: '541700002', amount: 3000, source: 'manual' },
    ];
    const deduped = deduplicateInvoices(invoices);
    assertEqual(deduped.length, 2, 'Dedupe funciona sem AGT');
    assertTrue(deduped.every((i) => i.source !== 'agt'), 'Nenhuma fatura AGT');
  }),

  test('App continua utilizável com apenas 1 conta e 0 transações', () => {
    assertEqual(calculateTotalBalance([{ balance: 25000 }]), 25000, '1 conta');
    assertEqual(calculateMonthlyExpenses([], '2026-07'), 0, '0 transações');
    assertEqual(calculateTotalPending([]), 0, '0 pendentes');
  }),
];