'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

const GAME_SRC = '/games/erhe-baidao.html';

/**
 * 二河白道 · 跑酷
 *
 * 游戏本体是零外部请求的单文件（public/games/erhe-baidao.html），
 * 这里只负责一个说明栏 + 一个占满剩余视口的 iframe。
 * 不做内嵌到内容页，是因为 1MB + WebGL 会拖慢那个页面，而且跑酷要横屏才好玩。
 */
export default function ErheBaidaoPage() {
  const { i18n } = useTranslation();
  const isEn = !(i18n.language || 'zh-CN').startsWith('zh');

  return (
    // iframe 内部的 env(safe-area-inset-*) 恒为 0，底部摇杆会压到 iPhone 的 home 指示条，
    // 所以在容器上补安全区（border-box，不会溢出）。
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col bg-[#0d0b0a] pb-[env(safe-area-inset-bottom)]">
      {/* ── 说明栏 ── */}
      {/* 手机上必须保持一行：长文用 min-w-0 + truncate 兜底，
          否则 flex-wrap 里 flex-1 会被压到 0 宽、文字竖排成一列，把 iframe 挤没。 */}
      <div className="shrink-0 border-b border-[#2A2320] bg-[#151110]">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-2 sm:px-6 sm:py-2.5">
          <Link
            href="/about-simon/content"
            scroll={false}
            className="shrink-0 text-xs text-[#A08D82] transition-colors hover:text-[#E8C87A]"
          >
            ← {isEn ? 'Content' : '内容作品'}
          </Link>
          <span className="shrink-0 text-[#3A302B]">|</span>

          <h1 className="as-serif shrink-0 text-sm font-bold text-[#E8C87A] sm:text-base">
            {isEn ? 'Two Rivers, One White Path' : '二河白道'}
          </h1>

          <p className="hidden min-w-0 flex-1 truncate text-[11.5px] leading-relaxed text-[#C4B3A8] md:block">
            {isEn
              ? 'Between the river of greed and the river of anger there is only one white path, four or five inches wide. Stay on it.'
              : '水河是贪爱，火河是嗔憎——中间只有一条白道，宽不过四五寸。向西跑，别掉下去，也别被两岸带走。'}
          </p>

          <div className="hidden shrink-0 items-center gap-1.5 text-[10px] text-[#A08D82] lg:flex">
            <kbd className="rounded border border-[#3A302B] px-1.5 py-0.5 font-mono">W A S D</kbd>
            <span>{isEn ? 'move' : '移动'}</span>
            <kbd className="ml-2 rounded border border-[#3A302B] px-1.5 py-0.5 font-mono">Space</kbd>
            <span>{isEn ? 'jump' : '跳'}</span>
            <kbd className="ml-2 rounded border border-[#3A302B] px-1.5 py-0.5 font-mono">Shift</kbd>
            <span>{isEn ? 'sprint' : '冲刺'}</span>
          </div>

          <p className="ml-auto shrink-0 text-[10px] text-[#A08D82] md:hidden">
            {isEn ? 'Rotate for a wider view' : '横屏视野更宽'}
          </p>
        </div>
      </div>

      {/* ── 游戏本体 ── */}
      <div className="min-h-0 flex-1">
        <iframe
          src={GAME_SRC}
          title={isEn ? 'Two Rivers, One White Path' : '二河白道 · 跑酷'}
          className="h-full w-full border-0"
          allow="autoplay; fullscreen; pointer-lock"
        />
      </div>
    </div>
  );
}
