/**
 * 通用工具函数
 */

/**
 * 格式化日期为友好字符串
 */
export function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return `${days}天前`;
  if (days < 30) return `${Math.floor(days / 7)}周前`;
  if (days < 365) return `${Math.floor(days / 30)}个月前`;
  return `${Math.floor(days / 365)}年前`;
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
export function formatDateShort(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * 生成星级评分字符串
 */
export function renderStars(score: number, maxScore: number = 10): string {
  const fullStars = Math.round((score / maxScore) * 5);
  return '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);
}

/**
 * 截断文本
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
