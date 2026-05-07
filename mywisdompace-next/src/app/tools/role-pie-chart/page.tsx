'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
// Recharts 已移除 — 使用纯 CSS conic-gradient 避免 OOM
// import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useRolePieChartStore } from '@/lib/role-pie-chart-store';
import { usePersistHydrated } from '@/lib/hooks/usePersistHydrated';
import { useAuthStore } from '@/stores/authStore';
import { useProgressByCategory, useUpsertProgress } from '@/lib/hooks/useProgress';
import {
  PRESET_ROLES,
  generateReport,
  exportMarkdown,
} from '@/lib/role-pie-chart-data';
import type { RolePieChartReport } from '@/types/role-pie-chart';

// ==================== 主题色 ==================== //
const THEME = {
  primary: '#C87941',
  primaryLight: '#E8A66A',
  primaryDark: '#A85E2D',
  bg: '#F5F0E8',
  cardBg: '#FFFFFF',
  border: '#E8D9C2',
  textPrimary: '#4A3728',
  textSecondary: '#8A7E6A',
  textMuted: '#B8A888',
  coreBadge: '#C87941',
  warning: '#D97706',
  success: '#059669',
};

// ==================== 进度条 ==================== //
function ProgressBar({
  current,
  total,
  label,
}: {
  current: number;
  total: number;
  label: string;
}) {
  const pct = (current / total) * 100;
  return (
    <div className="mb-5 rounded-xl border border-[#E8D9C2] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-[#8A7E6A]">{label}</span>
        <span className="text-xs font-bold" style={{ color: THEME.primary }}>
          {current}/{total}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#E8D9C2]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(to right, ${THEME.primaryLight}, ${THEME.primary})`,
          }}
        />
      </div>
    </div>
  );
}

// ==================== 星标按钮 ==================== //
function StarButton({
  rank,
  onClick,
}: {
  rank: number;
  onClick: () => void;
}) {
  const label =
    rank === 0 ? '设为核心' : rank === 1 ? '第一核心' : rank === 2 ? '第二核心' : '第三核心';
  // 反转显示：排名越靠前星越多（第一核心3颗、第二核心2颗、第三核心1颗）
  const starCount = rank > 0 ? 4 - rank : 0;
  const stars = starCount > 0 ? '⭐'.repeat(starCount) : '☆';

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 rounded-full border border-[#E8D9C2] px-2 py-0.5 text-xs transition-all hover:border-[#C87941] hover:text-[#C87941]"
      title={label}
    >
      <span>{stars}</span>
      <span className="text-[#8A7E6A]">{label}</span>
    </button>
  );
}

// ==================== 5点量表按钮组 ==================== //
function ImportanceScale({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className="h-8 w-8 rounded-full border-2 transition-all"
          style={{
            borderColor: value >= n ? THEME.primary : '#E8D9C2',
            backgroundColor: value >= n ? THEME.primary : 'transparent',
            color: value >= n ? 'white' : '#B8A888',
          }}
          title={
            ['很不重要', '不太重要', '一般', '比较重要', '非常重要'][
              n - 1
            ]
          }
        />
      ))}
    </div>
  );
}

// ==================== 欢迎页 ==================== //
function WelcomePage() {
  const { setPhase, reset, phase } = useRolePieChartStore();
  const hasProgress = phase !== 'welcome';

  const handleStart = () => {
    reset();
    setPhase('select-roles');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinue = () => {
    setPhase(
      phase === 'welcome' ? 'select-roles' : phase,
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 text-center">
        <div className="mb-4 text-5xl">🥧</div>
        <h1 className="mb-2 text-2xl font-bold sm:text-3xl" style={{ color: THEME.textPrimary }}>
          人生角色饼图
        </h1>
        <p className="text-[15px]" style={{ color: THEME.textSecondary }}>
          Social Identity Assessment
        </p>
        <p className="mt-4 leading-relaxed" style={{ color: THEME.textSecondary }}>
          每个人都被多重角色定义——
          <br />
          你是谁？你把时间花在哪里？
          <br />
          这项测评帮助你梳理生活中承担的各种角色，
          <br />
          看见重视程度与时间分配的偏差，
          <br />
          找到最值得你投入的核心身份。
        </p>
      </div>

      {/* 流程说明 */}
      <div className="mb-8 rounded-xl border border-[#E8D9C2] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <h3 className="mb-3 text-sm font-semibold" style={{ color: THEME.textPrimary }}>
          测评流程
        </h3>
        <div className="space-y-2 text-sm" style={{ color: THEME.textSecondary }}>
          <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: THEME.primary }}>
              1
            </span>
            <span>选择你承担的各种角色</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: THEME.primary }}>
              2
            </span>
            <span>评估对各角色的重视程度，标注核心角色</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: THEME.primary }}>
              3
            </span>
            <span>估算每周在各角色上投入的时间</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: THEME.primary }}>
              4
            </span>
            <span>生成个性化报告，看见偏差与洞察</span>
          </div>
        </div>
      </div>

      {/* 预计时长 */}
      <div className="mb-6 rounded-xl border border-[#E8D9C2] bg-white p-4 text-center shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <p className="text-sm" style={{ color: THEME.textSecondary }}>
          ⏱️ 预计耗时 5–10 分钟
        </p>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleStart}
          className="w-full rounded-xl py-3.5 text-center text-base font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: THEME.primary }}
        >
          {hasProgress ? '重新开始' : '开始测评'}
        </button>
        {hasProgress && (
          <button
            onClick={handleContinue}
            className="w-full rounded-xl border py-3.5 text-center text-sm font-medium transition-colors hover:bg-[#F5EDE3]"
            style={{ borderColor: THEME.border, color: THEME.textSecondary }}
          >
            继续上次的进度 →
          </button>
        )}
      </div>
    </div>
  );
}

