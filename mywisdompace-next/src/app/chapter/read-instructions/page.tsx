import ChapterTopNav from "@/components/ChapterTopNav";


type IconProps = { className?: string };

const IconHourglass = ({ className }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M6 2h12" />
    <path d="M6 22h12" />
    <path d="M6 2c0 4 6 6 6 10s-6 6-6 10" />
    <path d="M18 2c0 4-6 6-6 10s6 6 6 10" />
  </svg>
);

const IconMirror = ({ className }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <rect x="4" y="2.5" width="16" height="19" rx="3" />
    <path d="M8 7h8" />
    <path d="M8 12h8" />
    <path d="M8 17h6" />
  </svg>
);

const IconPenTool = ({ className }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M12 2l3 6-3 6-3-6 3-6z" />
    <path d="M6 22l6-6 6 6" />
    <path d="M12 14v2" />
  </svg>
);

const IconRotateCcw = ({ className }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M3 12a9 9 0 1 0 3-6" />
    <path d="M3 4v5h5" />
  </svg>
);

const IconLock = ({ className }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <rect x="5" y="10" width="14" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);

const guidelines = [
  {
    icon: IconHourglass,
    title: "缓慢阅读，允许暂停",
    desc: "人生没有标准进度条。你不需要急于求成，当状态不佳或感到疲惫时，请允许自己随时停下。在头脑清晰时再继续。",
  },
  {
    icon: IconMirror,
    title: "坦诚面对，只悦纳自己",
    desc: "这不是展示给他人的答卷。不需要为了体面而修饰。哪怕答案不够成熟，只要是真实的，就足够珍贵。",
  },
  {
    icon: IconPenTool,
    title: "允许修改，拥抱变化",
    desc: "人生是蜿蜒的山路。今天的你与未来的你会有不同的风景。请允许答案变化，随时回来涂改、推翻、重写。",
  },
  {
    icon: IconRotateCcw,
    title: "定期复盘，跨时空对话",
    desc: "设定一个属于自己的复盘周期。不必强迫得出结论，只需观察哪些变了、哪些没变。这本身就是珍贵的自我对话。",
  },
  {
    icon: IconLock,
    title: "妥善安放，守护边界",
    desc: "这里记录着你最私密的思考。请将它安放在安全的位置。分享与否全由你自己决定。你的隐私有权被保护。",
  },
] as const;

const tocItems = [
  { id: "intro", label: "序言" },
  { id: "quote", label: "引言" },
  { id: "text", label: "正文" },
  { id: "structure", label: "结构" },
  { id: "guidelines", label: "阅读建议" },
  { id: "closing", label: "结语" },
];

export default function ReadInstructionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F6E9D2] via-[#F2E3C2] to-[#FAF7F1]">
      <ChapterTopNav />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:pt-12">
        <section
          id="intro"
          className="relative mt-6 overflow-hidden rounded-3xl border border-black/10 bg-[#3A2B1F]/75 shadow-[0_14px_36px_rgba(43,32,23,0.2)]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(58,43,31,0.45), rgba(58,43,31,0.45)), url('/images/hero-reading.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="px-6 py-8 text-center text-white sm:px-10 sm:py-10">
            <p className="text-xs tracking-[0.35em] text-white/80">CHAPTER 0</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
              阅读说明 Read Instructions
            </h1>
          </div>
        </section>


        <div className="mt-10 grid gap-8 lg:grid-cols-[200px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-black/10 bg-white/70 p-4 text-center shadow-sm backdrop-blur">
              <div className="text-base font-bold uppercase tracking-[0.2em] text-[#7A6A52]">
                页面导航
              </div>
              <ul className="mt-4 space-y-3 text-[17px] font-semibold">
                {tocItems.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="block rounded-lg px-2 py-3 text-[#3D3A32] transition hover:bg-[#F6E9D2]"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

          </aside>


          <div className="space-y-10">
            <section
              id="quote"
              className="rounded-3xl border border-black/10 bg-white/80 p-8 shadow-sm"
            >
              <p className="text-center text-xl italic leading-relaxed text-[#4F5B3B]">
                面对无常，真正的崩溃往往不是无常本身，而是毫无准备的仓促。
              </p>

            </section>

            <section
              id="text"
              className="rounded-3xl border border-black/10 bg-white/80 p-8 shadow-sm"
            >
              <div className="space-y-5 text-[15px] leading-loose text-[#3F3B34]">
                <p className="first-letter:float-left first-letter:mr-2 first-letter:text-4xl">

                  在这个充满不确定性的时代，无常的来袭往往不打招呼。我们习惯为升学、资产做详尽规划，却鲜少去回答一个更基础的问题：如果人生不能按预期继续，我是否预留了应对的空间？
                </p>
                <p>
                  《一生的整理》并非一本关于死亡的沉重教条，而是一份
                  <strong className="font-semibold text-[#2F2A24]">
                    关于如何认真回顾此生
                  </strong>
                  的使用说明书。在这个家庭结构变迁的当下，我们越来越不能假设总有人替我们收拾残局。因此，提前搭建一套“人生与终局”的准备系统，不再是悲观，而是一种属于成年人的
                  <strong className="font-semibold text-[#2F2A24]">
                    成熟
                  </strong>
                  。
                </p>
              </div>
            </section>

            <section
              id="structure"
              className="rounded-3xl border border-black/10 bg-white/80 p-8 shadow-sm"
            >
              <div className="grid gap-6 text-sm text-[#6A6256] md:grid-cols-2 md:divide-x md:divide-[#E6DCC7]">
                <div className="pr-0 md:pr-6">
                  <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9A8A72]">
                    上半场
                  </div>
                  <p className="mt-3 leading-relaxed">
                    看见自己，积极去活，在清醒中建构属于你的日常与回应。
                  </p>
                </div>
                <div className="pl-0 md:pl-6">
                  <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9A8A72]">
                    下半场
                  </div>
                  <p className="mt-3 leading-relaxed">
                    清楚交代，好好告别，为重要的人留下清晰与体面的答案。
                  </p>
                </div>
              </div>
            </section>

            <section id="guidelines" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {guidelines.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className={`rounded-2xl bg-white p-8 shadow-sm transition-transform duration-200 hover:-translate-y-1 ${
                        index === guidelines.length - 1
                          ? "md:col-span-2 md:mx-auto md:max-w-[420px]"
                          : ""
                      }`}
                    >
                      <div className="mb-4">
                        <Icon className="h-6 w-6 text-[#4F5B3B]" />
                      </div>
                      <h3 className="text-base font-semibold text-[#3D3D3D]">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-[1.6] text-[#666]">
                        {item.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
              <p className="text-center text-xs italic text-gray-400">
                特别说明：如果在整理过程中感到强烈的不适或情绪困扰，请优先照顾好自己，并寻求专业人士的支持。
              </p>
            </section>

            <section
              id="closing"
              className="mx-auto max-w-3xl rounded-3xl border border-black/10 bg-[#F3EDE1] p-8 text-center text-sm leading-relaxed text-[#4A433A]"
            >
              这些书写并不是为了完美答案，而是为了留下清晰与温柔的痕迹。
              <strong className="font-semibold text-[#2F2A24]">
                我已经认真活过...
              </strong>
            </section>

          </div>
        </div>
        <div className="mx-auto mt-10 max-w-3xl pb-6 text-center text-xs text-[#7A6A52]">
          网站制作：思考熊 | 内容来源：《一生的整理》（全网同名：借假修真的思考熊）
        </div>

      </main>
    </div>
  );
}

