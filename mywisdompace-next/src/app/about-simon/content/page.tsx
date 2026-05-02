"use client";

import Link from "next/link";
import AboutHero from "@/components/about-simon/AboutHero";
import ScrollToTopButton from "@/components/about-simon/ScrollToTopButton";
import SectionNav from "@/components/about-simon/SectionNav";

/* ─────────────────────────────────────
   数据：章节导航
   ───────────────────────────────────── */
const SECTIONS = [
  { id: "platforms", label: "平台入口" },
  { id: "topics", label: "内容板块" },
  { id: "podcast", label: "播客直播" },
  { id: "styles", label: "内容风格" },
];

/* ─────────────────────────────────────
   数据：平台
   ───────────────────────────────────── */
const PLATFORMS = [
  {
    name: "在行",
    id: "生涯规划咨询",
    desc: "1对1生涯规划咨询，9.7分在行评分",
    icon: "🎓",
    href: "https://www.zaih.com/falcon/mentors/2bxahqla7fk",
  },
  {
    name: "小红书",
    id: "借假修真的思考熊",
    desc: "生活方式、素食分享、职场干货",
    icon: "📕",
    href: "https://www.xiaohongshu.com/user/",
  },
  {
    name: "微信公众号",
    id: "借假修真的思考熊",
    desc: "深度长文，组织洞察与人生感悟",
    icon: "📝",
    href: "https://mp.weixin.qq.com/",
  },
  {
    name: "微信视频号",
    id: "借假修真的思考熊",
    desc: "短视频分享，职场实操与修行笔记",
    icon: "🎬",
    href: "https://channels.weixin.qq.com/",
  },
];

/* ─────────────────────────────────────
   数据：内容板块
   ───────────────────────────────────── */
const CONTENT_SECTIONS = [
  {
    icon: "🏢",
    title: "组织观察",
    desc: "从千亿集团到创业公司，深度解剖组织运作的底层逻辑",
    count: "30+",
  },
  {
    icon: "🧭",
    title: "生涯导航",
    desc: "350+位客户的真实案例，生涯规划的实战方法论",
    count: "20+",
  },
  {
    icon: "🪷",
    title: "修行笔记",
    desc: "国学智慧在职场和生活中的落地实践",
    count: "15+",
  },
  {
    icon: "🥬",
    title: "素食生活",
    desc: "10年素食实践，健康生活方式的探索与分享",
    count: "10+",
  },
  {
    icon: "🤖",
    title: "AI+人文",
    desc: "用技术赋能人文，AI工具开发与实践心得",
    count: "5+",
  },
];

/* ─────────────────────────────────────
   数据：播客
   ───────────────────────────────────── */
const PODCASTS = [
  {
    title: "EP01: 从HRD到创业者——一个20年老兵的转型告白",
    desc: "为什么放弃千万年薪？从甲方到乙方是什么体验？",
  },
  {
    title: "EP02: 裁员5000人后，我悟出了什么？",
    desc: "那些深夜的电话、发抖的签字、哭泣的总监，教会我的事。",
  },
];

/* ─────────────────────────────────────
   数据：直播
   ───────────────────────────────────── */
const LIVES = [
  { title: "《了凡四训》共读", desc: "国学经典与现代职场的对话", episodes: "8期连载" },
  { title: "组织人效提升实战", desc: "从诊断到落地的完整路径", episodes: "3期精华" },
];

/* ─────────────────────────────────────
   数据：内容风格Sample
   ───────────────────────────────────── */
const STYLE_SAMPLES = [
  {
    style: "理性分析型",
    tag: "组织洞察",
    preview:
      "组织四象限的第一步不是画图，是问对问题。你的组织是人效问题还是文化问题？如果是人效问题，那又分两种：工作太多还是人太少？如果是文化问题，也分两种：价值观模糊还是行为脱节？每个分支的解法完全不同。",
  },
  {
    style: "故事启发型",
    tag: "生涯叙事",
    preview:
      "那个在办公室哭的总监，不是因为被裁。是因为裁完人之后，他忽然不知道自己到底在做什么。十年的忠诚，换来的是一夜之间的茫然。我说：这不是终点，是你第一次有机会问自己——如果不是这份工作，我是谁？",
  },
  {
    style: "冷幽默",
    tag: "职场真相",
    preview:
      "HR最大的职业病是什么？是在任何社交场合都能3分钟内判断对方是不是在'表演'。因为面试的时候见太多了。你以为你在聊天，我在做行为面试。抱歉，职业病，控制不住。",
  },
];

/* ─────────────────────────────────────
   Page 4: 内容作品
   ───────────────────────────────────── */
