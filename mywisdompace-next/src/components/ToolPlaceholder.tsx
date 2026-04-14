import Link from "next/link";
import { getToolInfo, getToolStatusText } from "@/lib/tools";
import PersonalityTestCards from "@/components/PersonalityTestCards";
import PreparednessSlider from "@/app/chapter/read-instructions/PreparednessSlider";

// ── 框架卡片数据与组件 ──
const frameworkCards = [
  {
    title: "上半部分：如何积极地活",
    subtitle: "「看见自己」\n「积极去活」",
    desc: "认识自己是谁，状态怎么样，珍惜过什么，喜欢过什么，还有哪些尚未完成的、藏在内心深处的心愿",
  },
  {
    title: "下半部分：如何坦然地死",
    subtitle: "「清楚交代」\n「好好告别」",
    desc: "把该建立的深度生死信仰建立到位；把想说的重要的话说完；把此生看重的事情安排好",
  },
];

function FrameworkGrid() {
  return (
    <div className="mt-6 grid gap-6 md:grid-cols-2 md:items-stretch">
      {frameworkCards.map((card) => (
        <div
          key={card.title}
          className="flex h-full flex-col gap-4 rounded-lg border border-[#E8E4DD] bg-[#FAF8F3] p-6 text-left"
        >
          <div className="text-[18px] font-semibold text-[#4A3728]">
            {card.title}
          </div>
          <div className="whitespace-pre-line text-[15px] font-semibold text-[#4A3728]">
            {card.subtitle}
          </div>
          <p className="text-[15px] leading-[1.7] text-[#5A5A5A]">
            {card.desc}
          </p>
        </div>
      ))}
    </div>
  );
}

// ── 提醒事项数据与组件 ──
const reminderCards = [
  {
    title: "① 缓慢阅读，允许暂停",
    desc: "网站中的内容与工具，可以被视为贯穿人生不同阶段的一系列重要功课。在阅读与练习的过程中，并不需要急于求成，更不必一气呵成。你可以从「看见自己」的相关内容开始，慢慢寻找属于自己的节奏。当状态不佳、感受不到连接，或只是单纯觉得累了，随时放下，都是被允许的。建议尽量在头脑清晰、身体不疲惫、情绪相对稳定的时候，进行重要的思考与练习。",
  },
  {
    title: "② 坦诚细致，对己负责",
    desc: "本网站的内容并不是一份需要对他人展示的答卷。所有问题，最终只服务于你自己，并且帮助你逐步形成生命的自洽。因此，在填写与思考的过程中，请尽量对自己保持充分的坦诚。不需要为了给谁看而写得好看，也不需要迎合任何\"应该如此\"的期待。哪怕答案并不光彩、不够体面，甚至尚未想清楚、显得不够成熟和完善——但只要它是真实的，这便已足够。",
  },
  {
    title: "③ 反复修改，允许变化",
    desc: "网站中的许多问题，都不存在一次就能完成的版本。今天的你，与多年后的你，可能会在同一件事上给出完全不同的答案。请允许这些变化发生。你可以随时回到某一页，涂改、补充、推翻乃至重写。每个人的人生轨道本就不会是一条笔直的铁轨，而更像是一条蜿蜒起伏的山路——当你站在山脚、山腰或山顶，回眼望去，眼中都会出现不一样的景致。",
  },
  {
    title: "④ 定期复盘，照见变化",
    desc: "如果条件允许，你可以为自己设定一个\"复盘周期\"。譬如半年或一年一次，或在人生发生重要变化或重大事件之后，再去重新翻看一下曾经的记录。你不必强迫自己马上要得出结论或写上新的东西，可以先只是看看：细细观察哪些地方已发生了改变，哪些地方相关的问题依然存在。这本身，就是一种极其珍贵的穿越时空的自我对话。",
  },
  {
    title: "⑤ 妥善保管，尊重边界",
    desc: "在这个网站上，可能会逐渐记录下你最真实、最私密的思考与选择。建议将你的记录存放在一个你觉得安全、安心的位置。是否与他人分享、分享多少、在什么时候分享，都应由你自己决定。你的整理，你的隐私，有权被保护妥当。",
  },
];

function ReminderList() {
  return (
    <div className="mt-6 flex flex-col gap-4 text-left">
      {reminderCards.map((card) => (
        <div
          key={card.title}
          className="rounded-lg border border-[#E8D9C2] bg-[#FAF8F3] p-5"
        >
          <div className="text-[18px] font-semibold text-[#4A3728]">
            {card.title}
          </div>
          <p className="mt-3 text-[15px] leading-[1.7] text-[#5A5A5A]">
            {card.desc}
          </p>
        </div>
      ))}
      <p className="mt-2 text-[14px] italic text-[#888888]">
        如果你在使用过程中感到长时间的强烈不适或情绪困扰，请优先照顾好自己，并考虑寻求身边的专业人士进行相关支持。
      </p>
    </div>
  );
}

