'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ceremonyFormats,
  restingPlaces,
  epitaphStyles,
  photoStyles,
  hostOptions,
  musicOptions,
  loadFarewellData,
  saveFarewellData,
  getDefaultData,
  type FarewellStyleData,
} from '@/data/farewell-style/farewellStyleData';

// ── 步骤定义 ──
const STEPS = [
  { id: 0, title: '告别仪式', subtitle: '你希望怎样被记住' },
  { id: 1, title: '归处选择', subtitle: '生命最后的落脚点' },
  { id: 2, title: '一句话总结', subtitle: '你的专属告别语' },
  { id: 3, title: '形象定格', subtitle: '留给世界的最后一面' },
  { id: 4, title: '送行团队', subtitle: '谁来主持你的告别' },
  { id: 5, title: '背景音乐', subtitle: '属于你的旋律' },
];

// ── 卡片选择组件 ──
function CardSelector<T extends { id: string; label: string; description: string; icon: string; tags?: string[]; funFact?: string }>({
  options,
  value,
  onChange,
  columns = 2,
}: {
  options: T[];
  value: string;
  onChange: (id: string) => void;
  columns?: number;
}) {
  return (
    <div className={`grid gap-3 ${columns === 3 ? 'sm:grid-cols-3' : columns === 1 ? '' : 'sm:grid-cols-2'}`}>
      {options.map((opt) => {
        const isActive = value === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`flex flex-col items-start rounded-xl border p-4 text-left transition-all ${
              isActive
                ? 'border-[#C87941] bg-[#FDF5EE] shadow-sm'
                : 'border-[#E8D9C2] bg-white hover:border-[#C87941]/50'
            }`}
          >
            <div className="flex w-full items-center gap-2">
              <span className="text-xl">{opt.icon}</span>
              <span className={`text-sm font-bold ${isActive ? 'text-[#C87941]' : 'text-[#4A3728]'}`}>
                {opt.label}
              </span>
              {opt.tags && opt.tags.length > 0 && (
                <span className="ml-auto rounded-full bg-[#F5F0E8] px-2 py-0.5 text-[10px] text-[#8A7E6A]">
                  {opt.tags[0]}
                </span>
              )}
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-[#5A5A5A]">{opt.description}</p>
            {opt.funFact && (
              <p className="mt-1.5 text-[10px] text-[#C87941]">💡 {opt.funFact}</p>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── 主页面 ──
export default function FarewellStylePage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FarewellStyleData>(getDefaultData());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setData(loadFarewellData());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveFarewellData(data);
  }, [data, loaded]);

  const update = <K extends keyof FarewellStyleData>(key: K, value: FarewellStyleData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const canProceed = () => {
    switch (step) {
      case 0: return !!data.ceremonyFormat;
      case 1: return !!data.restingPlace;
      case 2: return !!data.epitaphStyle;
      case 3: return !!data.photoStyle;
      case 4: return !!data.host;
      case 5: return !!data.music;
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] pb-20">
      <nav className="sticky top-0 z-50 border-b border-[#E8D9C2]/50 bg-white/80 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/chapter/chapter-4" className="text-sm font-medium text-[#8A7E6A] hover:text-[#C87941]">
            ← 返回好好告别
          </Link>
          <h1 className="text-sm font-bold text-[#4A3728]">告别的方式</h1>
          <div className="w-20" />
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-4 pt-8">
        {/* 标题 */}
        <header className="mb-6 text-center">
          <div className="mb-3 inline-block rounded-full bg-[#FDF5EE] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C87941]">
            My Farewell Style
          </div>
          <h2 className="text-2xl font-bold text-[#4A3728]">你希望怎样被记住？</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#8A7E6A]">
            这不是一份悲伤的清单，而是你留给世界的最后一份创意简报。<br className="hidden sm:block" />
            用你喜欢的方式，设计属于你的告别。
          </p>
        </header>

        {/* 步骤指示器 */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-1">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                <button
                  onClick={() => setStep(i)}
                  className={`flex flex-col items-center rounded-lg px-2 py-1.5 sm:px-2.5 sm:py-2 transition-all ${
                    i === step
                      ? 'bg-[#C87941] text-white shadow-md'
                      : i < step
                        ? 'bg-[#C87941]/10 text-[#C87941]'
                        : 'bg-white text-[#8A7E6A]'
                  }`}
                >
                  <span className="text-xs font-bold">{i + 1}</span>
                  <span className="mt-0.5 text-[9px] font-medium whitespace-nowrap">{s.title}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`h-px w-3 ${i < step ? 'bg-[#C87941]' : 'bg-[#E8D9C2]'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* 步骤内容 */}
        {step < STEPS.length && (
        <div className="rounded-2xl border border-[#E8D9C2] bg-white p-6 shadow-sm">
          <h3 className="mb-1 text-lg font-bold text-[#4A3728]">{STEPS[step].title}</h3>
          <p className="mb-6 text-sm text-[#8A7E6A]">{STEPS[step].subtitle}</p>

          {/* Step 0: 告别仪式 */}
          {step === 0 && (
            <div className="space-y-6">
              <p className="text-sm text-[#5A5A5A]">
                告别不一定非要悲伤。它可以是一场派对、一次旅行、一个安静的拥抱——由你定义。
              </p>
              <CardSelector
                options={ceremonyFormats}
                value={data.ceremonyFormat}
                onChange={(v) => update('ceremonyFormat', v)}
              />
              {data.ceremonyFormat === 'custom' && (
                <div>
                  <label className="mb-1 block text-xs text-[#8A7E6A]">描述你心目中的告别方式</label>
                  <textarea
                    value={data.ceremonyCustom}
                    onChange={(e) => update('ceremonyCustom', e.target.value)}
                    placeholder="例如：我想在海边办一场篝火晚会，大家围坐在一起分享和我的回忆..."
                    rows={3}
                    className="w-full resize-none rounded-lg border border-[#E8D9C2] bg-white px-3 py-2 text-sm text-[#4A3728] outline-none focus:border-[#C87941]"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 1: 归处选择 */}
          {step === 1 && (
            <div className="space-y-6">
              <p className="text-sm text-[#5A5A5A]">
                生命的终点不是消失，而是换一种存在方式。你希望自己的「归处」在哪里？
              </p>
              <CardSelector
                options={restingPlaces}
                value={data.restingPlace}
                onChange={(v) => update('restingPlace', v)}
              />
              {data.restingPlace === 'custom' && (
                <div>
                  <label className="mb-1 block text-xs text-[#8A7E6A]">描述你理想的归处</label>
                  <textarea
                    value={data.restingCustom}
                    onChange={(e) => update('restingCustom', e.target.value)}
                    placeholder="例如：我想被做成一棵樱花树，种在老家的院子里..."
                    rows={3}
                    className="w-full resize-none rounded-lg border border-[#E8D9C2] bg-white px-3 py-2 text-sm text-[#4A3728] outline-none focus:border-[#C87941]"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 2: 墓志铭 */}
          {step === 2 && (
            <div className="space-y-6">
              <p className="text-sm text-[#5A5A5A]">
                如果只能留一句话给这个世界，你会说什么？选一个风格，或者自己写一句。
              </p>
              <CardSelector
                options={epitaphStyles}
                value={data.epitaphStyle}
                onChange={(v) => update('epitaphStyle', v)}
                columns={3}
              />
              {data.epitaphStyle && (
                <div>
                  <p className="mb-2 text-xs text-[#8A7E6A]">
                    {epitaphStyles.find((s) => s.id === data.epitaphStyle)?.examples.length
                      ? '参考文案（可直接选用或修改）'
                      : '写下你的告别语'}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {epitaphStyles
                      .find((s) => s.id === data.epitaphStyle)
                      ?.examples.map((ex, i) => (
                        <button
                          key={i}
                          onClick={() => update('epitaphText', ex)}
                          className={`rounded-full border px-3 py-1 text-xs transition-all ${
                            data.epitaphText === ex
                              ? 'border-[#C87941] bg-[#FDF5EE] font-medium text-[#C87941]'
                              : 'border-[#E8D9C2] bg-white text-[#5A5A5A] hover:border-[#C87941]/50'
                          }`}
                        >
                          {ex}
                        </button>
                      ))}
                  </div>
                  <label className="mb-1 block text-xs text-[#8A7E6A]">你的告别语（可直接选用上方，或自己写）</label>
                  <input
                    type="text"
                    value={data.epitaphText}
                    onChange={(e) => update('epitaphText', e.target.value)}
                    placeholder="写下你想留给世界的最后一句话..."
                    maxLength={50}
                    className="w-full rounded-lg border border-[#E8D9C2] bg-white px-3 py-2 text-sm text-[#4A3728] outline-none focus:border-[#C87941]"
                  />
                  {data.epitaphText && (
                    <p className="mt-2 text-center text-sm italic text-[#C87941]">
                      「{data.epitaphText}」
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: 遗照风格 */}
          {step === 3 && (
            <div className="space-y-6">
              <p className="text-sm text-[#5A5A5A]">
                如果告别时要放一张照片，你希望人们看到的是怎样的你？
              </p>
              <CardSelector
                options={photoStyles}
                value={data.photoStyle}
                onChange={(v) => update('photoStyle', v)}
                columns={3}
              />
              {data.photoStyle === 'custom' && (
                <div>
                  <label className="mb-1 block text-xs text-[#8A7E6A]">描述你想要的形象</label>
                  <input
                    type="text"
                    value={data.photoCustom}
                    onChange={(e) => update('photoCustom', e.target.value)}
                    placeholder="例如：我想用一张骑摩托车的照片..."
                    className="w-full rounded-lg border border-[#E8D9C2] bg-white px-3 py-2 text-sm text-[#4A3728] outline-none focus:border-[#C87941]"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 4: 主持人 */}
          {step === 4 && (
            <div className="space-y-6">
              <p className="text-sm text-[#5A5A5A]">
                你希望谁来主持你的告别仪式？选一个最能代表你的人。
              </p>
              <CardSelector
                options={hostOptions}
                value={data.host}
                onChange={(v) => update('host', v)}
                columns={2}
              />
              {data.host === 'custom' && (
                <div>
                  <label className="mb-1 block text-xs text-[#8A7E6A]">你希望谁来主持？</label>
                  <input
                    type="text"
                    value={data.hostCustom}
                    onChange={(e) => update('hostCustom', e.target.value)}
                    placeholder="例如：我的大学室友，他最会讲段子..."
                    className="w-full rounded-lg border border-[#E8D9C2] bg-white px-3 py-2 text-sm text-[#4A3728] outline-none focus:border-[#C87941]"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 5: 背景音乐 */}
          {step === 5 && (
            <div className="space-y-6">
              <p className="text-sm text-[#5A5A5A]">
                如果你的告别有背景音乐，你希望响起的是什么旋律？
              </p>
              <CardSelector
                options={musicOptions}
                value={data.music}
                onChange={(v) => update('music', v)}
                columns={2}
              />
              {data.music === 'custom' && (
                <div>
                  <label className="mb-1 block text-xs text-[#8A7E6A]">你想放什么歌/曲子？</label>
                  <input
                    type="text"
                    value={data.musicCustom}
                    onChange={(e) => update('musicCustom', e.target.value)}
                    placeholder="例如：朴树《平凡之路》..."
                    className="w-full rounded-lg border border-[#E8D9C2] bg-white px-3 py-2 text-sm text-[#4A3728] outline-none focus:border-[#C87941]"
                  />
                </div>
              )}

              {/* 补充说明 */}
              <div>
                <label className="mb-1 block text-xs text-[#8A7E6A]">还有什么想补充的吗？（可选）</label>
                <textarea
                  value={data.additionalNotes}
                  onChange={(e) => update('additionalNotes', e.target.value)}
                  placeholder="任何关于你告别方式的想法，都可以写在这里..."
                  rows={3}
                  className="w-full resize-none rounded-lg border border-[#E8D9C2] bg-white px-3 py-2 text-sm text-[#4A3728] outline-none focus:border-[#C87941]"
                />
              </div>
            </div>
          )}

          {/* 步骤导航 */}
          <div className="mt-8 flex items-center justify-between border-t border-[#E8D9C2] pt-6">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="rounded-lg border border-[#E8D9C2] bg-white px-5 py-2.5 text-sm font-medium text-[#4A3728] transition-all hover:border-[#C87941] disabled:opacity-40"
            >
              上一步
            </button>
            <span className="text-xs text-[#B8A888]">{step + 1} / {STEPS.length}</span>
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="rounded-lg bg-[#C87941] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#A85E2D] disabled:opacity-40"
              >
                下一步
              </button>
            ) : (
              <button
                onClick={() => setStep(STEPS.length)}
                disabled={!canProceed()}
                className="rounded-lg bg-[#C87941] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#A85E2D] disabled:opacity-40"
              >
                预览我的安排
              </button>
            )}
          </div>
        </div>
        )}

        {/* 预览（第 6 步之后） */}
        {step === STEPS.length && (
          <div className="mt-8 space-y-6">
            <div className="text-center">
              <span className="inline-block rounded-full bg-[#FDF5EE] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C87941]">
                My Farewell Arrangement
              </span>
              <h3 className="mt-3 text-2xl font-bold text-[#4A3728]">你的告别安排</h3>
              <p className="mt-1 text-sm text-[#8A7E6A]">这份安排可以随时修改，人生在变，告别也可以跟着变。</p>
            </div>

            {/* 告别仪式 */}
            <div className="rounded-xl border border-[#E8D9C2] bg-white p-5 shadow-sm">
              <h4 className="mb-3 text-sm font-bold text-[#4A3728]">🎭 告别仪式</h4>
              <p className="text-sm text-[#5A5A5A]">
                {ceremonyFormats.find((f) => f.id === data.ceremonyFormat)?.label}
                {data.ceremonyFormat === 'custom' && data.ceremonyCustom && `：${data.ceremonyCustom}`}
              </p>
            </div>

            {/* 归处 */}
            <div className="rounded-xl border border-[#E8D9C2] bg-white p-5 shadow-sm">
              <h4 className="mb-3 text-sm font-bold text-[#4A3728]">🌏 归处选择</h4>
              <p className="text-sm text-[#5A5A5A]">
                {restingPlaces.find((f) => f.id === data.restingPlace)?.label}
                {data.restingPlace === 'custom' && data.restingCustom && `：${data.restingCustom}`}
              </p>
            </div>

            {/* 墓志铭 */}
            {data.epitaphText && (
              <div className="rounded-xl border border-[#C87941]/20 bg-[#FDF5EE] p-5 text-center">
                <h4 className="mb-3 text-sm font-bold text-[#4A3728]">✍️ 你的告别语</h4>
                <p className="text-lg italic font-medium text-[#C87941]">「{data.epitaphText}」</p>
              </div>
            )}

            {/* 遗照 */}
            <div className="rounded-xl border border-[#E8D9C2] bg-white p-5 shadow-sm">
              <h4 className="mb-3 text-sm font-bold text-[#4A3728]">📸 形象定格</h4>
              <p className="text-sm text-[#5A5A5A]">
                {photoStyles.find((f) => f.id === data.photoStyle)?.label}
                {data.photoStyle === 'custom' && data.photoCustom && `：${data.photoCustom}`}
              </p>
            </div>

            {/* 主持人 */}
            <div className="rounded-xl border border-[#E8D9C2] bg-white p-5 shadow-sm">
              <h4 className="mb-3 text-sm font-bold text-[#4A3728]">🎤 送行团队</h4>
              <p className="text-sm text-[#5A5A5A]">
                {hostOptions.find((f) => f.id === data.host)?.label}
                {data.host === 'custom' && data.hostCustom && `：${data.hostCustom}`}
              </p>
            </div>

            {/* 音乐 */}
            <div className="rounded-xl border border-[#E8D9C2] bg-white p-5 shadow-sm">
              <h4 className="mb-3 text-sm font-bold text-[#4A3728]">🎵 背景音乐</h4>
              <p className="text-sm text-[#5A5A5A]">
                {musicOptions.find((f) => f.id === data.music)?.label}
                {data.music === 'custom' && data.musicCustom && `：${data.musicCustom}`}
              </p>
            </div>

            {/* 补充 */}
            {data.additionalNotes && (
              <div className="rounded-xl border border-[#E8D9C2] bg-white p-5 shadow-sm">
                <h4 className="mb-3 text-sm font-bold text-[#4A3728]">📝 补充说明</h4>
                <p className="text-sm text-[#5A5A5A] whitespace-pre-line">{data.additionalNotes}</p>
              </div>
            )}

            {/* 核心提示 */}
            <div className="rounded-xl border border-[#C87941]/20 bg-[#FDF5EE] p-5 text-center">
              <p className="text-sm font-medium leading-relaxed text-[#4A3728]">
                这份安排是你留给世界的一份创意简报。<br />
                你可以随时回来修改它——人生在变，告别也可以跟着变。
              </p>
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setStep(0)}
                className="rounded-xl border border-[#C87941] bg-white px-6 py-3 text-sm font-bold text-[#C87941] transition-all hover:bg-[#FDF5EE]"
              >
                修改安排
              </button>
              <Link
                href="/chapter/chapter-4"
                className="rounded-xl bg-[#C87941] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#A85E2D]"
              >
                返回章节
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