export default function ContentPage() {
  return (
    <div className="as-with-sidebar">
      <SectionNav sections={SECTIONS} />

      <AboutHero
        label="Content"
        title="这些地方，能找到我"
        description="每一篇作品都是一次自我对话，做着做着，就懂了自己"
      />

      {/* 平台地图 */}
      <section id="platforms" className="as-section">
        <div className="as-container">
          <div className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-2">
            {PLATFORMS.map((p) => (
              <a
                key={p.name}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="as-card flex flex-col items-center p-8 text-center transition hover:border-[var(--as-primary-300)] hover:shadow-md"
              >
                <span className="text-5xl">{p.icon}</span>
                <h3 className="as-serif mt-4 text-xl font-bold text-[var(--as-primary-700)]">
                  {p.name}
                </h3>
                <p className="mt-1 text-sm text-[var(--as-gray-500)]">
                  {p.id}
                </p>
                <p className="mt-2 text-sm text-[var(--as-gray-600)]">
                  {p.desc}
                </p>
                <p className="mt-3 text-xs text-[var(--as-primary-500)] transition hover:text-[var(--as-primary-700)]">
                  → 前往主页
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 五大板块 */}
      <section id="topics" className="as-section-alt">
        <div className="as-container">
          <div className="mb-6 text-center">
            <h2 className="as-serif text-3xl font-bold text-[var(--as-primary-700)]">
              <span className="as-heading-line">五大内容板块</span>
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {CONTENT_SECTIONS.map((s) => (
              <div key={s.title} className="as-card p-4 text-center">
                <span className="text-3xl">{s.icon}</span>
                <h3 className="as-serif mt-2 text-sm font-bold text-[var(--as-primary-700)]">
                  {s.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[var(--as-gray-600)]">
                  {s.desc}
                </p>
                <p className="mt-2 text-sm font-bold text-[var(--as-primary-400)]">
                  {s.count} 篇
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 播客 & 直播 */}
      <section id="podcast" className="as-section">
        <div className="as-container">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* 播客 */}
            <div>
              <h2 className="as-serif mb-3 text-2xl font-bold text-[var(--as-primary-700)]">
                🎙️ 播客
              </h2>
              <div className="space-y-3">
                {PODCASTS.map((ep) => (
                  <div key={ep.title} className="as-card p-4">
                    <h3 className="font-semibold text-[var(--as-primary-700)]">
                      {ep.title}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--as-gray-500)]">
                      {ep.desc}
                    </p>
                    <span className="mt-2 inline-block text-xs text-[var(--as-gray-400)]">
                      🔗 链接待补充
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 直播 */}
            <div>
              <h2 className="as-serif mb-3 text-2xl font-bold text-[var(--as-primary-700)]">
                📺 直播系列
              </h2>
              <div className="space-y-3">
                {LIVES.map((live) => (
                  <div key={live.title} className="as-card p-4">
                    <h3 className="font-semibold text-[var(--as-primary-700)]">
                      {live.title}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--as-gray-500)]">
                      {live.desc}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="rounded-full bg-[var(--as-primary-50)] px-2 py-0.5 text-xs text-[var(--as-primary-600)]">
                        {live.episodes}
                      </span>
                      <span className="text-xs text-[var(--as-gray-400)]">
                        🔗 回放待补充
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 内容风格Sample */}
      <section id="styles" className="as-section-alt">
        <div className="as-container">
          <div className="mb-6 text-center">
            <h2 className="as-serif text-3xl font-bold text-[var(--as-primary-700)]">
              <span className="as-heading-line">三种内容风格</span>
            </h2>
            <p className="mt-2 text-sm text-[var(--as-gray-500)]">
              不是刻意切换，是同一个问题的不同入口
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {STYLE_SAMPLES.map((s) => (
              <div key={s.style} className="as-card p-6">
                <span className="mb-3 inline-block rounded-full bg-[var(--as-accent-light)] px-3 py-1 text-xs font-semibold text-[var(--as-accent)]">
                  {s.tag}
                </span>
                <h3 className="as-serif text-lg font-bold text-[var(--as-primary-700)]">
                  {s.style}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--as-gray-600)]">
                  {s.preview}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 底部引导 */}
      <section className="as-section">
        <div className="text-center">
          <p className="text-[var(--as-gray-500)]">
            喜欢我的内容？来聊聊吧
          </p>
          <Link scroll={false}
            href="/about-simon/connect"
            className="mt-3 inline-block rounded-full bg-[var(--as-primary-600)] px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[var(--as-primary-700)]"
          >
            联系我 →
          </Link>
        </div>
      </section>

      <ScrollToTopButton />
    </div>
  );
}
