'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLivingWillStore } from '@/stores/livingWillStore';
import { LivingWillData, validateLivingWill } from '@/types/living-will';

const STEPS = [
  { id: 0, title: '医疗服务', desc: '我要或不要什么医疗服务' },
  { id: 1, title: '生命支持', desc: '我希望使用或不使用生命支持治疗' },
  { id: 2, title: '情感意愿', desc: '我希望别人怎么对待我' },
  { id: 3, title: '家人朋友', desc: '我想让我的家人和朋友知道什么' },
  { id: 4, title: '见证签署', desc: '见证人与声明签署' },
  { id: 5, title: '预览完成', desc: '预览与保存' },
];

const WISH1_OPTIONS = [
  { id: 'cpr', label: '心肺复苏（CPR）', desc: '在心脏停跳时，不要对我进行胸外按压、电击除颤等抢救措施' },
  { id: 'intubation', label: '气管插管', desc: '不要为我插入气管导管连接呼吸机' },
  { id: 'dialysis', label: '透析治疗', desc: '在肾衰竭时，不要为我进行血液透析或腹膜透析' },
  { id: 'surgery', label: '创伤性手术', desc: '不要进行大型创伤性手术以延长生命' },
  { id: 'antibiotics', label: '强效抗生素', desc: '仅使用缓解痛苦的药物，不使用单纯延长生命的强效抗生素' },
  { id: 'feeding-tube', label: '鼻胃管/胃造瘘', desc: '当无法自主进食时，不要通过管道强制喂食' },
  { id: 'iv-fluids', label: '静脉输液', desc: '不要仅为了维持生命体征而持续输液' },
];

const WISH2_ABANDON_OPTIONS = [
  { id: 'ventilator', label: '呼吸机', desc: '依靠机器维持呼吸' },
  { id: 'dialysis-machine', label: '透析机', desc: '依靠机器维持肾脏功能' },
  { id: 'feeding-machine', label: '营养泵', desc: '依靠机器强制输送营养' },
  { id: 'cardiac-pacing', label: '心脏起搏器', desc: '依靠电子装置维持心跳' },
];

const SCENARIO_OPTIONS = [
  { value: 'yes' as const, label: '同意不使用', desc: '在医生判断无治愈希望时，同意放弃上述生命支持治疗' },
  { value: 'no' as const, label: '希望继续使用', desc: '在一切情况下，希望尽可能使用生命支持治疗延长生命' },
  { value: 'conditional' as const, label: '视情况而定', desc: '由我的医疗代理人/家属根据当时具体情况决定' },
];

const WISH3_OPTIONS = [
  { id: 'pain-relief', label: '充分的疼痛缓解', desc: '即使可能缩短我的生命，也请给我足够的止痛药让我保持舒适' },
  { id: 'personal-hygiene', label: '保持个人清洁与尊严', desc: '请定期为我清洁身体、更换衣物，维护我作为人的基本尊严' },
  { id: 'religious-ritual', label: '宗教/精神仪式', desc: '如果我属于某个宗教或信仰传统，请在最后时刻安排相应的仪式或祈祷' },
  { id: 'music-company', label: '音乐与陪伴', desc: '请播放我喜欢的音乐，让熟悉的声音陪伴我' },
  { id: 'no-isolation', label: '不要孤立我', desc: '请不要让我独自待在冰冷的ICU病房，允许亲友陪伴在我身边' },
  { id: 'natural-death', label: '允许自然离世', desc: '当死亡来临时，请顺其自然，不要进行无谓的抢救让我支离破碎' },
];

const WISH4_OPTIONS = [
  { id: 'organ-donate', label: '器官捐献意愿', desc: '我愿意在去世后捐献有用的器官帮助他人（请在补充说明中具体说明）' },
  { id: 'body-donate', label: '遗体捐献意愿', desc: '我愿意将遗体捐献给医学事业（请在补充说明中具体说明）' },
  { id: 'funeral-simple', label: '希望简单的告别仪式', desc: '我希望告别仪式从简，不铺张、不喧闹' },
  { id: 'ashes-scatter', label: '骨灰处理方式', desc: '我对骨灰的处理有具体想法（请在补充说明中描述）' },
  { id: 'messages', label: '留给家人的话', desc: '我有特别想对家人朋友说的话（请在补充说明中写下）' },
  { id: 'pet-care', label: '宠物/植物照护', desc: '我有放心不下的宠物或植物，希望有人能继续照顾它们' },
];

