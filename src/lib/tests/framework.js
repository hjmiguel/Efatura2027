// Framework de testes simples — sem dependências externas

export function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message || 'Falhou'}: esperado ${expected}, obtido ${actual}`);
  }
}

export function assertTrue(value, message) {
  if (!value) {
    throw new Error(message || 'Esperado true, obtido false');
  }
}

export function assertFalse(value, message) {
  if (value) {
    throw new Error(message || 'Esperado false, obtido true');
  }
}

export function test(name, fn) {
  return { name, fn };
}

export function runTest(testCase) {
  try {
    testCase.fn();
    return { name: testCase.name, passed: true, error: null };
  } catch (err) {
    return { name: testCase.name, passed: false, error: err.message };
  }
}

export function runSuite(suite) {
  return suite.map(runTest);
}