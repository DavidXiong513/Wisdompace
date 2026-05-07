"use client";

import Image from "next/image";
import Link from "next/link";
import AboutHero from "@/components/about-simon/AboutHero";
import ScrollToTopButton from "@/components/about-simon/ScrollToTopButton";
import SectionNav from "@/components/about-simon/SectionNav";

/* ─────────────────────────────────────
   数据：章节导航
   ───────────────────────────────────── */
const SECTIONS = [
  { id: "b-services", label: "组织项目" },
  { id: "c-products", label: "个体咨询" },
  { id: "story", label: "裁员故事" },
  { id: "clients", label: "企业客户" },
];

/* ─────────────────────────────────────
   数据：B端服务
   ───────────────────────────────────── */
const B_SERVICES = [
  {
    icon: "🔄",
    title: "组织变革与升级",
    items: ["组织诊断与四象限定位", "变革路径设计与落地推手", "组织架构优化与人才盘点", "文化重塑与价值观落地"],
  },
  {
    icon: "📊",
    title: "干部管理与人才梯队",
    items: ["关键岗位胜任力建模", "人才盘点与九宫格落位", "继任者计划与梯队搭建", "高潜人才加速发展"],
  },
  {
    icon: "⚡",
    title: "组织人效提升",
    items: ["人效指标体系搭建", "组织精简与人员优化", "绩效考核与薪酬激励体系设计", "AI工具与组织赋能"],
  },
  {
    icon: "🧭",
    title: "通用管理主题培训与沙龙",
    items: ["非人力资源的人力资源管理", "非职权领导力", "20+后浪人群洞察与管理", "团队信任与协作打造"],
  },
];

/* ─────────────────────────────────────
   数据：C端产品
   ───────────────────────────────────── */
const C_PRODUCTS = [
  {
    title: "MBTI 专业测评 v2.1",
    badge: "旗舰产品",
    badgeColor: "var(--as-accent)",
    price: "详询",
    desc: "93题完整版 + 专业解读报告 + 1对1咨询（30分钟）。不是简单的类型标签，而是深度理解自己性格模式的入口。",
    features: ["MBTI 四维度深度解析", "职业适配建议", "沟通风格指南", "1对1专业咨询"],
    href: "/tools/mbti-test",
  },
  {
    title: "生涯规划咨询",
    price: "详询",
    priceHref: "/about-simon/connect",
    desc: "基于近20年HR实战经验 + 全球生涯规划师认证，帮你厘清职业方向，制定可落地的转型计划。",
    features: ["现状诊断", "方向锚定", "路径规划", "行动方案"],
  },
  {
    title: "能力兴趣42项评估",
    price: "免费",
    desc: "四象限分类：优势区、潜力区、后备区、放弃区。用数据告诉你，什么值得深耕，什么应该放手。",
    features: ["42项能力兴趣维度", "四象限可视化", "发展建议"],
    href: "/tools/ability-test",
  },
  {
    title: "心理情绪压力自测",
    price: "免费",
    desc: "SDS抑郁量表 + SAS焦虑量表 + LES生活事件量表，三重评估你的心理状态。",
    features: ["三维度评估", "风险等级判定", "专业建议"],
    href: "/tools/emotional-assessment",
  },
  {
    title: "三思决策法",
    price: "免费",
    desc: "一个简洁有力的决策工具：你真正想要什么？你愿意放弃什么？你准备好了吗？",
    features: ["场景化引导", "决策报告生成"],
    href: "/tools/three-questions",
  },
  {
    title: "个性化定制咨询",
    price: "详询",
    priceHref: "/about-simon/connect",
    desc: "不被标准流程框住。你的问题可能跨领域、跨阶段，我来为你量身定制解决方案。",
    features: ["需求深度梳理", "方案量身设计", "1对1全程陪伴", "弹性调整迭代"],
  },
];

/* ─────────────────────────────────────
   数据：客户分类墙
   ───────────────────────────────────── */
