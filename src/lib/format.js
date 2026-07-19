export function formatKz(value) {
  const num = Number(value || 0);
  const formatted = Math.abs(num).toLocaleString('pt-AO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${num < 0 ? '-' : ''}${formatted} Kz`;
}

export function formatKzShort(value) {
  const num = Number(value || 0);
  const abs = Math.abs(num);
  if (abs >= 1000000) {
    return `${(abs / 1000000).toFixed(1).replace('.0', '')}M Kz`;
  }
  if (abs >= 10000) {
    return `${Math.round(abs / 1000)} mil Kz`;
  }
  return formatKz(num);
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const due = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return Math.round((due - today) / (1000 * 60 * 60 * 24));
}

export function getFirstName(fullName) {
  if (!fullName) return '';
  return fullName.trim().split(' ')[0];
}