// ==================== 阶段一：选择角色 ==================== //
function SelectRolesPage() {
  const { selectedRoles, toggleRole, addCustomRole, setPhase } =
    useRolePieChartStore();
  const [customInput, setCustomInput] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const categories = ['家庭', '工作', '社交'] as const;

  const handleAddCustom = () => {
    if (customInput.trim()) {
      addCustomRole(customInput.trim());
      setCustomInput('');
      setShowCustom(false);
    }
  };

  const allRoles = useMemo(() => {
    return [
      ...PRESET_ROLES.map((r) => ({ ...r, isCustom: false })),
      ...selectedRoles
        .filter((r) => !PRESET_ROLES.find((p) => p.id === r.id))
        .map((r) => ({ id: r.id, name: r.name, icon: '✏️', category: '自定义' as const, isCustom: true })),
    ];
  }, [selectedRoles]);

  const canProceed = selectedRoles.length >= 1;

  return (
    <div className="mx-auto max-w-2xl">
      <ProgressBar current={1} total={4} label="第一阶段 · 选择角色" />

      <div className="mb-5 rounded-xl border border-[#E8D9C2] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <p className="text-sm leading-relaxed" style={{ color: THEME.textSecondary }}>
          想想你目前承担的各种角色。不要只想到&ldquo;工作&rdquo;和&ldquo;家庭&rdquo;这种大词&mdash;&mdash;要具体：比如&ldquo;母亲&rdquo;、&ldquo;团队领导&rdquo;、&ldquo;朋友&rdquo;、&ldquo;照顾者&rdquo;&hellip;&hellip;
          <br />
          <span className="mt-1 block">
            勾选你实际承担的角色，可从列表选择，也可自行添加。
          </span>
        </p>
      </div>

      {/* 已选计数 */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm" style={{ color: THEME.textSecondary }}>
          已选择 {selectedRoles.length} 个角色
        </span>
        {selectedRoles.length > 0 && (
          <span className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white" style={{ backgroundColor: THEME.primary }}>
            {selectedRoles.length} 个
          </span>
        )}
      </div>

      {/* 预置角色按类别展示 */}
      {categories.map((cat) => {
        const catRoles = allRoles.filter((r) => r.category === cat);
        if (catRoles.length === 0) return null;
        return (
          <div key={cat} className="mb-6">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold" style={{ color: THEME.textPrimary }}>
              <span className="h-[2px] w-4 rounded" style={{ backgroundColor: THEME.primary }} />
              {cat}
            </h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {catRoles.map((role) => {
                const isSelected = selectedRoles.some((r) => r.id === role.id);
                return (
                  <button
                    key={role.id}
                    onClick={() => toggleRole(role.id, role.name)}
                    className="flex items-start gap-3 rounded-xl border p-3 text-left transition-all"
                    style={{
                      borderColor: isSelected ? THEME.primary : '#E8D9C2',
                      backgroundColor: isSelected ? '#FDF5EE' : 'white',
                    }}
                  >
                    <span className="mt-0.5 text-lg">{role.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: isSelected ? THEME.primaryDark : THEME.textPrimary }}>
                        {role.name}
                      </p>
                    </div>
                    <div
                      className="mt-0.5 h-4 w-4 shrink-0 rounded-full border-2"
                      style={{
                        borderColor: isSelected ? THEME.primary : '#D8CDB8',
                        backgroundColor: isSelected ? THEME.primary : 'transparent',
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* 自定义角色 */}
      <div className="mb-6">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold" style={{ color: THEME.textPrimary }}>
          <span className="h-[2px] w-4 rounded" style={{ backgroundColor: THEME.primary }} />
          自定义角色
        </h3>

        {/* 已添加的自定义角色 */}
        {allRoles
          .filter((r) => r.isCustom)
          .map((role) => (
            <button
              key={role.id}
              onClick={() => toggleRole(role.id, role.name)}
              className="mb-2 flex w-full items-center gap-3 rounded-xl border p-3 text-left"
              style={{ borderColor: THEME.primary, backgroundColor: '#FDF5EE' }}
            >
              <span className="text-lg">{role.icon}</span>
              <p className="flex-1 text-sm font-medium" style={{ color: THEME.primaryDark }}>
                {role.name}
              </p>
              <span className="text-xs" style={{ color: THEME.textMuted }}>点击移除</span>
            </button>
          ))}

        {showCustom ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
              placeholder="输入角色名称，如：'业余画家'"
              className="flex-1 rounded-xl border border-[#E8D9C2] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#C87941]"
              style={{ color: THEME.textPrimary }}
              autoFocus
            />
            <button
              onClick={handleAddCustom}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: THEME.primary }}
            >
              添加
            </button>
            <button
              onClick={() => { setShowCustom(false); setCustomInput(''); }}
              className="rounded-xl border px-4 py-2.5 text-sm"
              style={{ borderColor: THEME.border, color: THEME.textSecondary }}
            >
              取消
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowCustom(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed p-3 text-sm transition-colors hover:border-[#C87941] hover:text-[#C87941]"
            style={{ borderColor: '#D8CDB8', color: THEME.textMuted }}
          >
            <span>+</span> 添加自定义角色
          </button>
        )}
      </div>

      {/* 下一步 */}
      <div className="mt-4 flex flex-col gap-3">
        <button
          onClick={() => { setPhase('importance'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          disabled={!canProceed}
          className="w-full rounded-xl py-3.5 text-center text-base font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40 hover:opacity-90"
          style={{ backgroundColor: canProceed ? THEME.primary : '#D8CDB8' }}
        >
          下一步：评估重视程度 →
        </button>
        {!canProceed && (
          <p className="text-center text-xs" style={{ color: THEME.textMuted }}>
            请至少选择 1 个角色
          </p>
        )}
      </div>
    </div>
  );
}

// ==================== 阶段二：重视程度 ==================== //
function ImportancePage() {
  const { selectedRoles, assessments, setImportance, cycleCoreRank, setPhase } =
    useRolePieChartStore();

  const assessmentsMap = useMemo(() => {
    const map: Record<string, typeof assessments[0]> = {};
    assessments.forEach((a) => { map[a.roleId] = a; });
    return map;
  }, [assessments]);

  const allScored = selectedRoles.every((r) => {
    const a = assessmentsMap[r.id];
    return a && a.importance > 0;
  });

  // 获取当前的核心角色排名
  const coreRankMap = useMemo(() => {
    const map: Record<string, number> = {};
    selectedRoles.forEach((r) => {
      const a = assessmentsMap[r.id];
      map[r.id] = a?.coreRank ?? 0;
    });
    return map;
  }, [selectedRoles, assessmentsMap]);

  const currentCoreCount = Object.values(coreRankMap).filter((r) => r > 0).length;

  return (
    <div className="mx-auto max-w-2xl">
      <ProgressBar current={2} total={4} label="第二阶段 · 重视程度" />

      <div className="mb-5 rounded-xl border border-[#E8D9C2] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <p className="text-sm leading-relaxed" style={{ color: THEME.textSecondary }}>
          对每个角色，滑动选择重视程度（1=很不重要，5=非常重要）。
          <br />
          点击「设为核心」选出你最核心的{" "}
          <strong style={{ color: THEME.primary }}>3 个角色</strong>
          ，顺序代表重要程度。
        </p>
        {currentCoreCount > 0 && (
          <p className="mt-2 text-xs" style={{ color: THEME.primary }}>
            已标注 {currentCoreCount}/3 个核心角色
          </p>
        )}
      </div>

      <div className="space-y-3">
        {selectedRoles.map((role) => {
          const a = assessmentsMap[role.id];
          const importance = a?.importance ?? 0;
          const coreRank = coreRankMap[role.id];

          return (
            <div
              key={role.id}
              className="rounded-xl border border-[#E8D9C2] bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: THEME.textPrimary }}>
                  {role.name}
                </span>
                <StarButton
                  rank={coreRank}
                  onClick={() => cycleCoreRank(role.id)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: THEME.textMuted }}>很不重要</span>
                <ImportanceScale
                  value={importance}
                  onChange={(v) => setImportance(role.id, v)}
                />
                <span className="text-xs" style={{ color: THEME.textMuted }}>非常重要</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 极端情况提示 */}
      {selectedRoles.length <= 1 && (
        <div className="mt-4 rounded-xl border border-[#D97706] bg-amber-50 p-4">
          <p className="text-xs leading-relaxed" style={{ color: '#92400E' }}>
            💡 你目前选择的角色较少。如果有其他未被列出的身份（如朋友、同事、社群成员等），可以在上一步补充，这样报告会更完整。
          </p>
        </div>
      )}

      {/* 导航 */}
      <div className="mt-6 flex flex-col gap-3">
        <button
          onClick={() => { setPhase('time'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          disabled={!allScored}
          className="w-full rounded-xl py-3.5 text-center text-base font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40 hover:opacity-90"
          style={{ backgroundColor: allScored ? THEME.primary : '#D8CDB8' }}
        >
          下一步：时间分配 →
        </button>
        <button
          onClick={() => { setPhase('select-roles'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="w-full rounded-xl border py-3 text-center text-sm"
          style={{ borderColor: THEME.border, color: THEME.textSecondary }}
        >
          ← 返回修改角色
        </button>
      </div>
    </div>
  );
}

// ==================== 每周清醒时间参考常量 ==================== //
const AWAKE_HOURS_PER_DAY = 14; // 24h - 8h睡眠 - 2h吃喝拉撒
const TOTAL_AWAKE_HOURS_PER_WEEK = AWAKE_HOURS_PER_DAY * 7; // 98小时

// ==================== 饼图颜色（含待分配色） ==================== //
const PIE_COLORS = [
  '#C87941', '#E8A66A', '#A85E2D', '#D4956A', '#8B5E34',
  '#6B4226', '#92400E', '#7C5C3E', '#FBBF24', '#B45309',
  '#059669', '#0891B2', '#7C3AED', '#BE185D', '#DC2626',
  '#6B7280', '#FDE68A', '#FFEDD5', '#F0D4B0', '#F5C89A',
];
const UNALLOCATED_COLOR = '#E8D9C2';

// ==================== CSS 环形图辅助函数 ====================
function buildConicGradient(
  data: { name: string; value: number }[],
  colors: string[]
): string {
  if (data.length === 0) return 'conic-gradient(#E8D9C2 0deg 360deg)';
  if (data.length === 1) return `conic-gradient(${colors[0]} 0deg 360deg)`;

  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return 'conic-gradient(#E8D9C2 0deg 360deg)';

  let currentAngle = 0;
  const segments: string[] = [];

  data.forEach((d, idx) => {
    const angle = (d.value / total) * 360;
    const color = colors[idx % colors.length];
    segments.push(`${color} ${currentAngle.toFixed(1)}deg ${(currentAngle + angle).toFixed(1)}deg`);
    currentAngle += angle;
  });

  return `conic-gradient(${segments.join(', ')})`;
}

// ==================== 阶段三：时间分配（重新设计版）==================== //
function TimePage() {
  const { selectedRoles, assessments, setHoursPerWeek, setPhase } =
    useRolePieChartStore();
  const [localHours, setLocalHours] = useState<Record<string, string>>({});

  const assessmentsMap = useMemo(() => {
    const map: Record<string, typeof assessments[0]> = {};
    assessments.forEach((a) => { map[a.roleId] = a; });
    return map;
  }, [assessments]);

  // 计算各角色实际分配小时数
  const roleHoursMap = useMemo(() => {
    const map: Record<string, number> = {};
    selectedRoles.forEach((r) => {
      const raw = localHours[r.id];
      map[r.id] = raw ? Math.max(0, parseFloat(raw) || 0) : (assessmentsMap[r.id]?.hoursPerWeek ?? 0);
    });
    return map;
  }, [localHours, selectedRoles, assessmentsMap]);

  // 已分配总时长
  const totalAllocated = Object.values(roleHoursMap).reduce((s, h) => s + h, 0);
  // 待分配时长
  const unallocated = Math.max(0, TOTAL_AWAKE_HOURS_PER_WEEK - totalAllocated);

  // 构建饼图数据（角色 + 待分配）
  const pieData = useMemo(() => {
    const items = selectedRoles
      .map((r, idx) => ({
        name: r.name,
        value: roleHoursMap[r.id],
        color: PIE_COLORS[idx % PIE_COLORS.length],
      }))
      .filter((item) => item.value > 0);
    if (unallocated > 0) {
      items.push({ name: '待分配', value: unallocated, color: UNALLOCATED_COLOR });
    }
    return items;
  }, [selectedRoles, roleHoursMap, unallocated]);

  const pieGradient = useMemo(
    () => buildConicGradient(pieData.map(d => ({ name: d.name, value: d.value })), pieData.map(d => d.color)),
    [pieData]
  );

  // 计算某个角色可分配的最大值（当前值 + 剩余额度）
  const getMaxForRole = (roleId: string) => {
    const currentVal = roleHoursMap[roleId] ?? 0;
    return Math.max(currentVal, unallocated + currentVal);
  };

  // 钳位到允许的最大值
  const clampToLimit = (roleId: string, val: number): number => {
    return Math.max(0, Math.min(getMaxForRole(roleId), val));
  };

  const handleSliderChange = (roleId: string, value: number) => {
    const clamped = clampToLimit(roleId, value);
    setLocalHours((prev) => ({ ...prev, [roleId]: String(clamped) }));
    setHoursPerWeek(roleId, clamped);
  };

  const handleInputChange = (roleId: string, value: string) => {
    setLocalHours((prev) => ({ ...prev, [roleId]: value }));
    const num = parseFloat(value);
    if (!isNaN(num)) {
      const clamped = clampToLimit(roleId, num);
      if (clamped !== num) {
        setLocalHours((prev) => ({ ...prev, [roleId]: String(clamped) }));
      }
      setHoursPerWeek(roleId, clamped);
    }
  };

  const handleResetRole = (roleId: string) => {
    setLocalHours((prev) => ({ ...prev, [roleId]: '' }));
    setHoursPerWeek(roleId, 0);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <ProgressBar current={3} total={4} label="第三阶段 · 时间分配" />

      {/* 说明文字 */}
      <div className="mb-5 rounded-xl border border-[#E8D9C2] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <p className="text-sm leading-relaxed" style={{ color: THEME.textSecondary }}>
          估算你每周在每个角色上实际投入的时间（单位：小时）。
          <br />
          请如实填写——这里没有&quot;正确答案&quot;，诚实的数据才能生成有价值的报告。
        </p>
      </div>

      {/* 参考卡片：每周清醒时间 */}
      <div className="mb-5 rounded-xl bg-[#FDF8F0] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium" style={{ color: THEME.textSecondary }}>
              每周清醒可支配时间（参考值）
            </p>
            <p className="mt-1 text-xs leading-relaxed" style={{ color: THEME.textMuted }}>
              按每天睡8小时、扣除吃喝拉撒约2小时计算
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold" style={{ color: THEME.primary }}>
              {TOTAL_AWAKE_HOURS_PER_WEEK}
            </span>
            <span className="ml-1 text-sm" style={{ color: THEME.textSecondary }}>小时/周</span>
          </div>
        </div>

        {/* 分配进度条 */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 h-2.5 overflow-hidden rounded-full bg-[#E8D9C2]">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, (totalAllocated / TOTAL_AWAKE_HOURS_PER_WEEK) * 100)}%`,
                background: totalAllocated <= TOTAL_AWAKE_HOURS_PER_WEEK
                  ? `linear-gradient(to right, ${THEME.primaryLight}, ${THEME.primary})`
                  : '#DC2626',
              }}
            />
          </div>
          <span className={`text-xs font-medium shrink-0 ${
            totalAllocated > TOTAL_AWAKE_HOURS_PER_WEEK ? 'text-red-600' :
            totalAllocated >= TOTAL_AWAKE_HOURS_PER_WEEK * 0.95 ? 'text-amber-600' :
            ''
          }`} style={totalAllocated <= TOTAL_AWAKE_HOURS_PER_WEEK * 0.95 ? { color: THEME.textSecondary } : undefined}>
            已分配 {totalAllocated.toFixed(1)}
          </span>
        </div>

        {unallocated > 0 ? (
          <p className="mt-1.5 text-right text-xs" style={{ color: THEME.textMuted }}>
            剩余待分配 <strong style={{ color: THEME.primary }}>{unallocated.toFixed(1)}</strong> 小时
          </p>
        ) : (
          <p className="mt-1.5 text-right text-xs font-medium" style={{ color: THEME.primaryDark }}>
            ✓ 额度已全部分配
          </p>
        )}
      </div>

      {/* 实时饼图 */}
      <div className="mb-6">
        <div className="rounded-xl border border-[#E8D9C2] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <p className="mb-3 text-center text-sm font-medium" style={{ color: THEME.textPrimary }}>
            时间分配占比
          </p>

          <div className="flex flex-col items-center">
            {/* CSS 环形图 */}
            <div className="relative h-[200px] w-[200px] sm:h-[240px] sm:w-[240px]">
              <div
                className="h-full w-full rounded-full transition-all duration-300"
                style={{ background: pieGradient }}
              />
              {/* 中心白色圆形成环形 */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white flex flex-col items-center justify-center" style={{ width: '50%', height: '50%' }}>
                <span className="text-lg font-bold sm:text-xl" style={{ color: THEME.primary }}>
                  {TOTAL_AWAKE_HOURS_PER_WEEK > 0 ? Math.round((totalAllocated / TOTAL_AWAKE_HOURS_PER_WEEK) * 100) : 0}%
                </span>
                <span className="text-[10px]" style={{ color: THEME.textMuted }}>已分配</span>
              </div>
            </div>

            {/* 图例 */}
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:flex sm:flex-wrap sm:justify-center sm:gap-x-3 sm:gap-y-1.5">
              {pieData.map((d, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-sm"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="text-xs" style={{ color: THEME.textSecondary }}>
                    {d.name}{' '}
                    <span className="font-medium" style={{ color: d.name === '待分配' ? THEME.textMuted : THEME.textPrimary }}>
                      {((d.value / TOTAL_AWAKE_HOURS_PER_WEEK) * 100).toFixed(0)}%
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 时间输入：滑块 + 数字 */}
      <div className="space-y-4">
        {selectedRoles.map((role, roleIdx) => {
          const hours = localHours[role.id] ?? (assessmentsMap[role.id]?.hoursPerWeek?.toString() ?? '');
          const numHours = parseFloat(hours) || 0;
          const maxForRole = getMaxForRole(role.id);
          // 视觉填充：始终相对于固定98h，保证位置一致性（不随额度变化而跳动）
          const sliderPct = TOTAL_AWAKE_HOURS_PER_WEEK > 0 ? (numHours / TOTAL_AWAKE_HOURS_PER_WEEK) * 100 : 0;
          // 全局占比百分比
          const pct = sliderPct;
          const roleColor = PIE_COLORS[roleIdx % PIE_COLORS.length];
          const isOverLimit = numHours > TOTAL_AWAKE_HOURS_PER_WEEK;

          return (
            <div
              key={role.id}
              className="rounded-xl border border-[#E8D9C2] bg-white p-4 transition-shadow hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
            >
              {/* 角色名 + 数值 */}
              <div className="mb-3 flex items-center gap-3">
                <span
                  className="h-3 w-3 shrink-0 rounded-sm"
                  style={{ backgroundColor: roleColor }}
                />
                <span className="min-w-0 flex-1 text-sm font-medium truncate" style={{ color: THEME.textPrimary }}>
                  {role.name}
                </span>
                <div className="flex shrink-0 items-center gap-1.5">
                  <input
                    type="number"
                    value={hours}
                    onChange={(e) => handleInputChange(role.id, e.target.value)}
                    placeholder="0"
                    min="0"
                    max={maxForRole}
                    step="0.5"
                    className="w-16 rounded-lg border border-[#E8D9C2] bg-[#FAFAF8] px-2 py-1 text-center text-sm font-medium outline-none focus:border-[#C87941]"
                    style={{ color: THEME.textPrimary }}
                  />
                  <span className="w-10 text-xs" style={{ color: THEME.textMuted }}>小时/周</span>
                  {numHours > 0 && (
                    <button
                      onClick={() => handleResetRole(role.id)}
                      className="ml-1 rounded-md px-1.5 py-0.5 text-[10px] text-red-500 opacity-60 transition-opacity hover:opacity-100"
                      title="清零"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* 滑块 */}
              <div className="relative">
                {/* 背景轨道 — 显示已用占比 */}
                <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#E8D9C2]">
                  <div
                    className="h-full rounded-full transition-all duration-150"
                    style={{
                      width: `${Math.min(100, sliderPct)}%`,
                      backgroundColor: isOverLimit ? '#DC2626' : roleColor,
                    }}
                  />
                </div>
                {/* 实际滑块 */}
                <input
                  type="range"
                  min="0"
                  max={TOTAL_AWAKE_HOURS_PER_WEEK}
                  step="0.5"
                  value={Math.min(numHours, TOTAL_AWAKE_HOURS_PER_WEEK)}
                  onChange={(e) => handleSliderChange(role.id, parseFloat(e.target.value))}
                  className="relative z-10 w-full cursor-pointer appearance-none bg-transparent"
                  style={{
                    WebkitAppearance: 'none',
                    accentColor: isOverLimit ? '#DC2626' : roleColor,
                  }}
                />
              </div>

              {/* 占比标签 */}
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-[10px]" style={{ color: THEME.textMuted }}>
                  0h
                </span>
                {numHours > 0 ? (
                  <span className="text-xs font-medium tabular-nums" style={{ color: THEME.primary }}>
                    {pct.toFixed(0)}%
                    {TOTAL_AWAKE_HOURS_PER_WEEK > 0 && (
                      <> · 约{Math.round(pct / 100 * 7)}天/周</>
                    )}
                  </span>
                ) : unallocated <= 0 ? (
                  <span className="text-[10px] font-medium text-red-500">额度已用完</span>
                ) : null}
                <span className="text-[10px]" style={{ color: THEME.textMuted }}>
                  {TOTAL_AWAKE_HOURS_PER_WEEK}h
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 导航 */}
      <div className="mt-6 flex flex-col gap-3">
        <button
          onClick={() => {
            setPhase('report');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          disabled={selectedRoles.every(r => !roleHoursMap[r.id])}
          className="w-full rounded-xl py-3.5 text-center text-base font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40 hover:opacity-90"
          style={{ backgroundColor: selectedRoles.some(r => roleHoursMap[r.id]) ? THEME.primary : '#D8CDB8' }}
        >
          生成报告 →
        </button>
        <button
          onClick={() => { setPhase('importance'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="w-full rounded-xl border py-3 text-center text-sm"
          style={{ borderColor: THEME.border, color: THEME.textSecondary }}
        >
          ← 返回重视程度
        </button>
      </div>
    </div>
  );
}

// ── 角色剥离：开放式文本框 ──

const STRIPPING_LOCAL_KEY = 'wp-role-stripper-answer';

function StrippingSection() {
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = !!user;
  const [text, setText] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const upsert = useUpsertProgress();

  // 初始化：从 localStorage 或服务端加载
  const { data: progressRows } = useProgressByCategory('reflection-answer', {
    enabled: isLoggedIn,
  });

  useEffect(() => {
    // 先尝试 localStorage
    const local = localStorage.getItem(STRIPPING_LOCAL_KEY);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed?.answer) {
          setText(parsed.answer);
          return;
        }
      } catch { /* ignore */ }
    }
    // 已登录则尝试服务端
    if (isLoggedIn && progressRows) {
      const row = progressRows.find((r: { key: string }) => r.key === 'role-stripper');
      if (row?.value && typeof row.value === 'object' && 'answer' in (row.value as object)) {
        setText((row.value as { answer: string }).answer);
      }
    }
  }, [isLoggedIn, progressRows]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);

    // 写 localStorage
    localStorage.setItem(STRIPPING_LOCAL_KEY, JSON.stringify({
      answer: val,
      updatedAt: new Date().toISOString(),
    }));

    // 防抖同步到服务端
    setStatus('saving');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (isLoggedIn) {
        upsert.mutate(
          {
            category: 'reflection-answer',
            key: 'role-stripper',
            value: { answer: val, answeredAt: new Date().toISOString() },
          },
          {
            onSuccess: () => setStatus('saved'),
            onError: () => setStatus('error'),
          }
        );
      } else {
        setStatus('saved');
      }
      setTimeout(() => setStatus('idle'), 2000);
    }, 800);
  }, [isLoggedIn, upsert]);

  const charCount = text.length;

  let statusText = '';
  let statusColor = THEME.textMuted;
  if (status === 'saving') {
    statusText = '保存中…';
    statusColor = THEME.primary;
  } else if (status === 'saved') {
    statusText = isLoggedIn ? '已同步到云端 ✓' : '已保存到本地 ✓';
    statusColor = '#7A9E7E';
  } else if (status === 'error') {
    statusText = '同步失败，已保留本地';
    statusColor = '#C45B4A';
  }

  return (
    <div className="mb-5 rounded-xl border border-[#E8D9C2] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <h3 className="mb-3 text-sm font-semibold" style={{ color: THEME.textPrimary }}>
        🪞 剥去角色后的自己
      </h3>
      <p className="mb-4 text-sm leading-relaxed" style={{ color: THEME.textSecondary }}>
        完成角色梳理后，试着回答这个问题：
        <br />
        <strong style={{ color: THEME.primary }}>「如果去掉所有这些角色和标签，你是谁？」</strong>
        <br />
        不用急着回答——让这个问题在心里停留一会儿。写下任何浮现的想法，没有对错。
      </p>
      <div className="relative">
        <textarea
          value={text}
          onChange={handleChange}
          placeholder="在这里写下你的思考…"
          rows={5}
          className="w-full resize-y rounded-xl border px-4 py-3 text-sm leading-relaxed outline-none transition-all"
          style={{
            borderColor: THEME.border,
            color: THEME.textPrimary,
            backgroundColor: '#FAF8F3',
            minHeight: '120px',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = THEME.primary;
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,121,65,0.12)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = THEME.border;
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        <span className="pointer-events-none absolute bottom-3 right-3 text-xs" style={{ color: charCount > 0 ? THEME.textMuted : THEME.border }}>
          {charCount} 字
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs" style={{ color: statusColor }}>
          {statusText}
        </span>
        {!isLoggedIn && charCount > 0 && (
          <span className="rounded-full px-2 py-0.5 text-[10px]" style={{ background: '#F5EDE0', color: THEME.textMuted }}>
            登录后可云端保存
          </span>
        )}
      </div>
    </div>
  );
}

// ==================== 阶段四：报告页 ==================== //
function ReportPage() {
  const { assessments, reset } = useRolePieChartStore();

  const report = useMemo<RolePieChartReport | null>(() => {
    if (assessments.length === 0) return null;
    return generateReport(assessments);
  }, [assessments]);

  if (!report) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <p style={{ color: THEME.textSecondary }}>正在生成报告…</p>
      </div>
    );
  }

  const chartColors = [
    '#C87941', '#E8A66A', '#F5C89A', '#A85E2D', '#D4956A',
    '#8B5E34', '#F0D4B0', '#6B4226', '#FFEDD5', '#92400E',
    '#7C5C3E', '#FBBF24', '#B45309', '#FDE68A', '#DC2626',
    '#6B7280', '#059669', '#0891B2', '#7C3AED', '#BE185D',
  ];

  const validImportance = report.importanceData.filter((d) => d.value > 0);
  const validTime = report.timeData.filter((d) => d.value > 0);

  const handleExport = () => {
    const md = exportMarkdown(report);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `人生角色饼图报告_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };




  return (
    <div className="mx-auto max-w-2xl">
      <ProgressBar current={4} total={4} label="报告已生成" />

      {/* 报告标题 */}
      <div className="mb-5 text-center">
        <h2 className="text-xl font-bold" style={{ color: THEME.textPrimary }}>
          人生角色报告
        </h2>
        <p className="mt-1 text-xs" style={{ color: THEME.textMuted }}>
          测评日期：{new Date(report.completedAt).toLocaleDateString('zh-CN')}
        </p>
      </div>

      {/* 极端情况提醒 */}
      {report.lowIdentityAlert.triggered && (
        <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4">
          <div className="flex items-start gap-2">
            <span className="text-base">💡</span>
            <div>
              <p className="text-sm font-medium" style={{ color: '#92400E' }}>
                关于你的身份构成
              </p>
              <p className="mt-1 text-xs leading-relaxed" style={{ color: '#78350F' }}>
                {report.lowIdentityAlert.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 核心角色展示 */}
      {report.coreRoles.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-3 text-sm font-semibold" style={{ color: THEME.textPrimary }}>
            🌟 你的核心角色
          </h3>
          <div className="space-y-3">
            {report.coreRoles.map((r) => (
              <div
                key={r.roleId}
                className="rounded-xl border border-[#E8D9C2] bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{r.stars}</span>
                    <span className="text-base font-medium" style={{ color: THEME.primary }}>
                      {r.name}角色
                    </span>
                  </div>
                  <span className="rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: '#FDF5EE', color: THEME.primary }}>
                    重视度 {r.importance}/5
                    {(() => {
                      const labels: Record<number, string> = { 1: '低', 2: '偏低', 3: '一般', 4: '较高', 5: '极高' };
                      return labels[r.importance] ? `（${labels[r.importance]}）` : '';
                    })()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 重视程度 + 时间分配 */}
      <div className="mb-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* 重视程度 — 横向柱状图 */}
          <div className="rounded-xl border border-[#E8D9C2] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <p className="mb-3 text-xs font-medium" style={{ color: THEME.textSecondary }}>
              重视程度（5点量表）
            </p>
            {validImportance.length > 0 ? (
              <div className="space-y-2.5">
                {validImportance.map((d, idx) => (
                  <div key={idx}>
                    <div className="mb-0.5 flex items-center justify-between">
                      <span className="truncate text-xs" style={{ color: THEME.textSecondary }}>
                        {d.name}
                      </span>
                      <span className="text-xs font-medium tabular-nums" style={{ color: THEME.primary }}>
                        {d.value}/5
                      </span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-[#F0E6D6]">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${(d.value / 5) * 100}%`,
                          backgroundColor: chartColors[idx % chartColors.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-[80px] items-center justify-center">
                <p className="text-xs" style={{ color: THEME.textMuted }}>暂无数据</p>
              </div>
            )}
          </div>

          {/* 时间分配环形图 */}
          <div className="rounded-xl border border-[#E8D9C2] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <p className="mb-2 text-xs font-medium" style={{ color: THEME.textSecondary }}>
              时间分配
            </p>
            {validTime.length > 0 ? (
              <div className="flex flex-col items-center">
                {/* CSS 环形图 */}
                <div className="relative h-[160px] w-[160px]">
                  <div
                    className="h-full w-full rounded-full"
                    style={{
                      background: buildConicGradient(validTime, chartColors),
                    }}
                  />
                  {/* 中心白色圆形成环形 */}
                  <div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
                    style={{ width: '45%', height: '45%' }}
                  />
                </div>
                {/* 数据提示 */}
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  {validTime.slice(0, 4).map((d, idx) => (
                    <div key={idx} className="flex items-center gap-1 text-xs" title={`${d.name}: ${d.value}%`}>
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: chartColors[idx % chartColors.length] }}
                      />
                      <span style={{ color: THEME.textSecondary }}>
                        {d.name} {d.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-[160px] items-center justify-center">
                <p className="text-xs" style={{ color: THEME.textMuted }}>暂无数据</p>
              </div>
            )}
            <div className="mt-2 space-y-1">
              {validTime.slice(0, 5).map((d, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: chartColors[idx % chartColors.length] }} />
                  <span className="truncate text-xs" style={{ color: THEME.textSecondary }}>{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-2 text-center text-xs" style={{ color: THEME.textMuted }}>
          左侧：重视程度（柱状图） · 右侧：实际时间占比（饼图）
        </p>
      </div>

      {/* 极端情况分析 */}
      {report.extremeSituationAnalysis && (
        <div className="mb-5 rounded-xl border border-[#E8D9C2] bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold" style={{ color: THEME.textPrimary }}>
            🪞 身份反思
          </h3>
          <div className="space-y-2 text-sm leading-relaxed" style={{ color: THEME.textSecondary }}>
            {report.extremeSituationAnalysis.split('\n\n').map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        </div>
      )}

      {/* 综合洞察 */}
      {report.overallInsights && (
        <div className="mb-5 rounded-xl border border-[#E8D9C2] bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold" style={{ color: THEME.textPrimary }}>
            💡 综合洞察
          </h3>
          <div className="space-y-2 text-sm leading-relaxed" style={{ color: THEME.textSecondary }}>
            {report.overallInsights.split('\n\n').map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        </div>
      )}

      {/* 🪞 角色剥离：开放式思考 */}
      <StrippingSection />
      {/* 操作按钮 */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleExport}
          className="w-full rounded-xl border py-3.5 text-center text-sm font-medium transition-colors hover:bg-[#F5EDE3]"
          style={{ borderColor: THEME.primary, color: THEME.primary }}
        >
          📄 导出 Markdown 报告
        </button>
        <button
          onClick={() => { reset(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="w-full rounded-xl border py-3 text-center text-sm"
          style={{ borderColor: THEME.border, color: THEME.textSecondary }}
        >
          重新开始测评
        </button>
      </div>
    </div>
  );
}

// ==================== 主页面 ==================== //
export default function RolePieChartPage() {
  const phase = useRolePieChartStore((s) => s.phase);
  const hydrated = usePersistHydrated(useRolePieChartStore);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: THEME.bg }}>
        <div className="text-sm" style={{ color: THEME.textSecondary }}>加载中…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12" style={{ backgroundColor: THEME.bg }}>
      {/* 顶部导航 */}
      <div
        className="sticky top-0 z-50 border-b px-4 py-3 backdrop-blur-sm"
        style={{ borderColor: THEME.border, backgroundColor: 'rgba(255,255,255,0.9)' }}
      >
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <Link
            href="/chapter/chapter-1#social-roles"
            className="flex items-center gap-1 text-sm transition-colors hover:opacity-70"
            style={{ color: THEME.textSecondary }}
          >
            ← 返回
          </Link>
          <span className="flex-1 text-center text-sm font-medium" style={{ color: THEME.textPrimary }}>
            人生角色饼图
          </span>
          <div className="w-12" />
        </div>
      </div>

      <div className="px-4 pt-6">
        {phase === 'welcome' && <WelcomePage />}
        {phase === 'select-roles' && <SelectRolesPage />}
        {phase === 'importance' && <ImportancePage />}
        {phase === 'time' && <TimePage />}
        {phase === 'report' && <ReportPage />}
      </div>
    </div>
  );
}
