import { v4 as uuidv4 } from 'uuid';
import { getDB } from '@/knowpeople/services/db';
import type {
  Person,
  CreatePersonInput,
  PersonFilters,
  HardwareInfo,
  SoftwareTrait,
  CharacterScores,
} from '@/knowpeople/core/models';
import { getCategoryById } from '@/knowpeople/core/constants/categories';
import { recalculateTrustBank } from './observeService';

/**
 * 人物服务
 * 负责人物的增删改查及关联数据管理
 */

export async function createPerson(input: CreatePersonInput): Promise<Person> {
  const db = getDB();
  const now = new Date();
  const categoryConfig = getCategoryById(input.category);

  if (!categoryConfig) {
    throw new Error(`Invalid category: ${input.category}`);
  }

  const personId = uuidv4();
  const initialTrust = categoryConfig.initialTrust;
  // 第一印象优先：用户的主观直觉覆盖分类默认值
  const effectiveInitialTrust = input.firstImpression ?? initialTrust;

  // 创建人物主记录
  const person: Person = {
    id: personId,
    alias: input.alias,
    avatar: input.avatar,
    category: input.category,
    subCategory: input.subCategory,
    tags: input.tags || [],
    note: input.note,
    firstImpression: input.firstImpression,
    firstImpressionNote: input.firstImpressionNote,
    knownSince: input.knownSince,
    trustValue: effectiveInitialTrust,
    reliability: 0,
    intimacy: 0,
    status: 'active',
    createdAt: now,
    updatedAt: now,
    lastObservedAt: now,
  };

  await db.persons.add(person);

  // 创建关联数据
  let hardwareId: string | undefined;
  let softwareId: string | undefined;

  if (input.hardware) {
    const hardware: HardwareInfo = {
      id: uuidv4(),
      personId,
      ...input.hardware,
      updatedAt: now,
    };
    await db.hardwareInfos.add(hardware);
    hardwareId = hardware.id;
  }

  if (input.software) {
    const software: SoftwareTrait = {
      id: uuidv4(),
      personId,
      ...input.software,
      hobbies: input.software.hobbies || [],
      personalityTags: input.software.personalityTags || [],
      updatedAt: now,
    };
    await db.softwareTraits.add(software);
    softwareId = software.id;
  }

  // 创建默认品性评分（所有维度 5 分）
  const characterScores: CharacterScores = {
    id: uuidv4(),
    personId,
    diligence: 5,
    reliability: 5,
    integrity: 5,
    emotionalStability: 5,
    empathy: 5,
    updatedAt: now,
  };
  await db.characterScores.add(characterScores);

  // 更新人物的关联 ID
  await db.persons.update(personId, {
    hardwareId,
    softwareId,
    characterId: characterScores.id,
  });

  return { ...person, hardwareId, softwareId, characterId: characterScores.id };
}

export async function getPersonById(id: string): Promise<Person | undefined> {
  const db = getDB();
  return db.persons.get(id);
}

export async function getPersonWithDetails(id: string): Promise<{
  person: Person;
  hardware?: HardwareInfo;
  software?: SoftwareTrait;
  character?: CharacterScores;
} | null> {
  const db = getDB();
  const person = await db.persons.get(id);
  if (!person) return null;

  const [hardware, software, character] = await Promise.all([
    person.hardwareId ? db.hardwareInfos.get(person.hardwareId) : undefined,
    person.softwareId ? db.softwareTraits.get(person.softwareId) : undefined,
    person.characterId ? db.characterScores.get(person.characterId) : undefined,
  ]);

  return { person, hardware, software, character };
}

