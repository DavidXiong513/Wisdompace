/**
 * 投票相关的客户端格式化工具
 */

/**
 * 把 ISO 时间格式化为「2026 年 11 月 10 日」
 * 固定按 Asia/Shanghai 渲染，避免服务端与浏览器时区不同导致的水合不一致。
 */
export function formatVoteDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d);

  const get = (type: string) =>
    parts.find(p => p.type === type)?.value ?? '';

  const year = get('year');
  const month = String(Number(get('month')));
  const day = String(Number(get('day')));

  if (!year) return '';
  return `${year} 年 ${month} 月 ${day} 日`;
}

/** 「3 分钟前」「2 天前」这类相对时间，列表里更好读 */
export function formatRelativeTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';

  const diffMs = Date.now() - d.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return '刚刚';
  if (min < 60) return `${min} 分钟前`;

  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour} 小时前`;

  const day = Math.floor(hour / 24);
  if (day < 30) return `${day} 天前`;

  return formatVoteDate(iso);
}