const CLIENT_CATEGORIES = [
  {
    label: "🏢 外资单位",
    count: "40+",
    clients: "箭牌糖类、罗氏研发/诊断、小皮、柯达研发中心、江森能源控制、艾利中国、库柏耐吉电气、安捷伦科技、惠普、家乐福中国、艾默生、巴特勒、华夏邓白氏、摩托罗拉、YKK拉链、施奈德、欧莱雅、惠氏、杜邦、拜尔制药、索尼中国、霍尼韦尔、飞利浦、登士柏中国、正大集团等",
  },
  {
    label: "🤝 合资单位",
    count: "5",
    clients: "上海通用汽车、和黄药业、华夏邓白氏、延锋伟世通、厦门国际银行",
  },
  {
    label: "🏛️ 国营单位",
    count: "15+",
    clients: "SMG文广传媒、上海财大MBA、申银万国期货、上海城建集团、上汽集团、上海建筑设计研究院、招行信用卡中心、中国银行、豫园商城、现代集团、中国农业银行、国泰基金等",
  },
  {
    label: "🚀 民营单位",
    count: "14+",
    clients: "沪东重机、华虹电子、浙商银行、中青旅、友讯科技、中达电通、宏力半导体、尚德太阳能、海康威视、前程无忧、上海奕尚、华住集团、携程集团",
  },
];

/* ─────────────────────────────────────
   Page 3: 服务产品
   ───────────────────────────────────── */
