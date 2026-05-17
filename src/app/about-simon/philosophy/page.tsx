'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import AboutHero from '@/components/about-simon/AboutHero';
import ScrollToTopButton from '@/components/about-simon/ScrollToTopButton';
import SectionNav from '@/components/about-simon/SectionNav';

/* ─────────────────────────────────────
   数据：章节导航
   ───────────────────────────────────── */
function useSections() {
  const { t } = useTranslation();
  return [
    { id: 'ideology', label: t('aboutContent.philosophy.navIdeology') },
    { id: 'methodology', label: t('aboutContent.philosophy.navMethodology') },
    { id: 'stages', label: t('aboutContent.philosophy.navStages') },
    { id: 'quotes', label: t('aboutContent.philosophy.navQuotes') },
  ];
}

/* ─────────────────────────────────────
   数据：核心理念三配
   ───────────────────────────────────── */
const CORE_IDEOLOGY = [
  {
    icon: '🪙',
    title: '物质低配',
    subtitle: 'Minimal Material',
    desc: '不是苦行僧式的克制，而是主动选择。13年素食、简朴生活——减去多余的欲望，才能听见内心真正的声音。物质做减法，生命做加法。',
  },
  {
    icon: '⚡',
    title: '能力高配',
    subtitle: 'Maximal Capability',
    desc: '20年横跨6大行业，从培训师到集团高管，从甲方到乙方，从HRD到Vibe Coding——永远在学，永远在练。能力是唯一不会背叛你的资产。',
  },
  {
    icon: '🪷',
    title: '精神顶配',
    subtitle: 'Supreme Spirit',
    desc: '借假修真，向死而生。工作即道场，关系即镜子，每一个角色都是修炼。精神顶配不是超脱世俗，而是在世俗中活出真实。',
  },
];

/* ─────────────────────────────────────
   数据：四阶模型
   ───────────────────────────────────── */
const STAGES = [
  {
    step: 1,
    title: '看见自己',
    subtitle: 'Self-Awareness',
    color: 'var(--as-primary-400)',
    desc: '所有改变的起点是看见。看见自己的模式、信念、盲区。不是评判，而是觉察。',
    methods: ['MBTI 性格洞察', '360° 反馈解码', '生涯叙事梳理'],
  },
  {
    step: 2,
    title: '因人制宜',
    subtitle: 'Personalization',
    color: 'var(--as-primary-500)',
    desc: '没有放之四海而皆准的方法。因地制宜，因人施策，让每一个解决方案长在当事人的土壤里。',
    methods: ['因地思维决策四问', '个体优势锚定', '场景化方案设计'],
  },
  {
    step: 3,
    title: '积极生活',
    subtitle: 'Active Living',
    color: 'var(--as-primary-600)',
    desc: '不是要在所有领域做到满分，而是守住工作与家庭的底盘。将体能、智力、创作三大兴趣变成日常——用运动经营肉身，用阅读喂养大脑，用创作表达灵魂。阶段性成就感与持续性成长感并行，才是积极生活。',
    methods: ['工作生活平衡', '体能兴趣', '智力兴趣', '创作兴趣', '持续成长'],
  },
  {
    step: 4,
    title: '生命觉醒',
    subtitle: 'Awakening',
    color: 'var(--as-primary-700)',
    desc: '从NPC觉醒为玩家——不再被动执行剧本，而是看清游戏规则，夺回选择权。工作的意义不是攀爬，是借事炼心；生老病死不是恐惧，是必经的关卡。走到最后，要的是生命自洽——内不拧巴，外不逢迎，自己跟自己和解。',
    methods: ['国学修行指引', '素食生活实践', '持戒自律体系'],
  },
];

/* ─────────────────────────────────────
   数据：方法论卡片
   ───────────────────────────────────── */
