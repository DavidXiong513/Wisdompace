'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import type { Database } from '@/types/database';
import type { UpsertProgressInput, ProgressCategory } from '@/lib/validations/progress';

// ============ 类型别名 ============
type ProgressRow = Database['public']['Tables']['progress']['Row'];
type ProgressInsert = Database['public']['Tables']['progress']['Insert'];

// ============ API 基础函数 ============

async function fetchProgress(category?: ProgressCategory): Promise<ProgressRow[]> {
  const url = category ? `/api/progress?category=${category}` : '/api/progress';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch progress');
  const json = await res.json();
  return json.data;
}

async function upsertProgress(input: UpsertProgressInput): Promise<ProgressRow> {
  const res = await fetch('/api/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? 'Failed to upsert progress');
  }
  const json = await res.json();
  return json.data;
}

// ============ 查询全部进度 ============
export function useProgress(
  options?: Partial<Pick<UseQueryOptions<ProgressRow[]>, 'enabled'>>
) {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['progress'],
    queryFn: () => fetchProgress(),
    enabled: !!user && (options?.enabled ?? true),
  });
}

// ============ 查询特定分类的进度 ============
export function useProgressByCategory(
  category: ProgressCategory,
  options?: Partial<Pick<UseQueryOptions<ProgressRow[]>, 'enabled'>>
) {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['progress', category],
    queryFn: () => fetchProgress(category),
    enabled: !!user && (options?.enabled ?? true),
  });
}

// ============ 保存进度 Mutation ============
export function useUpsertProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpsertProgressInput) => upsertProgress(input),
    onSuccess: (_data, variables) => {
      // 清除 progress 列表缓存 + 对应 category 缓存，触发重新拉取
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['progress', variables.category] });
    },
  });
}

// ============ 便捷工具：查询特定进度项 ============
export function useProgressItem(category: ProgressCategory, key: string) {
  const { data, ...rest } = useProgressByCategory(category);
  const item = data?.find((p) => p.key === key);
  return { data: item, ...rest };
}
