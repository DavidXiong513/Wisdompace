import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createPerson,
  listPersons,
  getPersonWithDetails,
  updatePerson,
  deletePerson,
  searchPersons,
  updateHardware,
  updateSoftware,
  updateCharacter,
  archivePerson,
  unarchivePerson,
} from '@/knowpeople/services/personService';
import { recalculateTrustBank } from '@/knowpeople/services/observeService';
import type {
  Person,
  CreatePersonInput,
  PersonFilters,
  CharacterScores,
  HardwareInfo,
  SoftwareTrait,
} from '@/knowpeople/core/models';

/**
 * 人物列表 Hook
 */
export function usePersons(filters?: PersonFilters) {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 稳定 filters 对象引用，避免传入对象字面量时触发无限重渲染
  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listPersons(filters);
      setPersons(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [filtersKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { persons, loading, error, refresh };
}

/**
 * 单个人物详情 Hook
 */
export function usePersonDetail(personId: string | null) {
  const [data, setData] = useState<{
    person: Person;
    hardware?: HardwareInfo;
    software?: SoftwareTrait;
    character?: CharacterScores;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!personId) return;
    try {
      setLoading(true);
      const result = await getPersonWithDetails(personId);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [personId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

/**
 * 创建人物 Hook
 */
export function useCreatePerson() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = useCallback(async (input: CreatePersonInput) => {
    try {
      setLoading(true);
      const person = await createPerson(input);
      // 创建后立即触发信任银行重算，计算初始亲密度/靠谱度
      await recalculateTrustBank(person.id);
      setError(null);
      return person;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading, error };
}

/**
 * 更新人物 Hook
 */
export function useUpdatePerson() {
  const [loading, setLoading] = useState(false);

  const update = useCallback(async (id: string, updates: Partial<Person>) => {
    setLoading(true);
    try {
      const person = await updatePerson(id, updates);
      return person;
    } finally {
      setLoading(false);
    }
  }, []);

  return { update, loading };
}

/**
 * 删除人物 Hook
 */
export function useDeletePerson() {
  const [loading, setLoading] = useState(false);

  const remove = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await deletePerson(id);
    } finally {
      setLoading(false);
    }
  }, []);

  return { delete: remove, loading };
}

/**
 * 归档人物 Hook
 */
export function useArchivePerson() {
  const [loading, setLoading] = useState(false);

  const archive = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await archivePerson(id);
    } finally {
      setLoading(false);
    }
  }, []);

  return { archive, loading };
}

/**
 * 解除归档 Hook
 */
export function useUnarchivePerson() {
  const [loading, setLoading] = useState(false);

  const unarchive = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await unarchivePerson(id);
    } finally {
      setLoading(false);
    }
  }, []);

  return { unarchive, loading };
}

/**
 * 搜索人物 Hook
 */
export function useSearchPersons() {
  const [results, setResults] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await searchPersons(query);
      setResults(data);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, search };
}

/**
 * 更新硬件信息 Hook
 */
export function useUpdateHardware(personId: string) {
  const [loading, setLoading] = useState(false);

  const update = useCallback(
    async (updates: Partial<Omit<HardwareInfo, 'id' | 'personId'>>) => {
      setLoading(true);
      try {
        return await updateHardware(personId, updates);
      } finally {
        setLoading(false);
      }
    },
    [personId]
  );

  return { update, loading };
}

/**
 * 更新软件特质 Hook
 */
export function useUpdateSoftware(personId: string) {
  const [loading, setLoading] = useState(false);

  const update = useCallback(
    async (updates: Partial<Omit<SoftwareTrait, 'id' | 'personId'>>) => {
      setLoading(true);
      try {
        return await updateSoftware(personId, updates);
      } finally {
        setLoading(false);
      }
    },
    [personId]
  );

  return { update, loading };
}

/**
 * 更新品性评分 Hook
 */
export function useUpdateCharacter(personId: string) {
  const [loading, setLoading] = useState(false);

  const update = useCallback(
    async (updates: Partial<Omit<CharacterScores, 'id' | 'personId'>>) => {
      setLoading(true);
      try {
        return await updateCharacter(personId, updates);
      } finally {
        setLoading(false);
      }
    },
    [personId]
  );

  return { update, loading };
}
