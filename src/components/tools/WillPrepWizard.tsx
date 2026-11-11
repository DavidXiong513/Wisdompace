'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  assetCategories,
  accountPlans,
  maritalOptions,
  coownerChecks,
  intentChecks,
  willForms,
  witnessDisqualified,
  redLines,
  memoDisclaimer,
  memoNextSteps,
  type IntentCheck,
  type RedLine,
  type FormVerdict,
} from '@/data/will-preparation/willPrepData';

const STEPS = ['资产盘点', '析产判断', '意愿梳理', '形式对照', '风险自检', '准备备忘'];
const STORAGE_KEY = 'wisdompace:will-prep:v1';

type Draft = {
  assets: string[];
  /** 数字资产明细（assetCategories 里数字资产的 subItems） */
  digital: string[];
  /** 账号交代方式，取 accountPlans 的 id */
  accountPlan: string | null;
  marital: string | null;
  coowners: string[];
  intents: string[];
  form: string | null;
  redlines: string[];
};

const DIGITAL_SUB_ITEMS = assetCategories.find(a => a.id === 'digital')?.subItems ?? [];
const DIGITAL_IDS = new Set(DIGITAL_SUB_ITEMS.map(s => s.id));
const ACCOUNT_PLAN_IDS = new Set(accountPlans.map(p => p.id));

function emptyDraft(): Draft {
  return {
    assets: [],
    digital: [],
    accountPlan: null,
    marital: null,
    coowners: [],
    intents: [],
    form: null,
    redlines: [],
  };
}

function loadDraft(): Draft {
  if (typeof window === 'undefined') return emptyDraft();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyDraft();
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return emptyDraft();
    const o = parsed as Record<string, unknown>;
    const takeIds = (v: unknown): string[] =>
      Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
    const draft = emptyDraft();
    draft.assets = takeIds(o.assets);
    // 旧草稿没有 digital 字段；明细 id 也要按当前数据白名单过一次，避免残留脏值
    draft.digital = takeIds(o.digital).filter(id => DIGITAL_IDS.has(id));
    draft.accountPlan =
      typeof o.accountPlan === 'string' && ACCOUNT_PLAN_IDS.has(o.accountPlan) ? o.accountPlan : null;
    draft.coowners = takeIds(o.coowners);
    draft.intents = takeIds(o.intents);
    draft.redlines = takeIds(o.redlines);
    draft.marital = typeof o.marital === 'string' ? o.marital : null;
    draft.form = typeof o.form === 'string' ? o.form : null;
    return draft;
  } catch {
    return emptyDraft();
  }
}

function saveDraft(draft: Draft): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    /* 存储不可用时静默降级，不影响当前会话 */
  }
}

const intentTone: Record<IntentCheck['level'], string> = {
  info: 'border-[#CFDCE8] bg-[#F1F5F9] text-[#3D5A73]',
  warn: 'border-[#F0D9B0] bg-[#FDF5EE] text-[#8A5A17]',
  danger: 'border-[#EFC9C2] bg-[#FBEDEB] text-[#93372C]',
};

const formTone: Record<FormVerdict, string> = {
  ok: 'bg-[#EDF4EC] text-[#3F6B45] border-[#CBDDC8]',
  caution: 'bg-[#FDF3E3] text-[#8A5A17] border-[#F0D9B0]',
  no: 'bg-[#FBEDEB] text-[#93372C] border-[#EFC9C2]',
};

const redTone: Record<RedLine['severity'], string> = {
  fatal: 'border-[#EFC9C2] bg-[#FBEDEB] text-[#93372C]',
  serious: 'border-[#F0D9B0] bg-[#FDF5EE] text-[#8A5A17]',
  note: 'border-[#E5DED2] bg-[#F7F4EF] text-[#8A7E6A]',
};

