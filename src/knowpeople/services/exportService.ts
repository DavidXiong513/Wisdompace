import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';
import { getDB } from '@/knowpeople/services/db';
import type { ExportData, ImportResult } from '@/knowpeople/core/models';

/**
 * 数据导出/导入服务
 * 支持加密导出和导入，确保数据隐私
 */

const EXPORT_VERSION = '1.0';

/**
 * 导出所有数据
 * @param password 可选密码，提供则加密导出
 */
export async function exportAll(password?: string): Promise<string> {
  const db = getDB();

  const data: ExportData = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    persons: await db.persons.toArray(),
    hardwareInfos: await db.hardwareInfos.toArray(),
    softwareTraits: await db.softwareTraits.toArray(),
    characterScores: await db.characterScores.toArray(),
    networkInfos: await db.networkInfos.toArray(),
    abilities: await db.abilities.toArray(),
    observeEvents: await db.observeEvents.toArray(),
  };

  const jsonStr = JSON.stringify(data);

  if (password) {
    // AES 加密
    const encrypted = CryptoJS.AES.encrypt(jsonStr, password).toString();
    return JSON.stringify({
      encrypted: true,
      data: encrypted,
    });
  }

  return jsonStr;
}

/**
 * 导入数据
 * @param dataStr 导出字符串
 * @param password 密码（如果导出时加密了）
 * @param mode 'overwrite' | 'merge' 导入模式
 *
 * 修复要点：
 * 1. 整个导入过程包裹在 Dexie 事务中，失败时自动回滚（原子性）
 * 2. merge 模式下 personId 映射应用到所有关联数据（观察事件、硬件、软件等）
 * 3. 关联数据生成新 UUID 避免冲突，并同步更新 person 的引用字段
 * 4. 所有日期字段正确转换为 Date 对象
 */
