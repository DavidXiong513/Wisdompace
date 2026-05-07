'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import type { Database } from '@/types/database';
import type { SaveAssessmentInput, AssessmentType } from '@/lib/validations/assessment';

// ============ 类型别名 ============
type AssessmentRow = Database['public']['Tables']['assessments']['Row'];

// ============ API 基础函数 ============

async function fetchAssessments(): Promise<AssessmentRow[]> {
  const res = await fetch('/api/assessments');
  if (!res.ok) throw new Error('Failed to fetch assessments');
  const json = await res.json();
  return json.data;
}

async function saveAssessment(input: SaveAssessmentInput): Promise<AssessmentRow> {
  const res = await fetch('/api/assessments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? 'Failed to save assessment');
  }
  const json = await res.json();
  return json.data;
}

// ============ 已有用户时注册查询 ============
export function useAssessments(
  options?: Partial<Pick<UseQueryOptions<AssessmentRow[]>, 'enabled'>>
) {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['assessments'],
    queryFn: fetchAssessments,
    enabled: !!user && (options?.enabled ?? true),
  });
}

// ============ 已有用户时注册保存 Mutation ============
export function useSaveAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SaveAssessmentInput) => saveAssessment(input),
    onSuccess: () => {
      // 保存成功后 invalidate，强制重新拉取最新列表
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
    },
  });
}

// ============ 便捷工具：查询单个类型的最新测评 ============
export function useLatestAssessment(type: AssessmentType) {
  const { data, ...rest } = useAssessments();
  const latest = data?.find((a) => a.type === type);
  return { data: latest, ...rest };
}