function CheckMark({ active }: { active: boolean }) {
  return (
    <span
      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
        active ? 'border-[#C87941] bg-[#C87941]' : 'border-[#D9C6AC] bg-white'
      }`}
    >
      {active && (
        <svg className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3.5}
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
    </span>
  );
}

export default function WillPrepWizard() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(() => emptyDraft());
  // 挂载时的首次渲染跳过保存，避免用空草稿覆盖已存内容
  const skipFirstSave = useRef(true);

  // 首次挂载后再读本地草稿：服务端渲染没有 localStorage，
  // 若放进 useState 初始化会造成 hydration 不一致。
  useEffect(() => {
    const loaded = loadDraft();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 挂载后读取本地草稿，避免 SSR 与客户端首帧不一致
    setDraft(loaded);
  }, []);

  useEffect(() => {
    if (skipFirstSave.current) {
      skipFirstSave.current = false;
      return;
    }
    saveDraft(draft);
  }, [draft]);

  const toggle = useCallback(
    (key: 'assets' | 'digital' | 'coowners' | 'intents' | 'redlines', id: string) => {
      setDraft(prev => {
        const list = prev[key];
        return {
          ...prev,
          [key]: list.includes(id) ? list.filter(x => x !== id) : [...list, id],
        };
      });
    },
    []
  );

  const reset = useCallback(() => {
    if (!window.confirm('确定清空当前的全部填写？\n\n清空后无法恢复。')) return;
    setDraft(emptyDraft());
    setStep(0);
  }, []);

  const marital = useMemo(
    () => maritalOptions.find(m => m.id === draft.marital) ?? null,
    [draft.marital]
  );
  const chosenForm = useMemo(() => willForms.find(f => f.id === draft.form) ?? null, [draft.form]);
  const pickedAssets = useMemo(
    () => assetCategories.filter(a => draft.assets.includes(a.id)),
    [draft.assets]
  );
  const digitalActive = draft.assets.includes('digital');
  const pickedDigital = useMemo(
    () => DIGITAL_SUB_ITEMS.filter(s => draft.digital.includes(s.id)),
    [draft.digital]
  );
  const chosenPlan = useMemo(
    () => accountPlans.find(p => p.id === draft.accountPlan) ?? null,
    [draft.accountPlan]
  );
  const pickedCoowners = useMemo(
    () => coownerChecks.filter(c => draft.coowners.includes(c.id)),
    [draft.coowners]
  );
  const pickedIntents = useMemo(
    () => intentChecks.filter(i => draft.intents.includes(i.id)),
    [draft.intents]
  );
  const pickedRedLines = useMemo(
    () => redLines.filter(r => draft.redlines.includes(r.id)),
    [draft.redlines]
  );

  const fatalCount = pickedRedLines.filter(r => r.severity === 'fatal').length;
  const progress = ((step + 1) / STEPS.length) * 100;

  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 pt-6 sm:pt-9">
      {/* 进度 */}
      <div className="print:hidden">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
          {STEPS.map((name, i) => (
            <button
              key={name}
              type="button"
              onClick={() => setStep(i)}
              className={`rounded-full px-2.5 py-1 text-[11.5px] font-medium transition ${
                i === step
                  ? 'bg-[#C87941] text-white'
                  : i < step
                    ? 'bg-[#FDF5EE] text-[#A85E2D]'
                    : 'bg-white text-[#B5A48C] hover:text-[#8A7E6A]'
              }`}
            >
              {i + 1}. {name}
            </button>
          ))}
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#E8DFD2]">
          <div
            className="h-full rounded-full bg-[#C87941] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* ── 第一步：资产盘点 ── */}
      {step === 0 && (
        <section className="mt-5 print:hidden">
          <h2 className="font-serif text-2xl font-bold tracking-wide text-[#4A3728]">
            先盘清你有什么
          </h2>
          <p className="mt-2 text-sm leading-[1.85] text-[#6A6256]">
            只勾类别，不填金额。这一步不是为了估值，是让你知道自己名下到底有哪些东西——
            很多人第一次认真盘完，才发现漏了整整一类。
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {assetCategories.map(c => {
              const active = draft.assets.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle('assets', c.id)}
                  className={`rounded-xl border p-3.5 text-left transition ${
                    active
                      ? 'border-[#C87941] bg-[#FDF5EE]'
                      : 'border-[#EDE2D0] bg-white hover:border-[#D9C6AC]'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <CheckMark active={active} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-semibold text-[#4A3728]">
                        {c.name}
                      </span>
                      <span className="mt-0.5 block text-[11.5px] leading-snug text-[#A8927A]">
                        {c.examples}
                      </span>
                      {active && (
                        <span className="mt-1.5 block text-[12.5px] leading-[1.7] text-[#8A5A17]">
                          {c.note}
                        </span>
                      )}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-[12px] leading-[1.7] text-[#A8927A]">
            已勾选 {draft.assets.length} 类。所有内容只存在你的浏览器里，不上传服务器。
          </p>

          {/* 数字资产是唯一需要展开明细的一类：钱在手机里，家人看不见 */}
          {digitalActive && (
            <div className="mt-4 rounded-2xl border border-[#E8D9C2] bg-white p-4 sm:p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="flex items-center gap-2 text-[14px] font-bold text-[#4A3728]">
                  <span className="h-3.5 w-1 rounded-full bg-[#C87941]" />
                  数字资产与账号交代
                </h3>
                <span className="text-[11px] text-[#A8927A]">
                  已选 {pickedDigital.length} / {DIGITAL_SUB_ITEMS.length}
                </span>
              </div>
              <p className="mt-2 text-[12.5px] leading-[1.8] text-[#6A6256]">
                这一类没有任何凭证：没有存折、没有权证，只有一部手机。
                你不在了，家人连「有哪些」都不知道。先把有的勾出来。
              </p>

              <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
                {DIGITAL_SUB_ITEMS.map(s => {
                  const on = draft.digital.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle('digital', s.id)}
                      className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-left transition ${
                        on
                          ? 'border-[#C87941] bg-[#FDF5EE]'
                          : 'border-[#EDE2D0] bg-white hover:border-[#D9C6AC]'
                      }`}
                    >
                      <CheckMark active={on} />
                      <span className="text-[12.5px] leading-snug text-[#4A3728]">{s.name}</span>
                    </button>
                  );
                })}
              </div>

              <h4 className="mt-5 flex items-center gap-2 text-[13.5px] font-bold text-[#4A3728]">
                <span className="h-3 w-1 rounded-full bg-[#C87941]" />
                这些账号，你打算怎么交代
              </h4>
              <p className="mt-1.5 text-[12px] leading-[1.75] text-[#A8927A]">
                三条路，可以只选一条。无论选哪一条，密码都不写进遗嘱正文。
              </p>
              <div className="mt-2.5 space-y-1.5">
                {accountPlans.map(p => {
                  const on = draft.accountPlan === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setDraft(prev => ({ ...prev, accountPlan: on ? null : p.id }))}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-left transition ${
                        on
                          ? 'border-[#C87941] bg-white shadow-sm'
                          : 'border-[#EDE2D0] bg-white hover:border-[#D9C6AC]'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span
                          className={`mt-[3px] flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border ${
                            on ? 'border-[#C87941]' : 'border-[#D9C6AC]'
                          }`}
                        >
                          {on && <span className="h-2 w-2 rounded-full bg-[#C87941]" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] font-semibold text-[#4A3728]">
                            {p.label}
                          </span>
                          {on ? (
                            <>
                              <span className="mt-1 block text-[12.5px] leading-[1.75] text-[#6A6256]">
                                {p.desc}
                              </span>
                              <span className="mt-1.5 block rounded-lg border border-[#F0D9B0] bg-[#FDF5EE] px-3 py-2 text-[12px] leading-[1.75] text-[#8A5A17]">
                                {p.caution}
                              </span>
                            </>
                          ) : (
                            <span className="mt-0.5 block text-[11.5px] leading-snug text-[#A8927A]">
                              {p.brief}
                            </span>
                          )}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── 第二步：析产判断 ── */}
      {step === 1 && (
        <section className="mt-5 print:hidden">
          <h2 className="font-serif text-2xl font-bold tracking-wide text-[#4A3728]">
            哪些真正属于你
          </h2>
          <p className="mt-2 text-sm leading-[1.85] text-[#6A6256]">
            遗嘱只能处分「你自己的」财产。房产写「我的房子」是最常见的失效原因——
            这一页帮你把可处分范围看清楚。
          </p>

          <h3 className="mt-5 flex items-center gap-2 text-[14px] font-bold text-[#4A3728]">
            <span className="h-3.5 w-1 rounded-full bg-[#C87941]" />
            你的婚姻状况
          </h3>
          <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
            {maritalOptions.map(m => {
              const active = draft.marital === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setDraft(prev => ({ ...prev, marital: active ? null : m.id }))}
                  className={`rounded-xl border px-3.5 py-2.5 text-left text-[13px] font-medium transition ${
                    active
                      ? 'border-[#C87941] bg-[#FDF5EE] text-[#A85E2D]'
                      : 'border-[#EDE2D0] bg-white text-[#6A6256] hover:border-[#D9C6AC]'
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>

          {marital && (
            <div className="mt-3 rounded-xl border border-[#F0D9B0] bg-[#FDF5EE] px-3.5 py-3">
              <p className="text-[13px] leading-[1.8] text-[#8A5A17]">
                <span className="font-bold">可处分范围：</span>
                {marital.scope}
              </p>
              <p className="mt-1.5 text-[12.5px] leading-[1.75] text-[#A07A3A]">{marital.caution}</p>
            </div>
          )}

          <h3 className="mt-5 flex items-center gap-2 text-[14px] font-bold text-[#4A3728]">
            <span className="h-3.5 w-1 rounded-full bg-[#C87941]" />
            有没有这些情况
          </h3>
          <div className="mt-2.5 space-y-1.5">
            {coownerChecks.map(c => {
              const active = draft.coowners.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle('coowners', c.id)}
                  className={`flex w-full items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-left transition ${
                    active
                      ? 'border-[#C87941] bg-white shadow-sm'
                      : 'border-[#EDE2D0] bg-white hover:border-[#D9C6AC]'
                  }`}
                >
                  <CheckMark active={active} />
                  <span className="text-[13px] leading-snug text-[#4A3728]">{c.label}</span>
                </button>
              );
            })}
          </div>

          {pickedCoowners.length > 0 && (
            <div className="mt-3 rounded-xl border border-[#EFC9C2] bg-[#FBEDEB] px-3.5 py-3">
              <p className="text-[13px] leading-[1.8] text-[#93372C]">
                命中 {pickedCoowners.length} 项。这些情况意味着某部分财产不能由你单独处分，
                必须先确权或析产，否则写进去也可能被认定无效。
              </p>
            </div>
          )}
        </section>
      )}

      {/* ── 第三步：意愿梳理 ── */}
      {step === 2 && (
        <section className="mt-5 print:hidden">
          <h2 className="font-serif text-2xl font-bold tracking-wide text-[#4A3728]">
            你想怎么安排
          </h2>
          <p className="mt-2 text-sm leading-[1.85] text-[#6A6256]">
            下面这些不是选择题，是提醒清单。勾中的每一项，都对应一条不能忽略的规则。
          </p>
          <div className="mt-4 space-y-1.5">
            {intentChecks.map(item => {
              const active = draft.intents.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle('intents', item.id)}
                  className={`w-full rounded-xl border px-3.5 py-3 text-left transition ${
                    active
                      ? 'border-[#C87941] bg-white shadow-sm'
                      : 'border-[#EDE2D0] bg-white hover:border-[#D9C6AC]'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <CheckMark active={active} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13.5px] leading-snug font-semibold text-[#4A3728]">
                        {item.label}
                      </span>
                      {active && (
                        <span
                          className={`mt-2 block rounded-lg border px-3 py-2 text-[12.5px] leading-[1.75] ${intentTone[item.level]}`}
                        >
                          {item.tip}
                        </span>
                      )}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ── 第四步：形式对照 ── */}
      {step === 3 && (
        <section className="mt-5 print:hidden">
          <h2 className="font-serif text-2xl font-bold tracking-wide text-[#4A3728]">用哪种形式</h2>
          <p className="mt-2 text-sm leading-[1.85] text-[#6A6256]">
            六种形式法律地位平等，但要件各不相同。选一种作为意向，可以随时改。
          </p>
          <div className="mt-4 space-y-2">
            {willForms.map(f => {
              const active = draft.form === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setDraft(prev => ({ ...prev, form: active ? null : f.id }))}
                  className={`w-full rounded-xl border p-3.5 text-left transition ${
                    active
                      ? 'border-[#C87941] bg-white shadow-sm'
                      : 'border-[#EDE2D0] bg-white hover:border-[#D9C6AC]'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[14px] font-bold text-[#4A3728]">{f.name}</span>
                    <span className="rounded-full bg-[#F7F4EF] px-2 py-0.5 text-[10.5px] text-[#A8927A]">
                      {f.article}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10.5px] font-bold ${formTone[f.verdict]}`}
                    >
                      {f.verdictLabel}
                    </span>
                  </div>
                  <div className="mt-2 grid gap-1 text-[12.5px] leading-[1.7] text-[#6A6256] sm:grid-cols-2">
                    <p>
                      <span className="font-semibold text-[#8A7E6A]">谁写：</span>
                      {f.writer}
                    </p>
                    <p>
                      <span className="font-semibold text-[#8A7E6A]">见证人：</span>
                      {f.witness}
                    </p>
                    <p className="sm:col-span-2">
                      <span className="font-semibold text-[#8A7E6A]">签名日期：</span>
                      {f.signing}
                    </p>
                  </div>
                  <p className="mt-1.5 text-[12.5px] leading-[1.75] text-[#93372C]">{f.risk}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-xl border border-[#CFDCE8] bg-[#F1F5F9] px-3.5 py-3">
            <p className="text-[13px] font-bold text-[#3D5A73]">谁不能做见证人（第 1140 条）</p>
            <ul className="mt-1.5 space-y-1">
              {witnessDisqualified.map(w => (
                <li key={w} className="flex gap-2 text-[12.5px] leading-[1.7] text-[#4A6B85]">
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#8FA8BE]" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── 第五步：风险自检 ── */}
      {step === 4 && (
        <section className="mt-5 print:hidden">
          <h2 className="font-serif text-2xl font-bold tracking-wide text-[#4A3728]">
            八条红线，逐条自检
          </h2>
          <p className="mt-2 text-sm leading-[1.85] text-[#6A6256]">
            命中任何一条，都建议先停下，找公证处或律师核一遍。这些不是理论风险，
            是实际案件里最常见的失效原因。
          </p>
          <div className="mt-4 space-y-1.5">
            {redLines.map(r => {
              const active = draft.redlines.includes(r.id);
              return (
                <button
                  key={r.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle('redlines', r.id)}
                  className={`w-full rounded-xl border px-3.5 py-3 text-left transition ${
                    active
                      ? 'border-[#C87941] bg-white shadow-sm'
                      : 'border-[#EDE2D0] bg-white hover:border-[#D9C6AC]'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <CheckMark active={active} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13.5px] leading-snug font-semibold text-[#4A3728]">
                        {r.label}
                      </span>
                      {active && (
                        <span
                          className={`mt-2 block rounded-lg border px-3 py-2 text-[12.5px] leading-[1.75] ${redTone[r.severity]}`}
                        >
                          {r.consequence}
                        </span>
                      )}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {fatalCount > 0 && (
            <div className="mt-3 rounded-xl border border-[#EFC9C2] bg-[#FBEDEB] px-3.5 py-3">
              <p className="text-[13px] leading-[1.8] font-semibold text-[#93372C]">
                命中 {fatalCount} 条致命红线。这几条会直接导致遗嘱无效或部分无效，
                不建议自己动手，先咨询专业人士。
              </p>
            </div>
          )}
          {pickedRedLines.length === 0 && (
            <p className="mt-3 text-[12.5px] leading-[1.75] text-[#8A7E6A]">
              一条都没勾，说明你的情形相对简单。但「没勾」不等于「没问题」，
              最终仍建议找公证处核一遍形式要件。
            </p>
          )}
        </section>
      )}

      {/* ── 第六步：准备备忘 ── */}
      {step === 5 && (
        <section className="mt-5">
          <div className="print:hidden">
            <h2 className="font-serif text-2xl font-bold tracking-wide text-[#4A3728]">
              你的《遗嘱准备备忘》
            </h2>
            <p className="mt-2 text-sm leading-[1.85] text-[#6A6256]">
              这不是遗嘱，是一份可以带去公证处或律师那里的梳理结果。
              打印出来，比空手去问效率高得多。
            </p>
          </div>

          <article className="mt-4 rounded-2xl border border-[#E8D9C2] bg-white px-5 py-6 sm:px-7 sm:py-8">
            <header className="border-b border-[#EDE2D0] pb-4">
              <h3 className="font-serif text-xl font-bold tracking-wide text-[#4A3728]">
                遗嘱准备备忘
              </h3>
              <p className="mt-1 text-[12px] text-[#A8927A]">生成日期：{today}</p>
            </header>

            <div className="mt-5 space-y-5">
              <div>
                <h4 className="text-[13px] font-bold tracking-[0.08em] text-[#C87941]">
                  一、已识别的财产类别
                </h4>
                {pickedAssets.length > 0 ? (
                  <ul className="mt-2 space-y-1">
                    {pickedAssets.map(a => (
                      <li
                        key={a.id}
                        className="flex gap-2 text-[13px] leading-[1.75] text-[#4A3728]"
                      >
                        <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#C87941]" />
                        <span>
                          <span className="font-semibold">{a.name}</span>
                          <span className="text-[#8A7E6A]">（{a.examples}）</span>
                          {a.id === 'digital' &&
                            (pickedDigital.length > 0 ? (
                              <span className="mt-1 block text-[12.5px] leading-[1.7] text-[#6A6256]">
                                明细：{pickedDigital.map(s => s.name).join('、')}
                              </span>
                            ) : (
                              <span className="mt-1 block text-[12px] text-[#A8927A]">
                                明细未勾选——建议至少留下账号清单。
                              </span>
                            ))}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-[13px] text-[#A8927A]">尚未盘点。</p>
                )}
              </div>

              <div>
                <h4 className="text-[13px] font-bold tracking-[0.08em] text-[#C87941]">
                  二、可处分范围
                </h4>
                {marital ? (
                  <div className="mt-2 space-y-1.5">
                    <p className="text-[13px] leading-[1.8] text-[#4A3728]">
                      <span className="font-semibold">婚姻状况：</span>
                      {marital.label}。{marital.scope}
                    </p>
                    <p className="text-[12.5px] leading-[1.75] text-[#8A7E6A]">{marital.caution}</p>
                    {pickedCoowners.length > 0 && (
                      <ul className="mt-1 space-y-1">
                        {pickedCoowners.map(c => (
                          <li
                            key={c.id}
                            className="flex gap-2 text-[12.5px] leading-[1.75] text-[#93372C]"
                          >
                            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#D09A93]" />
                            <span>{c.label}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-[13px] text-[#A8927A]">尚未填写。</p>
                )}
              </div>

              <div>
                <h4 className="text-[13px] font-bold tracking-[0.08em] text-[#C87941]">
                  三、意愿要点
                </h4>
                {pickedIntents.length > 0 || chosenPlan ? (
                  <ul className="mt-2 space-y-2">
                    {chosenPlan && (
                      <li className="text-[13px] leading-[1.75] text-[#4A3728]">
                        <span className="font-semibold">· 数字资产的交代方式：{chosenPlan.label}</span>
                        <span className="mt-0.5 block text-[12.5px] text-[#8A7E6A]">
                          {chosenPlan.desc}
                        </span>
                        <span className="mt-0.5 block text-[12px] text-[#8A5A17]">
                          注意：{chosenPlan.caution}
                        </span>
                      </li>
                    )}
                    {pickedIntents.map(i => (
                      <li key={i.id} className="text-[13px] leading-[1.75] text-[#4A3728]">
                        <span className="font-semibold">· {i.label}</span>
                        <span className="mt-0.5 block text-[12.5px] text-[#8A7E6A]">{i.tip}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-[13px] text-[#A8927A]">
                    尚未勾选意向，也未选择账号交代方式。
                  </p>
                )}
              </div>

              <div>
                <h4 className="text-[13px] font-bold tracking-[0.08em] text-[#C87941]">
                  四、拟采用的形式
                </h4>
                {chosenForm ? (
                  <div className="mt-2 text-[13px] leading-[1.8] text-[#4A3728]">
                    <p className="font-semibold">
                      {chosenForm.name}
                      <span className="ml-2 text-[11.5px] font-normal text-[#A8927A]">
                        {chosenForm.article}
                      </span>
                    </p>
                    <p className="mt-0.5 text-[12.5px] text-[#6A6256]">
                      谁写：{chosenForm.writer}；见证人：{chosenForm.witness}。
                    </p>
                    <p className="mt-0.5 text-[12.5px] text-[#6A6256]">
                      签名与日期：{chosenForm.signing}。
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 text-[13px] text-[#A8927A]">尚未选择。</p>
                )}
              </div>

              <div>
                <h4 className="text-[13px] font-bold tracking-[0.08em] text-[#C87941]">
                  五、需要留意的红线
                </h4>
                {pickedRedLines.length > 0 ? (
                  <ul className="mt-2 space-y-2">
                    {pickedRedLines.map(r => (
                      <li key={r.id} className="text-[13px] leading-[1.75] text-[#93372C]">
                        <span className="font-semibold">· {r.label}</span>
                        <span className="mt-0.5 block text-[12.5px] text-[#8A6A66]">
                          {r.consequence}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-[13px] text-[#A8927A]">未命中任何红线。</p>
                )}
              </div>

              <div>
                <h4 className="text-[13px] font-bold tracking-[0.08em] text-[#C87941]">
                  六、下一步待办
                </h4>
                <ol className="mt-2 space-y-1">
                  {memoNextSteps.map((s, i) => (
                    <li key={s} className="flex gap-2.5 text-[13px] leading-[1.75] text-[#4A3728]">
                      <span className="shrink-0 font-semibold text-[#C87941]">{i + 1}.</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <footer className="mt-6 border-t border-[#EDE2D0] pt-3">
              <p className="text-[11.5px] leading-[1.7] text-[#A8927A]">{memoDisclaimer}</p>
            </footer>
          </article>

          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#C87941] px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-[#A85E2D]"
            >
              打印备忘
            </button>
            <Link
              href="/tools/will-templates"
              className="inline-flex items-center justify-center rounded-full border border-[#E8D9C2] bg-white px-6 py-3 text-sm font-medium text-[#6A6256] transition-all hover:border-[#C87941] hover:text-[#C87941]"
            >
              去看三份范本
            </Link>
          </div>
        </section>
      )}

      {/* 底部导航 */}
      <div className="mt-5 flex items-center justify-between gap-3 print:hidden">
        <button
          type="button"
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-full border border-[#E8D9C2] bg-white px-5 py-2.5 text-[13px] font-medium text-[#6A6256] transition hover:border-[#C87941] hover:text-[#C87941] disabled:cursor-not-allowed disabled:opacity-40"
        >
          上一步
        </button>
        <button
          type="button"
          onClick={reset}
          className="text-[12px] text-[#B5A48C] transition hover:text-[#93372C]"
        >
          清空重填
        </button>
        <button
          type="button"
          onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}
          disabled={step === STEPS.length - 1}
          className="rounded-full bg-[#C87941] px-5 py-2.5 text-[13px] font-bold text-white shadow-sm transition hover:bg-[#A85E2D] disabled:cursor-not-allowed disabled:opacity-40"
        >
          下一步
        </button>
      </div>
    </div>
  );
}
