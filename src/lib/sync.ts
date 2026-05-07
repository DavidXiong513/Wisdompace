'use client';

import type { ProgressCategory } from '@/lib/validations/progress';

// ============ 类型 ============

export interface SyncResult {
  uploaded: number;    // 本地覆盖云端的数量
  downloaded: number;  // 云端覆盖本地的数量
  skipped: number;     // 时间戳相同跳过的数量
  errors: string[];
}

interface SyncableKeyConfig {
  lsKey: string;
  category: ProgressCategory;
  key: string;
  /** 部分 key 需要从 localStorage 数据中动态提取多个条目（如 readingProgress） */
  extractKeys?: (raw: unknown) => Array<{ key: string; value: unknown; updatedAt: string }>;
}

interface CloudProgressItem {
  key: string;
  category: string;
  value: Record<string, unknown>;
  updated_at: string;
}

// ============ 可同步的 localStorage key 白名单 ============

const SYNCABLE_KEYS: SyncableKeyConfig[] = [
  {
    lsKey: 'wp-reading-progress',
    category: 'chapter-read',
    key: '', // 占位，由 extractKeys 动态生成
    extractKeys: (raw) => {
      const data = raw as { progress?: Record<string, { sectionId: string; timestamp: number; percentComplete?: number }> } | undefined;
      if (!data?.progress) return [];
      return Object.entries(data.progress).map(([chapterSlug, entry]) => ({
        key: chapterSlug,
        value: {
          sectionId: entry.sectionId,
          percentComplete: entry.percentComplete,
          updatedAt: new Date(entry.timestamp).toISOString(),
        },
        updatedAt: new Date(entry.timestamp).toISOString(),
      }));
    },
  },
  { lsKey: 'mbti-test-state',       category: 'tool-state', key: 'mbti-test' },
  { lsKey: 'big-five-storage',      category: 'tool-state', key: 'big-five' },
  { lsKey: 'ability-test-storage',  category: 'tool-state', key: 'ability-test' },
  { lsKey: 'career-values-storage', category: 'tool-state', key: 'career-values' },
  { lsKey: 'wp-emotional-assessment-storage', category: 'tool-state', key: 'emotional-assessment' },
  { lsKey: 'role-pie-chart-storage',category: 'tool-state', key: 'role-pie-chart' },
  { lsKey: 'wp-life-clock-storage', category: 'tool-state', key: 'life-clock' },
  { lsKey: 'wp-three-questions-storage', category: 'tool-state', key: 'three-questions' },
  {
    lsKey: 'wp-preferences',
    category: 'preference',
    key: '',
    extractKeys: (raw) => {
      const data = raw as Record<string, unknown> | undefined;
      if (!data) return [];
      return Object.entries(data).map(([prefKey, value]) => ({
        key: prefKey,
        value: { value, updatedAt: new Date().toISOString() },
        updatedAt: new Date().toISOString(),
      }));
    },
  },
];

// ============ 本地数据读取辅助 ============

function readLocalItem(lsKey: string): { data: unknown; updatedAt: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(lsKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    // 如果数据本身包含 updatedAt（如 useCloudSync 格式），直接返回
    if (parsed && typeof parsed === 'object' && 'updatedAt' in parsed) {
      return parsed as { data: unknown; updatedAt: string };
    }

    // 否则，用文件的修改时间（这里用当前时间作为 fallback）
    // 对于旧格式的数据，我们无法知道确切的更新时间，只能假设本地数据是较新的
    return { data: parsed, updatedAt: new Date().toISOString() };
  } catch {
    return null;
  }
}

// ============ API 调用 ============

async function fetchAllProgress(): Promise<CloudProgressItem[]> {
  const res = await fetch('/api/progress');
  if (!res.ok) throw new Error('Failed to fetch progress');
  const json = await res.json();
  return json.data ?? [];
}

async function upsertProgress(category: string, key: string, value: Record<string, unknown>): Promise<void> {
  const res = await fetch('/api/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, key, value }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? 'Failed to upsert progress');
  }
}

// ============ 主函数 ============

/**
 * 登录合并：扫描本地 localStorage 并与云端 progress 数据合并
 *
 * 规则：
 * - 本地较新 → 上传覆盖云端
 * - 云端较新 → 更新本地 localStorage
 * - 时间戳相同 → 跳过
 *
 * 注意：此函数只处理 progress 表的数据，assessments 表由各个工具在完成后独立上传。
 */