// ── 生命余光入口卡片 ──
function LifeClockEntry() {
  return (
    <Link
      href="/tools/life-clock"
      className="group mt-8 block overflow-hidden rounded-2xl border border-[#E8D9C2] bg-white p-1 transition-all hover:border-[#C87941] hover:shadow-[0_12px_24px_rgba(200,121,65,0.12)]"
    >
      <div className="flex flex-col items-center gap-6 p-6 sm:flex-row">
        {/* 左侧图标/视觉 */}
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#FDF5EE] text-4xl shadow-inner transition-transform group-hover:scale-110">
          ⏳
        </div>
        
        {/* 中间文字 */}
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-xl font-bold text-[#4A3728] transition-colors group-hover:text-[#C87941]">
            生命余光 · 倒计时
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[#8A7E6A]">
            看见时间的刻度，直面生命的有限。通过简单的生活方式评估，计算出你具象的生命余晖剩余时间。
          </p>
        </div>

        {/* 右侧动作 */}
        <div className="flex items-center gap-2 rounded-full bg-[#C87941] px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all group-hover:bg-[#A85E2D] group-hover:px-8">
          开启计时
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

// ── 三思清单入口卡片 ──
function ThreeQuestionsEntry() {
  return (
    <Link
      href="/tools/three-questions"
      className="group mt-8 block overflow-hidden rounded-2xl border border-[#E8D9C2] bg-white p-1 transition-all hover:border-[#C87941] hover:shadow-[0_12px_24px_rgba(200,121,65,0.12)]"
    >
      <div className="flex flex-col items-center gap-6 p-6 sm:flex-row">
        {/* 左侧图标/视觉 */}
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#FDF5EE] text-4xl shadow-inner transition-transform group-hover:scale-110">
          ⚖️
        </div>
        
        {/* 中间文字 */}
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-xl font-bold text-[#4A3728] transition-colors group-hover:text-[#C87941]">
            三思清单 · 重大决策
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[#8A7E6A]">
            面对人生重大抉择，通过价值观、心理预期、稀缺性三个维度的深度追问，帮你做出不留遗憾的人生交代。
          </p>
        </div>

        {/* 右侧动作 */}
        <div className="flex items-center gap-2 rounded-full bg-[#C87941] px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all group-hover:bg-[#A85E2D] group-hover:px-8">
          开启深思
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

// ── 情绪与压力测评入口卡片 ──
function DepressionAssessmentEntry() {
  return (
    <Link
      href="/tools/emotional-stress-test"
      className="group mt-8 block overflow-hidden rounded-2xl border border-[#E8D9C2] bg-white p-1 transition-all hover:border-[#C87941] hover:shadow-[0_12px_24px_rgba(200,121,65,0.12)]"
    >
      <div className="flex flex-col items-center gap-6 p-6 sm:flex-row">
        {/* 左侧图标/视觉 */}
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#FDF5EE] text-4xl shadow-inner transition-transform group-hover:scale-110">
          🧠
        </div>
        
        {/* 中间文字 */}
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-xl font-bold text-[#4A3728] transition-colors group-hover:text-[#C87941]">
            情绪与压力测评
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[#8A7E6A]">
            全面评估你的情绪、压力与紧张状态。基于 SDS、SAS 及 LES 量表，帮助你识别潜在心理风险，提供个性化调节建议。
          </p>
        </div>

        {/* 右侧动作 */}
        <div className="flex items-center gap-2 rounded-full bg-[#C87941] px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all group-hover:bg-[#A85E2D] group-hover:px-8">
          开始测评
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

// 生产环境检测
const isDev = process.env.NODE_ENV === "development";

export function ToolPlaceholder({ toolId }: { toolId: string }) {
  // 特殊处理：性格测试卡片
  if (toolId === "personality-test-cards") {
    return <PersonalityTestCards />;
  }

  // 特殊处理：生命余光入口
  if (toolId === "life-clock") {
    return <LifeClockEntry />;
  }

  // 特殊处理：三思清单入口
  if (toolId === "three-questions-tool") {
    return <ThreeQuestionsEntry />;
  }

  // 特殊处理：情绪与压力测评入口
  if (toolId === "emotional-stress-test") {
    return <DepressionAssessmentEntry />;
  }

  // 特殊处理：预备自测滑块
  if (toolId === "preparedness-slider") {
    return (
      <div className="mt-6 rounded-lg border border-[#E8D9C2] bg-[#FAF8F3] p-6">
        <PreparednessSlider />
      </div>
    );
  }

  // 特殊处理：人生框架
  if (toolId === "framework-grid") {
    return <FrameworkGrid />;
  }

  // 特殊处理：使用提醒
  if (toolId === "reminder-list") {
    return <ReminderList />;
  }

  const tool = getToolInfo(toolId);
  if (!tool) return null;

  const statusText = getToolStatusText(tool.status);
  const statusClass =
    tool.status === "ready"
      ? "bg-emerald-600 text-white"
      : tool.status === "maintenance"
        ? "bg-zinc-200 text-zinc-700"
        : "bg-amber-200 text-zinc-900";

  return (
    <div className="mt-8 rounded-2xl border border-border bg-background/40 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-foreground">{tool.name}</div>
          <div className="mt-1 text-sm text-muted">{tool.description}</div>
        </div>
        <span
          className={
            "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium " + statusClass
          }
        >
          {statusText}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled
          className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-muted opacity-60"
        >
          展开工具
        </button>

        <details className="group">
          <summary className="cursor-pointer list-none rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-foreground">
            了解更多
          </summary>
          <div className="mt-2 max-w-xl rounded-xl border border-border bg-surface p-3 text-sm text-muted shadow-[var(--shadow-card)]">
            这是占位组件：后续会把工具做成可交互模块，并支持登录后保存。
          </div>
        </details>
      </div>

      {/* 仅在开发环境显示调试信息 */}
      {isDev && (
        <div className="mt-3 text-xs text-muted">
          toolId: <span className="font-mono">{toolId}</span>
        </div>
      )}
    </div>
  );
}