function CheckboxGroup({
  options,
  selected,
  onChange,
}: {
  options: { id: string; label: string; desc: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="space-y-3">
      {options.map((opt) => {
        const isSelected = selected.includes(opt.id);
        return (
          <button
            key={opt.id}
            onClick={() => toggle(opt.id)}
            className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all ${
              isSelected
                ? 'border-[#C87941] bg-[#FDF5EE] shadow-sm'
                : 'border-[#E8D9C2] bg-white hover:border-[#C87941]/50'
            }`}
          >
            <div
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                isSelected ? 'border-[#C87941] bg-[#C87941]' : 'border-[#C8B8A0] bg-white'
              }`}
            >
              {isSelected && (
                <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div>
              <div className={`text-sm font-semibold ${isSelected ? 'text-[#C87941]' : 'text-[#4A3728]'}`}>
                {opt.label}
              </div>
              <div className="mt-0.5 text-xs leading-relaxed text-[#8A7E6A]">{opt.desc}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ScenarioRadio({
  value,
  onChange,
}: {
  value: LivingWillData['scenarioTerminal'];
  onChange: (v: LivingWillData['scenarioTerminal']) => void;
}) {
  return (
    <div className="space-y-3">
      {SCENARIO_OPTIONS.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all ${
              isSelected
                ? 'border-[#C87941] bg-[#FDF5EE] shadow-sm'
                : 'border-[#E8D9C2] bg-white hover:border-[#C87941]/50'
            }`}
          >
            <div
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                isSelected ? 'border-[#C87941] bg-[#C87941]' : 'border-[#C8B8A0] bg-white'
              }`}
            >
              {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
            </div>
            <div>
              <div className={`text-sm font-semibold ${isSelected ? 'text-[#C87941]' : 'text-[#4A3728]'}`}>
                {opt.label}
              </div>
              <div className="mt-0.5 text-xs leading-relaxed text-[#8A7E6A]">{opt.desc}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="mt-4">
      <label className="mb-1.5 block text-sm font-medium text-[#4A3728]">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-none rounded-xl border border-[#E8D9C2] bg-white px-4 py-3 text-sm text-[#4A3728] placeholder:text-[#B8A888] focus:border-[#C87941] focus:outline-none focus:ring-1 focus:ring-[#C87941]/20"
      />
    </div>
  );
}

export default function LivingWillPage() {
  const store = useLivingWillStore();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { data } = store;

  const handleSave = async () => {
    const validation = validateLivingWill(data);
    if (!validation.valid) {
      alert('请完成必填项：' + validation.missing.join(', '));
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/living-will', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result: { ...data, completedAt: new Date().toISOString() } }),
      });
      if (res.ok) {
        setSaved(true);
      } else {
        const err = await res.json();
        alert('保存失败：' + (err.error || '未知错误'));
      }
    } catch {
      alert('网络错误，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return true;
      case 1:
        return true;
      case 2:
        return true;
      case 3:
        return true;
      case 4:
        return data.declarationAgreed && data.signName.trim() && data.signDate;
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] pb-20">
      {/* 顶部导航 */}
      <nav className="sticky top-0 z-50 border-b border-[#E8D9C2]/50 bg-white/80 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/chapter/chapter-3" className="text-sm font-medium text-[#8A7E6A] hover:text-[#C87941]">
            ← 返回清楚交代
          </Link>
          <h1 className="text-sm font-bold text-[#4A3728]">生前预嘱</h1>
          <div className="w-20" />
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-4 pt-8">
        {/* 标题区 */}
        <header className="mb-8 text-center">
          <div className="mb-3 inline-block rounded-full bg-[#FDF5EE] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C87941]">
            Living Will
          </div>
          <h2 className="text-2xl font-bold text-[#4A3728]">我的五个愿望</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#8A7E6A]">
            提前明确医疗意愿与临终安排，保护您最后时刻的尊严与选择，<br className="hidden sm:block" />
            让家人在艰难时刻不必猜测您的意愿。
          </p>
        </header>

        {/* 步骤指示器 */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex min-w-max items-center gap-1 px-1">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                <button
                  onClick={() => setStep(i)}
                  className={`flex flex-col items-center rounded-lg px-3 py-2 transition-all ${
                    i === step
                      ? 'bg-[#C87941] text-white shadow-md'
                      : i < step
                        ? 'bg-[#C87941]/10 text-[#C87941]'
                        : 'bg-white text-[#8A7E6A]'
                  }`}
                >
                  <span className="text-xs font-bold">{i + 1}</span>
                  <span className="mt-0.5 text-[10px] font-medium whitespace-nowrap">{s.title}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`h-px w-4 ${i < step ? 'bg-[#C87941]' : 'bg-[#E8D9C2]'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* 步骤内容 */}
        <div className="rounded-2xl border border-[#E8D9C2] bg-white p-6 shadow-sm">
          <h3 className="mb-1 text-lg font-bold text-[#4A3728]">{STEPS[step].title}</h3>
          <p className="mb-6 text-sm text-[#8A7E6A]">{STEPS[step].desc}</p>

          {step === 0 && (
            <div className="space-y-6">
              <div>
                <p className="mb-3 text-sm text-[#5A5A5A]">
                  当我罹患严重疾病、处于疾病终末期或不可逆转的昏迷状态时，<strong className="text-[#4A3728]">我不要</strong>以下医疗服务：
                </p>
                <CheckboxGroup
                  options={WISH1_OPTIONS}
                  selected={data.wish1}
                  onChange={store.setWish1}
                />
              </div>
              <TextArea
                label="补充说明（可选）"
                value={data.wish1Supplement}
                onChange={store.setWish1Supplement}
                placeholder="如果您对上述选项有特殊说明，或还有其他不愿接受的医疗措施，请在此补充..."
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <p className="mb-3 text-sm text-[#5A5A5A]">
                  以下是我可能<strong className="text-[#4A3728]">希望放弃</strong>的生命支持治疗手段：
                </p>
                <CheckboxGroup
                  options={WISH2_ABANDON_OPTIONS}
                  selected={data.wish2Abandon}
                  onChange={store.setWish2Abandon}
                />
              </div>

              <div className="space-y-4 rounded-xl border border-[#E8D9C2] bg-[#FAF8F3] p-4">
                <p className="text-sm font-semibold text-[#4A3728]">在以下具体情境中，我的选择是：</p>

                <div>
                  <p className="mb-2 text-xs font-medium text-[#8A7E6A]">1. 身患绝症、处于疾病终末期</p>
                  <ScenarioRadio value={data.scenarioTerminal} onChange={store.setScenarioTerminal} />
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium text-[#8A7E6A]">2. 处于深度昏迷、无法自主呼吸</p>
                  <ScenarioRadio value={data.scenarioComa} onChange={store.setScenarioComa} />
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium text-[#8A7E6A]">3. 处于持续植物人状态</p>
                  <ScenarioRadio value={data.scenarioVegetative} onChange={store.setScenarioVegetative} />
                </div>
              </div>

              <TextArea
                label="补充说明（可选）"
                value={data.wish2Supplement}
                onChange={store.setWish2Supplement}
                placeholder="例如：希望在家乡医院度过最后时刻、希望在特定宗教场所等..."
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <p className="mb-3 text-sm text-[#5A5A5A]">
                  在我生命的最后时刻，<strong className="text-[#4A3728]">我希望</strong>：
                </p>
                <CheckboxGroup
                  options={WISH3_OPTIONS}
                  selected={data.wish3}
                  onChange={store.setWish3}
                />
              </div>
              <TextArea
                label="补充说明（可选）"
                value={data.wish3Supplement}
                onChange={store.setWish3Supplement}
                placeholder="例如：希望房间保持安静、希望播放特定的音乐、希望身体朝向某个方向等..."
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <p className="mb-3 text-sm text-[#5A5A5A]">
                  关于我的后事与告别，<strong className="text-[#4A3728]">我想让家人和朋友知道</strong>：
                </p>
                <CheckboxGroup
                  options={WISH4_OPTIONS}
                  selected={data.wish4}
                  onChange={store.setWish4}
                />
              </div>
              <TextArea
                label="补充说明（可选）"
                value={data.wish4Supplement}
                onChange={store.setWish4Supplement}
                placeholder="请写下您想对家人朋友说的话、具体的葬礼安排、财产分配意愿等..."
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="rounded-xl border border-[#E8D9C2] bg-[#FAF8F3] p-4">
                <h4 className="mb-3 text-sm font-bold text-[#4A3728]">见证人信息</h4>
                <p className="mb-4 text-xs text-[#8A7E6A]">
                  建议邀请两位见证人在场见证您签署本预嘱。见证人不应是您的继承人或医疗代理人。
                </p>

                <div className="space-y-4">
                  <div className="rounded-lg border border-[#E8D9C2] bg-white p-4">
                    <p className="mb-2 text-xs font-semibold text-[#8A7E6A]">见证人 1</p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <input
                        type="text"
                        placeholder="姓名"
                        value={data.witness1.name}
                        onChange={(e) => store.setWitness1({ name: e.target.value })}
                        className="rounded-lg border border-[#E8D9C2] bg-white px-3 py-2 text-sm text-[#4A3728] placeholder:text-[#B8A888] focus:border-[#C87941] focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="与我的关系"
                        value={data.witness1.relation}
                        onChange={(e) => store.setWitness1({ relation: e.target.value })}
                        className="rounded-lg border border-[#E8D9C2] bg-white px-3 py-2 text-sm text-[#4A3728] placeholder:text-[#B8A888] focus:border-[#C87941] focus:outline-none"
                      />
                      <input
                        type="tel"
                        placeholder="联系电话"
                        value={data.witness1.phone}
                        onChange={(e) => store.setWitness1({ phone: e.target.value })}
                        className="rounded-lg border border-[#E8D9C2] bg-white px-3 py-2 text-sm text-[#4A3728] placeholder:text-[#B8A888] focus:border-[#C87941] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border border-[#E8D9C2] bg-white p-4">
                    <p className="mb-2 text-xs font-semibold text-[#8A7E6A]">见证人 2</p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <input
                        type="text"
                        placeholder="姓名"
                        value={data.witness2.name}
                        onChange={(e) => store.setWitness2({ name: e.target.value })}
                        className="rounded-lg border border-[#E8D9C2] bg-white px-3 py-2 text-sm text-[#4A3728] placeholder:text-[#B8A888] focus:border-[#C87941] focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="与我的关系"
                        value={data.witness2.relation}
                        onChange={(e) => store.setWitness2({ relation: e.target.value })}
                        className="rounded-lg border border-[#E8D9C2] bg-white px-3 py-2 text-sm text-[#4A3728] placeholder:text-[#B8A888] focus:border-[#C87941] focus:outline-none"
                      />
                      <input
                        type="tel"
                        placeholder="联系电话"
                        value={data.witness2.phone}
                        onChange={(e) => store.setWitness2({ phone: e.target.value })}
                        className="rounded-lg border border-[#E8D9C2] bg-white px-3 py-2 text-sm text-[#4A3728] placeholder:text-[#B8A888] focus:border-[#C87941] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#E8D9C2] bg-[#FAF8F3] p-4">
                <h4 className="mb-3 text-sm font-bold text-[#4A3728]">声明与签署</h4>
                <div className="space-y-3 text-xs leading-relaxed text-[#5A5A5A]">
                  <p>
                    我在神志清醒、未受胁迫的状态下，自愿签署本预嘱。我理解这些选择意味着在特定情况下，医疗人员将按照我的意愿减少或停止某些可能延长生命的治疗措施。
                  </p>
                  <p>
                    我了解本预嘱可随时修改或撤销，新的预嘱将自动替代旧的版本。我承诺在做出重大人生决定或健康状况发生显著变化时，及时回顾并更新本预嘱。
                  </p>
                </div>

                <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-[#E8D9C2] bg-white p-3 transition-all hover:border-[#C87941]/50">
                  <input
                    type="checkbox"
                    checked={data.declarationAgreed}
                    onChange={(e) => store.setDeclarationAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#C87941]"
                  />
                  <span className="text-xs font-medium text-[#4A3728]">
                    我已阅读并理解上述声明，确认这是我的真实意愿。
                  </span>
                </label>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#8A7E6A]">签署人姓名</label>
                    <input
                      type="text"
                      value={data.signName}
                      onChange={(e) => store.setSignName(e.target.value)}
                      placeholder="请输入您的姓名"
                      className="w-full rounded-lg border border-[#E8D9C2] bg-white px-3 py-2 text-sm text-[#4A3728] placeholder:text-[#B8A888] focus:border-[#C87941] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#8A7E6A]">签署日期</label>
                    <input
                      type="date"
                      value={data.signDate}
                      onChange={(e) => store.setSignDate(e.target.value)}
                      className="w-full rounded-lg border border-[#E8D9C2] bg-white px-3 py-2 text-sm text-[#4A3728] focus:border-[#C87941] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div className="rounded-xl border border-[#C87941]/20 bg-[#FDF5EE] p-4">
                <h4 className="mb-2 text-sm font-bold text-[#C87941]">预览</h4>
                <p className="text-xs text-[#8A7E6A]">
                  请仔细核对以下内容，确认无误后可保存到账户或打印纸质版备用。
                </p>
              </div>

              <div className="space-y-4 text-sm">
                <PreviewSection title="愿望一：医疗服务" items={data.wish1} map={WISH1_OPTIONS} supplement={data.wish1Supplement} />
                <PreviewSection title="愿望二：生命支持治疗">
                  <div className="mt-2 space-y-2">
                    <p className="text-xs text-[#8A7E6A]">希望放弃：{data.wish2Abandon.length > 0 ? data.wish2Abandon.map(id => WISH2_ABANDON_OPTIONS.find(o => o.id === id)?.label).join('、') : '未选择'}</p>
                    <p className="text-xs text-[#8A7E6A]">终末期：{SCENARIO_OPTIONS.find(o => o.value === data.scenarioTerminal)?.label || '未选择'}</p>
                    <p className="text-xs text-[#8A7E6A]">深度昏迷：{SCENARIO_OPTIONS.find(o => o.value === data.scenarioComa)?.label || '未选择'}</p>
                    <p className="text-xs text-[#8A7E6A]">植物人状态：{SCENARIO_OPTIONS.find(o => o.value === data.scenarioVegetative)?.label || '未选择'}</p>
                    {data.wish2Supplement && <p className="text-xs text-[#5A5A5A]">补充：{data.wish2Supplement}</p>}
                  </div>
                </PreviewSection>
                <PreviewSection title="愿望三：个人情感意愿" items={data.wish3} map={WISH3_OPTIONS} supplement={data.wish3Supplement} />
                <PreviewSection title="愿望四：家人朋友" items={data.wish4} map={WISH4_OPTIONS} supplement={data.wish4Supplement} />
                <PreviewSection title="愿望五：见证与签署">
                  <div className="mt-2 space-y-1 text-xs text-[#8A7E6A]">
                    <p>声明同意：{data.declarationAgreed ? '已同意' : '未同意'}</p>
                    <p>签署人：{data.signName || '未填写'}</p>
                    <p>日期：{data.signDate || '未填写'}</p>
                    <p>见证人1：{data.witness1.name || '未填写'} {data.witness1.relation} {data.witness1.phone}</p>
                    <p>见证人2：{data.witness2.name || '未填写'} {data.witness2.relation} {data.witness2.phone}</p>
                  </div>
                </PreviewSection>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleSave}
                  disabled={saving || saved}
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold text-white transition-all ${
                    saved ? 'bg-emerald-600' : 'bg-[#C87941] hover:bg-[#A85E2D]'
                  } disabled:opacity-60`}
                >
                  {saving ? '保存中...' : saved ? '已保存到账户' : '保存到账户'}
                </button>
                <button
                  onClick={handlePrint}
                  className="flex-1 rounded-xl border border-[#C87941] px-4 py-3 text-sm font-bold text-[#C87941] transition-all hover:bg-[#FDF5EE]"
                >
                  打印 / 存为PDF
                </button>
              </div>
            </div>
          )}

          {/* 步骤导航按钮 */}
          <div className="mt-8 flex items-center justify-between border-t border-[#E8D9C2] pt-6">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="rounded-lg border border-[#E8D9C2] bg-white px-5 py-2.5 text-sm font-medium text-[#4A3728] transition-all hover:border-[#C87941] disabled:opacity-40"
            >
              上一步
            </button>
            <span className="text-xs text-[#B8A888]">
              {step + 1} / {STEPS.length}
            </span>
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}
                className="rounded-lg bg-[#C87941] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#A85E2D]"
              >
                下一步
              </button>
            ) : (
              <button
                onClick={() => setStep(5)}
                disabled={!canProceed()}
                className="rounded-lg bg-[#C87941] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#A85E2D] disabled:opacity-40"
              >
                完成
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function PreviewSection({
  title,
  children,
  items,
  map,
  supplement,
}: {
  title: string;
  children?: React.ReactNode;
  items?: string[];
  map?: { id: string; label: string }[];
  supplement?: string;
}) {
  return (
    <div className="rounded-lg border border-[#E8D9C2] bg-[#FAF8F3] p-4">
      <h5 className="text-xs font-bold uppercase tracking-wider text-[#C87941]">{title}</h5>
      {items !== undefined && map !== undefined && (
        <div className="mt-2">
          {items.length > 0 ? (
            <ul className="space-y-1">
              {items.map((id) => {
                const found = map.find((o) => o.id === id);
                return found ? (
                  <li key={id} className="text-xs text-[#5A5A5A]">• {found.label}</li>
                ) : null;
              })}
            </ul>
          ) : (
            <p className="text-xs text-[#B8A888]">未选择</p>
          )}
          {supplement && <p className="mt-2 text-xs text-[#5A5A5A]">补充：{supplement}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
