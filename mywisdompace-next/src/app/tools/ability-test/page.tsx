'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAbilityStore } from '@/lib/ability-store';
import { usePersistHydrated } from '@/lib/hooks/usePersistHydrated';
import {
  getAllAbilities,
  getAbilityByIndex,
  getAbilitiesByBatch,
  getAbilitiesByDomain,
  checkAlerts,
  generateReport,
  exportMarkdown,
  DOMAINS,
} from '@/lib/ability-data';
import type { Ability } from '@/types/ability';
import {
  PROF_LABELS,
  INTE_LABELS,
  PROF_HINTS,
  BATCH_NAMES,
} from '@/types/ability';

// ==================== 子组件 ==================== //

// --- 欢迎页 ---
function WelcomePage() {
  const { setUserInfo, setPhase } = useAbilityStore();
  const [name, setName] = useState('');
  const [years, setYears] = useState('');
  const [industry, setIndustry] = useState('');

  const handleStart = () => {
    if (!name.trim()) {
      alert('请填写你的称呼');
      return;
    }
    setUserInfo(name.trim(), years || '未填写', industry.trim() || '未填写');
    setPhase('anchor');
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Hero */}
      <div className="mb-8 text-center">
        <div className="mb-4 text-5xl">🧭</div>
        <h1 className="mb-2 text-2xl font-bold text-[#4A3728] sm:text-3xl">
          42项能力兴趣自评
        </h1>
        <p className="text-[15px] text-[#8A7E6A]">
          基于双维度自评，帮助你识别优势能力与成长潜力
        </p>
      </div>

      {/* 特性介绍 */}
      <div className="mb-6 space-y-3 rounded-xl border border-[#E8E4DD] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] sm:p-7">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-[#6B9A68]">✓</span>
          <span className="text-[15px] text-[#5D4A3A]">发现自己真正突出的核心能力</span>
        </div>
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-[#6B9A68]">✓</span>
          <span className="text-[15px] text-[#5D4A3A]">识别值得持续投入的成长方向</span>
        </div>
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-[#6B9A68]">✓</span>
          <span className="text-[15px] text-[#5D4A3A]">形成更清晰的生涯发展线索</span>
        </div>

        {/* 7大能力域预览 */}
        <div className="mt-5 border-t border-[#E8E4DD] pt-5">
          <p className="mb-3 text-xs font-medium text-[#8A7E6A]">涵盖7大能力域</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {DOMAINS.map((d, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 rounded-lg bg-[#FAF8F3] px-3 py-2 text-xs text-[#5D4A3A]"
              >
                <span>{d.icon}</span>
                <span className="font-medium">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-[#8A7E6A]">
          ⏱ 预计 30-40 分钟 &nbsp;·&nbsp; 📋 42项能力 · 7个批次
        </div>
      </div>

      {/* 用户信息 */}
      <div className="mb-6 rounded-xl border border-[#E8E4DD] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] sm:p-7">
        <h3 className="mb-4 text-[15px] font-semibold text-[#4A3728]">请填写基础信息</h3>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#5D4A3A]">你的称呼</label>
            <input
              className="w-full rounded-lg border border-[#D5CFC2] bg-[#FAFBFC] px-3.5 py-2.5 text-sm transition-colors focus:border-[#8BA888] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8BA888]/20"
              placeholder="用于报告展示"
              maxLength={20}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#5D4A3A]">工作年限</label>
            <input
              className="w-full rounded-lg border border-[#D5CFC2] bg-[#FAFBFC] px-3.5 py-2.5 text-sm transition-colors focus:border-[#8BA888] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8BA888]/20"
              placeholder="如：5"
              type="number"
              min={0}
              max={50}
              value={years}
              onChange={(e) => setYears(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#5D4A3A]">
              所在行业<span className="text-[#8A7E6A]">（选填）</span>
            </label>
            <input
              className="w-full rounded-lg border border-[#D5CFC2] bg-[#FAFBFC] px-3.5 py-2.5 text-sm transition-colors focus:border-[#8BA888] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8BA888]/20"
              placeholder="如：互联网、制造业"
              maxLength={30}
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={handleStart}
          className="inline-flex items-center gap-2 rounded-xl bg-[#6B9A68] px-8 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#5A8A57] hover:shadow-md active:translate-y-0"
        >
          开始测评 →
        </button>
      </div>
      <p className="mt-4 text-center text-[10px] text-[#8A7E6A]">
        🔒 所有数据仅在本地处理，不上传到任何服务器
      </p>
    </div>
  );
}

// --- 锚定基准页 ---
function AnchorPage() {
  const { setAnchor, setPhase } = useAbilityStore();
  const [good, setGood] = useState('');
  const [bad, setBad] = useState('');

  const handleStart = () => {
    setAnchor(good, bad);
    useAbilityStore.getState().setCurrentIndex(0);
    setPhase('evaluate');
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-xl border border-[#E8E4DD] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] sm:p-7">
        <h2 className="mb-1 text-xl font-bold text-[#4A3728]">第一步：建立你的评价基准</h2>
        <p className="mb-5 text-sm text-[#8A7E6A]">
          在开始前，先用下面两个问题帮自己校准参照标准。
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#5D4A3A]">
              1. 最近一次被同事或上级认可的能力是什么？
            </label>
            <textarea
              className="w-full rounded-lg border border-[#D5CFC2] bg-[#FAFBFC] px-3.5 py-2.5 text-sm leading-relaxed transition-colors focus:border-[#8BA888] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8BA888]/20"
              placeholder="如：上个月帮团队理清了混乱的项目需求……"
              rows={3}
              value={good}
              onChange={(e) => setGood(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#5D4A3A]">
              2. 最近一次明显感到吃力或被指出不足的方面是什么？
            </label>
            <textarea
              className="w-full rounded-lg border border-[#D5CFC2] bg-[#FAFBFC] px-3.5 py-2.5 text-sm leading-relaxed transition-colors focus:border-[#8BA888] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8BA888]/20"
              placeholder="如：做年度预算时反复出错……"
              rows={3}
              value={bad}
              onChange={(e) => setBad(e.target.value)}
            />
          </div>
        </div>

        {/* 参考标准 */}
        <div className="mt-5 rounded-lg bg-[#E8F0E8] p-4 text-xs leading-relaxed text-[#2C5282]">
          <strong className="text-[#3D6B3A]">参考标准：</strong>
          <br />
          &ldquo;比较擅长&rdquo;约为同龄、同职级人群中的<strong>前30%</strong>，&ldquo;很擅长&rdquo;约为<strong>前10%</strong>。
          <br />
          <span className="text-[#8A7E6A]">建议以&ldquo;你身边条件相近的人&rdquo;为参照，而不是理想状态下的自己。</span>
        </div>
      </div>

      <div className="mt-5 flex justify-center gap-3">
        <button
          onClick={() => setPhase('welcome')}
          className="rounded-xl border border-[#8BA888] bg-white px-5 py-2.5 text-sm font-semibold text-[#6B9A68] transition-all hover:bg-[#FAF8F3]"
        >
          ← 返回
        </button>
        <button
          onClick={handleStart}
          className="rounded-xl bg-[#6B9A68] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#5A8A57] hover:shadow-md"
        >
          我已理解，开始评价 →
        </button>
      </div>
    </div>
  );
}

// --- 答题页 ---
function EvaluatePage() {
  const { currentIndex, answers, setCurrentIndex, setAnswer, setPhase, setLastCompletedBatch } = useAbilityStore();
  const [showProfAnchors, setShowProfAnchors] = useState(false);
  const [showInteAnchors, setShowInteAnchors] = useState(false);

  const ability = getAbilityByIndex(currentIndex);
  const allAbilities = getAllAbilities();

  // 当前能力评分
  const currentAnswer = ability ? answers[ability.id] : undefined;
  const hasBoth = !!(currentAnswer?.p && currentAnswer?.i);
  const alerts = useMemo(
    () => (ability && currentAnswer?.p ? checkAlerts(ability, answers) : []),
    [ability, currentAnswer?.p, answers]
  );

  // 是否是当前批次的第一项
  const isBatchFirst = useMemo(() => {
    if (!ability) return false;
    if (currentIndex === 0) return true;
    const prev = getAbilityByIndex(currentIndex - 1);
    return prev ? prev.batch !== ability.batch : true;
  }, [currentIndex, ability]);

  // 矛盾检测
  const handlePickProf = (v: number) => {
    if (!ability) return;
    setAnswer(ability.id, v, currentAnswer?.i || 0);
  };

  const handlePickInte = (v: number) => {
    if (!ability) return;
    setAnswer(ability.id, currentAnswer?.p || 0, v);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowProfAnchors(false);
      setShowInteAnchors(false);
    }
  };

  const handleNext = () => {
    if (!ability || !hasBoth) return;
    const nextIdx = currentIndex + 1;

    // 检查是否当前批次结束
    if (nextIdx >= 42 || allAbilities[nextIdx].batch !== ability.batch) {
      setLastCompletedBatch(ability.batch);
      setPhase('batch-summary');
      return;
    }

    setCurrentIndex(nextIdx);
    setShowProfAnchors(false);
    setShowInteAnchors(false);
  };

  if (!ability) return null;

  // 进度
  const progress = ((currentIndex + 1) / 42) * 100;

  // 选项按钮样式
  const profBtnClass = (level: number) => {
    const base = 'flex flex-col items-center justify-center rounded-lg border-2 p-3 text-center transition-all cursor-pointer hover:scale-[1.02] sm:p-4';
    if (currentAnswer?.p === level) {
      const colors: Record<number, string> = {
        1: 'border-[#90A4AE] bg-[#ECEFF1] text-[#37474F]',
        2: 'border-[#42A5F5] bg-[#E3F2FD] text-[#1565C0]',
        3: 'border-[#66BB6A] bg-[#F1F8E9] text-[#558B2F]',
        4: 'border-[#4CAF50] bg-[#E8F5E9] text-[#388E3C]',
      };
      return `${base} ${colors[level]}`;
    }
    return `${base} border-[#DDE2E8] bg-[#FAFBFC] text-[#555] hover:border-[#8BA888] hover:bg-[#FAF8F3]`;
  };

  const inteBtnClass = (level: number) => {
    const base = 'flex items-center justify-center rounded-lg border-2 px-3 py-2.5 text-center text-sm font-semibold transition-all cursor-pointer hover:scale-[1.02] sm:px-4 sm:py-3';
    if (currentAnswer?.i === level) {
      const colors: Record<number, string> = {
        1: 'border-[#78909C] bg-[#ECEFF1] text-[#37474F]',
        2: 'border-[#BDBDBD] bg-[#F5F5F5] text-[#616161]',
        3: 'border-[#FFA726] bg-[#FFF8E1] text-[#E65100]',
        4: 'border-[#FF9800] bg-[#FFF3E0] text-[#F57C00]',
      };
      return `${base} ${colors[level]}`;
    }
    return `${base} border-[#DDE2E8] bg-[#FAFBFC] text-[#555] hover:border-[#FFA726] hover:bg-[#FFF8E1]`;
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* 进度条 */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-[#8A7E6A]">
          <span>能力 {currentIndex + 1} / 42</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#E8E4DD]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#8BA888] to-[#6B9A68] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 批次标题 */}
      {isBatchFirst && (
        <div className="mb-4 flex items-center gap-2.5 rounded-lg bg-[#E8F0E8] px-4 py-3">
          <span className="rounded-full bg-[#6B9A68] px-2.5 py-0.5 text-[11px] font-semibold text-white">
            第{ability.batch}批/共7批
          </span>
          <span className="text-sm font-semibold text-[#3D6B3A]">
            {BATCH_NAMES[ability.batch - 1]}
          </span>
        </div>
      )}

      {/* 矛盾告警 */}
      {alerts.length > 0 && (
        <div className="mb-4 space-y-2">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 rounded-lg border-l-3 border-[#FFC107] bg-[#FFF8E1] p-3"
            >
              <span className="text-base">⚠️</span>
              <div className="text-xs leading-relaxed text-[#5D4A3A]">
                你给自己「{alert.abilityName}」评了<strong>{alert.abilityLevel}</strong>，
                但「{alert.relatedName}」评了<strong>{alert.relatedLevel}</strong>。
                <br />通常这两项能力高度关联，差异较大时值得再想一想。
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 能力卡片 */}
      <div className="rounded-xl border border-[#E8E4DD] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] sm:p-7">
        {/* 标题行 */}
        <div className="mb-5 flex items-start gap-3">
          <span className="mt-0.5 text-xs font-semibold text-[#8A7E6A]">
            {currentIndex + 1}/42
          </span>
          <div>
            <h3 className="text-lg font-bold text-[#4A3728]">{ability.name}</h3>
            <p className="text-xs text-[#8A7E6A]">{ability.def}</p>
          </div>
        </div>

        {/* 擅长度 */}
        <div className="mb-6">
          <div className="mb-2.5 text-sm font-semibold text-[#5D4A3A]">
            你觉得自己在「<strong className="text-[#4A3728]">{ability.name}</strong>」上有多{' '}
            <span className="inline-block rounded-md bg-[#E8F5E9] px-1.5 py-0.5 text-xs font-bold text-[#388E3C]">擅长</span>？
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PROF_LABELS.map((label, i) => (
              <button
                key={`p-${i}`}
                className={profBtnClass(i + 1)}
                onClick={() => handlePickProf(i + 1)}
              >
                <span className="text-sm font-semibold">{label}</span>
                <span className="mt-0.5 text-[10px] opacity-70">{PROF_HINTS[i]}</span>
              </button>
            ))}
          </div>

          {/* 行为参考 - 擅长度 */}
          <div className="mt-3 overflow-hidden rounded-lg border border-[#E8E4DD]">
            <button
              className="flex w-full items-center gap-1.5 px-3 py-2 text-left text-xs text-[#8A7E6A] transition-colors hover:text-[#5D4A3A]"
              onClick={() => setShowProfAnchors(!showProfAnchors)}
            >
              <span className={`inline-block transition-transform ${showProfAnchors ? 'rotate-90' : ''}`}>▶</span>
              查看行为参考
            </button>
            {showProfAnchors && (
              <div className="border-t border-[#E8E4DD] px-3 py-2">
                {[3, 2, 1, 0].map((level) => (
                  <div key={level} className="flex items-start gap-2 py-1.5 text-xs leading-relaxed">
                    <span
                      className={`mt-0.5 shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                        level >= 2
                          ? level === 3
                            ? 'bg-[#E8F5E9] text-[#388E3C]'
                            : 'bg-[#F1F8E9] text-[#558B2F]'
                          : level === 1
                          ? 'bg-[#E3F2FD] text-[#1565C0]'
                          : 'bg-[#ECEFF1] text-[#546E7A]'
                      }`}
                    >
                      {PROF_LABELS[level]}
                    </span>
                    <span className="text-[#5D4A3A]">{ability.prof[level]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 喜欢度 */}
        <div>
          <div className="mb-2.5 text-sm font-semibold text-[#5D4A3A]">
            你有多{' '}
            <span className="inline-block rounded-md bg-[#FFF3E0] px-1.5 py-0.5 text-xs font-bold text-[#F57C00]">喜欢</span>{' '}
            做「{ability.name}」这类事情？
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {INTE_LABELS.map((label, i) => (
              <button
                key={`i-${i}`}
                className={inteBtnClass(i + 1)}
                onClick={() => handlePickInte(i + 1)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 行为参考 - 喜欢度 */}
          <div className="mt-3 overflow-hidden rounded-lg border border-[#E8E4DD]">
            <button
              className="flex w-full items-center gap-1.5 px-3 py-2 text-left text-xs text-[#8A7E6A] transition-colors hover:text-[#5D4A3A]"
              onClick={() => setShowInteAnchors(!showInteAnchors)}
            >
              <span className={`inline-block transition-transform ${showInteAnchors ? 'rotate-90' : ''}`}>▶</span>
              查看行为参考
            </button>
            {showInteAnchors && (
              <div className="border-t border-[#E8E4DD] px-3 py-2">
                {[3, 2, 1, 0].map((level) => (
                  <div key={level} className="flex items-start gap-2 py-1.5 text-xs leading-relaxed">
                    <span
                      className={`mt-0.5 shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                        level >= 2
                          ? level === 3
                            ? 'bg-[#FFF3E0] text-[#F57C00]'
                            : 'bg-[#FFF8E1] text-[#E65100]'
                          : level === 1
                          ? 'bg-[#F5F5F5] text-[#616161]'
                          : 'bg-[#ECEFF1] text-[#546E7A]'
                      }`}
                    >
                      {INTE_LABELS[level]}
                    </span>
                    <span className="text-[#5D4A3A]">{ability.inte[level]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 导航按钮 */}
      <div className="mt-5 flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="rounded-xl border border-[#D5CFC2] bg-white px-4 py-2.5 text-sm font-medium text-[#8A7E6A] transition-all hover:bg-[#FAF8F3] disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← 上一项
        </button>
        <button
          onClick={handleNext}
          disabled={!hasBoth}
          className="rounded-xl bg-[#6B9A68] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#5A8A57] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
        >
          {currentIndex === 41 ? '完成所有评价 →' : '确认并下一项 →'}
        </button>
      </div>
    </div>
  );
}

// --- 批次汇总页 ---
function BatchSummaryPage() {
  const { lastCompletedBatch, answers, setCurrentIndex, setPhase } = useAbilityStore();

  if (!lastCompletedBatch) return null;

  const items = getAbilitiesByBatch(lastCompletedBatch);
  const batchName = BATCH_NAMES[lastCompletedBatch - 1];

  // 擅长度/喜欢度分布统计
  const profCounts = [0, 0, 0, 0];
  const inteCounts = [0, 0, 0, 0];
  items.forEach((a) => {
    const ans = answers[a.id];
    if (ans) {
      profCounts[ans.p - 1]++;
      inteCounts[ans.i - 1]++;
    }
  });
  const maxProf = Math.max(...profCounts, 1);
  const maxInte = Math.max(...inteCounts, 1);

  // 总进度
  const doneCount = Object.keys(answers).length;
  const totalPct = Math.round((doneCount / 42) * 100);

  const handleNext = () => {
    if (lastCompletedBatch === 7) {
      setPhase('review');
    } else {
      const nextBatch = lastCompletedBatch + 1;
      const firstNext = getAllAbilities().find((a) => a.batch === nextBatch);
      if (firstNext) {
        setCurrentIndex(firstNext.id - 1);
        setPhase('evaluate');
      }
    }
  };

  const profColors = ['#9E9E9E', '#42A5F5', '#66BB6A', '#4CAF50'];
  const inteColors = ['#9E9E9E', '#BDBDBD', '#FFA726', '#FF9800'];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-xl border border-[#E8E4DD] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] sm:p-7">
        <h2 className="mb-1 text-xl font-bold text-[#4A3728]">
          完成第 {lastCompletedBatch} 批：{batchName}
        </h2>
        <p className="mb-5 text-sm text-[#8A7E6A]">本批评价了 {items.length} 项能力</p>

        {/* 双列统计 */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* 擅长度 */}
          <div>
            <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-[#4A3728]">
              📊 擅长度分布
            </h3>
            <div className="space-y-2">
              {[3, 2, 1, 0].map((i) => (
                <div key={i}>
                  <div className="mb-1 flex justify-between text-[11px]">
                    <span className="text-[#5D4A3A]">{PROF_LABELS[i]}</span>
                    <span className="text-[#8A7E6A]">{profCounts[i]}项</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#E8E4DD]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.round((profCounts[i] / maxProf) * 100)}%`,
                        background: profColors[i],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 喜欢度 */}
          <div>
            <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-[#4A3728]">
              ⭐ 喜欢度分布
            </h3>
            <div className="space-y-2">
              {[3, 2, 1, 0].map((i) => (
                <div key={i}>
                  <div className="mb-1 flex justify-between text-[11px]">
                    <span className="text-[#5D4A3A]">{INTE_LABELS[i]}</span>
                    <span className="text-[#8A7E6A]">{inteCounts[i]}项</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#E8E4DD]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.round((inteCounts[i] / maxInte) * 100)}%`,
                        background: inteColors[i],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 总进度 */}
        <div className="mt-6 text-center">
          <div className="mb-2 text-xs text-[#8A7E6A]">总进度：{doneCount}/42项 ({totalPct}%)</div>
          <div className="mx-auto h-2.5 max-w-[300px] overflow-hidden rounded-full bg-[#E8E4DD]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#8BA888] to-[#6B9A68] transition-all duration-500"
              style={{ width: `${totalPct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 text-center">
        <button
          onClick={handleNext}
          className="rounded-xl bg-[#6B9A68] px-8 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#5A8A57] hover:shadow-md"
        >
          {lastCompletedBatch === 7 ? '查看回顾 →' : '继续下一批 →'}
        </button>
      </div>
    </div>
  );
}

// --- 回顾页 ---
function ReviewPage() {
  const { answers, setCurrentIndex, setPhase, reset } = useAbilityStore();

  const proTagClass = (v: number) => {
    const cls = [
      'bg-[#ECEFF1] text-[#546E7A]',
      'bg-[#E3F2FD] text-[#1565C0]',
      'bg-[#F1F8E9] text-[#558B2F]',
      'bg-[#E8F5E9] text-[#388E3C]',
    ];
    return cls[v - 1];
  };

  const intTagClass = (v: number) => {
    const cls = [
      'bg-[#ECEFF1] text-[#546E7A]',
      'bg-[#FFF8E1] text-[#E65100]',
      'bg-[#FFF3E0] text-[#F57C00]',
      'bg-[#FFF3E0] text-[#F57C00]',
    ];
    return cls[v - 1];
  };

  const handleJump = (id: number) => {
    setCurrentIndex(id - 1);
    setPhase('evaluate');
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-xl border border-[#E8E4DD] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] sm:p-7">
        <h2 className="mb-1 text-xl font-bold text-[#4A3728]">评价回顾 · 最后确认</h2>
        <p className="mb-5 text-sm text-[#8A7E6A]">点击能力名称可返回对应题目修改。</p>

        {DOMAINS.map((domain, dIdx) => {
          const items = getAbilitiesByDomain(dIdx);
          return (
            <div key={dIdx} className="mb-4 last:mb-0">
              <div className="rounded-t-lg bg-[#E8F0E8] px-4 py-2.5 text-sm font-semibold text-[#3D6B3A]">
                {domain.icon} {domain.name}
              </div>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#F5F6F8] text-left text-[11px] font-semibold text-[#8A7E6A]">
                    <th className="px-4 py-2">能力</th>
                    <th className="px-4 py-2">擅长度</th>
                    <th className="px-4 py-2">喜欢度</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((a) => {
                    const ans = answers[a.id];
                    return (
                      <tr
                        key={a.id}
                        className="cursor-pointer border-b border-[#F0F0F0] transition-colors hover:bg-[#FAFBFC]"
                        onClick={() => handleJump(a.id)}
                      >
                        <td className="px-4 py-2 font-medium text-[#6B9A68] hover:underline">
                          {a.name}
                        </td>
                        <td className="px-4 py-2">
                          {ans ? (
                            <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold ${proTagClass(ans.p)}`}>
                              {PROF_LABELS[ans.p - 1]}
                            </span>
                          ) : (
                            <span className="inline-block rounded-md bg-[#ECEFF1] px-2 py-0.5 text-[10px] font-semibold text-[#546E7A]">未评</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {ans ? (
                            <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold ${intTagClass(ans.i)}`}>
                              {INTE_LABELS[ans.i - 1]}
                            </span>
                          ) : (
                            <span className="inline-block rounded-md bg-[#ECEFF1] px-2 py-0.5 text-[10px] font-semibold text-[#546E7A]">未评</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-xl border border-[#D5CFC2] bg-white px-5 py-2.5 text-sm font-medium text-[#8A7E6A] transition-all hover:bg-[#FAF8F3]"
        >
          重新测评
        </button>
        <button
          onClick={() => setPhase('report')}
          className="rounded-xl bg-[#6B9A68] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#5A8A57] hover:shadow-md"
        >
          确认并生成报告 →
        </button>
      </div>
    </div>
  );
}

// --- 2×2小宫格组件 ---
function MiniGrid({ cells, tip }: {
  cells: { label: string; items: Ability[]; bg: string; color: string; star?: boolean }[];
  tip?: string;
}) {
  return (
    <div>
      <div className="mt-1.5 grid grid-cols-2 gap-px overflow-hidden rounded-md bg-[#D0D0D0]">
        {cells.map((c, i) => {
          const names = c.items.length ? c.items.map((a) => a.name).join('、') : '—';
          return (
            <div
              key={i}
              className="px-2 py-1.5 text-center text-[10px] leading-snug"
              style={{ background: c.bg }}
            >
              <div className="font-semibold" style={{ color: c.color }}>
                {c.star && <span className="text-[#F57C00]">★</span>} {c.label}
              </div>
              <div className="mt-0.5 text-[#666]">{names}</div>
            </div>
          );
        })}
      </div>
      {tip && (
        <div className="mt-1 text-center text-[9px] text-[#AAA]">{tip}</div>
      )}
    </div>
  );
}

// --- 结果报告页 ---
function ReportPage() {
  const { answers, name, years, reset } = useAbilityStore();
  const report = useMemo(() => generateReport(answers), [answers]);

  const handleExportMD = () => {
    if (!report) return;
    const md = exportMarkdown(answers, name, years);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `能力兴趣自评报告_${name || '未命名'}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!report) return null;

  const proTagClass = (v: number) => {
    const cls = [
      'bg-[#ECEFF1] text-[#546E7A]',
      'bg-[#E3F2FD] text-[#1565C0]',
      'bg-[#F1F8E9] text-[#558B2F]',
      'bg-[#E8F5E9] text-[#388E3C]',
    ];
    return cls[v - 1];
  };

  const intTagClass = (v: number) => {
    const cls = [
      'bg-[#ECEFF1] text-[#546E7A]',
      'bg-[#FFF8E1] text-[#E65100]',
      'bg-[#FFF3E0] text-[#F57C00]',
      'bg-[#FFF3E0] text-[#F57C00]',
    ];
    return cls[v - 1];
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* 报告头 */}
      <div className="mb-5 border-b-2 border-[#E8F0E8] pb-5 text-center">
        <h1 className="mb-1 text-xl font-bold text-[#4A3728]">42项能力兴趣自评报告</h1>
        <h2 className="mb-2 text-sm font-normal text-[#8A7E6A]">生涯发展综合分析</h2>
        <div className="flex justify-center gap-4 text-[11px] text-[#8A7E6A]">
          <span>👤 {name || '未填写'}</span>
          <span>📈 {years || '未填写'}年</span>
          <span>📅 {new Date().toLocaleDateString('zh-CN')}</span>
        </div>
      </div>

      {/* 四象限 */}
      <div className="mb-5 rounded-xl border border-[#E8E4DD] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] sm:p-7">
        <h2 className="mb-1 text-lg font-bold text-[#4A3728]">能力四象限</h2>
        <p className="mb-4 text-center text-[11px] text-[#8A7E6A]">
          分界标准：擅长/喜欢 ≥ 3 为&ldquo;高侧&rdquo;，≤ 2 为&ldquo;低侧&rdquo; · 每象限内按评分细分为2×2小宫格
        </p>

        <div className="mx-auto grid max-w-[580px] grid-cols-2 gap-1 overflow-hidden rounded-lg bg-[#D0D0D0]">
          {/* 后备区（左上） */}
          <div className="bg-[#E3F2FD] p-3">
            <div className="text-base">🗂</div>
            <div className="text-[13px] font-bold text-[#2B4C7E]">后备区</div>
            <div className="text-[10px] text-[#8A7E6A]">{report.quadrants.reserve.length}项 · 高擅+低喜</div>
            <MiniGrid
              cells={[
                { label: '较擅+较不喜', items: report.reserveDetail.m2, bg: '#E3F2FD', color: '#1565C0' },
                { label: '很擅+较不喜', items: report.reserveDetail.h2, bg: '#BBDEFB', color: '#0D47A1' },
                { label: '较擅+很不喜', items: report.reserveDetail.m1, bg: '#FFF9C4', color: '#F57F17' },
                { label: '很擅+很不喜', items: report.reserveDetail.h1, bg: '#FFF176', color: '#F57F17' },
              ]}
              tip="右上为最极端"
            />
          </div>

          {/* 优势区（右上） */}
          <div className="bg-[#E8F5E9] p-3">
            <div className="text-base">🌟</div>
            <div className="text-[13px] font-bold text-[#388E3C]">优势区</div>
            <div className="text-[10px] text-[#8A7E6A]">{report.quadrants.strength.length}项 · 高擅+高喜</div>
            <MiniGrid
              cells={[
                { label: '较擅+较喜', items: report.strengthDetail.mm, bg: '#F1F8E9', color: '#558B2F' },
                { label: '★ 很擅+很喜', items: report.strengthDetail.hh, bg: '#C8E6C9', color: '#1B5E20', star: true },
                { label: '较擅+很喜', items: report.strengthDetail.mh, bg: '#FFF8E0', color: '#E65100' },
                { label: '很擅+较喜', items: report.strengthDetail.hm, bg: '#E8F5E9', color: '#388E3C' },
              ]}
              tip="右上为核心优势"
            />
          </div>

          {/* 放弃区（左下） */}
          <div className="bg-[#F5F5F5] p-3">
            <div className="text-base">🧊</div>
            <div className="text-[13px] font-bold text-[#616161]">放弃区</div>
            <div className="text-[10px] text-[#8A7E6A]">{report.quadrants.abandon.length}项 · 低擅+低喜</div>
            <MiniGrid
              cells={[
                { label: '不太擅+较不喜', items: report.abandonDetail.nn, bg: '#ECEFF1', color: '#546E7A' },
                { label: '很不擅+较不喜', items: report.abandonDetail.ln, bg: '#CFD8DC', color: '#37474F' },
                { label: '不太擅+很不喜', items: report.abandonDetail.nl, bg: '#FAFAFA', color: '#9E9E9E' },
                { label: '很不擅+很不喜', items: report.abandonDetail.ll, bg: '#E0E0E0', color: '#616161' },
              ]}
              tip="右下为最弱"
            />
          </div>

          {/* 潜力区（右下） */}
          <div className="bg-[#FFF3E0] p-3">
            <div className="text-base">🌱</div>
            <div className="text-[13px] font-bold text-[#F57C00]">潜力区</div>
            <div className="text-[10px] text-[#8A7E6A]">{report.quadrants.potential.length}项 · 低擅+高喜</div>
            <MiniGrid
              cells={[
                { label: '不太擅+较喜', items: report.potentialDetail.n3, bg: '#FFE0B2', color: '#EF6C00' },
                { label: '很不擅+很喜欢', items: report.potentialDetail.l4, bg: '#FFCC80', color: '#E65100' },
                { label: '不太擅+很喜欢', items: report.potentialDetail.n4, bg: '#FFF3E0', color: '#F57C00' },
                { label: '很不擅+较喜', items: report.potentialDetail.l3, bg: '#FFECB3', color: '#FF6F00' },
              ]}
              tip="右上为最大潜力"
            />
          </div>
        </div>
      </div>

      {/* 7大能力域概览 */}
      <div className="mb-5 rounded-xl border border-[#E8E4DD] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] sm:p-7">
        <h2 className="mb-4 text-lg font-bold text-[#4A3728]">7大能力域概览</h2>
        {report.domainStats.map((ds, i) => (
          <div key={i} className="mb-3 last:mb-0">
            <div className="flex items-center justify-between rounded-t-lg bg-[#F5F6F8] px-4 py-2">
              <h4 className="text-[13px] font-semibold text-[#4A3728]">
                {ds.domain.icon} {ds.domain.name}
              </h4>
              <span className="text-[11px] text-[#8A7E6A]">
                擅长 {ds.avgProf.toFixed(1)} / 喜欢 {ds.avgInte.toFixed(1)}
              </span>
            </div>
            <div className="flex h-2">
              <div
                className="bg-[#4CAF50] transition-all duration-500"
                style={{ width: `${(ds.avgProf / 4) * 100}%` }}
              />
              <div
                className="bg-[#FF9800] transition-all duration-500"
                style={{ width: `${(ds.avgInte / 4) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 完整结果 */}
      <div className="mb-5 rounded-xl border border-[#E8E4DD] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] sm:p-7">
        <h2 className="mb-4 text-lg font-bold text-[#4A3728]">完整结果</h2>
        {DOMAINS.map((domain, dIdx) => {
          const items = getAbilitiesByDomain(dIdx);
          return (
            <div key={dIdx} className="mb-4 last:mb-0">
              <div className="rounded-md bg-[#E8F0E8] px-4 py-2 text-sm font-semibold text-[#3D6B3A]">
                {domain.icon} {domain.name}
              </div>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#F5F6F8] text-left text-[11px] font-semibold text-[#8A7E6A]">
                    <th className="px-4 py-2">能力</th>
                    <th className="px-4 py-2">擅长度</th>
                    <th className="px-4 py-2">喜欢度</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((a) => {
                    const ans = answers[a.id];
                    if (!ans) return null;
                    return (
                      <tr key={a.id} className="border-b border-[#F0F0F0]">
                        <td className="px-4 py-2">{a.name}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold ${proTagClass(ans.p)}`}>
                            {PROF_LABELS[ans.p - 1]}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold ${intTagClass(ans.i)}`}>
                            {INTE_LABELS[ans.i - 1]}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-center gap-3">
        <button
          onClick={handleExportMD}
          className="rounded-xl border border-[#8BA888] bg-white px-5 py-2.5 text-sm font-medium text-[#6B9A68] transition-all hover:bg-[#FAF8F3]"
        >
          📥 导出 Markdown
        </button>
        <button
          onClick={reset}
          className="rounded-xl bg-[#6B9A68] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#5A8A57] hover:shadow-md"
        >
          重新测评
        </button>
      </div>
    </div>
  );
}

// ==================== 主页面 ==================== //
export default function AbilityTestPage() {
  const phase = useAbilityStore((state) => state.phase);
  const hydrated = usePersistHydrated(useAbilityStore);

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
            href="/chapter/chapter-1#ability-assessment"
            className="text-sm text-[#8A7E6A] transition-colors hover:text-[#5D4A3A]"
          >
            ← 返回章节
          </Link>
          <span className="text-sm font-semibold text-[#6B9A68]">🔎 能力兴趣自评</span>
          {phase === 'evaluate' && (
            <span className="ml-auto text-[11px] text-[#8A7E6A]">
              {useAbilityStore.getState().currentIndex + 1}/42
            </span>
          )}
        </div>
      </div>

      {/* 恢复进度提示 */}
      {phase !== 'welcome' && phase !== 'evaluate' && phase !== 'batch-summary' && phase !== 'review' && phase !== 'report' && phase !== 'anchor' && (
        <div className="mx-auto mt-4 max-w-2xl rounded-lg border border-[#FFC107] bg-[#FFF8E1] p-3 text-center text-xs text-[#5D4A3A]">
          你上次已填写部分数据。继续完成测评，或点击&ldquo;重新测评&rdquo;开始。
        </div>
      )}

      {/* 主体内容 */}
      <div className="mx-auto max-w-3xl px-4 pt-6">
        {phase === 'welcome' && <WelcomePage />}
        {phase === 'anchor' && <AnchorPage />}
        {phase === 'evaluate' && <EvaluatePage />}
        {phase === 'batch-summary' && <BatchSummaryPage />}
        {phase === 'review' && <ReviewPage />}
        {phase === 'report' && <ReportPage />}
      </div>
    </div>
  );
}
