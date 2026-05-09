'use client';

import Image from 'next/image';
import Link from 'next/link';
import ScrollToTopButton from '@/components/about-simon/ScrollToTopButton';
import SectionNav from '@/components/about-simon/SectionNav';

/* ─────────────────────────────────────
   数据：章节导航
   ───────────────────────────────────── */
const SECTIONS = [
  { id: 'timeline', label: '职涯足迹' },
  { id: 'capabilities', label: '能力图谱' },
  { id: 'faces', label: '斜杠中年' },
  { id: 'credentials', label: '教育资质' },
];

/* ─────────────────────────────────────
   数据：时间线节点
   ───────────────────────────────────── */
const TIMELINE = [
  {
    year: '2006-2010',
    title: '培训师起步',
    desc: '前程无忧（51JOB）培训师，乙方视角的人力启蒙，从交付中理解企业的真正需求',
  },
  {
    year: '2010-2013',
    title: '合资纵深',
    desc: '上汽通用汽车HRBP，3万人+制造体系，在规模化组织中锤炼系统思维',
  },
  {
    year: '2013-2017',
    title: '外企深耕',
    desc: '登士柏（全球口腔TOP1）大中国区HRD，外企体系下的人力资源纵深实践',
  },
  {
    year: '2017-2020',
    title: '创业历练',
    desc: '奕尚电商HR&Admin负责人+盟广信息HRD，从0到1的组织搭建，理解创业公司的生存法则',
  },
  {
    year: '2020-2021',
    title: '互联网大厂',
    desc: '携程集团旅游事业集群HRD，4万人+互联网大厂实战，拥抱速度与变化',
  },
  {
    year: '2021-2023',
    title: '酒旅龙头',
    desc: '华住集团OD/OC/绩效COE总负责人+中、高端业务大HRBP Head，15万人+组织纵深操盘',
  },
  {
    year: '2023-至今',
    title: '乙方创业',
    desc: '创立慧行足管理咨询，从甲方到乙方，生涯累积服务125+家企业客户、近千位个人客户，借假修真、知行合一',
  },
];

/* ─────────────────────────────────────
   数据：斜杠中年卡片
   ───────────────────────────────────── */
const FACES = [
  {
    icon: '💼',
    title: '作为咨询顾问的我',
    text: '近20年，125家企业客户，近千位个人客户。我见过职场最残酷的一面，也见证过最美的蜕变。如果你正在职业的十字路口，我或许能帮你看清路。',
  },
  {
    icon: '🪷',
    title: '作为修行持戒居士的我',
    text: '借假修真不是逃避世俗，而是在每一个角色里活出真实的自己。持戒不是为了束缚，是为了自由——工作是我的道场，关系是我的镜子，在红尘中修一颗清净心。',
  },
  {
    icon: '🥬',
    title: '作为素食生活家的我',
    text: '13年素食，不是克制，而是选择。身体是修行的容器，每一餐都是对生命的敬畏。我相信，如何对待食物，就如何对待自己。',
  },
  {
    icon: '✍️',
    title: '作为自媒体创作的我',
    text: '不只是写文章，还有主题短视频、音乐作品、音频播客节目。每一种创作形式，都是借假修真的另一种修行。输出不是目的，共修才是。',
  },
  {
    icon: '💻',
    title: '作为技术实践者的我',
    text: '我会Vibe Coding、部署AI应用、做深度数据分析。技术不是目的，服务人的成长才是。我认为最好的咨询师，肯定是能用AI武装自己的那一个。',
  },
  {
    icon: '📋',
    title: '作为项目管理专家的我',
    text: 'PMP项目管理师认证，用项目管理思维统筹每一个咨询项目。从诊断到交付，不只是一个想法，而是一条可追溯的路径。',
  },
  {
    icon: '🤝',
    title: '作为生命关怀义工的我',
    text: '生命关怀不是施舍，是看见。在健康科普与临终关怀的义工服务中，我深刻理解了「未病先防」的智慧。最深的慈悲，是在病痛来临之前教会人们好好生活。付出比索取更接近自由，这是我学到的最深的道理。',
  },
  {
    icon: '🗺️',
    title: '作为国家双语导游的我',
    text: '中英双语导游证，不是职业备份，而是用另一种语言打开世界的门。每一次带团，都是跨文化的共修。',
  },
  {
    icon: '📖',
    title: '作为高中语文教资的我',
    text: '高中语文教师资格证，不是职业备选，而是对母语的深情、对国学的敬畏。语文是文以载道的根基，教人是最好的自学，而经典永远是最好的老师。',
  },
  {
    icon: '✨',
    title: '还在继续探索的我',
    text: '\u201c我\u201d只是一个虚妄假象，会伴随着众生需要\u201c我\u201d掌握哪些技能而不断成长~未来尚有更多的斜杠技能解锁的可能——不是因为缺什么补什么，而是世界太大，值得永远保持好奇。探索本身，就是答案。',
  },
];

