'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import AboutHero from '@/components/about-simon/AboutHero';
import ScrollToTopButton from '@/components/about-simon/ScrollToTopButton';
import SectionNav from '@/components/about-simon/SectionNav';

const SECTIONS = [
  { id: 'platforms', cn: '平台入口', enKey: 'navPlatforms' },
  { id: 'topics', cn: '内容板块', enKey: 'navTopics' },
  { id: 'podcast', cn: '播客·音乐·直播', enKey: 'navPodcast' },
];

const PLATFORMS = [
  {
    icon: '🎓',
    name: '在行',
    nameEn: 'Zaihai',
    id: '生涯规划咨询',
    idEn: 'Career Counselor',
    desc: '1对1生涯规划咨询，9.7分在行评分',
    descEn: '1-on-1 career counseling, 9.7/10 rating',
    href: 'https://www.zaih.com/falcon/mentors/2bxahqla7fk',
  },
  {
    icon: '📕',
    name: '小红书',
    nameEn: 'Xiaohongshu',
    id: '借假修真的思考熊',
    idEn: 'Musing Bear',
    desc: '生命思考、健康科普、旅行攻略',
    descEn: 'Life reflections, health科普, travel guides',
    href: 'https://www.xiaohongshu.com/user/',
  },
  {
    icon: '📝',
    name: '微信公众号',
    nameEn: 'WeChat Official',
    id: '借假修真的思考熊',
    idEn: 'Musing Bear',
    desc: '国学智慧、经典解读、生活科普、运动日志',
    descEn: 'Eastern wisdom, classic texts, life science, fitness logs',
    href: 'https://mp.weixin.qq.com/',
  },
  {
    icon: '🎬',
    name: '微信视频号',
    nameEn: 'WeChat Channels',
    id: '借假修真的思考熊',
    idEn: 'Musing Bear',
    desc: '哲学思考、读书分享、音乐创作、主题播客',
    descEn: 'Philosophical reflections, book sharing, music creation, themed podcasts',
    href: 'https://channels.weixin.qq.com/',
  },
];

const TOPICS = [
  {
    icon: '💊',
    title: '红药丸',
    desc: '从Matrix的觉醒隐喻出发，打破认知滤镜，拒绝做轮回的NPC。每一次独立思考，都是对母体的温柔反抗。',
    count: '100+',
  },
  {
    icon: '🌿',
    title: '生活百科',
    desc: '从柴米油盐到星辰大海，把生活里的每一个「为什么」变成有用的知识。懂生活，才更懂得爱自己。',
    count: '50+',
  },
  {
    icon: '🌏',
    title: '慧行天下',
    desc: '身体和灵魂，总有一个在路上。用脚步丈量世界的宽度，用见闻拓宽认知的边界。走万里路，读万卷书。',
    count: '100+',
  },
  {
    icon: '🏃',
    title: '身心强健',
    desc: '健康不是目的，是底色。运动、营养、睡眠、压力管理——用科学的方法经营这具肉身，让灵魂有处安放。',
    count: '60+',
  },
  {
    icon: '📚',
    title: '读书观影',
    desc: '每本好书都是一次灵魂对话，每部好电影都是一次人生模拟。把读过、看过的，变成滋养自己的光。',
    count: '50+',
  },
  {
    icon: '🤖',
    title: 'AI技术赋能',
    desc: '不是被AI替代，而是用AI武装。学习、实践、分享——让技术回归工具本质，为人文理想服务。',
    count: '10+',
  },
];

const PODCASTS_CN = [
  {
    title: '【菩提科普】主题播客',
    desc: '以佛学智慧为镜，照见生老病死八苦的真相。不是在讲经，是在陪你一起思考如何离苦得乐。',
  },
  {
    title: '【一生的整理】主题播客',
    desc: '整理的不是物品，是人生。从看见自己到好好告别——每期一个话题，陪你踏出智慧下一步。',
  },
];