const METHODOLOGIES = [
  {
    title: '因地思维',
    tag: '思维模式',
    desc: '决策四问：这是谁的问题？他在什么处境下？他的核心诉求是什么？什么方案能在这个处境里生长？',
    desc2:
      '菩萨畏因，凡夫畏果——真正的高手不在结果上纠结，而在因上着力。与其焦虑裁员之后怎么办，不如追问：哪些因是我今天还能种的？',
    example:
      '面对裁员：不是先想补偿方案，而是先问——这个人处在什么人生阶段？他最怕什么？什么转型路径对他最可行？',
  },
  {
    title: '借假修真',
    tag: '人生哲学',
    desc: '在每一个暂时扮演的斜杠角色中修炼自己真实的内心。工作即道场，烦恼是菩提——如何借由每次升起的烦恼内观自己的心念起伏，这才是真正的修行功课。',
    example:
      "5000+裁员经历：每一次艰难对话，都是修炼慈悲心的机会。裁员是'假'，修出的同理心是'真'。",
  },
  {
    title: '组织四象限',
    tag: '诊断工具',
    desc: '人效 × 文化两个维度，将组织分为四个象限：高人效高文化（繁荣态）、高人效低文化（机械态）、低人效高文化（养老态）、低人效低文化（僵尸态）。',
    example: '某中高端酒店集群：人效达标但文化断层→先修复文化纽带，再推组织精简，避免硬着陆。',
  },
  {
    title: '灵魂拷问',
    tag: '自我探索',
    desc: '你真正内心想要的目标愿景是什么？你想此生想成为一个什么样的人？你对当下自己的满意度打几分？如果还剩余1年生命，你当下会如何去生活？步步深入，去触达自己内心真正的生命自洽...',
    example:
      "一位40岁的高管：被问到'如果还剩余1年生命'时当场泪崩→原来他一直活在别人的期待里，从未问过自己真正想要什么。",
  },
];

/* ─────────────────────────────────────
   数据：金句墙
   ───────────────────────────────────── */
const QUOTES = [
  { text: '工作不是苦修，但可以是道场。', category: '借假修真' },
  { text: '裁员是组织的新陈代谢，但每一个被代谢的人，都值得被看见。', category: '借假修真' },
  {
    text: '真正的自由不是想做什么做什么，是在每个不得不做的角色里，依然能做自己。',
    category: '借假修真',
  },
  { text: '财富是功课，不是答案。修的是你和欲望的关系。', category: '借假修真' },
  { text: '借假修真不是逃避世俗，是在世俗中找到那条通向真实的路。', category: '借假修真' },
  { text: '没有放之四海而皆准的方法，只有因地制宜的智慧。', category: '因地思维' },
  { text: '管理最大的傲慢，是用自己的处境去理解别人的问题。', category: '因地思维' },
  { text: '咨询不是给答案，是帮对方长出属于自己的答案。', category: '因地思维' },
  { text: '因地制宜不是没有原则，是原则在具体情境中的灵活表达。', category: '因地思维' },
  { text: '每个组织的病，只有它自己的身体知道。', category: '因地思维' },
  { text: '觉醒不是离开红尘，是在红尘中不再迷失。', category: '生命觉醒' },
  { text: '持戒不是束缚，是给自由画一个安全的边界。', category: '生命觉醒' },
  { text: '身体是修行的容器，不好好对待它，你连修行的资格都没有。', category: '生命觉醒' },
  { text: '生命的整理不是扔掉什么，是看清楚什么值得留下。', category: '生命觉醒' },
  { text: '向死而生不是悲观，是最彻底的清醒。', category: '生命觉醒' },
];

/* ─────────────────────────────────────
   Page 2: 理念体系
   ───────────────────────────────────── */
