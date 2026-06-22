/**
 * 共享工具函数 —— 信任颜色、分类颜色、日期计算
 * 从多个页面中提取去重
 */

// ============================================================
// 信任值颜色（Tailwind 类名版本，用于文本和进度条）
// ============================================================

export function getTrustTextColor(value: number): string {
  if (value >= 80) return 'text-violet-600';
  if (value >= 60) return 'text-emerald-600';
  if (value >= 40) return 'text-amber-500';
  if (value >= 20) return 'text-orange-500';
  return 'text-red-500';
}

export function getTrustBarColor(value: number): string {
  if (value >= 80) return 'bg-violet-500';
  if (value >= 60) return 'bg-emerald-500';
  if (value >= 40) return 'bg-amber-400';
  if (value >= 20) return 'bg-orange-400';
  return 'bg-red-400';
}

// ============================================================
// 分类颜色
// ============================================================

export function getCategoryColorClass(id: string): string {
  const colors: Record<string, string> = {
    parent: 'bg-rose-50 text-rose-600',
    family: 'bg-orange-50 text-orange-600',
    intimate: 'bg-pink-50 text-pink-600',
    friend: 'bg-sky-50 text-sky-600',
    classmate: 'bg-indigo-50 text-indigo-600',
    colleague: 'bg-amber-50 text-amber-600',
    circle: 'bg-cyan-50 text-cyan-600',
    stranger: 'bg-slate-50 text-slate-500',
    other: 'bg-purple-50 text-purple-600',
  };
  return colors[id] || 'bg-purple-50 text-purple-600';
}

export function getCategoryColorHex(id: string): string {
  const colors: Record<string, string> = {
    parent: '#f43f5e',
    family: '#f97316',
    intimate: '#ec4899',
    friend: '#0ea5e9',
    classmate: '#6366f1',
    colleague: '#f59e0b',
    circle: '#06b6d4',
    stranger: '#64748b',
    other: '#7c5cfc',
  };
  return colors[id] || '#7c5cfc';
}

// ============================================================
// 日期 / 时长计算
// ============================================================

/**
 * 计算认识时长，返回可读字符串
 * 使用本地时间避免时区问题
 */
export function formatKnownDuration(knownSince: Date | string): string | null {
  const date =
    typeof knownSince === 'string' ? new Date(knownSince + 'T00:00:00') : new Date(knownSince);
  const now = new Date();
  const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (days <= 0) return null;

  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const remainDays = days % 30;

  const parts: string[] = [];
  if (years > 0) parts.push(`${years}年`);
  if (months > 0) parts.push(`${months}个月`);
  if (remainDays > 0 && years === 0) parts.push(`${remainDays}天`);

  return parts.join('');
}
