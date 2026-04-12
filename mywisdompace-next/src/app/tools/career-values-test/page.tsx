'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCareerValuesStore } from '@/lib/career-values-store';
import { usePersistHydrated } from '@/lib/hooks/usePersistHydrated';
import {
  CAREER_VALUES,
  VALUE_CONFLICTS,
  SENTENCE_TEMPLATE,
  CONNECTORS,
  getValueById,
  getValuesByIds,
  generateReport,
  exportMarkdown,
} from '@/lib/career-values-data';

// ==================== 欢迎页 ==================== //
function WelcomePage() {
  const { setPhase, reset } = useCareerValuesStore();
  const phase = useCareerValuesStore(s => s.phase);

  // 如果不是welcome阶段，说明有历史进度
  const hasProgress = phase !== 'welcome';

  const handleStart = () => {
    reset();
    setPhase('explore');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinue = () => {
    setPhase(phase === 'welcome' ? 'explore' : phase);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Hero */}
      <div className="mb-8 text-center">
        <div className="mb-4 text-5xl">💎</div>
        <h1 className="mb-2 text-2xl font-bold text-[#4A3728] sm:text-3xl">
          生涯价值观测评
        </h1>
        <p className="text-[15px] text-[#8A7E6A]">Career Values Assessment</p>
        <p className="mt-4 text-[15px] leading-relaxed text-[#6A6256]">
          <span className="whitespace-nowrap">价值观是你做选择的底层逻辑。</span>{' '}
          <span className="whitespace-nowrap">这项测评将帮助你梳理自己的核心价值观，</span>{' '}
          <span className="whitespace-nowrap">看清哪些东西对你真正重要，</span>
          <span className="whitespace-nowrap">哪些只是外界强加的期望。</span>
        </p>
      </div>

      {/* 特性卡片 */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          { icon: '🔍', title: '发现核心驱动力', desc: '识别真正驱动你做选择的力量' },
          { icon: '⚖️', title: '理清选择逻辑', desc: '看清价值观之间的取舍关系' },
          { icon: '🧭', title: '找到方向锚点', desc: '为职业决策提供清晰的参照' },
        ].map(item => (
          <div
            key={item.title}
            className="rounded-xl border border-[#E8E4DD] bg-white p-4 text-center shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
          >
            <div className="mb-2 text-2xl">{item.icon}</div>
            <div className="text-sm font-semibold text-[#4A3728]">{item.title}</div>
            <div className="mt-1 text-xs text-[#8A7E6A]">{item.desc}</div>
          </div>
        ))}
      </div>

      {/* 14个价值观预览 */}
      <div className="mb-6 rounded-xl border border-[#E8E4DD] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] sm:p-7">
        <p className="mb-3 text-xs font-medium text-[#8A7E6A]">14个叔伯职业价值观</p>
        <div className="flex flex-wrap gap-2">
          {CAREER_VALUES.map(v => (
            <span
              key={v.id}
              className="inline-flex items-center gap-1 rounded-full bg-[#F5F0E8] px-3 py-1.5 text-xs font-medium text-[#6A6256]"
            >
              <span>{v.icon}</span>
              <span>{v.name}</span>
            </span>
          ))}
        </div>
        <div className="mt-4 text-center text-xs text-[#8A7E6A]">
          ⏱ 预计 10-15 分钟 · 5个递进阶段
        </div>
      </div>

      {/* 开始按钮 */}
      <div className="text-center">
        <button
          onClick={hasProgress ? handleContinue : handleStart}
          className="inline-flex items-center gap-2 rounded-xl bg-[#8B6AA0] px-8 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#7A5A8F] hover:shadow-md active:translate-y-0"
        >
          {hasProgress ? '继续测评 →' : '开始探索 →'}
        </button>
      </div>
      {hasProgress && (
        <div className="mt-4 text-center">
          <button
            onClick={handleStart}
            className="text-sm text-[#8A7E6A] hover:text-[#4A3728]"
          >
            清除进度，重新开始
          </button>
        </div>
      )}
      <p className="mt-4 text-center text-[10px] text-[#8A7E6A]">
        🔒 所有数据仅在本地处理，不上传到任何服务器
      </p>
    </div>
  );
}

