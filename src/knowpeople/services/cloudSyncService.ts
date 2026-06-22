'use no memo';

import { exportAllAsObject, importData } from '@/knowpeople/services/exportService';
import type { ExportData } from '@/knowpeople/core/models';
import type { ImportResult } from '@/knowpeople/core/models';

/**
 * 慧眼识人云同步服务
 * 通过复用 /api/progress 接口，将完整的本地 IndexedDB 数据打包为 JSONB 保存到 Supabase。
 *
 * 存储结构：
 * category: 'tool-state'
 * key: 'people-insight'
 * value: {
 *   type: 'people-insight',
 *   version: '1.0',
 *   updatedAt: ISO string,
 *   payload: ExportData, // 完整本地数据
 * }
 */

const CLOUD_CATEGORY = 'tool-state' as const;
const CLOUD_KEY = 'people-insight' as const;
const CLOUD_VERSION = '1.0' as const;

export interface CloudPayload {
  type: 'people-insight';
  version: string;
  updatedAt: string;
  payload: ExportData;
}

export interface CloudSyncResult {
  success: boolean;
  direction: 'upload' | 'download' | 'none' | 'error';
  message: string;
}

async function fetchProgressItem(): Promise<CloudPayload | null> {
  const res = await fetch(`/api/progress?category=${CLOUD_CATEGORY}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch cloud progress: ${res.status}`);
  }
  const json = await res.json();
  const item = (json.data as Array<{ key: string; value: CloudPayload }> | undefined)?.find(
    p => p.key === CLOUD_KEY
  );
  return item?.value ?? null;
}

async function upsertProgressItem(payload: CloudPayload): Promise<void> {
  const res = await fetch('/api/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category: CLOUD_CATEGORY,
      key: CLOUD_KEY,
      value: payload,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Failed to save cloud progress: ${res.status}`);
  }
}

function getLatestUpdatedAt(data: ExportData): Date {
  const candidates = [
    ...data.persons.map(p => new Date(p.updatedAt)),
    ...data.observeEvents.map(e => new Date(e.createdAt)),
    ...data.hardwareInfos.map(h => new Date(h.updatedAt)),
    ...data.softwareTraits.map(s => new Date(s.updatedAt)),
    ...data.characterScores.map(c => new Date(c.updatedAt)),
    ...data.networkInfos.map(n => new Date(n.updatedAt)),
    ...data.abilities.map(a => new Date(a.createdAt)),
  ];

  if (candidates.length === 0) {
    return new Date(0);
  }
  return new Date(Math.max(...candidates.map(d => d.getTime())));
}

/**
 * 将本地数据上传到云端
 */
export async function uploadPeopleInsightToCloud(): Promise<CloudSyncResult> {
  try {
    const payload = await exportAllAsObject();

    if (payload.persons.length === 0) {
      return {
        success: true,
        direction: 'none',
        message: '本地暂无数据，无需同步',
      };
    }

    await upsertProgressItem({
      type: 'people-insight',
      version: CLOUD_VERSION,
      updatedAt: new Date().toISOString(),
      payload,
    });

    return {
      success: true,
      direction: 'upload',
      message: '已同步到云端',
    };
  } catch (err) {
    return {
      success: false,
      direction: 'error',
      message: err instanceof Error ? err.message : '上传失败',
    };
  }
}

/**
 * 从云端下载数据并覆盖本地
 */
export async function downloadPeopleInsightFromCloud(): Promise<
  CloudSyncResult & { importResult?: ImportResult }
> {
  try {
    const cloud = await fetchProgressItem();

    if (!cloud || !cloud.payload) {
      return {
        success: true,
        direction: 'none',
        message: '云端暂无数据',
      };
    }

    const result = await importData(JSON.stringify(cloud.payload), undefined, 'merge');

    return {
      success: result.success,
      direction: 'download',
      message: `从云端同步成功，导入 ${result.importedPersons} 人、${result.importedEvents} 条事件`,
      importResult: result,
    };
  } catch (err) {
    return {
      success: false,
      direction: 'error',
      message: err instanceof Error ? err.message : '下载失败',
    };
  }
}

/**
 * 双向同步：比较本地与云端更新时间，以最新者为准
 */
export async function syncPeopleInsightWithCloud(): Promise<CloudSyncResult> {
  try {
    const cloud = await fetchProgressItem();

    // 本地数据
    const local = await exportAllAsObject();
    const localLatest = getLatestUpdatedAt(local);

    // 云端无数据：直接上传本地
    if (!cloud || !cloud.payload) {
      if (local.persons.length === 0) {
        return {
          success: true,
          direction: 'none',
          message: '本地和云端均无数据',
        };
      }
      return uploadPeopleInsightToCloud();
    }

    const cloudLatest = new Date(cloud.updatedAt);

    // 云端更新：下载覆盖本地
    if (cloudLatest > localLatest) {
      const result = await downloadPeopleInsightFromCloud();
      return result;
    }

    // 本地更新或相等：上传覆盖云端
    if (localLatest > cloudLatest) {
      return uploadPeopleInsightToCloud();
    }

    return {
      success: true,
      direction: 'none',
      message: '本地与云端数据一致',
    };
  } catch (err) {
    return {
      success: false,
      direction: 'error',
      message: err instanceof Error ? err.message : '同步失败',
    };
  }
}
