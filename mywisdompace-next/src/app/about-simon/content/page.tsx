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
  { id: "podcast", label: "播客·音乐·直播" },
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
    desc: "生命思考、健康科普、旅行攻略",
    icon: "📕",
    href: "https://www.xiaohongshu.com/user/",
  },
  {
    name: "微信公众号",
    id: "借假修真的思考熊",
    desc: "国学智慧、经典解读、生活科普、运动日志",
    icon: "📝",
    href: "https://mp.weixin.qq.com/",
  },
  {
    name: "微信视频号",
    id: "借假修真的思考熊",
    desc: "哲学思考、读书分享、音乐创作、主题播客",
    icon: "🎬",
    href: "https://channels.weixin.qq.com/",
  },
];

/* ─────────────────────────────────────
   数据：内容板块
   ───────────────────────────────────── */
const CONTENT_SECTIONS = [
  {
    icon: "💊",
    title: "红药丸",
    desc: "从Matrix的觉醒隐喻出发，打破认知滤镜，拒绝做轮回的NPC。每一次独立思考，都是对母体的温柔反抗。",
    count: "100+",
  },
  {
    icon: "🌿",
    title: "生活百科",
    desc: "从柴米油盐到星辰大海，把生活里的每一个「为什么」变成有用的知识。懂生活，才更懂得爱自己。",
    count: "50+",
  },
  {
    icon: "🌏",
    title: "慧行天下",
    desc: "身体和灵魂，总有一个在路上。用脚步丈量世界的宽度，用见闻拓宽认知的边界。走万里路，读万卷书。",
    count: "100+",
  },
  {
    icon: "🏃",
    title: "身心强健",
    desc: "健康不是目的，是底色。运动、营养、睡眠、压力管理——用科学的方法经营这具肉身，让灵魂有处安放。",
    count: "60+",
  },
  {
    icon: "📚",
    title: "读书观影",
    desc: "每本好书都是一次灵魂对话，每部好电影都是一次人生模拟。把读过、看过的，变成滋养自己的光。",
    count: "50+",
  },
  {
    icon: "🤖",
    title: "AI技术赋能",
    desc: "不是被AI替代，而是用AI武装。学习、实践、分享——让技术回归工具本质，为人文理想服务。",
    count: "10+",
  },
];

/* ─────────────────────────────────────
   数据：播客
   ───────────────────────────────────── */
const PODCASTS = [
  {
    title: "【菩提科普】主题播客",
    desc: "以佛学智慧为镜，照见生老病死、爱别离、怨憎会、求不得、五阴炽盛八苦的真相。每一次对苦的直面，都是觉悟的开始。不是在讲经，是在陪你一起思考如何离苦得乐。",
  },
  {
    title: "【一生的整理】主题播客",
    desc: "整理的不是物品，是人生。从看见自己，积极生活，再到清楚交代，好好告别——用播客的形式，呈现「一生的整理」这个网站的完整脉络。每期一个话题，陪你踏出智慧下一步。",
  },
];

/* ─────────────────────────────────────
   数据：直播
   ───────────────────────────────────── */
const LIVES = [
  { title: "《了凡四训》共读", desc: "国学经典与生命智慧的对话", episodes: "15期连载" },
  { title: "生、老、病、死的交流与思考", desc: "关于疾病，衰老死亡的好书推荐", episodes: "5期精华" },
];

/* ─────────────────────────────────────
   数据：音乐
   ───────────────────────────────────── */