// ==================== 第一阶段：认识价值观 ==================== //
function ExplorePage() {
  const { setPhase } = useCareerValuesStore();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const expandedCount = expandedIds.size;

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleNext = () => {
    setPhase('select8');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* 进度条 */}
      <ProgressBar current={1} total={5} label="第一阶段 · 认识" />

      {/* 提示 */}
      <div className="mb-5 rounded-xl border border-[#E8E4DD] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <p className="text-sm text-[#6A6256] leading-relaxed">
          以下是14个常见的职业价值观。请逐一阅读，理解每个价值观的含义。
          <strong className="text-[#4A3728]">至少展开阅读5个</strong>后，你就可以进入下一阶段。
        </p>
        <div className="mt-3 text-right text-xs text-[#8A7E6A]">
          已阅读 {expandedCount}/15
        </div>
      </div>

      {/* 价值观卡片网格 */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CAREER_VALUES.map(v => {
          const isExpanded = expandedIds.has(v.id);
          return (
            <button
              key={v.id}
              onClick={() => toggleExpand(v.id)}
              className={`w-full rounded-xl border p-4 text-left transition-all ${
                isExpanded
                  ? 'border-[#8B6AA0]/40 bg-[#FAF6FD] shadow-[0_2px_8px_rgba(139,106,160,0.1)]'
                  : 'border-[#E8E4DD] bg-white hover:border-[#8B6AA0]/20 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{v.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-semibold text-[#4A3728]">{v.name}</span>
                    <span className="rounded-full bg-[#F5F0E8] px-2 py-0.5 text-[10px] text-[#8A7E6A]">
                      {v.category}
                    </span>
                  </div>
                </div>
                <svg
                  className={`h-4 w-4 text-[#8A7E6A] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {isExpanded && (
                <div className="mt-3 border-t border-[#E8E4DD] pt-3">
                  <p className="text-sm leading-relaxed text-[#5D4A3A]">
                    {v.description}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 达到上限提示 */}
      {expandedCount >= 5 && (
        <div className="mb-4 rounded-lg bg-[#EDE4F3] p-3 text-center text-xs text-[#5A3A6F]">
          ✓ 你已阅读足够多的价值观，可以进入下一阶段了
        </div>
      )}

      {/* 底部按钮 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => { setPhase('welcome'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="rounded-xl border border-[#E8E4DD] bg-white px-5 py-2.5 text-sm font-medium text-[#6A6256] transition-all hover:bg-[#FAF8F3]"
        >
          ← 返回
        </button>
        <button
          onClick={handleNext}
          disabled={expandedCount < 5}
          className="rounded-xl bg-[#8B6AA0] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#7A5A8F] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
        >
          我已了解，开始选择 →
        </button>
      </div>
    </div>
  );
}

// ==================== 第二阶段：15选8 ==================== //
function Select8Page() {
  const { selected8, toggleSelected8, setPhase } = useCareerValuesStore();
  const [overflowTip, setOverflowTip] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    if (selected8.includes(id)) {
      toggleSelected8(id);
      setOverflowTip(false);
    } else if (selected8.length >= 8) {
      setOverflowTip(true);
      setTimeout(() => setOverflowTip(false), 2000);
    } else {
      toggleSelected8(id);
      setOverflowTip(false);
    }
  };

  const handleNext = () => {
    setPhase('rank3');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /** 当前展示详情的价值观 */
  const detailValue = detailId ? getValueById(detailId) : null;

  return (
    <div className="mx-auto max-w-2xl">
      <ProgressBar current={2} total={5} label="第二阶段 · 筛选" />

      {/* 提示语 */}
      <p className="mb-4 text-center text-sm text-[#8A7E6A]">
        💡 点击卡片选择 · 点「定义解读」查看详细含义
      </p>

      {/* 计数器 */}
      <div className="mb-5 flex items-center justify-between rounded-xl border border-[#E8E4DD] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <span className="text-sm text-[#6A6256]">从14个价值观中选出你最看重的8个</span>
        <span className={`text-sm font-bold ${selected8.length === 8 ? 'text-[#8B6AA0]' : 'text-[#C9A15A]'}`}>
          已选 {selected8.length}/8
        </span>
      </div>

      {/* 超出提示 */}
      {overflowTip && (
        <div className="mb-4 rounded-lg bg-[#FFF8E1] border border-[#FFC107] p-3 text-center text-xs text-[#5D4A3A]">
          已达上限，请先取消一个再选择新的
        </div>
      )}

      {/* 价值观详情弹层 */}
      {detailValue && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/25 pt-24 px-4 sm:pt-32"
          onClick={() => setDetailId(null)}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setDetailId(null)}
              className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
            >
              ✕
            </button>

            {/* 标题区 */}
            <div className="mb-4 flex items-center gap-3">
              <span className="text-3xl">{detailValue.icon}</span>
              <div>
                <h3 className="text-lg font-bold text-[#2F2A24]">{detailValue.name}</h3>
                <span className={`inline-block mt-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                  detailValue.category === '内在回报' ? 'bg-blue-50 text-blue-600' :
                  detailValue.category === '外在条件' ? 'bg-amber-50 text-amber-700' :
                  'bg-green-50 text-green-600'
                }`}>
                  {detailValue.category}
                </span>
              </div>
            </div>

            {/* 详细解读 */}
            <div className="rounded-lg bg-[#FAF8F3] p-4">
              <p className="text-[14px] leading-relaxed text-[#4A3728]">{detailValue.description}</p>
            </div>

            {/* 选择/取消按钮 */}
            <div className="mt-5 flex gap-3">
              {selected8.includes(detailValue.id) ? (
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggle(detailValue.id); setDetailId(null); }}
                  className="flex-1 rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
                >
                  取消选择
                </button>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggle(detailValue.id); setDetailId(null); }}
                  disabled={selected8.length >= 8 && !selected8.includes(detailValue.id)}
                  className="flex-1 rounded-xl bg-[#8B6AA0] py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#7A5A8F] disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  选择此价值观
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 价值观选择网格 */}
      <div className="mb-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {CAREER_VALUES.map(v => {
          const isSelected = selected8.includes(v.id);
          return (
            <div key={v.id} className="relative group/card">
              <button
                onClick={() => handleToggle(v.id)}
                className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                  isSelected
                    ? 'border-[#8B6AA0] bg-[#FAF6FD] shadow-[0_2px_8px_rgba(139,106,160,0.15)]'
                    : 'border-[#E8E4DD] bg-white hover:border-[#8B6AA0]/30 hover:shadow-sm'
                }`}
              >
                <span className="text-xl shrink-0">{v.icon}</span>
                <span className={`text-[15px] font-medium ${isSelected ? 'text-[#5A3A6F]' : 'text-[#4A3728]'}`}>
                  {v.name}
                </span>
                {isSelected && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#8B6AA0] text-xs text-white">✓</span>
                )}
              </button>
              {/* 定义解读 — 点击弹出详情 */}
              <button
                onClick={(e) => { e.stopPropagation(); setDetailId(detailId === v.id ? null : v.id); }}
                title={`查看"${v.name}"的详细解读`}
                className="absolute right-3 top-1.5 text-[11px] font-medium leading-none tracking-wide transition-colors text-[#B39DC7] hover:text-[#8B6AA0]"
              >
                定义解读
              </button>
            </div>
          );
        })}
      </div>

      {/* 底部按钮 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => { setPhase('explore'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="rounded-xl border border-[#E8E4DD] bg-white px-5 py-2.5 text-sm font-medium text-[#6A6256] transition-all hover:bg-[#FAF8F3]"
        >
          ← 返回
        </button>
        <button
          onClick={handleNext}
          disabled={selected8.length !== 8}
          className="rounded-xl bg-[#8B6AA0] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#7A5A8F] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
        >
          确认选择 →
        </button>
      </div>
    </div>
  );
}

// ==================== 第三阶段：8选3排序 ==================== //
function Rank3Page() {
  const { selected8, ranked3, setRankedSlot, clearRankedSlot, setPhase } = useCareerValuesStore();

  const candidates = getValuesByIds(selected8);
  const filledSlots = ranked3.filter(Boolean).length;

  // 找到下一个空槽
  const nextEmptySlot = ranked3.findIndex(s => !s) as 0 | 1 | 2 | -1;

  const handleCandidateClick = (id: string) => {
    // 如果已经在某个slot中，先移除
    const existingIdx = ranked3.indexOf(id);
    if (existingIdx !== -1) {
      clearRankedSlot(existingIdx as 0 | 1 | 2);
      return;
    }
    // 填入下一个空槽
    if (nextEmptySlot !== -1) {
      setRankedSlot(nextEmptySlot, id);
    }
  };

  const handleSlotClick = (slotIndex: 0 | 1 | 2) => {
    if (ranked3[slotIndex]) {
      clearRankedSlot(slotIndex);
    }
  };

  const handleNext = () => {
    setPhase('sentence');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const slotLabels = ['🥇 第一重要', '🥈 第二重要', '🥉 第三重要'];

  return (
    <div className="mx-auto max-w-2xl">
      <ProgressBar current={3} total={5} label="第三阶段 · 排序" />

      <div className="mb-5 rounded-xl border border-[#E8E4DD] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <p className="text-sm text-[#6A6256] leading-relaxed">
          从你选出的8个价值观中，选出并排列最重要的3个。点击候选词填入下一个空槽位，点击槽位中的词可以移除。
        </p>
      </div>

      {/* 3个排序槽位 */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {([0, 1, 2] as const).map(slotIdx => {
          const value = ranked3[slotIdx] ? getValueById(ranked3[slotIdx]) : null;
          return (
            <button
              key={slotIdx}
              onClick={() => handleSlotClick(slotIdx)}
              className={`rounded-xl border-2 p-4 text-center transition-all ${
                value
                  ? 'border-[#8B6AA0] bg-[#FAF6FD] shadow-sm cursor-pointer hover:border-[#5A3A6F]'
                  : 'border-dashed border-[#D5CFC2] bg-[#FAFBFC] cursor-default'
              }`}
            >
              <div className="mb-2 text-xs font-medium text-[#8A7E6A]">{slotLabels[slotIdx]}</div>
              {value ? (
                <div>
                  <div className="text-xl">{value.icon}</div>
                  <div className="mt-1 text-sm font-semibold text-[#5A3A6F]">{value.name}</div>
                  <div className="mt-1 text-[10px] text-[#8A7E6A]">点击移除</div>
                </div>
              ) : (
                <div className="py-3 text-xs text-[#C9B8A8]">
                  {nextEmptySlot === slotIdx ? '← 点击下方填入' : '等待选择'}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 8个候选标签 */}
      <div className="mb-6 rounded-xl border border-[#E8E4DD] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <p className="mb-3 text-xs font-medium text-[#8A7E6A]">候选价值观（点击选择/取消）</p>
        <div className="flex flex-wrap gap-2">
          {candidates.map(v => {
            const isInSlot = ranked3.includes(v.id);
            return (
              <button
                key={v.id}
                onClick={() => handleCandidateClick(v.id)}
                className={`inline-flex items-center gap-1.5 rounded-full border-2 px-4 py-2 text-sm font-medium transition-all ${
                  isInSlot
                    ? 'border-[#8B6AA0] bg-[#EDE4F3] text-[#5A3A6F] opacity-60'
                    : 'border-[#E8E4DD] bg-white text-[#4A3728] hover:border-[#8B6AA0] hover:bg-[#FAF6FD]'
                }`}
              >
                <span>{v.icon}</span>
                <span>{v.name}</span>
                {isInSlot && <span className="text-[10px]">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 底部按钮 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => { setPhase('select8'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="rounded-xl border border-[#E8E4DD] bg-white px-5 py-2.5 text-sm font-medium text-[#6A6256] transition-all hover:bg-[#FAF8F3]"
        >
          ← 返回
        </button>
        <button
          onClick={handleNext}
          disabled={filledSlots < 3}
          className="rounded-xl bg-[#8B6AA0] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#7A5A8F] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
        >
          确认排序 →
        </button>
      </div>
    </div>
  );
}

// ==================== 第四阶段：造句 ==================== //
function SentencePage() {
  const { ranked3, sentence, realityScore, setSentence, setRealityScore, setPhase } = useCareerValuesStore();
  const [showHelper, setShowHelper] = useState(false);
  const [showConflictTip, setShowConflictTip] = useState(true);

  const values3 = getValuesByIds(ranked3.filter(Boolean));

  const isValid = sentence.trim().length >= 10 && realityScore > 0;

  const handleNext = () => {
    setPhase('report');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <ProgressBar current={4} total={5} label="第四阶段 · 造句" />

      {/* 3个核心价值观标签 */}
      <div className="mb-5 flex items-center justify-center gap-3">
        {values3.map((v, i) => (
          <div
            key={v.id}
            className="flex items-center gap-1.5 rounded-full border-2 border-[#8B6AA0] bg-[#EDE4F3] px-4 py-2"
          >
            <span className="text-sm">{['🥇', '🥈', '🥉'][i]}</span>
            <span className="text-sm font-semibold text-[#5A3A6F]">{v.name}</span>
          </div>
        ))}
      </div>

      {/* 造句输入区 */}
      <div className="mb-5 rounded-xl border border-[#E8E4DD] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] sm:p-7">
        <h3 className="mb-3 text-[15px] font-semibold text-[#4A3728]">用你的价值观，造一个完整的句子</h3>
        <p className="mb-3 text-xs text-[#8A7E6A]">
          将上面3个价值观词语融入下面的模板，补充完整你的职业期望
        </p>

        {/* 模板提示 */}
        <div className="mb-3 rounded-lg bg-[#FAF6FD] border border-[#E8E4DD] p-3">
          <p className="text-xs text-[#5A3A6F]">
            📝 模板：{SENTENCE_TEMPLATE}
          </p>
        </div>

        <textarea
          className="w-full rounded-lg border border-[#D5CFC2] bg-[#FAFBFC] px-4 py-3 text-sm leading-relaxed text-[#2F2A24] transition-colors focus:border-[#8B6AA0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B6AA0]/20"
          rows={5}
          placeholder="我期望理想的职业或工作形态是..."
          value={sentence}
          onChange={e => setSentence(e.target.value)}
        />
        <div className="mt-2 text-right text-xs text-[#8A7E6A]">
          {sentence.trim().length < 10 ? `还需输入${10 - sentence.trim().length}个字符` : '✓ 字数达标'}
        </div>
      </div>

      {/* 造句小助手 */}
      <div className="mb-5 overflow-hidden rounded-xl border border-[#E8E4DD] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <button
          onClick={() => setShowHelper(!showHelper)}
          className="flex w-full items-center justify-between px-5 py-3 text-left"
        >
          <span className="text-sm font-medium text-[#4A3728]">📝 造句小助手</span>
          <svg
            className={`h-4 w-4 text-[#8A7E6A] transition-transform ${showHelper ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showHelper && (
          <div className="border-t border-[#E8E4DD] px-5 py-4">
            <p className="mb-2 text-xs text-[#8A7E6A]">可用的连接词：</p>
            <div className="flex flex-wrap gap-1.5">
              {CONNECTORS.map(c => (
                <span key={c} className="rounded-full bg-[#F5F0E8] px-2.5 py-1 text-xs text-[#5D4A3A]">
                  {c}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-[#8A7E6A]">不必完美，表达真实想法即可。</p>
          </div>
        )}
      </div>

      {/* 现实锚定提醒 */}
      <div className="mb-5 overflow-hidden rounded-xl border border-[#E8E4DD] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <button
          onClick={() => setShowConflictTip(!showConflictTip)}
          className="flex w-full items-center justify-between px-5 py-3 text-left"
        >
          <span className="text-sm font-medium text-[#4A3728]">⚖️ 现实锚定提醒</span>
          <svg
            className={`h-4 w-4 text-[#8A7E6A] transition-transform ${showConflictTip ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showConflictTip && (
          <div className="border-t border-[#E8E4DD] px-5 py-4">
            <div className="space-y-3">
              {VALUE_CONFLICTS.map((c, i) => {
                const lv = getValueById(c.left);
                const rv = getValueById(c.right);
                const isRelevant = ranked3.includes(c.left) || ranked3.includes(c.right);
                return (
                  <div
                    key={i}
                    className={`rounded-lg p-3 text-xs leading-relaxed ${
                      isRelevant ? 'bg-[#FFF8E1] border border-[#FFC107]/50' : 'bg-[#FAFBFC]'
                    }`}
                  >
                    <span className="font-semibold text-[#4A3728]">{lv?.icon} {lv?.name} ↔ {rv?.icon} {rv?.name}：</span>
                    <span className="text-[#5D4A3A]">{c.reason}</span>
                    {isRelevant && <span className="ml-1 text-[#E65100]">← 与你的选择相关</span>}
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-[#8A7E6A] italic">
              好的价值观陈述不是许愿清单，而是你愿意为之付出代价的选择。冲突本身不是问题——不知道自己在做取舍才是。
            </p>
          </div>
        )}
      </div>

      {/* 自我评估滑块 */}
      <div className="mb-6 rounded-xl border border-[#E8E4DD] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] sm:p-7">
        <h3 className="mb-3 text-[15px] font-semibold text-[#4A3728]">自我评估</h3>
        <p className="mb-4 text-xs text-[#8A7E6A]">
          这个描述有多接近你愿意为之付出代价的真实选择？
        </p>

        {/* 滑块 */}
        <div className="mb-3">
          <input
            type="range"
            min={0}
            max={5}
            step={1}
            value={realityScore}
            onChange={e => setRealityScore(Number(e.target.value))}
            className="w-full accent-[#8B6AA0]"
          />
          <div className="flex justify-between text-[10px] text-[#8A7E6A]">
            <span>未评估</span>
            <span>更像许愿</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>我愿意坚持</span>
          </div>
        </div>

        {realityScore > 0 && realityScore < 3 && (
          <div className="rounded-lg bg-[#FFF8E1] border border-[#FFC107]/50 p-3 text-xs text-[#5D4A3A]">
            💭 也许可以再想想什么是你真正愿意坚持的？
          </div>
        )}
        {realityScore >= 4 && (
          <div className="rounded-lg bg-[#E8F0E8] border border-[#8BA888]/50 p-3 text-xs text-[#3D6B3A]">
            ✓ 你对自己的价值观选择有较强的确信度
          </div>
        )}
      </div>

      {/* 底部按钮 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => { setPhase('rank3'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="rounded-xl border border-[#E8E4DD] bg-white px-5 py-2.5 text-sm font-medium text-[#6A6256] transition-all hover:bg-[#FAF8F3]"
        >
          ← 返回
        </button>
        <button
          onClick={handleNext}
          disabled={!isValid}
          className="rounded-xl bg-[#8B6AA0] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#7A5A8F] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
        >
          提交 →
        </button>
      </div>
    </div>
  );
}

// ==================== 第五阶段：报告 ==================== //
function ReportPage() {
  const { selected8, ranked3, sentence, realityScore, reset } = useCareerValuesStore();

  const report = useMemo(() => {
    if (ranked3.every(Boolean)) {
      return generateReport(
        selected8,
        ranked3 as [string, string, string],
        sentence,
        realityScore,
      );
    }
    return null;
  }, [selected8, ranked3, sentence, realityScore]);

  const handleExportMD = () => {
    if (!report) return;
    const md = exportMarkdown(report);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `生涯价值观测评报告.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    reset();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!report) return null;

  const eliminated15to8 = getValuesByIds(report.eliminatedPath.from14to8);
  const eliminated8to3 = getValuesByIds(report.eliminatedPath.from8to3);

  // 高亮造句中的价值观词
  const highlightSentence = (text: string) => {
    let result = text;
    const values = getValuesByIds(ranked3.filter(Boolean));
    values.forEach(v => {
      const regex = new RegExp(v.name, 'g');
      result = result.replace(regex, `<mark class="bg-[#EDE4F3] text-[#5A3A6F] px-0.5 rounded">${v.name}</mark>`);
    });
    return result;
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* 报告头 */}
      <div className="mb-5 rounded-2xl border border-[#E8E4DD] bg-gradient-to-br from-[#FAF6FD] to-white p-8 shadow-sm text-center">
        <div className="mb-2 text-4xl">💎</div>
        <h2 className="text-2xl font-bold text-[#2F2A24]">你的生涯价值观报告</h2>
        <p className="mt-1 text-sm text-[#8A7E6A]">
          测评完成于 {new Date(report.completedAt).toLocaleDateString('zh-CN')}
        </p>
      </div>

      {/* 核心价值观 */}
      <div className="mb-5 rounded-xl border border-[#E8E4DD] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] sm:p-7">
        <h3 className="mb-5 text-lg font-bold text-[#4A3728]">核心价值观</h3>
        <div className="space-y-4">
          {report.coreValues.map(cv => {
            const v = getValueById(cv.id);
            const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
            const roleColors: Record<number, string> = {
              1: 'bg-[#EDE4F3] text-[#5A3A6F]',
              2: 'bg-[#F5F0E8] text-[#7A5A3F]',
              3: 'bg-[#F0EBE0] text-[#8A7E6A]',
            };
            return (
              <div key={cv.id} className="rounded-xl border border-[#E8E4DD] p-4 sm:p-5">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xl">{v?.icon}</span>
                  <span className="text-lg font-bold text-[#2F2A24]">{cv.name}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${roleColors[cv.rank]}`}>
                    {medals[cv.rank]} {cv.role}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-[#5D4A3A]">{cv.interpretation}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 价值观取舍路径 */}
      <div className="mb-5 rounded-xl border border-[#E8E4DD] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] sm:p-7">
        <h3 className="mb-4 text-lg font-bold text-[#4A3728]">价值观取舍路径</h3>

        {/* 15 → 8 */}
        <div className="mb-4">
          <div className="mb-2 text-xs font-medium text-[#8A7E6A]">15 → 8（被排除的7个）</div>
          <div className="flex flex-wrap gap-1.5">
            {eliminated15to8.map(v => (
              <span key={v.id} className="inline-flex items-center gap-1 rounded-full bg-[#F0EBE0] px-2.5 py-1 text-xs text-[#8A7E6A] line-through opacity-60">
                {v.icon} {v.name}
              </span>
            ))}
          </div>
        </div>

        {/* 8 → 3 */}
        <div>
          <div className="mb-2 text-xs font-medium text-[#8A7E6A]">8 → 3（被排除的5个）</div>
          <div className="flex flex-wrap gap-1.5">
            {eliminated8to3.map(v => (
              <span key={v.id} className="inline-flex items-center gap-1 rounded-full bg-[#F5F0E8] px-2.5 py-1 text-xs text-[#6A6256]">
                {v.icon} {v.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 造句回顾 */}
      <div className="mb-5 rounded-xl border border-[#E8E4DD] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] sm:p-7">
        <h3 className="mb-3 text-lg font-bold text-[#4A3728]">你的价值观陈述</h3>
        <div className="rounded-lg bg-[#FAF6FD] border border-[#E8E4DD] p-4">
          <p
            className="text-sm leading-relaxed text-[#2F2A24]"
            dangerouslySetInnerHTML={{ __html: highlightSentence(sentence) }}
          />
        </div>
      </div>

      {/* 自我评估回顾 */}
      <div className="mb-5 rounded-xl border border-[#E8E4DD] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <h3 className="mb-2 text-sm font-semibold text-[#4A3728]">现实锚定评分</h3>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 overflow-hidden rounded-full bg-[#E8E4DD]">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                realityScore >= 4 ? 'bg-[#6B9A68]' : realityScore >= 3 ? 'bg-[#C9A15A]' : 'bg-[#E87461]'
              }`}
              style={{ width: `${(realityScore / 5) * 100}%` }}
            />
          </div>
          <span className={`text-sm font-bold ${
            realityScore >= 4 ? 'text-[#6B9A68]' : realityScore >= 3 ? 'text-[#C9A15A]' : 'text-[#E87461]'
          }`}>
            {realityScore}/5
          </span>
        </div>
        {realityScore <= 2 && (
          <p className="mt-2 text-xs text-[#E87461]">
            💭 评分较低，可能意味着你还需要更多时间来审视自己的价值观
          </p>
        )}
      </div>

      {/* 价值观冲突提醒 */}
      {report.detectedConflicts.length > 0 && (
        <div className="mb-5 rounded-xl border border-[#FFC107]/50 bg-[#FFF8E1] p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-[#E65100]">⚠️ 价值观张力提醒</h3>
          <div className="space-y-2">
            {report.detectedConflicts.map((c, i) => {
              const lv = getValueById(c.left);
              const rv = getValueById(c.right);
              return (
                <div key={i} className="text-sm leading-relaxed text-[#5D4A3A]">
                  <strong>{lv?.icon} {lv?.name} ↔ {rv?.icon} {rv?.name}：</strong>
                  {c.reason}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 综合分析 */}
      <div className="mb-5 rounded-xl border border-[#E8E4DD] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] sm:p-7">
        <h3 className="mb-4 text-lg font-bold text-[#4A3728]">综合分析</h3>
        <div className="space-y-4 text-sm leading-relaxed text-[#5D4A3A] whitespace-pre-line">
          {report.overallAnalysis}
        </div>
      </div>

      {/* 温馨提示 */}
      <div className="mb-5 rounded-xl border border-[#E8E4DD] bg-[#FAF8F3] p-5 shadow-sm">
        <p className="text-xs leading-relaxed text-[#8A7E6A]">
          💡 提示：价值观测评反映的是你当前阶段的倾向，它会随着人生阅历而变化。
          建议定期回顾，看看自己的价值观是否发生了变化。如有需要，建议结合专业生涯咨询进行更深入的探索。
        </p>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <button
          onClick={handleReset}
          className="flex-1 rounded-xl border border-[#E8E4DD] bg-white py-3 text-sm font-medium text-[#6A6256] transition-all hover:bg-[#FAF8F3]"
        >
          重新测评
        </button>
        <button
          onClick={handleExportMD}
          className="flex-1 rounded-xl border border-[#8B6AA0] bg-white py-3 text-sm font-medium text-[#8B6AA0] transition-all hover:bg-[#FAF6FD]"
        >
          📥 导出 Markdown
        </button>
        <Link
          href="/chapter/chapter-1#career-values"
          className="flex-1 rounded-xl bg-[#8B6AA0] py-3 text-center text-sm font-semibold text-white transition-all hover:bg-[#7A5A8F]"
        >
          返回章节
        </Link>
      </div>
    </div>
  );
}

// ==================== 进度条组件 ==================== //
function ProgressBar({ current, total, label }: { current: number; total: number; label: string }) {
  const pct = (current / total) * 100;
  return (
    <div className="mb-5 rounded-xl border border-[#E8E4DD] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-[#8A7E6A]">{label}</span>
        <span className="text-xs font-bold text-[#8B6AA0]">{current}/{total}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#E8E4DD]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#8B6AA0] to-[#A88BB8] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ==================== 主页面 ==================== //
export default function CareerValuesTestPage() {
  const phase = useCareerValuesStore(s => s.phase);
  const hydrated = usePersistHydrated(useCareerValuesStore);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F0E8]">
        <div className="text-sm text-[#8A7E6A]">加载中…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] pb-12">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-50 border-b border-[#E8E4DD] bg-white/90 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <Link
            href="/chapter/chapter-1#career-values"
            className="text-sm text-[#8A7E6A] transition-colors hover:text-[#5D4A3A]"
          >
            ← 返回章节
          </Link>
          <span className="text-sm font-semibold text-[#8B6AA0]">💎 生涯价值观测评</span>
          {phase !== 'welcome' && phase !== 'report' && (
            <span className="ml-auto text-[11px] text-[#8A7E6A]">
              阶段 {['welcome', 'explore', 'select8', 'rank3', 'sentence', 'report'].indexOf(phase)}/5
            </span>
          )}
        </div>
      </div>

      {/* 主体内容 */}
      <div className="mx-auto max-w-3xl px-4 pt-6">
        {phase === 'welcome' && <WelcomePage />}
        {phase === 'explore' && <ExplorePage />}
        {phase === 'select8' && <Select8Page />}
        {phase === 'rank3' && <Rank3Page />}
        {phase === 'sentence' && <SentencePage />}
        {phase === 'report' && <ReportPage />}
      </div>
    </div>
  );
}
