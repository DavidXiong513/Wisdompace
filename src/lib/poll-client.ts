'use client';

import { useState } from 'react';

/** 投票工具标识，前后端共用一份 */
export const POLL_TOOL_ID = 'community-aging-poll';

/** localStorage 里的匿名身份键 */
const SESSION_KEY = 'cap_session_id';

/**
 * 匿名投票身份：浏览器首次访问时生成 UUID 并持久化。
 * 换浏览器 / 清缓存会得到新身份（这是匿名方案的固有边界）。
 */
export function usePollSessionId(): string {
  const [sid] = useState(() => {
    if (typeof window === 'undefined') {
      return '00000000-0000-0000-0000-000000000000';
    }
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  });
  return sid;
}