/* ─────────────────────────────────────
   数据：认证墙
   ───────────────────────────────────── */
const CREDENTIALS = [
  { label: '上海交通大学（985）', sub: '统招硕士 · 工商管理' },
  { label: '北京理工大学（985）', sub: '统招本科 · 信息管理与信息系统（电子商务）' },
  { label: '全球生涯规划师 BCC', sub: 'CCE（USA）授证' },
  { label: '学习敏锐度授证', sub: 'Korn Ferry（USA，NYSE:KFY）' },
  { label: 'MBTI 授证培训', sub: 'Skill&Will（USA&HK）' },
  { label: 'PMP 项目管理师', sub: 'PMI（USA）认证' },
  { label: '高绩效团队与领导组织发展', sub: '中欧商学院 CEIBS' },
  { label: 'MOT 组织变革管理', sub: 'Linkage 授证培训' },
  { label: '销售专业辅导 PSC/PSS', sub: 'AG 授证培训' },
  { label: '中英双语导游证', sub: '旅游局认证' },
  { label: '高中教师资格证（语文）', sub: '教育局认证' },
];

/* ─────────────────────────────────────
   Page 1: 思考熊是谁
   ───────────────────────────────────── */
export default function AboutPage() {
  return (
    <div className="as-with-sidebar">
      <SectionNav sections={SECTIONS} />

      {/* ── Block 1: Hero 区 ── */}
      <HeroSection />

      {/* ── Block 2: 时间线 ── */}
      <TimelineSection />

      {/* ── Block 3: 能力六边形 ── */}
      <HexagonSection />

      {/* ── Block 4: 斜杠中年 ── */}
      <FacesSection />

      {/* ── Block 5: 认证墙 + 数据条 ── */}
      <CredentialsAndDataSection />

      <ScrollToTopButton />
    </div>
  );
}

/* ══════════════════════════════════════
   Hero Section
   ══════════════════════════════════════ */
