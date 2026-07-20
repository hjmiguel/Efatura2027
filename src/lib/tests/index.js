import arithmeticTests from './arithmetic.test';
import colorTests from './colorSemantics.test';
import duplicateTests from './duplicates.test';
import independenceTests from './independence.test';
import nifTests from './nifDeductible.test';
import { runSuite } from './framework';

export const testSuites = [
  { name: 'Aritmética — somas = totais', tests: arithmeticTests },
  { name: 'Semântica de cor — negativos não usam dourado', tests: colorTests },
  { name: 'Duplicados — 3 fontes → 1 registo', tests: duplicateTests },
  { name: 'Independência — AGT em baixo, app funciona', tests: independenceTests },
  { name: 'Fatura sem NIF — não entra no dedutível', tests: nifTests },
];

export function runAllTests() {
  return testSuites.map((suite) => ({
    name: suite.name,
    results: runSuite(suite.tests),
  }));
}

export function getTestSummary(results) {
  if (!results) return { total: 0, passed: 0, failed: 0 };
  const total = results.reduce((s, r) => s + r.results.length, 0);
  const passed = results.reduce(
    (s, r) => s + r.results.filter((t) => t.passed).length,
    0
  );
  return { total, passed, failed: total - passed };
}