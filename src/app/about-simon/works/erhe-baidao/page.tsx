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
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col bg-[#0d0b0a]">
      {/* ── 说明栏 ── */}
      <div className="shrink-0 border-b border-[#2A2320] bg-[#151110]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6">
          <Link
            href="/about-simon/content"
            scroll={false}
            className="shrink-0 text-xs text-[#A08D82] transition-colors hover:text-[#E8C87A]"
          >
            ← {isEn ? 'Content' : '内容作品'}
          </Link>
          <span className="shrink-0 text-[#3A302B]">|</span>

          <h1 className="as-serif shrink-0 text-base font-bold text-[#E8C87A]">
            {isEn ? 'Two Rivers, One White Path' : '二河白道'}
          </h1>
          <p className="min-w-0 flex-1 text-[11.5px] leading-relaxed text-[#C4B3A8]">
            {isEn
              ? 'Between the river of greed and the river of anger there is only one white path, four or five inches wide. Stay on it.'
              : '水河是贪爱，火河是嗔憎——中间只有一条白道，宽不过四五寸。向西跑，别掉下去，也别被两岸带走。'}
          </p>

          <div className="hidden shrink-0 items-center gap-1.5 text-[10px] text-[#A08D82] md:flex">
            <kbd className="rounded border border-[#3A302B] px-1.5 py-0.5 font-mono">W A S D</kbd>
            <span>{isEn ? 'move' : '移动'}</span>
            <kbd className="ml-2 rounded border border-[#3A302B] px-1.5 py-0.5 font-mono">Space</kbd>
            <span>{isEn ? 'jump' : '跳'}</span>
            <kbd className="ml-2 rounded border border-[#3A302B] px-1.5 py-0.5 font-mono">Shift</kbd>
            <span>{isEn ? 'sprint' : '冲刺'}</span>
          </div>
          <p className="shrink-0 text-[10px] text-[#A08D82] md:hidden">
            {isEn ? 'Left stick to move · drag right side to look' : '左摇杆移动 · 右半屏拖动视角'}
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
