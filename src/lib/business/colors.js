// Semântica de cor — negativos não usam dourado, positivos não usam vermelho

const GOLD_PATTERNS = ['gold', '#e8a23d', '#9a6a16', '#8a6420'];
const RED_PATTERNS = ['destructive', 'danger', '#d2483b'];

function containsAny(str, patterns) {
  if (!str || typeof str !== 'string') return false;
  const lower = str.toLowerCase();
  return patterns.some((p) => lower.includes(p.toLowerCase()));
}

export function hasGoldColor(colorClass) {
  return containsAny(colorClass, GOLD_PATTERNS);
}

export function hasRedColor(colorClass) {
  return containsAny(colorClass, RED_PATTERNS);
}

export function getAmountColorClass(amount) {
  if (amount < 0) return 'text-destructive';
  return 'text-ok';
}

export function validateColorSemantics(amount, colorClass) {
  const isNegative = amount < 0;
  const isPositive = amount >= 0;

  if (isNegative && hasGoldColor(colorClass)) {
    return false;
  }
  if (isPositive && hasRedColor(colorClass)) {
    return false;
  }
  return true;
}