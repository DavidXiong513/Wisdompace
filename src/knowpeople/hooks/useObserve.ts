import { useCallback, useEffect, useState } from 'react';
import {
  addObserveEvent,
  listObserveEvents,
  deleteObserveEvent,
  recalculateTrustBank,
  getDecayReminders,
  countAllObserveEvents,
} from '@/knowpeople/services/observeService';
import { generateTrustTrend } from '@/knowpeople/core/calculators/trustBank';
import { getCategoryById } from '@/knowpeople/core/constants/categories';
import type {
  ObserveEvent,
  CreateObserveEventInput,
  Person,
  TrustTrendPoint,
} from '@/knowpeople/core/models';

/**
 * 观察记录 Hook
 */
export function useObserveEvents(personId: string | null) {
  const [events, setEvents] = useState<ObserveEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!personId) return;
    setLoading(true);
    try {
      const data = await listObserveEvents(personId);
      setEvents(data);
    } finally {
      setLoading(false);
    }
  }, [personId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback(
    async (input: Omit<CreateObserveEventInput, 'personId'>) => {
      if (!personId) return null;
      const event = await addObserveEvent({ ...input, personId });
      await refresh();
      return event;
    },
    [personId, refresh]
  );

  const remove = useCallback(
    async (eventId: string) => {
      await deleteObserveEvent(eventId);
      await refresh();
    },
    [refresh]
  );

  return { events, loading, add, remove, refresh };
}

/**
 * 信任银行实时计算 Hook
 */
export function useTrustBank(personId: string | null) {
  const [stats, setStats] = useState<{
    trustValue: number;
    reliability: number;
    intimacy: number;
    timeBonus: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const recalculate = useCallback(async () => {
    if (!personId) return;
    setLoading(true);
    try {
      const result = await recalculateTrustBank(personId);
      setStats(result);
    } finally {
      setLoading(false);
    }
  }, [personId]);

  useEffect(() => {
    recalculate();
  }, [recalculate]);

  return { stats, loading, recalculate };
}

/**
 * 衰减提醒 Hook
 */
export function useDecayReminders() {
  const [reminders, setReminders] = useState<
    { person: Person; daysOverdue: number; status: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDecayReminders();
      setReminders(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { reminders, loading, refresh };
}

/**
 * 信任趋势 Hook
 */
export function useTrustTrend(personId: string | null, days: number = 30) {
  const [trend, setTrend] = useState<TrustTrendPoint[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!personId) return;
    setLoading(true);
    try {
      const { getDB } = await import('@/knowpeople/services/db');
      const db = getDB();
      const person = await db.persons.get(personId);
      if (!person) return;

      const events = await listObserveEvents(personId);
      const categoryConfig = getCategoryById(person.category);
      if (!categoryConfig) return;

      // 第一印象优先
      const effectiveInitialTrust = person.firstImpression ?? categoryConfig.initialTrust;

      const points = generateTrustTrend({
        initialTrust: effectiveInitialTrust,
        events,
        category: person.category,
        days,
        knownSince: person.knownSince ?? person.createdAt,
      });
      setTrend(points);
    } finally {
      setLoading(false);
    }
  }, [personId, days]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { trend, loading, refresh };
}

/**
 * 批量事件计数 Hook（用于列表页可信度计算）
 */
export function useEventCounts() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await countAllObserveEvents();
      setCounts(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { counts, loading, refresh };
}
