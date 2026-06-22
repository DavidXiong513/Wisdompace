import Dexie, { type EntityTable } from 'dexie';
import type {
  Person,
  HardwareInfo,
  SoftwareTrait,
  CharacterScores,
  Ability,
  NetworkInfo,
  ObserveEvent,
} from '@/knowpeople/core/models';

/**
 * 慧眼识人本地数据库（IndexedDB）
 * 主数据存储在浏览器本地，登录用户会自动通过 cloudSyncService 同步到 Supabase 云端。
 * 未登录用户数据仅保存在本地，不会上传服务器。
 */

class KnowPeopleDB extends Dexie {
  // 声明表
  persons!: EntityTable<Person, 'id'>;
  hardwareInfos!: EntityTable<HardwareInfo, 'id'>;
  softwareTraits!: EntityTable<SoftwareTrait, 'id'>;
  characterScores!: EntityTable<CharacterScores, 'id'>;
  abilities!: EntityTable<Ability, 'id'>;
  networkInfos!: EntityTable<NetworkInfo, 'id'>;
  observeEvents!: EntityTable<ObserveEvent, 'id'>;

  constructor() {
    super('WisdomPace_KnowPeople');

    this.version(1).stores({
      persons:
        '++id, alias, category, subCategory, *tags, trustValue, reliability, intimacy, createdAt, updatedAt, lastObservedAt',
      hardwareInfos: '++id, personId',
      softwareTraits: '++id, personId',
      characterScores: '++id, personId',
      abilities: '++id, personId, name',
      networkInfos: '++id, personId',
      observeEvents: '++id, personId, type, eventCategory, createdAt',
    });

    // v2: 添加 status 字段用于归档（冷宫）功能
    this.version(2).stores({
      persons:
        '++id, alias, category, subCategory, *tags, trustValue, reliability, intimacy, status, createdAt, updatedAt, lastObservedAt',
    });
  }
}

// 单例实例
let dbInstance: KnowPeopleDB | null = null;

export function getDB(): KnowPeopleDB {
  if (typeof window === 'undefined') {
    throw new Error('Database can only be initialized in browser environment');
  }
  if (!dbInstance) {
    dbInstance = new KnowPeopleDB();
  }
  return dbInstance;
}

// 用于 SSR/测试的兼容导出
export const db = typeof window !== 'undefined' ? getDB() : null;

export default KnowPeopleDB;