const MUSICS = [
  {
    title: "赛博菩提原创专辑",
    desc: "用AI工具将原创曲调化为菩提单曲。电子音色与禅意旋律在此相遇，是修行者写给数字时代的禅诗。",
  },
  {
    title: "菩提改编翻唱专辑",
    desc: "把经典老歌拆解重组，加入佛号、梵唱与禅意编曲。熟悉的旋律里藏着不一样的法喜，是另一种形式的共修。",
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
                className="as-card flex flex-col items-center p-5 text-center transition hover:border-[var(--as-primary-300)] hover:shadow-md sm:p-8"
              >
                <span className="text-4xl sm:text-5xl">{p.icon}</span>
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
              <span className="as-heading-line">六大内容板块</span>
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* 播客 & 音乐 & 直播 */}
      <section id="podcast" className="as-section">
        <div className="as-container">
          <div className="grid gap-x-6 gap-y-3 lg:grid-cols-3">
            {/* 标题行 */}
            <h2 className="as-serif mb-1 text-2xl font-bold text-[var(--as-primary-700)]">
              🎙️ 播客系列
            </h2>
            <h2 className="as-serif mb-1 text-2xl font-bold text-[var(--as-primary-700)]">
              🎵 音乐系列
            </h2>
            <h2 className="as-serif mb-1 text-2xl font-bold text-[var(--as-primary-700)]">
              📺 直播系列
            </h2>

            {/* 第 1 行卡片 */}
            {[
              <div key="p1" className="as-card p-4 flex flex-col">
                <h3 className="font-semibold text-[var(--as-primary-700)]">{PODCASTS[0].title}</h3>
                <p className="mt-1 text-sm text-[var(--as-gray-500)] flex-1">{PODCASTS[0].desc}</p>
                <span className="mt-2 inline-block text-xs text-[var(--as-gray-400)]">🔗 链接待补充</span>
              </div>,
              <div key="m1" className="as-card p-4 flex flex-col">
                <h3 className="font-semibold text-[var(--as-primary-700)]">{MUSICS[0].title}</h3>
                <p className="mt-1 text-sm text-[var(--as-gray-500)] flex-1">{MUSICS[0].desc}</p>
                <span className="mt-2 inline-block text-xs text-transparent">&nbsp;</span>
              </div>,
              <div key="l1" className="as-card p-4 flex flex-col">
                <h3 className="font-semibold text-[var(--as-primary-700)]">{LIVES[0].title}</h3>
                <p className="mt-1 text-sm text-[var(--as-gray-500)] flex-1">{LIVES[0].desc}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-full bg-[var(--as-primary-50)] px-2 py-0.5 text-xs text-[var(--as-primary-600)]">{LIVES[0].episodes}</span>
                  <span className="text-xs text-[var(--as-gray-400)]">🔗 回放已在视频号放出</span>
                </div>
              </div>,
            ]}

            {/* 第 2 行卡片 */}
            {[
              <div key="p2" className="as-card p-4 flex flex-col">
                <h3 className="font-semibold text-[var(--as-primary-700)]">{PODCASTS[1].title}</h3>
                <p className="mt-1 text-sm text-[var(--as-gray-500)] flex-1">{PODCASTS[1].desc}</p>
                <span className="mt-2 inline-block text-xs text-[var(--as-gray-400)]">🔗 链接待补充</span>
              </div>,
              <div key="m2" className="as-card p-4 flex flex-col">
                <h3 className="font-semibold text-[var(--as-primary-700)]">{MUSICS[1].title}</h3>
                <p className="mt-1 text-sm text-[var(--as-gray-500)] flex-1">{MUSICS[1].desc}</p>
                <span className="mt-2 inline-block text-xs text-transparent">&nbsp;</span>
              </div>,
              <div key="l2" className="as-card p-4 flex flex-col">
                <h3 className="font-semibold text-[var(--as-primary-700)]">{LIVES[1].title}</h3>
                <p className="mt-1 text-sm text-[var(--as-gray-500)] flex-1">{LIVES[1].desc}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-full bg-[var(--as-primary-50)] px-2 py-0.5 text-xs text-[var(--as-primary-600)]">{LIVES[1].episodes}</span>
                  <span className="text-xs text-[var(--as-gray-400)]">🔗 回放已在视频号放出</span>
                </div>
              </div>,
            ]}
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