const MUSICS_CN = [
  {
    title: '赛博菩提原创专辑',
    desc: '用AI工具将原创曲调化为菩提单曲。电子音色与禅意旋律在此相遇，是修行者写给数字时代的禅诗。',
  },
  {
    title: '菩提改编翻唱专辑',
    desc: '把经典老歌拆解重组，加入佛号、梵唱与禅意编曲。熟悉的旋律里藏着不一样的法喜，是另一种形式的共修。',
  },
];

const LIVES_CN = [
  { title: '《了凡四训》共读', desc: '国学经典与生命智慧的对话', episodes: '15期连载' },
  {
    title: '生、老、病、死的交流与思考',
    desc: '关于疾病，衰老死亡的好书推荐',
    episodes: '5期精华',
  },
];

export default function ContentPage() {
  const { t, i18n } = useTranslation();
  const isEn = !(i18n.language || 'zh-CN').startsWith('zh');
  const jt = (k: string, fb: string) => (isEn ? (t(k) === k ? fb : t(k)) : fb);

  return (
    <div className="as-with-sidebar">
      <SectionNav
        sections={SECTIONS.map(s => ({
          id: s.id,
          label: isEn ? jt(`aboutContent.content.${s.enKey}`, s.cn) : s.cn,
        }))}
      />
      <AboutHero
        label="Content"
        title={jt('aboutPageData.content.heroTitle', '这些地方，能找到我')}
        description={jt(
          'aboutPageData.content.heroSub',
          '每一篇作品都是一次自我对话，做着做着，就懂了自己'
        )}
        subtext={jt('aboutPageData.content.heroText', '')}
      />
      <section id="platforms" className="as-section">
        <div className="as-container">
          <h2 className="as-serif mb-6 text-center text-3xl font-bold text-[var(--as-primary-700)]">
            <span className="as-heading-line">
              {jt('aboutPageData.content.sectionPlatforms', '平台入口')}
            </span>
          </h2>
          <div className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-2">
            {PLATFORMS.map(p => (
              <a
                key={p.name}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="as-card flex flex-col items-center p-5 text-center transition hover:border-[var(--as-primary-300)] hover:shadow-md sm:p-8"
              >
                <span className="text-4xl sm:text-5xl">{p.icon}</span>
                <h3 className="as-serif mt-4 text-xl font-bold text-[var(--as-primary-700)]">
                  {isEn && p.nameEn ? p.nameEn : p.name}
                </h3>
                <p className="mt-1 text-sm text-[var(--as-gray-500)]">
                  {isEn && p.idEn ? p.idEn : p.id}
                </p>
                <p className="mt-2 text-sm text-[var(--as-gray-600)]">
                  {isEn && p.descEn ? p.descEn : p.desc}
                </p>
                <p className="hover:text-[var(--as-primary-700)) mt-3 text-xs text-[var(--as-primary-500)] transition">
                  → {jt('aboutPageData.content.heroSub', '前往主页').split(' · ')[0] || 'Visit'}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>
      <section id="topics" className="as-section-alt">
        <div className="as-container">
          <div className="mb-6 text-center">
            <h2 className="as-serif text-3xl font-bold text-[var(--as-primary-700)]">
              <span className="as-heading-line">
                {jt('aboutPageData.content.sectionTopics', '内容板块')}
              </span>
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TOPICS.map((s, ti) => (
              <div key={s.title} className="as-card p-4 text-center">
                <span className="text-3xl">{s.icon}</span>
                <h3 className="as-serif mt-2 text-sm font-bold text-[var(--as-primary-700)]">
                  {isEn ? jt(`aboutPageData.content.topics.${ti}.title`, s.title) : s.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[var(--as-gray-600)]">
                  {isEn ? jt(`aboutPageData.content.topics.${ti}.desc`, s.desc) : s.desc}
                </p>
                <p className="mt-2 text-sm font-bold text-[var(--as-primary-400)]">{s.count} 篇</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="podcast" className="as-section">
        <div className="as-container">
          <div className="mb-6 text-center">
            <h2 className="as-serif text-3xl font-bold text-[var(--as-primary-700)]">
              <span className="as-heading-line">
                {jt('aboutPageData.content.sectionPodcast', '播客·音乐·直播')}
              </span>
            </h2>
          </div>
          <div className="grid gap-x-6 gap-y-8 lg:grid-cols-3">
            <div className="space-y-3">
              <h2 className="as-serif text-2xl font-bold text-[var(--as-primary-700)]">
                🎙️ {isEn ? 'Podcasts' : '播客系列'}
              </h2>
              {PODCASTS_CN.map((item, i) => (
                <div key={`p${i}`} className="as-card flex flex-col p-4">
                  <h3 className="font-semibold text-[var(--as-primary-700)]">
                    {isEn ? jt(`aboutPageData.content.podcasts.${i}.name`, item.title) : item.title}
                  </h3>
                  <p className="mt-1 flex-1 text-sm text-[var(--as-gray-500)]">
                    {isEn ? jt(`aboutPageData.content.podcasts.${i}.desc`, item.desc) : item.desc}
                  </p>
                  <span className="mt-2 inline-block text-xs text-[var(--as-gray-400)]">
                    {isEn ? 'Available on WeChat Channels' : '已在视频号平台发布，欢迎收听'}
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <h2 className="as-serif text-2xl font-bold text-[var(--as-primary-700)]">
                🎵 {isEn ? 'Music' : '音乐系列'}
              </h2>
              {MUSICS_CN.map((item, i) => (
                <div key={`m${i}`} className="as-card flex flex-col p-4">
                  <h3 className="font-semibold text-[var(--as-primary-700)]">
                    {isEn ? jt(`aboutPageData.content.music.${i}.name`, item.title) : item.title}
                  </h3>
                  <p className="mt-1 flex-1 text-sm text-[var(--as-gray-500)]">
                    {isEn ? jt(`aboutPageData.content.music.${i}.desc`, item.desc) : item.desc}
                  </p>
                  <span className="mt-2 inline-block text-xs text-[var(--as-gray-400)]">
                    {isEn ? 'Available on WeChat Channels' : '已在视频号平台发布，欢迎收听'}
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <h2 className="as-serif text-2xl font-bold text-[var(--as-primary-700)]">
                📺 {isEn ? 'Live Series' : '直播系列'}
              </h2>
              {LIVES_CN.map((item, i) => (
                <div key={`l${i}`} className="as-card flex flex-col p-4">
                  <h3 className="font-semibold text-[var(--as-primary-700)]">
                    {isEn ? jt(`aboutPageData.content.lives.${i}.name`, item.title) : item.title}
                  </h3>
                  <p className="mt-1 flex-1 text-sm text-[var(--as-gray-500)]">
                    {isEn ? jt(`aboutPageData.content.lives.${i}.desc`, item.desc) : item.desc}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded-full bg-[var(--as-primary-50)] px-2 py-0.5 text-xs text-[var(--as-primary-600)]">
                      {isEn
                        ? jt(`aboutPageData.content.lives.${i}.episodes`, item.episodes)
                        : item.episodes}
                    </span>
                    <span className="text-xs text-[var(--as-gray-400)]">
                      🔗 {isEn ? 'Replays on Channels' : '回放已在视频号放出'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="as-section">
        <div className="text-center">
          <p className="text-[var(--as-gray-500)]">
            {jt('aboutPageData.content.ctaText', '喜欢我的内容？来聊聊吧')}
          </p>
          <Link
            scroll={false}
            href="/about-simon/connect"
            className="mt-3 inline-block rounded-full bg-[var(--as-primary-600)] px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[var(--as-primary-700)]"
          >
            {jt('aboutPageData.content.ctaBtn', '联系我 →')}
          </Link>
        </div>
      </section>
      <ScrollToTopButton />
    </div>
  );
}
