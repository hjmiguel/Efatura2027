import { test, assertEqual, assertTrue, assertFalse } from './framework';
import {
  deduplicateInvoices,
  isDuplicate,
  getDuplicateKey,
  findDuplicates,
} from '@/lib/business/duplicates';

const baseInvoice = {
  document_number: 'FT 2026/001',
  issuer_nif: '541700001',
  amount: 15000,
};

export default [
  test('Três fontes com mesma fatura → 1 registo', () => {
    const invoices = [
      { ...baseInvoice, source: 'manual' },
      { ...baseInvoice, source: 'photo_ocr' },
      { ...baseInvoice, source: 'partner' },
    ];
    assertEqual(deduplicateInvoices(invoices).length, 1, 'Deve resultar em 1 registo');
  }),

  test('Manual + OCR + AGT com mesma fatura → 1 registo', () => {
    const invoices = [
      { ...baseInvoice, source: 'manual' },
      { ...baseInvoice, source: 'photo_ocr' },
      { ...baseInvoice, source: 'agt' },
    ];
    assertEqual(deduplicateInvoices(invoices).length, 1, 'Três fontes = 1 registo');
  }),

  test('Faturas com NIF diferente não são duplicadas', () => {
    const invoices = [
      { ...baseInvoice, issuer_nif: '541700001' },
      { ...baseInvoice, issuer_nif: '541700002' },
    ];
    assertEqual(deduplicateInvoices(invoices).length, 2, 'NIF diferente = não duplicado');
  }),

  test('Faturas com número diferente não são duplicadas', () => {
    const invoices = [
      { ...baseInvoice, document_number: 'FT 2026/001' },
      { ...baseInvoice, document_number: 'FT 2026/002' },
    ];
    assertEqual(deduplicateInvoices(invoices).length, 2, 'Número diferente = não duplicado');
  }),

  test('Faturas com montante diferente não são duplicadas', () => {
    const invoices = [
      { ...baseInvoice, amount: 15000 },
      { ...baseInvoice, amount: 16000 },
    ];
    assertEqual(deduplicateInvoices(invoices).length, 2, 'Montante diferente = não duplicado');
  }),

  test('isDuplicate identifica duplicado corretamente', () => {
    assertTrue(isDuplicate(baseInvoice, { ...baseInvoice, source: 'partner' }), 'Mesma fatura é duplicado');
    assertFalse(isDuplicate(baseInvoice, { ...baseInvoice, amount: 99999 }), 'Montante diferente não é duplicado');
    assertFalse(isDuplicate(baseInvoice, { ...baseInvoice, issuer_nif: '999999999' }), 'NIF diferente não é duplicado');
  }),

  test('findDuplicates retorna apenas os duplicados', () => {
    const invoices = [
      { ...baseInvoice, source: 'manual' },
      { ...baseInvoice, source: 'partner' },
      { document_number: 'FT 2026/002', issuer_nif: '541700001', amount: 5000, source: 'manual' },
    ];
    assertEqual(findDuplicates(invoices).length, 1, '1 duplicado encontrado');
    assertEqual(deduplicateInvoices(invoices).length, 2, '2 únicos após dedupe');
  }),

  test('Lista vazia não quebra', () => {
    assertEqual(deduplicateInvoices([]).length, 0, 'Vazio = vazio');
    assertEqual(findDuplicates([]).length, 0, 'Vazio = sem duplicados');
  }),
];