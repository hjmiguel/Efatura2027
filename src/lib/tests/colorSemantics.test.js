import { test, assertTrue, assertFalse, assertEqual } from './framework';
import {
  validateColorSemantics,
  getAmountColorClass,
  hasGoldColor,
  hasRedColor,
} from '@/lib/business/colors';

export default [
  test('Montante negativo não usa dourado', () => {
    assertTrue(validateColorSemantics(-5000, 'text-destructive'), 'Negativo com vermelho');
    assertFalse(validateColorSemantics(-5000, 'text-gold'), 'Negativo com dourado');
    assertFalse(validateColorSemantics(-5000, 'text-[#E8A23D]'), 'Negativo com hex dourado');
    assertFalse(validateColorSemantics(-5000, 'bg-gold-soft'), 'Negativo com fundo dourado');
    assertFalse(validateColorSemantics(-5000, 'text-[#9a6a16]'), 'Negativo com texto dourado escuro');
  }),

  test('Montante positivo não usa vermelho', () => {
    assertTrue(validateColorSemantics(5000, 'text-ok'), 'Positivo com verde');
    assertTrue(validateColorSemantics(5000, 'text-ink'), 'Positivo com ink');
    assertFalse(validateColorSemantics(5000, 'text-destructive'), 'Positivo com vermelho');
    assertFalse(validateColorSemantics(5000, 'bg-danger-soft'), 'Positivo com danger-soft');
    assertFalse(validateColorSemantics(5000, 'text-[#D2483B]'), 'Positivo com hex vermelho');
  }),

  test('Zero é tratado como positivo', () => {
    assertTrue(validateColorSemantics(0, 'text-ok'), 'Zero com verde');
    assertFalse(validateColorSemantics(0, 'text-destructive'), 'Zero com vermelho');
    assertTrue(validateColorSemantics(0, 'text-gold'), 'Zero com dourado — permitido para positivos');
  }),

  test('getAmountColorClass retorna classe correta', () => {
    assertEqual(getAmountColorClass(-100), 'text-destructive', 'Negativo');
    assertEqual(getAmountColorClass(100), 'text-ok', 'Positivo');
    assertEqual(getAmountColorClass(0), 'text-ok', 'Zero');
  }),

  test('Detetores de cor funcionam', () => {
    assertTrue(hasGoldColor('text-gold'), 'Deteta gold');
    assertTrue(hasGoldColor('bg-gold-soft'), 'Deteta gold-soft');
    assertTrue(hasGoldColor('text-[#E8A23D]'), 'Deteta hex dourado');
    assertFalse(hasGoldColor('text-destructive'), 'Não confunde vermelho com dourado');

    assertTrue(hasRedColor('text-destructive'), 'Deteta destructive');
    assertTrue(hasRedColor('bg-danger-soft'), 'Deteta danger-soft');
    assertFalse(hasRedColor('text-gold'), 'Não confunde dourado com vermelho');
  }),
];