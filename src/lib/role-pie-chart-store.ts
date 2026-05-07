// ==================== 人生角色饼图测评状态管理 ==================== //
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RoleAssessment, RPCPhase } from '@/types/role-pie-chart';

interface RolePieChartState {
  // 阶段
  phase: RPCPhase;

  // 阶段一：选中的角色列表 [{ id, name }]
  selectedRoles: { id: string; name: string }[];

  // 阶段二&三：角色评估数据
  assessments: RoleAssessment[];

  // 操作方法
  setPhase: (phase: RPCPhase) => void;

  // 选中/取消角色
  toggleRole: (id: string, name: string) => void;

  // 添加自定义角色
  addCustomRole: (name: string) => void;

  // 移除角色
  removeRole: (id: string) => void;

  // 设置重视程度
  setImportance: (roleId: string, importance: number) => void;

  // 切换核心排名（0→1→2→3→0循环）
  cycleCoreRank: (roleId: string) => void;

  // 设置每周小时数
  setHoursPerWeek: (roleId: string, hours: number) => void;

  reset: () => void;
}

const initialState = {
  phase: 'welcome' as RPCPhase,
  selectedRoles: [] as { id: string; name: string }[],
  assessments: [] as RoleAssessment[],
};

export const useRolePieChartStore = create<RolePieChartState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setPhase: (phase) => set({ phase }),

      toggleRole: (id, name) => {
        const current = get().selectedRoles;
        if (current.some(r => r.id === id)) {
          set({ selectedRoles: current.filter(r => r.id !== id) });
        } else {
          set({ selectedRoles: [...current, { id, name }] });
        }
      },

      addCustomRole: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        // 检查是否已存在
        const exists = get().selectedRoles.some(r => r.name === trimmed);
        if (exists) return;
        const id = `custom-${Date.now()}`;
        set({ selectedRoles: [...get().selectedRoles, { id, name: trimmed }] });
      },

      removeRole: (id) => {
        set({
          selectedRoles: get().selectedRoles.filter(r => r.id !== id),
          assessments: get().assessments.filter(a => a.roleId !== id),
        });
      },

      setImportance: (roleId, importance) => {
        const assessments = get().assessments;
        const existing = assessments.find(a => a.roleId === roleId);

        if (existing) {
          set({
            assessments: assessments.map(a =>
              a.roleId === roleId ? { ...a, importance } : a,
            ),
          });
        } else {
          // 新增评估数据
          const role = get().selectedRoles.find(r => r.id === roleId);
          set({
            assessments: [
              ...assessments,
              {
                roleId,
                name: role?.name ?? roleId,
                importance,
                coreRank: 0,
                hoursPerWeek: 0,
              },
            ],
          });
        }
      },

      cycleCoreRank: (roleId) => {
        const assessments = get().assessments;
        const current = assessments.find(a => a.roleId === roleId);
        const currentRank = current?.coreRank ?? 0;

        let nextRank: number;

        if (currentRank > 0) {
          // 已有排名 → 循环切换：1→2→3→0
          nextRank = currentRank >= 3 ? 0 : currentRank + 1;
        } else {
          // 未排名 → 自动分配第一个空缺的核心排名（1/2/3）
          const usedRanks = new Set(
            assessments.filter(a => a.roleId !== roleId && a.coreRank > 0).map(a => a.coreRank),
          );
          nextRank = 1;
          while (usedRanks.has(nextRank) && nextRank <= 3) {
            nextRank++;
          }
          // 超过3说明核心位已满，设为0（不分配）
          if (nextRank > 3) nextRank = 0;
        }

        set({
          assessments: assessments.map(a => {
            if (a.roleId === roleId) {
              return { ...a, coreRank: nextRank };
            }
            // 清除被挤掉的相同排名角色
            if (nextRank > 0 && a.coreRank === nextRank) {
              return { ...a, coreRank: 0 };
            }
            return a;
          }),
        });
      },

      setHoursPerWeek: (roleId, hours) => {
        const assessments = get().assessments;
        const existing = assessments.find(a => a.roleId === roleId);

        if (existing) {
          set({
            assessments: assessments.map(a =>
              a.roleId === roleId ? { ...a, hoursPerWeek: Math.max(0, hours) } : a,
            ),
          });
        } else {
          const role = get().selectedRoles.find(r => r.id === roleId);
          set({
            assessments: [
              ...assessments,
              {
                roleId,
                name: role?.name ?? roleId,
                importance: 0,
                coreRank: 0,
                hoursPerWeek: Math.max(0, hours),
              },
            ],
          });
        }
      },

      reset: () => set(initialState),
    }),
    {
      name: 'role-pie-chart-storage',
      // Zustand v5 不支持 deserialize，必须用自定义 storage 的 getItem 做防护
      storage: {
        getItem: (name) => {
          const raw = localStorage.getItem(name);
          if (!raw) return null;
          try {
            const parsed = JSON.parse(raw);
            const data = parsed?.state;
            if (!data || typeof data !== 'object') {
              console.warn('[role-pie-chart] localStorage 数据结构异常，已重置');
              return null;
            }
            // 容量上限防护：数组超过 100 条直接丢弃
            if (Array.isArray(data.selectedRoles) && data.selectedRoles.length > 100) {
              console.warn('[role-pie-chart] selectedRoles 数组异常膨胀，已重置');
              return null;
            }
            if (Array.isArray(data.assessments) && data.assessments.length > 100) {
              console.warn('[role-pie-chart] assessments 数组异常膨胀，已重置');
              return null;
            }
            // 结构校验
            const safePhase = ['welcome', 'select-roles', 'importance', 'time', 'report'].includes(data.phase)
              ? data.phase : initialState.phase;
            const safeRoles = Array.isArray(data.selectedRoles) ? data.selectedRoles.slice(0, 50) : [];
            const safeAssessments = Array.isArray(data.assessments)
              ? data.assessments
                  .filter((a: unknown) => a && typeof a === 'object' && 'roleId' in (a as Record<string, unknown>) && 'name' in (a as Record<string, unknown>))
                  .slice(0, 50)
              : [];
            return {
              state: {
                phase: safePhase,
                selectedRoles: safeRoles,
                assessments: safeAssessments,
              },
              version: parsed.version ?? 0,
            };
          } catch {
            console.warn('[role-pie-chart] localStorage 数据损坏，已重置');
            localStorage.removeItem(name);
            return null;
          }
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
      partialize: (state) => ({
        phase: state.phase,
        selectedRoles: state.selectedRoles.slice(0, 50),
        assessments: state.assessments.slice(0, 50),
      }),
    },
  ),
);