export default function ServicesPage() {
  return (
    <div className="as-with-sidebar">
      <SectionNav sections={SECTIONS} />

      <AboutHero
        label="Services"
        title="双轮驱动，知行合一"
        description="一轮服务组织，一轮服务个体。既知企业的痛点，也懂打工人的心声。"
      />

      {/* 双轮图示 */}
      <section id="b-services" className="as-section">
        <div className="as-container">
          <div className="mb-6 text-center">
            <h2 className="as-serif text-3xl font-bold text-[var(--as-primary-700)]">
              <span className="as-heading-line">B端：组织项目</span>
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {B_SERVICES.map((s) => (
              <div key={s.title} className="as-card p-5">
                <div className="mb-3 text-3xl">{s.icon}</div>
                <h3 className="as-serif text-xl font-bold text-[var(--as-primary-700)]">
                  {s.title}
                </h3>
                <ul className="mt-3 space-y-1.5">
                  {s.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-[var(--as-gray-600)]"
                    >
                      <span className="mt-1 text-[var(--as-primary-400)]">✦</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 职场发展模型（B端→C端的桥接） ── */}
      <section className="as-section-alt">
        <div className="as-container">
          <div className="mb-6 text-center">
            <h2 className="as-serif text-3xl font-bold text-[var(--as-primary-700)]">
              <span className="as-heading-line">职场发展模型</span>
            </h2>
            <p className="mt-2 text-sm text-[var(--as-gray-500)]">
              从组织诉求到个体成长，两个视角缺一不可
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-[var(--as-gray-100)] bg-white p-4 shadow-md sm:p-6">
              <Image
                src="/images/career-development-model.png"
                alt="职场发展模型"
                width={1200}
                height={800}
                className="h-auto w-full"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* C端产品 */}
      <section id="c-products" className="as-section-alt">
        <div className="as-container">
          <div className="mb-6 text-center">
            <h2 className="as-serif text-3xl font-bold text-[var(--as-primary-700)]">
              <span className="as-heading-line">C端：个体咨询</span>
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {C_PRODUCTS.map((p) => (
              <div key={p.title} className="as-card p-5">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="as-serif text-lg font-bold text-[var(--as-primary-700)]">
                    {p.title}
                  </h3>
                  {p.badge && (
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                      style={{ backgroundColor: p.badgeColor }}
                    >
                      {p.badge}
                    </span>
                  )}
                </div>
                <p className="text-xl font-bold text-[var(--as-accent)]">
                  {p.priceHref ? (
                    <Link scroll={false} href={p.priceHref} className="transition hover:underline hover:text-[var(--as-primary-600)]">
                      {p.price} →
                    </Link>
                  ) : (
                    p.price
                  )}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--as-gray-600)]">
                  {p.desc}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.features.map((f) => (
                    <span
                      key={f}
                      className="rounded-full bg-[var(--as-primary-50)] px-2.5 py-0.5 text-xs text-[var(--as-primary-600)]"
                    >
                      {f}
                    </span>
                  ))}
                </div>
                {p.href && (
                  <Link scroll={false}
                    href={p.href}
                    className="mt-4 inline-block rounded-md bg-[var(--as-primary-600)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--as-primary-700)]"
                  >
                    立即体验 →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 裁员故事 */}
      <section id="story" className="as-section">
        <div className="as-container">
          {/* 引言区 */}
          <div className="mb-8 text-center">
            <span className="text-5xl">💔</span>
            <h2 className="as-serif mt-3 text-3xl font-bold text-[var(--as-primary-700)]">
              5000+ 裁员背后的故事
            </h2>
          </div>

          {/* 正文 */}
          <div className="mx-auto max-w-4xl space-y-4">
            <p className="text-sm leading-relaxed text-[var(--as-gray-600)]">
              5000不是一个冰冷的数字。它是5000个深夜的电话，5000次艰难的对话，5000个人生的转折点。
              每个数字背后，都是一张具体的脸、一个家庭、一段正在经历暴风雨的人生。
            </p>

            <p className="text-sm leading-relaxed text-[var(--as-gray-600)]">
              说到底，公司打工的本质，是组织与个体之间的一场共赢平衡——你贡献能力与时间，公司给予平台与回报。
              但当业务调整、战略转向，或者你自己的价值主张变了，这个平衡就会被打破。
              主动跳槽也好，被动裁撤也罢，本质都是一回事：平衡没了，就该重新选择了。
            </p>

            <p className="text-sm leading-relaxed text-[var(--as-gray-600)]">
              我见过下午刚拿优秀员工奖、晚上就被裁的95后——不是她不够好，只是业务线被砍了。
              我见过在这家公司干了18年的老HR，亲手拟完自己的离职协议后，在车里坐了整整两个小时。
              我也见过被裁后反而松了一口气的中年人：他说"我早就想走了，只是一直没有勇气"。
            </p>

            <p className="text-sm leading-relaxed text-[var(--as-gray-600)]">
              我能做的，不是在"冷酷"和"温情"之间做选择——因为这件事本身就充满矛盾的张力。
              我尽量做到的是：让离开的人有尊严，让留下的人不恐惧，让每一次平衡被打破时，双方都能体面转身。
            </p>

            <p className="as-serif mt-6 text-center text-base font-semibold text-[var(--as-primary-600)]">
              「裁员是组织的新陈代谢，但每一个被代谢的人，都值得被看见。」
            </p>
          </div>
        </div>
      </section>

      {/* 信任背书区 */}
      <section id="clients" className="as-section-alt">
        <div className="as-container">
          <div className="mb-6 text-center">
            <h2 className="as-serif text-3xl font-bold text-[var(--as-primary-700)]">
              <span className="as-heading-line">服务过的企业</span>
            </h2>
          </div>

          {/* 数据条 */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { value: "9.7/10", label: "在行评分" },
              { value: "125+", label: "服务企业" },
              { value: "近千位", label: "职场个体" },
              { value: "985×2", label: "教育背景" },
            ].map((d) => (
              <div key={d.label} className="rounded-lg bg-white p-4 text-center shadow-sm">
                <p className="as-serif text-2xl font-bold text-[var(--as-primary-600)]">
                  {d.value}
                </p>
                <p className="mt-1 text-xs text-[var(--as-gray-500)]">
                  {d.label}
                </p>
              </div>
            ))}
          </div>

          {/* 客户分类 */}
          <div className="grid gap-4 sm:grid-cols-2">
            {CLIENT_CATEGORIES.map((cat) => (
              <div
                key={cat.label}
                className="rounded-lg border border-[var(--as-gray-100)] bg-white p-5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[var(--as-primary-700)]">
                    {cat.label}
                  </h3>
                  <span className="text-lg font-bold text-[var(--as-primary-400)]">
                    {cat.count}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--as-gray-500)]">
                  {cat.clients}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center text-xs text-[var(--as-gray-400)]">
            覆盖行业：互联网电商 · 旅游OTA · 酒店 · 汽车制造 · 医疗器械 · 制药 · 半导体
          </div>
        </div>
      </section>

      {/* 底部引导 */}
      <section className="as-section">
        <div className="text-center">
          <p className="text-[var(--as-gray-500)]">
            想看看我写了什么？
          </p>
          <Link scroll={false}
            href="/about-simon/content"
            className="mt-3 inline-block rounded-full bg-[var(--as-primary-600)] px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[var(--as-primary-700)]"
          >
            内容作品 →
          </Link>
        </div>
      </section>

      <ScrollToTopButton />
    </div>
  );
}