function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[var(--as-primary-800)] via-[var(--as-primary-700)] to-[var(--as-primary-600)]">
      {/* 背景纹理 */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 40%)',
        }}
      />

      <div className="as-container relative z-10 py-10 sm:py-14">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-12">
          {/* 左侧：头像（真实照片） */}
          <div className="flex-shrink-0 will-change-transform">
            <div
              className="relative h-36 w-36 overflow-hidden rounded-full border-4 border-white/20 shadow-xl sm:h-56 sm:w-56"
              style={{
                background:
                  'linear-gradient(135deg, var(--as-primary-300) 0%, var(--as-primary-500) 100%)',
              }}
            >
              <Image
                src="/avatar-photo.png"
                alt="思考熊 Simon Xiong"
                fill
                sizes="224px"
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* 右侧：文案 */}
          <div className="text-left">
            <p className="text-sm font-medium tracking-widest text-[var(--as-primary-200)]">
              借假修真的思考熊
            </p>
            <h1 className="mt-2 font-serif text-4xl leading-tight font-bold text-white sm:text-5xl">
              思考熊<span className="ml-1 text-3xl sm:text-4xl">Simon</span>
            </h1>
            <p className="mt-3 text-lg leading-relaxed text-white/85 sm:text-xl">
              做组织与个体的
              <span className="font-semibold text-[var(--as-primary-200)]">终身整理者</span>
            </p>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/70 sm:text-base">
              近20年HR实战 · 千亿市值集团HRD · 国学修行智慧
              <br />
              既知企业组织的痛点，也懂打工人的心声
            </p>

            {/* ── 定位标语 ── */}
            <div className="mt-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[var(--as-primary-300)/50]" />
              <p className="text-sm font-semibold tracking-[0.12em] whitespace-nowrap text-[var(--as-primary-200)]">
                组织提效 × 个体解惑<span className="mx-2 text-[var(--as-primary-300)]">——</span>
                20年实战，助你迈出智慧下一步
              </p>
              <span className="h-px flex-1 bg-gradient-to-r from-[var(--as-primary-300)/50] to-transparent" />
            </div>

            {/* CTA */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                scroll={false}
                href="/about-simon/philosophy"
                className="rounded-full bg-white px-6 py-2.5 text-center text-sm font-semibold text-[var(--as-primary-700)] shadow-lg transition hover:bg-white/90"
              >
                了解我的理念 →
              </Link>
              <Link
                scroll={false}
                href="/about-simon/connect"
                className="rounded-full border border-white/40 px-6 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                联系我
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════
   时间线 Section
   ══════════════════════════════════════ */
function TimelineSection() {
  return (
    <section id="timeline" className="as-section">
      <div className="as-container">
        <div className="mb-6 text-center">
          <h2 className="as-serif text-3xl font-bold text-[var(--as-primary-700)]">
            <span className="as-heading-line">20年职涯足迹</span>
          </h2>
          <p className="mt-2 text-sm text-[var(--as-gray-500)]">
            从培训师到公司高管，从合资、外企到民企，从千亿集团到创业公司，每一步都在积累
          </p>
        </div>

        {/* 时间线 */}
        <div className="relative">
          {/* 竖线 */}
          <div className="absolute top-0 left-4 h-full w-0.5 bg-[var(--as-primary-100)] sm:left-1/2 sm:-translate-x-px" />

          <div className="space-y-5">
            {TIMELINE.map((item, i) => (
              <div
                key={item.year}
                className={`relative flex items-start gap-4 sm:gap-0 ${
                  i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'
                }`}
              >
                {/* 圆点 */}
                <div className="absolute left-4 z-10 flex h-3 w-3 -translate-x-1/2 items-center justify-center rounded-full border-2 border-[var(--as-primary-400)] bg-white sm:left-1/2" />

                {/* 卡片 */}
                <div
                  className={`ml-10 w-full sm:ml-0 sm:w-[calc(50%-2rem)] ${i % 2 === 0 ? 'sm:pr-8' : 'sm:pl-8'}`}
                >
                  <div className="as-card p-4">
                    <span className="inline-block rounded-full bg-[var(--as-primary-50)] px-3 py-0.5 text-xs font-semibold text-[var(--as-primary-600)]">
                      {item.year}
                    </span>
                    <h3 className="mt-2 font-serif text-lg font-bold text-[var(--as-primary-800)]">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--as-gray-600)]">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════
   能力六边形 (简化版：用标签网格替代)
   ══════════════════════════════════════ */
const CAPABILITIES = [
  { name: '组织变革与升级', tag: '组织' },
  { name: '干部管理与人才盘点', tag: '组织' },
  { name: '组织人效提升', tag: '组织' },
  { name: '绩效激励体系', tag: '组织' },
  { name: '生涯规划咨询', tag: '个体' },
  { name: 'MBTI与性格洞察', tag: '个体' },
  { name: 'AI+人文工具开发', tag: '探索' },
  { name: '内容创作与表达', tag: '探索' },
];

function HexagonSection() {
  return (
    <section id="capabilities" className="as-section-alt">
      <div className="as-container">
        <div className="mb-6 text-center">
          <h2 className="as-serif text-3xl font-bold text-[var(--as-primary-700)]">
            <span className="as-heading-line">核心能力图谱</span>
          </h2>
          <p className="mt-2 text-sm text-[var(--as-gray-500)]">
            20年实战淬炼，覆盖组织与个体双维度
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CAPABILITIES.map(cap => (
            <div key={cap.name} className="as-card flex items-center gap-3 p-4">
              <span className="inline-flex-shrink-0 rounded-full bg-[var(--as-primary-50)] px-2.5 py-1 text-xs font-semibold text-[var(--as-primary-600)]">
                {cap.tag}
              </span>
              <h3 className="text-sm font-semibold text-[var(--as-primary-800)]">{cap.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════
   斜杠中年 Section
   ══════════════════════════════════════ */
function FacesSection() {
  return (
    <section id="faces" className="as-section">
      <div className="as-container">
        <div className="mb-6 text-center">
          <h2 className="as-serif text-3xl font-bold text-[var(--as-primary-700)]">
            <span className="as-heading-line">同一个人的不同切面</span>
          </h2>
          <p className="mt-2 text-sm text-[var(--as-gray-500)]">
            不是斜杠人生，而是同一颗心的不同面向
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {FACES.map(face => (
            <div key={face.title} className="as-card p-5">
              <div className="mb-2 text-3xl">{face.icon}</div>
              <h3 className="as-serif text-base font-bold text-[var(--as-primary-700)]">
                {face.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--as-gray-600)]">
                {face.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════
   认证墙 + 数据条 Section
   ══════════════════════════════════════ */
function CredentialsAndDataSection() {
  return (
    <section id="credentials" className="as-section-alt">
      <div className="as-container">
        {/* 认证墙 */}
        <div className="mb-6 text-center">
          <h2 className="as-serif text-3xl font-bold text-[var(--as-primary-700)]">
            <span className="as-heading-line">教育背景与专业资质</span>
          </h2>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {CREDENTIALS.map(cred => (
            <div
              key={cred.label}
              className="rounded-lg border border-[var(--as-gray-100)] bg-white p-3.5"
            >
              <p className="text-sm font-semibold text-[var(--as-primary-700)]">{cred.label}</p>
              <p className="mt-0.5 text-xs text-[var(--as-gray-500)]">{cred.sub}</p>
            </div>
          ))}
        </div>

        {/* 底部引导 */}
        <div className="mt-8 text-center">
          <p className="text-sm text-[var(--as-gray-500)]">想了解我背后的思想体系？</p>
          <Link
            scroll={false}
            href="/about-simon/philosophy"
            className="mt-2 inline-block rounded-full bg-[var(--as-primary-600)] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[var(--as-primary-700)]"
          >
            探索理念体系 →
          </Link>
        </div>
      </div>
    </section>
  );
}