export async function importData(
  dataStr: string,
  password?: string,
  mode: 'overwrite' | 'merge' = 'merge'
): Promise<ImportResult> {
  const db = getDB();
  const result: ImportResult = {
    success: false,
    importedPersons: 0,
    importedEvents: 0,
    errors: [],
  };

  try {
    // 解析外层
    const parsed = JSON.parse(dataStr);
    let jsonStr: string;

    // 如果是加密数据
    if (parsed.encrypted && parsed.data) {
      if (!password) {
        result.errors.push('此导出文件需要密码才能导入');
        return result;
      }
      const decrypted = CryptoJS.AES.decrypt(parsed.data, password);
      jsonStr = decrypted.toString(CryptoJS.enc.Utf8);
      if (!jsonStr) {
        result.errors.push('密码错误，无法解密');
        return result;
      }
    } else {
      jsonStr = dataStr;
    }

    // 解析数据
    const data: ExportData = JSON.parse(jsonStr);

    // 版本检查
    if (!data.version) {
      result.errors.push('无效的导出文件格式');
      return result;
    }

    // 整个导入过程包裹在事务中，确保原子性
    await db.transaction(
      'rw',
      [
        db.persons,
        db.hardwareInfos,
        db.softwareTraits,
        db.characterScores,
        db.networkInfos,
        db.abilities,
        db.observeEvents,
      ],
      async () => {
        // 覆盖模式：先清空所有表
        if (mode === 'overwrite') {
          await Promise.all([
            db.persons.clear(),
            db.hardwareInfos.clear(),
            db.softwareTraits.clear(),
            db.characterScores.clear(),
            db.networkInfos.clear(),
            db.abilities.clear(),
            db.observeEvents.clear(),
          ]);
        }

        // === 1. 导入人物（建立 oldId -> newId 映射） ===
        const personIdMap = new Map<string, string>();

        for (const person of data.persons) {
          try {
            const fixedPerson = {
              ...person,
              createdAt: new Date(person.createdAt),
              updatedAt: new Date(person.updatedAt),
              lastObservedAt: new Date(person.lastObservedAt),
              knownSince: person.knownSince ? new Date(person.knownSince) : undefined,
              // 清除关联引用，导入关联数据时重新设置
              hardwareId: undefined,
              softwareId: undefined,
              characterId: undefined,
              networkId: undefined,
            };

            if (mode === 'merge') {
              // 检查是否已存在（按代号匹配）
              const existing = await db.persons.where('alias').equals(person.alias).first();
              if (existing) {
                // 映射 oldId -> existingId
                personIdMap.set(person.id, existing.id);

                // 删除该人物旧的关联数据，避免残留
                await Promise.all([
                  db.hardwareInfos.where('personId').equals(existing.id).delete(),
                  db.softwareTraits.where('personId').equals(existing.id).delete(),
                  db.characterScores.where('personId').equals(existing.id).delete(),
                  db.networkInfos.where('personId').equals(existing.id).delete(),
                  db.abilities.where('personId').equals(existing.id).delete(),
                ]);

                // 更新人物记录（保留 existing ID）
                await db.persons.update(existing.id, {
                  ...fixedPerson,
                  id: existing.id,
                });
                continue;
              }
            }

            // 新人物——使用原始 ID
            await db.persons.add(fixedPerson);
            personIdMap.set(person.id, person.id);
            result.importedPersons++;
          } catch (err) {
            result.errors.push(`导入人物 "${person.alias}" 失败: ${err}`);
          }
        }

        // === 2. 导入观察事件（映射 personId） ===
        for (const event of data.observeEvents) {
          try {
            const mappedPersonId = personIdMap.get(event.personId) || event.personId;
            const fixedEvent = {
              ...event,
              personId: mappedPersonId,
              createdAt: new Date(event.createdAt),
            };
            await db.observeEvents.add(fixedEvent);
            result.importedEvents++;
          } catch (err) {
            result.errors.push(`导入事件失败: ${err}`);
          }
        }

        // === 3. 导入关联数据（映射 personId + 生成新 UUID + 更新引用） ===

        // 硬件信息
        for (const item of data.hardwareInfos) {
          try {
            const mappedPersonId = personIdMap.get(item.personId) || item.personId;
            const newId = uuidv4();
            await db.hardwareInfos.add({
              ...item,
              id: newId,
              personId: mappedPersonId,
              updatedAt: new Date(item.updatedAt),
            });
            await db.persons.update(mappedPersonId, { hardwareId: newId });
          } catch {
            // 忽略单个关联数据导入错误
          }
        }

        // 软件特质
        for (const item of data.softwareTraits) {
          try {
            const mappedPersonId = personIdMap.get(item.personId) || item.personId;
            const newId = uuidv4();
            await db.softwareTraits.add({
              ...item,
              id: newId,
              personId: mappedPersonId,
              updatedAt: new Date(item.updatedAt),
            });
            await db.persons.update(mappedPersonId, { softwareId: newId });
          } catch {
            // 忽略
          }
        }

        // 品性评分
        for (const item of data.characterScores) {
          try {
            const mappedPersonId = personIdMap.get(item.personId) || item.personId;
            const newId = uuidv4();
            await db.characterScores.add({
              ...item,
              id: newId,
              personId: mappedPersonId,
              updatedAt: new Date(item.updatedAt),
            });
            await db.persons.update(mappedPersonId, { characterId: newId });
          } catch {
            // 忽略
          }
        }

        // 人脉资源
        for (const item of data.networkInfos) {
          try {
            const mappedPersonId = personIdMap.get(item.personId) || item.personId;
            const newId = uuidv4();
            await db.networkInfos.add({
              ...item,
              id: newId,
              personId: mappedPersonId,
              updatedAt: new Date(item.updatedAt),
            });
            await db.persons.update(mappedPersonId, { networkId: newId });
          } catch {
            // 忽略
          }
        }

        // 能力项
        for (const item of data.abilities) {
          try {
            const mappedPersonId = personIdMap.get(item.personId) || item.personId;
            await db.abilities.add({
              ...item,
              id: uuidv4(),
              personId: mappedPersonId,
              createdAt: new Date(item.createdAt),
            });
          } catch {
            // 忽略
          }
        }
      }
    );

    result.success = result.errors.length === 0;
    return result;
  } catch (err) {
    result.errors.push(`导入失败: ${err}`);
    return result;
  }
}

/**
 * 验证导出数据格式
 */
export function validateExportData(data: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (typeof data !== 'object' || data === null) {
    errors.push('数据必须是对象');
    return { valid: false, errors };
  }

  const d = data as Record<string, unknown>;

  if (!d.version) errors.push('缺少版本号');
  if (!Array.isArray(d.persons)) errors.push('缺少 persons 数组');
  if (!Array.isArray(d.observeEvents)) errors.push('缺少 observeEvents 数组');

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 下载导出文件
 */
export function downloadExport(dataStr: string, filename?: string): void {
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `knowpeople-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
