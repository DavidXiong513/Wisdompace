'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

// 带版本号：手机 WebView 对同名 HTML 的缓存很顽固，换一个 query 才能确保拿到新构建
const GAME_URL = '/games/erhe-baidao.html?v=6';

/**
 * 「桌面 = 精细指针 + 宽屏」。
 * 这个条件同时被 matchMedia 和下面面板上的 CSS 断点使用，两处必须一字不差，
 * 否则会出现「CSS 已经藏起来了、JS 却没切桌面」的空白区。
 */
const DESKTOP_MQ = '(pointer: fine) and (min-width: 768px)';

function subscribeDesktop(onChange: () => void) {
  const mq = window.matchMedia(DESKTOP_MQ);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}
const getIsDesktop = () => window.matchMedia(DESKTOP_MQ).matches;
/** 服务端一律按手机渲染：先吐一个能点的链接，桌面水合后再换成 iframe */
const getIsDesktopOnServer = () => false;

/**
 * 二河白道 · 跑酷
 *
 * 桌面：说明栏 + 占满剩余视口的 iframe。
 * 移动端：**不套 iframe**，只给一个「进入游戏」入口跳到整页。
 *
 * 为什么手机不套 iframe：iframe 一旦加载不出来（被内置浏览器拦、网络中断、
 * 老 WebView 不支持），浏览器会自己画一张空白错误页盖在 iframe 上，
 * 页面看上去就是「什么都没有」，连兜底文案都露不出来。整页打开则没有这层嵌套，
 * 游戏的 3D 起不来时还有自己的提示卡兜着。
 */
export default function ErheBaidaoPage() {
  const { i18n } = useTranslation();
  const isEn = !(i18n.language || 'zh-CN').startsWith('zh');

  /**
   * 默认必须是「手机入口」，不能是一块等判定的占位。
   *
   * 之前的写法初始等一个 useEffect 再判定，期间渲染一块纯色占位——
   * 一旦 JS 没跑起来（水合失败、内置浏览器拦脚本、加载被截断），
   * 这个占位就永远停在那儿，手机上看到的就是「黑屏，什么都没有」。
   * 现在服务端直接吐「进入游戏」这个普通链接，JS 不执行也能点；
   * 只有确认是桌面（精细指针 + 宽屏）才切到 iframe。
   */
  const isDesktop = useSyncExternalStore(
    subscribeDesktop,
    getIsDesktop,
    getIsDesktopOnServer
  );

  return (
    /**
     * 用 position:fixed 铺满「顶栏以下」，不用 calc(100dvh - 3.5rem)：
     * `dvh` 在 iOS 15.4 之前、老版安卓 WebView、部分 App 内置浏览器里不被支持，
     * 整个 height 声明会被丢弃 → 父容器高度塌成 auto → iframe 退回默认 150px，
     * 手机上看就是一条几乎全黑的窄缝。
     */
    <div
      className="fixed right-0 left-0 flex flex-col bg-[#0d0b0a]"
      style={{
        top: '3.5rem',
        bottom: 0,
        // iframe 内部的 env(safe-area-inset-*) 恒为 0，安全区只能在外层补
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* ── 说明栏 ── */}
      {/* 手机上必须保持一行：长文用 min-w-0 + truncate 兜底，
          否则 flex-wrap 里 flex-1 会被压到 0 宽、文字竖排成一列，把内容挤没。 */}
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

          {/* 直连退路：内嵌这条路走不通时，至少还有一条能进的门 */}
          <a
            href={GAME_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto shrink-0 rounded-full border border-[#3A302B] px-2.5 py-1 text-[10px] text-[#C4B3A8] transition-colors hover:border-[#E8C87A] hover:text-[#E8C87A]"
          >
            {isEn ? 'Open ↗' : '直接打开 ↗'}
          </a>
        </div>
      </div>

      {/* ── 主体 ── */}
      <div className="relative min-h-0 flex-1">
        {/*
          手机端入口。默认就渲染它：即使 JS 没跑起来，这仍是一个普通 <a>，点得动。
          桌面上用媒体查询在首帧就藏掉（和上面 matchMedia 的判断条件一字不差），
          这样切到 iframe 之前也不会闪一下按钮。
        */}
        {!isDesktop && (
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-7 text-center [@media(pointer:fine)_and_(min-width:768px)]:hidden">
            <h2 className="as-serif text-xl font-bold tracking-[0.16em] text-[#E8C87A]">
              {isEn ? 'Two Rivers, One White Path' : '二河白道 · 跑酷'}
            </h2>
            <p className="max-w-md text-[12.5px] leading-[1.9] text-[#C4B3A8]">
              {isEn
                ? 'Three acts between the river of greed and the river of anger. Tap to start — the game opens full screen.'
                : '三幕关卡，水火二河之间只有一条白道。点下面进入，游戏会以整页全屏打开。'}
            </p>
            <a
              href={GAME_URL}
              className="rounded-xl px-10 py-3.5 text-[15px] font-bold tracking-[0.2em] text-[#151110] shadow-[0_10px_30px_rgba(212,175,55,0.28)]"
              style={{ background: 'linear-gradient(180deg, #ffe9a8, #d4af37 62%, #b8912a)' }}
            >
              {isEn ? 'Play' : '进 入 游 戏'}
            </a>
            <ul className="mt-1 flex flex-col gap-1 text-[10.5px] leading-relaxed text-[#8d7f76]">
              <li>{isEn ? 'Left stick to move · drag the right half to look' : '左摇杆移动 · 右半屏拖动视角'}</li>
              <li>{isEn ? 'Jump / Slide / Sprint buttons at bottom right' : '右下角是「跳 / 滑 / 冲刺」'}</li>
              <li>{isEn ? 'Landscape gives a wider view' : '横屏视野更宽，竖屏也能玩'}</li>
            </ul>
            <p className="mt-2 max-w-xs text-[10px] leading-relaxed text-[#6f625a]">
              {isEn
                ? 'If the screen stays blank, the device could not start 3D — open this page in your system browser.'
                : '若点开后仍然空白，说明这台设备没能启动 3D，请改用系统浏览器打开本页。'}
            </p>
          </div>
        )}

        {isDesktop && (
          <>
            {/* 垫在 iframe 后面：iframe 若什么都没画出来，这层才会露出来 */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
              <p className="text-[13px] leading-relaxed text-[#C4B3A8]">
                {isEn ? 'The game has not appeared.' : '游戏画面没有出现。'}
              </p>
              <a
                href={GAME_URL}
                className="pointer-events-auto rounded-lg bg-[#E8C87A] px-5 py-2.5 text-[13px] font-semibold text-[#151110]"
              >
                {isEn ? 'Open the game directly' : '直接打开游戏'}
              </a>
            </div>
            <iframe
              src={GAME_URL}
              title={isEn ? 'Two Rivers, One White Path' : '二河白道 · 跑酷'}
              className="relative h-full w-full border-0"
              allow="autoplay; fullscreen; pointer-lock"
            />
          </>
        )}
      </div>
    </div>
  );
}
