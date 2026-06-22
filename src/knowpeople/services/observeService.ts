import { v4 as uuidv4 } from 'uuid';
import { getDB } from '@/knowpeople/services/db';
import type { ObserveEvent, CreateObserveEventInput, Person } from '@/knowpeople/core/models';
import { getEventCategoryById } from '@/knowpeople/core/constants/events';
import {
  calculateTrustBank,
  calculateReliability,
  calculateIntimacy,
} from '@/knowpeople/core/calculators/trustBank';
import { getCategoryById } from '@/knowpeople/core/constants/categories';
import { updatePersonStats, updatePerson } from './personService';

/**
 * 观察记录服务
 * 负责观察事件的增删改查，以及触发信任银行重算
 */

export async function addObserveEvent(input: CreateObserveEventInput): Promise<ObserveEvent> {
  const db = getDB();
  const now = new Date();

  // 获取事件配置
  const eventConfig = getEventCategoryById(input.eventCategory);
  const trustDelta = input.trustDelta ?? eventConfig?.defaultTrustDelta ?? 0;

  const event: ObserveEvent = {
    id: uuidv4(),
    personId: input.personId,
    type: input.type,
    eventCategory: input.eventCategory,
    affectedDimensions: input.affectedDimensions,
    trustDelta,
    note: input.note,
    createdAt: now,
  };

  await db.observeEvents.add(event);

  // 更新人物最后观察时间
  await updatePerson(input.personId, {
    lastObservedAt: now,
  });

  // 触发信任银行重算
  await recalculateTrustBank(input.personId);

  return event;
}

export async function listObserveEvents(personId: string): Promise<ObserveEvent[]> {
  const db = getDB();
  return db.observeEvents.where('personId').equals(personId).sortBy('createdAt');
}

/**
 * 批量查询所有人物的观察事件数量
 */
export async function countAllObserveEvents(): Promise<Record<string, number>> {
  const db = getDB();
  const all = await db.observeEvents.toArray();
  const counts: Record<string, number> = {};
  all.forEach(e => {
    counts[e.personId] = (counts[e.personId] || 0) + 1;
  });
  return counts;
}

export async function deleteObserveEvent(eventId: string): Promise<void> {
  const db = getDB();
  const event = await db.observeEvents.get(eventId);
  if (!event) return;

  await db.observeEvents.delete(eventId);

  // 删除后重算信任值
  await recalculateTrustBank(event.personId);
}

/**
 * 重算某人物的信任银行、靠谱度、亲密度
 */
export async function recalculateTrustBank(personId: string): Promise<{
  trustValue: number;
  reliability: number;
  intimacy: number;
  timeBonus: number;
}> {
  const db = getDB();

  const person = await db.persons.get(personId);
  if (!person) {
    throw new Error(`Person not found: ${personId}`);
  }

  const categoryConfig = getCategoryById(person.category);
  if (!categoryConfig) {
    throw new Error(`Invalid category: ${person.category}`);
  }

  // 获取所有观察事件
  const events = await listObserveEvents(personId);

  // 第一印象优先：用户主观直觉覆盖分类默认值
  const effectiveInitialTrust = person.firstImpression ?? categoryConfig.initialTrust;

  // 1. 计算信任银行
  const trustResult = calculateTrustBank({
    initialTrust: effectiveInitialTrust,
    events,
    lastObservedAt: person.lastObservedAt,
    category: person.category,
    knownSince: person.knownSince ?? person.createdAt,
  });

  // 2. 计算靠谱度
  const character = person.characterId ? await db.characterScores.get(person.characterId) : null;
  const reliabilityResult = calculateReliability({
    scores: character || null,
    events,
  });

  // 3. 计算亲密度（简化版：互动频率基于事件数）
  const interactionFrequency = Math.min(events.length * 5, 100); // 每个事件 +5，上限 100
  const communicationDepth = character
    ? Math.round((character.empathy * 10 + character.emotionalStability * 10) / 2)
    : 50;

  const intimacyResult = calculateIntimacy({
    interactionFrequency,
    trustValue: trustResult.currentValue,
    communicationDepth,
  });

  // 4. 更新人物统计字段
  await updatePersonStats(personId, {
    trustValue: trustResult.currentValue,
    reliability: reliabilityResult.value,
    intimacy: intimacyResult.value,
  });

  return {
    trustValue: trustResult.currentValue,
    reliability: reliabilityResult.value,
    intimacy: intimacyResult.value,
    timeBonus: trustResult.timeBonus,
  };
}

/**
 * 获取所有需要衰减提醒的人物（观察即将过期或已过期）
 */
export async function getDecayReminders(): Promise<
  { person: Person; daysOverdue: number; status: string }[]
> {
  const db = getDB();
  const persons = await db.persons.toArray();
  const now = new Date();
  const reminders: { person: Person; daysOverdue: number; status: string }[] = [];

  for (const person of persons) {
    const config = getCategoryById(person.category);
    if (!config) continue;

    const daysSince = Math.floor(
      (now.getTime() - person.lastObservedAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSince > config.observeCycleDays) {
      reminders.push({
        person,
        daysOverdue: daysSince - config.observeCycleDays,
        status: 'expired',
      });
    } else if (daysSince > config.observeCycleDays * 0.8) {
      reminders.push({
        person,
        daysOverdue: 0,
        status: 'warning',
      });
    }
  }

  return reminders.sort((a, b) => b.daysOverdue - a.daysOverdue);
}