export async function listPersons(filters?: PersonFilters): Promise<Person[]> {
  const db = getDB();
  let collection = db.persons.toCollection();

  if (filters?.category) {
    collection = db.persons.where('category').equals(filters.category);
  }

  if (filters?.subCategory) {
    collection = db.persons.where('subCategory').equals(filters.subCategory);
  }

  if (filters?.tags && filters.tags.length > 0) {
    // Dexie 不支持直接查询数组包含，需要过滤
    const all = await collection.toArray();
    return all.filter(p => {
      const matchTags = filters.tags!.some(tag => p.tags.includes(tag));
      const matchStatus = filters.status ? p.status === filters.status : true;
      return matchTags && matchStatus;
    });
  }

  let results = await collection.toArray();

  // 状态筛选（默认只显示活跃）
  if (filters?.status) {
    results = results.filter(p => p.status === filters.status);
  }

  // 信任值范围筛选
  if (filters?.minTrust !== undefined) {
    results = results.filter(p => p.trustValue >= filters.minTrust!);
  }
  if (filters?.maxTrust !== undefined) {
    results = results.filter(p => p.trustValue <= filters.maxTrust!);
  }

  // 搜索（代号或标签）
  if (filters?.query) {
    const q = filters.query.toLowerCase();
    results = results.filter(
      p => p.alias.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  // 默认按更新时间倒序
  return results.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export async function updatePerson(
  id: string,
  updates: Partial<Omit<Person, 'id' | 'createdAt'>>
): Promise<Person> {
  const db = getDB();
  const now = new Date();

  // 检测分类是否变化——分类变化会影响初始信任值、衰减周期、时间加分
  const oldPerson = await db.persons.get(id);
  const categoryChanged = updates.category && updates.category !== oldPerson?.category;

  await db.persons.update(id, {
    ...updates,
    updatedAt: now,
  });

  const updated = await db.persons.get(id);
  if (!updated) {
    throw new Error(`Person not found: ${id}`);
  }

  // 分类变化时触发信任银行重算（initialTrust、minTrust、decayRate 等均依赖分类）
  if (categoryChanged) {
    await recalculateTrustBank(id);
    const recalculated = await db.persons.get(id);
    if (recalculated) return recalculated;
  }

  return updated;
}

/**
 * 归档人物（移入冷宫）
 * 保留所有数据，但从活跃列表中隐藏
 */
export async function archivePerson(id: string): Promise<void> {
  const db = getDB();
  await db.persons.update(id, {
    status: 'archived',
    updatedAt: new Date(),
  });
}

/**
 * 解除归档（从冷宫恢复）
 */
export async function unarchivePerson(id: string): Promise<void> {
  const db = getDB();
  await db.persons.update(id, {
    status: 'active',
    updatedAt: new Date(),
  });
}

export async function updatePersonStats(
  id: string,
  stats: { trustValue?: number; reliability?: number; intimacy?: number }
): Promise<void> {
  const db = getDB();
  await db.persons.update(id, {
    ...stats,
    updatedAt: new Date(),
  });
}

export async function deletePerson(id: string): Promise<void> {
  const db = getDB();

  // 获取人物以找到关联数据
  const person = await db.persons.get(id);
  if (!person) return;

  // 删除关联数据
  await Promise.all([
    person.hardwareId ? db.hardwareInfos.delete(person.hardwareId) : Promise.resolve(),
    person.softwareId ? db.softwareTraits.delete(person.softwareId) : Promise.resolve(),
    person.characterId ? db.characterScores.delete(person.characterId) : Promise.resolve(),
    db.abilities.where('personId').equals(id).delete(),
    db.networkInfos.where('personId').equals(id).delete(),
    db.observeEvents.where('personId').equals(id).delete(),
  ]);

  // 删除人物主记录
  await db.persons.delete(id);
}

export async function searchPersons(query: string): Promise<Person[]> {
  return listPersons({ query });
}

// ============================================================
// 关联数据更新
// ============================================================

export async function updateHardware(
  personId: string,
  updates: Partial<Omit<HardwareInfo, 'id' | 'personId'>>
): Promise<HardwareInfo> {
  const db = getDB();
  const person = await db.persons.get(personId);
  if (!person) throw new Error(`Person not found: ${personId}`);

  let hardwareId = person.hardwareId;
  if (!hardwareId) {
    const newHardware: HardwareInfo = {
      id: uuidv4(),
      personId,
      ...updates,
      updatedAt: new Date(),
    };
    hardwareId = newHardware.id;
    await db.hardwareInfos.add(newHardware);
    await db.persons.update(personId, { hardwareId });
    return newHardware;
  }

  await db.hardwareInfos.update(hardwareId, { ...updates, updatedAt: new Date() });
  const updated = await db.hardwareInfos.get(hardwareId);
  if (!updated) throw new Error(`Hardware not found: ${hardwareId}`);
  return updated;
}

export async function updateSoftware(
  personId: string,
  updates: Partial<Omit<SoftwareTrait, 'id' | 'personId'>>
): Promise<SoftwareTrait> {
  const db = getDB();
  const person = await db.persons.get(personId);
  if (!person) throw new Error(`Person not found: ${personId}`);

  let softwareId = person.softwareId;
  if (!softwareId) {
    const newSoftware: SoftwareTrait = {
      id: uuidv4(),
      personId,
      hobbies: [],
      personalityTags: [],
      ...updates,
      updatedAt: new Date(),
    };
    softwareId = newSoftware.id;
    await db.softwareTraits.add(newSoftware);
    await db.persons.update(personId, { softwareId });
    return newSoftware;
  }

  await db.softwareTraits.update(softwareId, { ...updates, updatedAt: new Date() });
  const updated = await db.softwareTraits.get(softwareId);
  if (!updated) throw new Error(`Software not found: ${softwareId}`);
  return updated;
}

export async function updateCharacter(
  personId: string,
  updates: Partial<Omit<CharacterScores, 'id' | 'personId'>>
): Promise<CharacterScores> {
  const db = getDB();
  const person = await db.persons.get(personId);
  if (!person) throw new Error(`Person not found: ${personId}`);

  let characterId = person.characterId;
  let result: CharacterScores;

  if (!characterId) {
    const newCharacter: CharacterScores = {
      id: uuidv4(),
      personId,
      diligence: 5,
      reliability: 5,
      integrity: 5,
      emotionalStability: 5,
      empathy: 5,
      ...updates,
      updatedAt: new Date(),
    };
    characterId = newCharacter.id;
    await db.characterScores.add(newCharacter);
    await db.persons.update(personId, { characterId });
    result = newCharacter;
  } else {
    await db.characterScores.update(characterId, { ...updates, updatedAt: new Date() });
    const updated = await db.characterScores.get(characterId);
    if (!updated) throw new Error(`Character not found: ${characterId}`);
    result = updated;
  }

  // 品性评分变化影响靠谱度和亲密度，触发信任银行重算
  await recalculateTrustBank(personId);

  return result;
}
