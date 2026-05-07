'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  maritalOptions,
  childrenOptions,
  parentsOptions,
  relationOptions,
  relationTypeOptions,
  evalDimensions,
  scoreOptions,
  alternativePlans,
  calculateCandidateScore,
  getRecommendation,
  type MaritalStatus,
  type ChildrenStatus,
  type ParentsStatus,
  type RelationQuality,
  type CandidateRelation,
  type Candidate,
  type CandidateScore,
} from '@/data/ta-worth-trust/trustData';

// ── 阶段类型 ──
type Phase = 'social' | 'nominate' | 'evaluate' | 'alternative' | 'report';

// ── Radio 选择组件 ──
function RadioGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`rounded-full border px-4 py-2 text-sm transition-all ${
              isActive
                ? 'border-[#C87941] bg-[#FDF5EE] font-semibold text-[#4A3728]'
                : 'border-[#E8D9C2] bg-white text-[#5A5A5A] hover:border-[#C87941]/50'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ── 评分选择组件 ──
function ScoreSelector({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <span className="shrink-0 text-[10px] sm:text-[11px] text-[#8A7E6A]">不符合</span>
      <div className="flex gap-1 sm:gap-1.5">
        {scoreOptions.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg border text-xs sm:text-sm font-bold transition-all ${
                isActive
                  ? 'border-[#C87941] bg-[#C87941] text-white'
                  : 'border-[#E8D9C2] bg-white text-[#8A7E6A] hover:border-[#C87941]/50'
              }`}
              title={opt.label}
            >
              {opt.value}
            </button>
          );
        })}
      </div>
      <span className="shrink-0 text-[10px] sm:text-[11px] text-[#8A7E6A]">符合</span>
    </div>
  );
}

