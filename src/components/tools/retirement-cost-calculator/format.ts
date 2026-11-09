export function formatMoney(value: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    maximumFractionDigits: 0,
  }).format(Math.round(Number.isFinite(value) ? value : 0));
}

export function formatWan(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  if (Math.abs(safe) >= 100000000) {
    return `${(safe / 100000000).toFixed(2)} 亿`;
  }
  if (Math.abs(safe) >= 10000) {
    return `${(safe / 10000).toFixed(1)} 万`;
  }
  return `${Math.round(safe).toLocaleString('zh-CN')} 元`;
}

export function formatPercent(value: number): string {
  return `${Math.round((Number.isFinite(value) ? value : 0) * 100)}%`;
}