export default function PhilosophyPage() {
  const sections = useSections();

  return (
    <div className="as-with-sidebar">
      <SectionNav sections={sections} />

      <AboutHero
        label="Philosophy"
        title="「借假修真 向死而生」"
        subtitle="物质低配 · 能力高配 · 精神顶配"
        subtext="不是鸡汤，是活出来的生命配方"
      />

      {/* 核心理念：三配卡片 */}
      <section id="ideology" className="as-section">
        <div className="as-container">
          <div className="mx-auto grid max-w-4xl gap-5 lg:grid-cols-3">
            {CORE_IDEOLOGY.map(item => (
              <div key={item.title} className="as-card p-5 text-center">
                <div className="text-4xl">{item.icon}</div>
                <h3 className="as-serif mt-4 text-xl font-bold text-[var(--as-primary-700)]">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs text-[var(--as-gray-400)]">{item.subtitle}</p>
                <p className="mt-3 text-left text-sm leading-relaxed text-[var(--as-gray-600)]">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 方法论 */}
      <section id="methodology" className="as-section-alt">
        <div className="as-container">
          <div className="mb-6 text-center">
            <h2 className="as-serif text-3xl font-bold text-[var(--as-primary-700)]">
              <span className="as-heading-line">方法论示例</span>
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {METHODOLOGIES.map(m => (
              <div key={m.title} className="as-card p-5">
                <span className="mb-3 inline-block rounded-full bg-[var(--as-accent-light)] px-3 py-1 text-xs font-semibold text-[var(--as-accent)]">
                  {m.tag}
                </span>
                <h3 className="as-serif text-xl font-bold text-[var(--as-primary-700)]">
                  {m.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--as-gray-600)]">{m.desc}</p>
                {m.desc2 && (
                  <p className="mt-2 text-sm leading-relaxed text-[var(--as-primary-600)] italic">
                    {m.desc2}
                  </p>
                )}
                <div className="mt-3 rounded-lg bg-[var(--as-primary-50)] p-3">
                  <p className="text-xs text-[var(--as-gray-500)]">💡 示例</p>
                  <p className="mt-1 text-sm text-[var(--as-primary-700)]">{m.example}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 四阶成长模型 */}
      <section id="stages" className="as-section">
        <div className="as-container">
          <div className="mb-6 text-center">
            <h2 className="as-serif text-3xl font-bold text-[var(--as-primary-700)]">
              <span className="as-heading-line">四阶成长模型</span>
            </h2>
            <p className="mt-2 text-sm text-[var(--as-gray-500)]">从觉察到觉醒，一条可验证的路径</p>
          </div>

          <div className="mx-auto max-w-3xl space-y-3">
            {STAGES.map(stage => (
              <div
                key={stage.step}
                className="as-card p-5"
                style={{ marginLeft: `min(${(stage.step - 1) * 1}rem, 8%)` }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
                    style={{ backgroundColor: stage.color }}
                  >
                    {stage.step}
                  </div>
                  <div>
                    <h3 className="as-serif text-lg font-bold text-[var(--as-primary-700)] sm:text-xl">
                      {stage.title}
                      <span className="ml-2 text-xs font-normal text-[var(--as-gray-400)] sm:text-sm">
                        {stage.subtitle}
                      </span>
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--as-gray-600)]">
                      {stage.desc}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {stage.methods.map(m => (
                        <span
                          key={m}
                          className="rounded-full bg-[var(--as-primary-50)] px-3 py-1 text-xs font-medium text-[var(--as-primary-600)]"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 金句墙 */}
      <section id="quotes" className="as-section-alt">
        <div className="as-container">
          <div className="mb-6 text-center">
            <h2 className="as-serif text-3xl font-bold text-[var(--as-primary-700)]">
              <span className="as-heading-line">金句墙</span>
            </h2>
            <p className="mt-2 text-sm text-[var(--as-gray-500)]">不是心灵鸡汤，是实修笔记</p>
          </div>

          <div className="columns-1 gap-3 sm:columns-2 lg:columns-3">
            {QUOTES.map((q, i) => (
              <div
                key={i}
                className="mb-3 break-inside-avoid rounded-xl border border-[var(--as-primary-100)] bg-white p-4"
              >
                <p className="as-serif text-base leading-relaxed text-[var(--as-primary-800)]">
                  「{q.text}」
                </p>
                <p className="mt-2 text-xs text-[var(--as-gray-400)]">— {q.category}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 底部引导 */}
      <section className="as-section-alt">
        <div className="text-center">
          <p className="text-sm text-[var(--as-gray-500)]">想知道这些理念如何变成服务？</p>
          <Link
            scroll={false}
            href="/about-simon/services"
            className="mt-2 inline-block rounded-full bg-[var(--as-primary-600)] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[var(--as-primary-700)]"
          >
            查看服务产品 →
          </Link>
        </div>
      </section>

      <ScrollToTopButton />
    </div>
  );
}
