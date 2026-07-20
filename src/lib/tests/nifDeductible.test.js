import { test, assertEqual, assertTrue, assertFalse } from './framework';
import {
  isDeductible,
  filterDeductible,
  calculateDeductibleTotal,
  groupDeductibleByType,
} from '@/lib/business/deductibles';

export default [
  test('Fatura sem NIF não é dedutível', () => {
    const invoice = { has_nif: false, deductible_type: 'saude', amount: 10000 };
    assertFalse(isDeductible(invoice), 'Sem NIF não deve ser dedutível');
  }),

  test('Fatura com NIF e tipo dedutível é dedutível', () => {
    const invoice = { has_nif: true, deductible_type: 'saude', amount: 10000 };
    assertTrue(isDeductible(invoice), 'Com NIF e tipo deve ser dedutível');
  }),

  test('Fatura com NIF mas tipo "none" não é dedutível', () => {
    const invoice = { has_nif: true, deductible_type: 'none', amount: 10000 };
    assertFalse(isDeductible(invoice), 'Tipo none não deve ser dedutível');
  }),

  test('Fatura com has_nif indefinido não é dedutível', () => {
    const invoice = { deductible_type: 'saude', amount: 10000 };
    assertFalse(isDeductible(invoice), 'NIF indefinido não deve ser dedutível');
  }),

  test('Fatura com deductible_type indefinido não é dedutível', () => {
    const invoice = { has_nif: true, amount: 10000 };
    assertFalse(isDeductible(invoice), 'Tipo indefinido não deve ser dedutível');
  }),

  test('Fatura sem NIF não entra no acumulado dedutível', () => {
    const invoices = [
      { has_nif: true, deductible_type: 'saude', amount: 10000 },
      { has_nif: false, deductible_type: 'saude', amount: 5000 },
      { has_nif: true, deductible_type: 'educacao', amount: 20000 },
    ];
    const deductible = filterDeductible(invoices);
    assertEqual(deductible.length, 2, 'Apenas 2 são dedutíveis');
    assertEqual(calculateDeductibleTotal(invoices), 30000, 'Total exclui sem NIF');
  }),

  test('Agrupamento por tipo exclui faturas sem NIF', () => {
    const invoices = [
      { has_nif: true, deductible_type: 'saude', amount: 10000 },
      { has_nif: false, deductible_type: 'saude', amount: 5000 },
      { has_nif: true, deductible_type: 'educacao', amount: 20000 },
      { has_nif: true, deductible_type: 'saude', amount: 7000 },
    ];
    const groups = groupDeductibleByType(invoices);
    assertEqual(groups.saude, 17000, 'Saúde = 10000 + 7000');
    assertEqual(groups.educacao, 20000, 'Educação = 20000');
    assertEqual(Object.keys(groups).length, 2, 'Apenas 2 tipos');
  }),

  test('Lista vazia retorna zero e vazio', () => {
    assertEqual(filterDeductible([]).length, 0, 'Vazio = vazio');
    assertEqual(calculateDeductibleTotal([]), 0, 'Vazio = zero');
    assertEqual(Object.keys(groupDeductibleByType([])).length, 0, 'Vazio = sem grupos');
  }),

  test('Todas as faturas sem NIF = acumulado zero', () => {
    const invoices = [
      { has_nif: false, deductible_type: 'saude', amount: 10000 },
      { has_nif: false, deductible_type: 'educacao', amount: 20000 },
    ];
    assertEqual(calculateDeductibleTotal(invoices), 0, 'Tudo sem NIF = zero');
  }),
];