'use no memo';

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useProgressByCategory, useUpsertProgress } from '@/lib/hooks/useProgress';

// ============ 本地存储 Key ============

function localKey(chapterSlug: string, sectionId: string) {
  return `wp-reflections-${chapterSlug}-${sectionId}`;
}

interface LocalAnswer {
  answer: string;
  updatedAt: string;
}

type LocalAnswersMap = Record<number, LocalAnswer>;

/** 从 localStorage 读取 */
function readLocal(chapterSlug: string, sectionId: string): LocalAnswersMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(localKey(chapterSlug, sectionId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as LocalAnswersMap;
    return parsed;
  } catch {
    return {};
  }
}

/** 写入 localStorage */
function writeLocal(chapterSlug: string, sectionId: string, map: LocalAnswersMap) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(localKey(chapterSlug, sectionId), JSON.stringify(map));
  } catch {
    // 忽略存储失败（如空间满）
  }
}

// ============ API Key 生成 ============

function progressKey(chapterSlug: string, sectionId: string, questionIndex: number) {
  return `${chapterSlug}-${sectionId}-q${questionIndex}`;
}

// ============ Hook ============

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseReflectionAnswersReturn {
  /** 当前各题答案（按题号索引） */
  answers: Record<number, string>;
  /** 保存某题答案 */
  saveAnswer: (questionIndex: number, text: string) => void;
  /** 各题保存状态 */
  statuses: Record<number, SaveStatus>;
  /** 是否正在从服务端加载 */
  isLoading: boolean;
}

/**
 * 管理章节思考题的回答
 *
 * - 未登录用户：纯 localStorage 持久化
 * - 已登录用户：localStorage 做本地缓存 + 自动同步到 Supabase progress 表
 */
export function useReflectionAnswers(
  chapterSlug: string,
  sectionId: string,
  questionCount: number
): UseReflectionAnswersReturn {
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = !!user;

  // 本地答案状态
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [statuses, setStatuses] = useState<Record<number, SaveStatus>>({});

  // 从服务端拉取已保存的回答
  const { data: progressRows, isLoading } = useProgressByCategory('reflection-answer', {
    enabled: isLoggedIn,
  });

  const upsert = useUpsertProgress();

  // 防抖定时器
  const debounceRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  // ====== 初始化：加载已有答案 ======
  useEffect(() => {
    const local = readLocal(chapterSlug, sectionId);
    const init: Record<number, string> = {};
    for (let i = 0; i < questionCount; i++) {
      if (local[i]) init[i] = local[i].answer;
    }

    // 如果已登录，服务端数据优先级更高（覆盖本地）
    if (isLoggedIn && progressRows) {
      const prefix = `${chapterSlug}-${sectionId}-q`;
      for (const row of progressRows) {
        if (row.key.startsWith(prefix)) {
          const idxMatch = row.key.match(/-q(\d+)$/);
          if (idxMatch) {
            const idx = parseInt(idxMatch[1], 10);
            const val = row.value as { answer?: string } | undefined;
            if (val?.answer !== undefined) {
              init[idx] = val.answer;
            }
          }
        }
      }
    }

    setAnswers(init);
  }, [chapterSlug, sectionId, questionCount, isLoggedIn, progressRows]);

  // ====== 保存逻辑 ======
  const saveAnswer = useCallback(
    (questionIndex: number, text: string) => {
      // 1. 立即更新本地状态
      setAnswers((prev) => ({ ...prev, [questionIndex]: text }));
      setStatuses((prev) => ({ ...prev, [questionIndex]: 'saving' }));

      // 2. 写入 localStorage（所有用户都写，作为本地缓存）
      const local = readLocal(chapterSlug, sectionId);
      local[questionIndex] = { answer: text, updatedAt: new Date().toISOString() };
      writeLocal(chapterSlug, sectionId, local);

      // 3. 清除旧的防抖定时器
      if (debounceRef.current[questionIndex]) {
        clearTimeout(debounceRef.current[questionIndex]);
      }

      // 4. 防抖后同步到服务端（已登录用户）
      debounceRef.current[questionIndex] = setTimeout(() => {
        if (isLoggedIn) {
          upsert.mutate(
            {
              category: 'reflection-answer',
              key: progressKey(chapterSlug, sectionId, questionIndex),
              value: { answer: text, answeredAt: new Date().toISOString() },
            },
            {
              onSuccess: () => {
                setStatuses((prev) => ({ ...prev, [questionIndex]: 'saved' }));
                // 2秒后恢复 idle
                setTimeout(() => {
                  setStatuses((prev) => {
                    if (prev[questionIndex] === 'saved') {
                      const next = { ...prev };
                      delete next[questionIndex];
                      return next;
                    }
                    return prev;
                  });
                }, 2000);
              },
              onError: () => {
                setStatuses((prev) => ({ ...prev, [questionIndex]: 'error' }));
              },
            }
          );
        } else {
          // 未登录用户：localStorage 保存完成后直接显示 saved
          setStatuses((prev) => ({ ...prev, [questionIndex]: 'saved' }));
          setTimeout(() => {
            setStatuses((prev) => {
              if (prev[questionIndex] === 'saved') {
                const next = { ...prev };
                delete next[questionIndex];
                return next;
              }
              return prev;
            });
          }, 2000);
        }
      }, 800); // 800ms 防抖
    },
    [chapterSlug, sectionId, isLoggedIn, upsert]
  );

  // 清理定时器
  useEffect(() => {
    return () => {
      Object.values(debounceRef.current).forEach(clearTimeout);
    };
  }, []);

  return { answers, saveAnswer, statuses, isLoading };
}