// ── 阶段一：社交状况评估 ──
function SocialPhase({
  marital,
  children,
  parentsAlive,
  siblingRelation,
  closeFriends,
  isSolo,
  onMarital,
  onChildren,
  onParents,
  onSibling,
  onFriends,
  onSolo,
  onNext,
}: {
  marital: MaritalStatus | null;
  children: ChildrenStatus | null;
  parentsAlive: ParentsStatus | null;
  siblingRelation: RelationQuality | null;
  closeFriends: number | null;
  isSolo: boolean | null;
  onMarital: (v: MaritalStatus) => void;
  onChildren: (v: ChildrenStatus) => void;
  onParents: (v: ParentsStatus) => void;
  onSibling: (v: RelationQuality) => void;
  onFriends: (v: number) => void;
  onSolo: (v: boolean) => void;
  onNext: () => void;
}) {
  const allAnswered = marital && children !== null && parentsAlive !== null && siblingRelation && closeFriends !== null && isSolo !== null;

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-[#E8D9C2] bg-white p-6 shadow-sm">
        <span className="inline-block rounded-full bg-[#FDF5EE] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C87941]">
          第一步
        </span>
        <h3 className="mt-2 text-lg font-bold text-[#4A3728]">了解你的社交状况</h3>
        <p className="mt-1 text-sm text-[#8A7E6A]">
          先了解一下你当前的家庭和社会关系，这将帮助我们为你推荐最合适的路径。
        </p>

        <div className="mt-6 space-y-6">
          <div>
            <p className="mb-2 text-sm font-medium text-[#4A3728]">你的婚姻状况</p>
            <RadioGroup options={maritalOptions} value={marital} onChange={onMarital} />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-[#4A3728]">子女情况</p>
            <RadioGroup options={childrenOptions} value={children} onChange={onChildren} />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-[#4A3728]">父母是否健在</p>
            <RadioGroup options={parentsOptions} value={parentsAlive} onChange={onParents} />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-[#4A3728]">与兄弟姐妹（含表亲堂亲）的关系</p>
            <RadioGroup options={relationOptions} value={siblingRelation} onChange={onSibling} />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-[#4A3728]">亲密朋友的数量</p>
            <RadioGroup
              options={[
                { value: '3', label: '3位以上' },
                { value: '2', label: '1-2位' },
                { value: '1', label: '几乎没有' },
              ]}
              value={closeFriends === null ? null : String(closeFriends)}
              onChange={(v) => onFriends(Number(v))}
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-[#4A3728]">你目前是否独居？</p>
            <RadioGroup
              options={[{ value: 'yes', label: '是，独居' }, { value: 'no', label: '否，与人同住' }]}
              value={isSolo === null ? null : isSolo ? 'yes' : 'no'}
              onChange={(v) => onSolo(v === 'yes')}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!allAnswered}
          className="rounded-xl bg-[#C87941] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#A85E2D] disabled:opacity-40"
        >
          下一步：提名候选人 →
        </button>
      </div>
    </div>
  );
}

// ── 阶段二：候选人提名 ──
function NominatePhase({
  candidates,
  onAdd,
  onRemove,
  onUpdate,
  onNoCandidate,
  onNext,
  onBack,
}: {
  candidates: Candidate[];
  onAdd: (relation: CandidateRelation) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof Candidate, value: string) => void;
  onNoCandidate: () => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [customName, setCustomName] = useState('');

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-[#E8D9C2] bg-white p-6 shadow-sm">
        <span className="inline-block rounded-full bg-[#FDF5EE] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C87941]">
          第二步
        </span>
        <h3 className="mt-2 text-lg font-bold text-[#4A3728]">提名候选人</h3>
        <p className="mt-1 text-sm text-[#8A7E6A]">
          从你认识的人中，选出可能成为意定人的候选人。可以选多位，后续会帮你逐一评估。
        </p>

        {/* 快捷添加 */}
        <div className="mt-4 flex flex-wrap gap-2">
          {relationTypeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onAdd(opt.value)}
              className="flex items-center gap-1.5 rounded-full border border-[#E8D9C2] bg-white px-3.5 py-1.5 text-sm text-[#5A5A5A] transition-all hover:border-[#C87941]/50"
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>

        {/* 已添加候选人 */}
        {candidates.length > 0 && (
          <div className="mt-6 space-y-3">
            <p className="text-xs font-medium text-[#8A7E6A]">已添加的候选人</p>
            {candidates.map((c) => {
              const relOpt = relationTypeOptions.find((r) => r.value === c.relation);
              return (
                <div key={c.id} className="rounded-lg border border-[#E8D9C2] bg-[#FAF8F3] p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{relOpt?.icon}</span>
                    <span className="text-sm font-bold text-[#4A3728]">{relOpt?.label}</span>
                    <button
                      onClick={() => onRemove(c.id)}
                      className="ml-auto text-xs text-red-400 hover:text-red-600"
                    >
                      移除
                    </button>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      value={c.name}
                      onChange={(e) => onUpdate(c.id, 'name', e.target.value)}
                      placeholder="姓名"
                      className="rounded-lg border border-[#E8D9C2] bg-white px-3 py-2 text-sm text-[#4A3728] outline-none focus:border-[#C87941]"
                    />
                    <input
                      type="tel"
                      value={c.phone ?? ''}
                      onChange={(e) => onUpdate(c.id, 'phone', e.target.value)}
                      placeholder="联系电话（可选）"
                      className="rounded-lg border border-[#E8D9C2] bg-white px-3 py-2 text-sm text-[#4A3728] outline-none focus:border-[#C87941]"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 暂无合适人选 */}
        <div className="mt-6 rounded-xl border border-dashed border-[#E8D9C2] bg-[#FAF8F3] p-5 text-center">
          <p className="text-sm text-[#8A7E6A]">
            如果你目前身边没有合适的人选，也没有关系。
          </p>
          <button
            onClick={onNoCandidate}
            className="mt-3 rounded-lg border border-[#C87941] bg-white px-5 py-2 text-sm font-medium text-[#C87941] transition-all hover:bg-[#FDF5EE]"
          >
            暂无合适人选，查看权宜方案
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="rounded-lg border border-[#E8D9C2] bg-white px-5 py-2.5 text-sm font-medium text-[#4A3728] transition-all hover:border-[#C87941]"
        >
          ← 上一步
        </button>
        <button
          onClick={onNext}
          disabled={candidates.length === 0}
          className="rounded-xl bg-[#C87941] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#A85E2D] disabled:opacity-40"
        >
          下一步：评估候选人 →
        </button>
      </div>
    </div>
  );
}

// ── 阶段三：候选人评估 ──
function EvaluatePhase({
  candidates,
  scores,
  onScore,
  onNext,
  onBack,
}: {
  candidates: Candidate[];
  scores: Record<string, Record<string, number>>;
  onScore: (candidateId: string, dimensionId: string, score: number) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const allScored = candidates.every((c) =>
    evalDimensions.every((d) => scores[c.id]?.[d.id] !== undefined)
  );

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-[#E8D9C2] bg-white p-6 shadow-sm">
        <span className="inline-block rounded-full bg-[#FDF5EE] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C87941]">
          第三步
        </span>
        <h3 className="mt-2 text-lg font-bold text-[#4A3728]">评估候选人</h3>
        <p className="mt-1 text-sm text-[#8A7E6A]">
          对每位候选人进行四维度评估（1-5分）。参考三思清单的评估框架，从价值观、能力、意愿和现实条件四个角度综合判断。
        </p>

        <div className="mt-6 space-y-8">
          {candidates.map((c) => {
            const relOpt = relationTypeOptions.find((r) => r.value === c.relation);
            return (
              <div key={c.id} className="rounded-lg border border-[#E8D9C2] bg-[#FAF8F3] p-5">
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-lg">{relOpt?.icon}</span>
                  <span className="text-base font-bold text-[#4A3728]">{c.name || relOpt?.label}</span>
                </div>

                <div className="space-y-4">
                  {evalDimensions.map((dim) => (
                    <div key={dim.id}>
                      <p className="mb-1 text-sm font-medium text-[#4A3728]">{dim.question}</p>
                      <p className="mb-2 text-xs text-[#8A7E6A]">{dim.description}</p>
                      <ScoreSelector
                        value={scores[c.id]?.[dim.id] ?? null}
                        onChange={(v) => onScore(c.id, dim.id, v)}
                      />
                    </div>
                  ))}
                </div>

                {/* 当前评分总览 */}
                {scores[c.id] && Object.keys(scores[c.id]).length === evalDimensions.length && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-white px-4 py-2">
                    <span className="text-xs text-[#8A7E6A]">综合得分</span>
                    <span className="text-lg font-bold text-[#C87941]">
                      {(Object.values(scores[c.id]).reduce((s, v) => s + v, 0) / evalDimensions.length).toFixed(1)}
                    </span>
                    <span className="text-xs text-[#8A7E6A]">/ 5</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="rounded-lg border border-[#E8D9C2] bg-white px-5 py-2.5 text-sm font-medium text-[#4A3728] transition-all hover:border-[#C87941]"
        >
          ← 上一步
        </button>
        <button
          onClick={onNext}
          disabled={!allScored}
          className="rounded-xl bg-[#C87941] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#A85E2D] disabled:opacity-40"
        >
          生成报告 →
        </button>
      </div>
    </div>
  );
}

// ── 阶段四：权宜方案（独居者路径） ──
function AlternativePhase({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <span className="inline-block rounded-full bg-[#FDF5EE] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C87941]">
          权宜方案
        </span>
        <h3 className="mt-3 text-2xl font-bold text-[#4A3728]">暂无合适人选？别担心</h3>
        <p className="mt-2 text-sm leading-relaxed text-[#8A7E6A]">
          没有合适的意定人并不意味着你无法保护自己。以下方案可以帮助你在没有亲密人选的情况下，依然为自己的未来做好安排。
        </p>
      </div>

      {alternativePlans.map((plan) => (
        <div key={plan.id} className="rounded-xl border border-[#E8D9C2] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDF5EE] text-lg">
              {plan.icon}
            </div>
            <h4 className="text-base font-bold text-[#4A3728]">{plan.title}</h4>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[#5A5A5A]">{plan.description}</p>
          <div className="mt-4 space-y-2">
            {plan.steps.map((step, i) => (
              <div key={i} className="flex gap-2 text-sm text-[#5A5A5A]">
                <span className="shrink-0 font-bold text-[#C87941]">{i + 1}.</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
          {plan.contactTemplate && (
            <div className="mt-3 rounded-lg bg-[#FAF8F3] px-4 py-2 text-xs text-[#8A7E6A]">
              {plan.contactTemplate}
            </div>
          )}
        </div>
      ))}

      {/* 培养建议 */}
      <div className="rounded-xl border border-[#C87941]/20 bg-[#FDF5EE] p-5">
        <h4 className="text-sm font-bold text-[#4A3728]">长远建议：培养潜在意定人</h4>
        <p className="mt-2 text-sm leading-relaxed text-[#5A5A5A]">
          如果你目前确实没有合适人选，可以有意识地在日常生活中培养信任关系：
        </p>
        <ul className="mt-3 space-y-1 text-sm text-[#5A5A5A]">
          <li>• 从兴趣社群、志愿活动中结识志同道合的人</li>
          <li>• 与邻居、老同学重新建立联系</li>
          <li>• 参与社区活动，建立互助网络</li>
          <li>• 考虑加入互助型养老社群</li>
        </ul>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="rounded-lg border border-[#E8D9C2] bg-white px-5 py-2.5 text-sm font-medium text-[#4A3728] transition-all hover:border-[#C87941]"
        >
          ← 返回提名候选人
        </button>
      </div>
    </div>
  );
}

// ── 阶段五：综合报告 ──
function ReportPhase({
  candidates,
  scoreResults,
  recommendation,
}: {
  candidates: Candidate[];
  scoreResults: CandidateScore[];
  recommendation: { topId: string; reason: string } | null;
}) {
  const topCandidate = candidates.find((c) => c.id === recommendation?.topId);
  const topRelOpt = topCandidate ? relationTypeOptions.find((r) => r.value === topCandidate.relation) : null;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <span className="inline-block rounded-full bg-[#FDF5EE] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C87941]">
          评估报告
        </span>
        <h3 className="mt-3 text-2xl font-bold text-[#4A3728]">你的意定人评估报告</h3>
      </div>

      {/* 推荐结果 */}
      {recommendation && topCandidate && (
        <div className="rounded-xl border border-[#C87941]/20 bg-[#FDF5EE] p-5">
          <h4 className="text-sm font-bold text-[#C87941]">推荐人选</h4>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-2xl">{topRelOpt?.icon}</span>
            <div>
              <p className="text-lg font-bold text-[#4A3728]">{topCandidate.name || topRelOpt?.label}</p>
              <p className="text-sm text-[#8A7E6A]">{topRelOpt?.label}</p>
            </div>
            <span className="ml-auto text-2xl font-bold text-[#C87941]">
              {scoreResults.find((s) => s.candidateId === topCandidate.id)?.average}
              <span className="text-sm text-[#8A7E6A]">/5</span>
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[#5A5A5A]">{recommendation.reason}</p>
        </div>
      )}

      {/* 候选人对比 */}
      <div className="rounded-xl border border-[#E8D9C2] bg-white p-5 shadow-sm">
        <h4 className="mb-4 text-sm font-bold text-[#4A3728]">候选人对比</h4>
        <div className="space-y-3">
          {scoreResults.map((sr) => {
            const c = candidates.find((x) => x.id === sr.candidateId);
            if (!c) return null;
            const relOpt = relationTypeOptions.find((r) => r.value === c.relation);
            const isTop = sr.candidateId === recommendation?.topId;
            return (
              <div
                key={sr.candidateId}
                className={`rounded-lg border p-4 ${
                  isTop ? 'border-[#C87941] bg-[#FDF5EE]' : 'border-[#E8D9C2] bg-[#FAF8F3]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{relOpt?.icon}</span>
                  <span className="text-sm font-bold text-[#4A3728]">{c.name || relOpt?.label}</span>
                  {isTop && (
                    <span className="rounded-full bg-[#C87941] px-2 py-0.5 text-[10px] font-medium text-white">
                      推荐
                    </span>
                  )}
                  <span className="ml-auto text-lg font-bold text-[#C87941]">{sr.average}/5</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {evalDimensions.map((dim) => (
                    <div key={dim.id} className="text-center">
                      <div className="text-xs text-[#8A7E6A]">{dim.label}</div>
                      <div className="mt-1 text-base font-bold text-[#4A3728]">{sr.scores[dim.id]}/5</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 下一步行动 */}
      <div className="rounded-xl border border-[#E8D9C2] bg-white p-5 shadow-sm">
        <h4 className="mb-3 text-sm font-bold text-[#4A3728]">下一步行动</h4>
        <div className="space-y-2 text-sm text-[#5A5A5A]">
          <div className="flex gap-2">
            <span className="shrink-0 font-bold text-[#C87941]">1.</span>
            <span>与推荐人选坦诚沟通，了解 TA 对意定监护的态度</span>
          </div>
          <div className="flex gap-2">
            <span className="shrink-0 font-bold text-[#C87941]">2.</span>
            <span>让 TA 阅读你的生前预嘱，确认 TA 能理解并尊重你的意愿</span>
          </div>
          <div className="flex gap-2">
            <span className="shrink-0 font-bold text-[#C87941]">3.</span>
            <span>前往公证处办理意定监护公证，确保法律效力</span>
          </div>
          <div className="flex gap-2">
            <span className="shrink-0 font-bold text-[#C87941]">4.</span>
            <span>定期（每年至少一次）与意定人沟通，更新你的意愿和安排</span>
          </div>
        </div>
      </div>

      {/* 重新测评 */}
      <div className="flex justify-center">
        <Link
          href="/tools/ta-worth-trust"
          className="inline-block rounded-xl border border-[#C87941] bg-white px-6 py-3 text-sm font-bold text-[#C87941] transition-all hover:bg-[#FDF5EE]"
        >
          重新评估
        </Link>
      </div>
    </div>
  );
}

// ── 主页面 ──
export default function TaWorthTrustPage() {
  const [phase, setPhase] = useState<Phase>('social');

  // 社交状况
  const [marital, setMarital] = useState<MaritalStatus | null>(null);
  const [children, setChildren] = useState<ChildrenStatus | null>(null);
  const [parentsAlive, setParentsAlive] = useState<ParentsStatus | null>(null);
  const [siblingRelation, setSiblingRelation] = useState<RelationQuality | null>(null);
  const [closeFriends, setCloseFriends] = useState<number | null>(null);
  const [isSolo, setIsSolo] = useState<boolean | null>(null);

  // 候选人
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [scores, setScores] = useState<Record<string, Record<string, number>>>({});
  const [scoreResults, setScoreResults] = useState<CandidateScore[]>([]);
  const [recommendation, setRecommendation] = useState<{ topId: string; reason: string } | null>(null);

  let candidateIdCounter = 0;
  const genId = () => `cand_${++candidateIdCounter}_${Date.now()}`;

  const handleAddCandidate = (relation: CandidateRelation) => {
    setCandidates((prev) => [...prev, { id: genId(), name: '', relation }]);
  };

  const handleRemoveCandidate = (id: string) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
    setScores((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleUpdateCandidate = (id: string, field: keyof Candidate, value: string) => {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const handleScore = (candidateId: string, dimensionId: string, score: number) => {
    setScores((prev) => ({
      ...prev,
      [candidateId]: { ...(prev[candidateId] ?? {}), [dimensionId]: score },
    }));
  };

  const goToNominate = () => setPhase('nominate');
  const goToEvaluate = () => setPhase('evaluate');
  const goToAlternative = () => setPhase('alternative');
  const goToReport = () => {
    const results = candidates.map((c) => calculateCandidateScore(c.id, scores[c.id] ?? {}));
    const rec = getRecommendation(results);
    setScoreResults(results);
    setRecommendation(rec);
    setPhase('report');
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] pb-20">
      <nav className="sticky top-0 z-50 border-b border-[#E8D9C2]/50 bg-white/80 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/chapter/chapter-3" className="text-sm font-medium text-[#8A7E6A] hover:text-[#C87941]">
            ← 返回清楚交代
          </Link>
          <h1 className="text-sm font-bold text-[#4A3728]">
            {phase === 'social' ? '意定人选择' : phase === 'nominate' ? '提名候选人' : phase === 'evaluate' ? '评估候选人' : phase === 'alternative' ? '权宜方案' : '评估报告'}
          </h1>
          <div className="w-20" />
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-4 pt-8">
        {phase === 'social' && (
          <SocialPhase
            marital={marital}
            children={children}
            parentsAlive={parentsAlive}
            siblingRelation={siblingRelation}
            closeFriends={closeFriends}
            isSolo={isSolo}
            onMarital={setMarital}
            onChildren={setChildren}
            onParents={setParentsAlive}
            onSibling={setSiblingRelation}
            onFriends={setCloseFriends}
            onSolo={setIsSolo}
            onNext={goToNominate}
          />
        )}

        {phase === 'nominate' && (
          <NominatePhase
            candidates={candidates}
            onAdd={handleAddCandidate}
            onRemove={handleRemoveCandidate}
            onUpdate={handleUpdateCandidate}
            onNoCandidate={goToAlternative}
            onNext={goToEvaluate}
            onBack={() => setPhase('social')}
          />
        )}

        {phase === 'evaluate' && (
          <EvaluatePhase
            candidates={candidates}
            scores={scores}
            onScore={handleScore}
            onNext={goToReport}
            onBack={() => setPhase('nominate')}
          />
        )}

        {phase === 'alternative' && (
          <AlternativePhase onBack={() => setPhase('nominate')} />
        )}

        {phase === 'report' && (
          <ReportPhase
            candidates={candidates}
            scoreResults={scoreResults}
            recommendation={recommendation}
          />
        )}
      </main>
    </div>
  );
}
