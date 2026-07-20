import { test, assertEqual } from './framework';
import {
  calculateTotalBalance,
  calculateTotalPending,
  calculateTotalPaid,
  calculateCategorySpent,
  calculateMonthlyExpenses,
  calculateMonthlyIncome,
} from '@/lib/business/finance';

export default [
  test('Soma das contas = património total', () => {
    const accounts = [
      { balance: 150000 },
      { balance: 75000 },
      { balance: 25000 },
    ];
    assertEqual(calculateTotalBalance(accounts), 250000, 'Património');
  }),

  test('Soma das faturas pendentes = total pendente', () => {
    const invoices = [
      { status: 'pending', amount: 5000 },
      { status: 'paid', amount: 3000 },
      { status: 'pending', amount: 7500 },
      { status: 'overdue', amount: 2000 },
    ];
    assertEqual(calculateTotalPending(invoices), 12500, 'Total pendente');
  }),

  test('Soma das faturas pagas = total pago', () => {
    const invoices = [
      { status: 'pending', amount: 5000 },
      { status: 'paid', amount: 3000 },
      { status: 'paid', amount: 7500 },
    ];
    assertEqual(calculateTotalPaid(invoices), 10500, 'Total pago');
  }),

  test('Soma de transações por categoria = gasto da categoria', () => {
    const transactions = [
      { category_id: 'cat1', date: '2026-07-15', amount: -5000 },
      { category_id: 'cat1', date: '2026-07-20', amount: -3000 },
      { category_id: 'cat2', date: '2026-07-10', amount: -2000 },
      { category_id: 'cat1', date: '2026-06-15', amount: -1000 },
    ];
    assertEqual(calculateCategorySpent(transactions, 'cat1', '2026-07'), 8000, 'Gasto categoria julho');
    assertEqual(calculateCategorySpent(transactions, 'cat1', '2026-06'), 1000, 'Gasto categoria junho');
    assertEqual(calculateCategorySpent(transactions, 'cat2', '2026-07'), 2000, 'Gasto cat2');
  }),

  test('Soma de despesas mensais = total despesas', () => {
    const transactions = [
      { type: 'expense', date: '2026-07-01', amount: -10000 },
      { type: 'expense', date: '2026-07-15', amount: -5000 },
      { type: 'income', date: '2026-07-05', amount: 80000 },
      { type: 'expense', date: '2026-06-20', amount: -3000 },
    ];
    assertEqual(calculateMonthlyExpenses(transactions, '2026-07'), 15000, 'Despesas julho');
  }),

  test('Soma de receitas mensais = total receitas', () => {
    const transactions = [
      { type: 'income', date: '2026-07-01', amount: 80000 },
      { type: 'income', date: '2026-07-20', amount: 15000 },
      { type: 'expense', date: '2026-07-15', amount: -5000 },
    ];
    assertEqual(calculateMonthlyIncome(transactions, '2026-07'), 95000, 'Receitas julho');
  }),

  test('Lista vazia retorna zero', () => {
    assertEqual(calculateTotalBalance([]), 0, 'Saldo vazio');
    assertEqual(calculateTotalPending([]), 0, 'Pendentes vazio');
    assertEqual(calculateTotalPaid([]), 0, 'Pagos vazio');
    assertEqual(calculateCategorySpent([], 'cat1', '2026-07'), 0, 'Categoria vazia');
    assertEqual(calculateMonthlyExpenses([], '2026-07'), 0, 'Despesas vazias');
  }),

  test('Saldo nulo tratado como zero', () => {
    const accounts = [
      { balance: 100000 },
      { balance: null },
      { balance: undefined },
      { balance: 50000 },
    ];
    assertEqual(calculateTotalBalance(accounts), 150000, 'Null tratado como zero');
  }),
];