export async function syncLocalToCloud(): Promise<SyncResult> {
  const result: SyncResult = { uploaded: 0, downloaded: 0, skipped: 0, errors: [] };

  if (typeof window === 'undefined') return result;

  try {
    // 1. 拉取所有云端 progress 数据
    const cloudItems = await fetchAllProgress();
    const cloudMap = new Map<string, CloudProgressItem>();
    for (const item of cloudItems) {
      cloudMap.set(`${item.category}:${item.key}`, item);
    }

    // 2. 扫描本地数据
    for (const config of SYNCABLE_KEYS) {
      const localRaw = readLocalItem(config.lsKey);
      if (!localRaw) continue;

      const entries: Array<{ key: string; value: unknown; updatedAt: string }> = [];

      if (config.extractKeys) {
        // 动态提取多个条目
        entries.push(...config.extractKeys(localRaw.data));
      } else {
        // 单一条目
        entries.push({
          key: config.key,
          value: localRaw.data,
          updatedAt: localRaw.updatedAt,
        });
      }

      // 3. 逐个比较并合并
      for (const entry of entries) {
        const mapKey = `${config.category}:${entry.key}`;
        const cloudItem = cloudMap.get(mapKey);

        if (!cloudItem) {
          // 云端无数据 → 上传本地
          try {
            await upsertProgress(config.category, entry.key, {
              data: entry.value,
              updatedAt: entry.updatedAt,
            });
            result.uploaded++;
          } catch (e) {
            result.errors.push(`${mapKey}: ${e instanceof Error ? e.message : String(e)}`);
          }
          continue;
        }

        // 比较时间戳
        const localTime = new Date(entry.updatedAt).getTime();
        const cloudValue = cloudItem.value as { updatedAt?: string } | undefined;
        const cloudTime = cloudValue?.updatedAt
          ? new Date(cloudValue.updatedAt).getTime()
          : new Date(cloudItem.updated_at).getTime();

        if (localTime > cloudTime) {
          // 本地较新 → 上传
          try {
            await upsertProgress(config.category, entry.key, {
              data: entry.value,
              updatedAt: entry.updatedAt,
            });
            result.uploaded++;
          } catch (e) {
            result.errors.push(`${mapKey}: ${e instanceof Error ? e.message : String(e)}`);
          }
        } else if (cloudTime > localTime) {
          // 云端较新 → 更新本地
          try {
            updateLocalStorage(config.lsKey, config.category, entry.key, cloudItem.value);
            result.downloaded++;
          } catch (e) {
            result.errors.push(`${mapKey} (download): ${e instanceof Error ? e.message : String(e)}`);
          }
        } else {
          result.skipped++;
        }
      }
    }
  } catch (e) {
    result.errors.push(`全局错误: ${e instanceof Error ? e.message : String(e)}`);
  }

  return result;
}

/**
 * 用云端数据更新本地 localStorage
 */
function updateLocalStorage(
  lsKey: string,
  category: string,
  entryKey: string,
  cloudValue: Record<string, unknown>
): void {
  // 对于简单 key（单一存储）
  const config = SYNCABLE_KEYS.find((c) => c.lsKey === lsKey);
  if (!config) return;

  if (!config.extractKeys) {
    // 单一条目：直接覆盖整个 localStorage key
    localStorage.setItem(
      lsKey,
      JSON.stringify({
        data: cloudValue,
        updatedAt: new Date().toISOString(),
      })
    );
  } else {
    // 多条目（如 readingProgress）：需要读取现有数据，更新对应子项
    const raw = localStorage.getItem(lsKey);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);

      if (lsKey === 'wp-reading-progress' && category === 'chapter-read') {
        const progress = (parsed.progress ?? {}) as Record<string, unknown>;
        const cloudData = cloudValue as { sectionId?: string; percentComplete?: number; updatedAt?: string };
        progress[entryKey] = {
          sectionId: cloudData.sectionId,
          timestamp: cloudData.updatedAt ? new Date(cloudData.updatedAt).getTime() : Date.now(),
          percentComplete: cloudData.percentComplete,
        };
        localStorage.setItem(lsKey, JSON.stringify({ ...parsed, progress }));
      }

      if (lsKey === 'wp-preferences' && category === 'preference') {
        const prefs = (parsed.state ?? parsed) as Record<string, unknown>;
        const cloudData = cloudValue as { value?: unknown };
        if (cloudData.value !== undefined) {
          prefs[entryKey] = cloudData.value;
          localStorage.setItem(lsKey, JSON.stringify(prefs));
        }
      }
    } catch {
      // ignore
    }
  }
}
