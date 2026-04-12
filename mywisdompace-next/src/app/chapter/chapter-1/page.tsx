import Link from "next/link";
import ChapterTopNav from "@/components/ChapterTopNav";
import ReadInstructionsToc from "@/app/chapter/read-instructions/ReadInstructionsToc";
import ScrollTopButton from "@/app/chapter/read-instructions/ScrollTopButton";
import PersonalityTestCards from "@/components/PersonalityTestCards";
import { getChapterBySlug } from "@/data/chapters";

const tocItems = [
  { id: "stop-and-look", label: "停下，看看自己" },
  { id: "personality-tests", label: "性格自测工具" },
  { id: "career-values", label: "生涯价值观测评" },
  { id: "ability-assessment", label: "社会能力自测" },
  { id: "social-roles", label: "我的社会角色" },
  { id: "true-self", label: "剥去角色后的自己" },
  { id: "summary", label: "重新认识自己" },
];

export default function ChapterOnePage() {
  const chapter = getChapterBySlug("chapter-1");
  if (!chapter) return null;

  return (
    <div className="relative min-h-screen bg-[#F5F0E8]">
      <div
        className="pointer-events-none absolute inset-0 bg-center bg-cover bg-no-repeat opacity-30"
        style={{ backgroundImage: "url('/images/hero-subbackground.webp')" }}
        aria-hidden
      />
      <div className="relative z-10">
        <ChapterTopNav
          containerClassName="max-w-[min(1800px,96vw)] px-6"
          navClassName="md:ml-0 md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[min(1316px,92vw)] md:flex md:items-center"
          navListClassName="w-[940px] max-w-none lg:ml-[80px] xl:ml-[185px] 2xl:ml-[220px]"
        />
        <main className="mx-auto max-w-[min(1800px,96vw)] px-6 pb-20 pt-8 sm:pt-10">
          <ReadInstructionsToc items={tocItems} />
          <div className="lg:ml-[280px]">
            <div className="mx-auto w-full max-w-[min(1316px,92vw)]">
              <div className="flex flex-col gap-8">
                {/* 停下，看看自己 */}
                <section
                  id="stop-and-look"
                  className="scroll-mt-24 rounded-xl border border-[#E8E4DD] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] sm:p-7 lg:p-10"
                >
                  <h2 className="text-[24px] font-bold text-[#4A3728]">
                    停下，看看自己
                  </h2>
                  <div className="mt-3 h-[3px] w-10 bg-[#4A3728]" />
                  <div className="mt-4 space-y-4 text-[17px] leading-[1.85] tracking-[-0.01em] text-[#3D3D3D]">
                    <p className="indent-[2em]">
                      在人生的某个时刻，我们突然意识到：自己已经走了很远，却很少真正停下来看看自己。日子一天天过去，我们忙着回应外界的需求，却渐渐听不见内心的声音。
                    </p>
                    <p className="indent-[2em]">
                      我们被推着向前走，被各种期待、责任、角色所定义。我们是谁？我们想要什么？这些问题似乎越来越模糊。有人说，最远的旅程是从头脑到心灵——而这段旅程的第一步，就是停下来。
                    </p>
                    <p className="indent-[2em]">
                      这一章，邀请你停下来，重新认识自己。不是为了改变什么，而是为了看见——看见那些被忽略的部分，看见真实的自己。下面的每一项测评，都是一面镜子，它们不会告诉你答案，但会帮助你更清晰地照见自己的轮廓。
                    </p>
                  </div>
                </section>

                {/* 性格自测工具 */}
                <section
                  id="personality-tests"
                  className="scroll-mt-24 rounded-xl border border-[#E8E4DD] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] sm:p-7 lg:p-10"
                >
                  <h2 className="text-[24px] font-bold text-[#4A3728]">
                    性格自测工具
                  </h2>
                  <div className="mt-3 h-[3px] w-10 bg-[#4A3728]" />
                  <div className="mt-4 space-y-4 text-[17px] leading-[1.85] tracking-[-0.01em] text-[#3D3D3D]">
                    <p className="indent-[2em]">
                      在开始深入探索之前，我们为你准备了两个经典的性格测评工具。
                    </p>
                    <p className="indent-[2em]">
                      这些测试可以帮助你从不同角度认识自己的性格特质、行为模式和思维偏好。它们不是为了给你贴标签，而是提供一个参考框架，让你更好地理解自己。
                    </p>
                    <p className="indent-[2em]">
                      你可以选择其中一个或两个都尝试，没有对错，只有更深入的自我认识。
                    </p>
                  </div>
                  <PersonalityTestCards />
                </section>

                {/* 生涯价值观测评 */}
                <section
                  id="career-values"
                  className="scroll-mt-24 rounded-xl border border-[#E8E4DD] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] sm:p-7 lg:p-10"
                >
                  <h2 className="text-[24px] font-bold text-[#4A3728]">
                    生涯价值观测评
                  </h2>
                  <div className="mt-3 h-[3px] w-10 bg-[#4A3728]" />
                  <div className="mt-4 space-y-4 text-[17px] leading-[1.85] tracking-[-0.01em] text-[#3D3D3D]">
                    <p className="indent-[2em]">
                      性格告诉你&quot;我是谁&quot;，能力回答&quot;我能做什么&quot;，而价值观决定了&quot;我为什么而活&quot;。
                    </p>
                    <p className="indent-[2em]">
                      价值观是我们做选择的底层逻辑——它影响着我们的职业方向、人际关系、生活方式，甚至是面对困境时的取舍。然而，许多时候我们并不清楚自己真正看重什么，只是随波逐流地做着&quot;应该&quot;做的事。
                    </p>
                    <p className="indent-[2em]">
                      这项测评将帮助你梳理自己的核心价值观，看清哪些东西对你真正重要，哪些只是外界强加的期望。只有明白了自己的价值坐标，才能做出真正属于自己的选择。
                    </p>
                  </div>
                  {/* 生涯价值观测评链接卡片 */}
                  <div className="mt-8">
                    <Link
                      href="/tools/career-values-test"
                      className="group relative flex items-center gap-5 overflow-hidden rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(42,32,23,0.12)]"
                    >
                      {/* 背景渐变装饰 */}
                      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-to-br from-[#A88BB8] to-[#8B6AA0] opacity-10 blur-2xl transition-opacity group-hover:opacity-20" />

                      {/* 徽章 */}
                      <div className="absolute right-4 top-4">
                        <span className="rounded-full bg-[#EDE4F3] px-3 py-1 text-xs font-medium text-[#7A5A8F]">
                          全新上线
                        </span>
                      </div>

                      {/* 图标 */}
                      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#EDE4F3] to-white text-3xl shadow-sm">
                        💎
                      </div>

                      {/* 文字内容 */}
                      <div className="relative min-w-0">
                        <h3 className="text-xl font-semibold text-[#2F2A24] transition-colors group-hover:text-[#8B6AA0]">
                          生涯价值观测评
                        </h3>
                        <p className="mt-1 text-sm font-medium text-[#8A7E6A]">
                          Career Values Assessment
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-[#6A6256]">
                          探索你的核心价值观，看清真正驱动你做选择的力量，找到属于你的人生方向。
                        </p>
                      </div>

                      {/* 箭头指示 */}
                      <div className="relative ml-auto flex shrink-0 items-center text-sm font-medium text-[#8B6AA0] transition-transform group-hover:translate-x-1">
                        开始测试
                        <svg
                          className="ml-1 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </Link>
                  </div>
                </section>

                {/* 社会能力自测 */}
                <section
                  id="ability-assessment"
                  className="scroll-mt-24 rounded-xl border border-[#E8E4DD] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] sm:p-7 lg:p-10"
                >
                  <h2 className="text-[24px] font-bold text-[#4A3728]">
                    社会能力自测
                  </h2>
                  <div className="mt-3 h-[3px] w-10 bg-[#4A3728]" />
                  <div className="mt-4 space-y-4 text-[17px] leading-[1.85] tracking-[-0.01em] text-[#3D3D3D]">
                    <p className="indent-[2em]">
                      性格告诉我们&quot;我是谁&quot;，而能力则回答&quot;我能做什么&quot;。了解自己的社会能力，是认识自我的另一面。
                    </p>
                    <p className="indent-[2em]">
                      社会能力不是单一的指标，它涵盖了沟通表达、人际协作、情绪管理、问题解决、适应变化等多个维度。你可能擅长某一方面，却在另一方面感到吃力——这很正常。
                    </p>
                    <p className="indent-[2em]">
                      通过这项自测，你可以更清晰地看到自己在各项社会能力上的优势与不足，从而更好地规划自我提升的方向，也更好地接纳自己的不完美。
                    </p>
                  </div>
                  {/* 社会能力自测链接卡片 */}
                  <div className="mt-8">
                    <Link
                      href="/tools/ability-test"
                      className="group relative flex items-center gap-5 overflow-hidden rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(42,32,23,0.12)]"
                    >
                      {/* 背景渐变装饰 */}
                      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-to-br from-[#8BA888] to-[#6B9A68] opacity-10 blur-2xl transition-opacity group-hover:opacity-20" />

                      {/* 徽章 */}
                      <div className="absolute right-4 top-4">
                        <span className="rounded-full bg-[#E8F0E8] px-3 py-1 text-xs font-medium text-[#5A7A52]">
                          全新上线
                        </span>
                      </div>

                      {/* 图标 */}
                      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#E8F0E8] to-white text-3xl shadow-sm">
                        🌱
                      </div>

                      {/* 文字内容 */}
                      <div className="relative min-w-0">
                        <h3 className="text-xl font-semibold text-[#2F2A24] transition-colors group-hover:text-[#6B9A68]">
                          社会能力自测
                        </h3>
                        <p className="mt-1 text-sm font-medium text-[#8A7E6A]">
                          Social Competence Assessment
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-[#6A6256]">
                          从沟通表达、人际协作、情绪管理、问题解决、适应变化五大维度，评估你的社会能力图谱。
                        </p>
                      </div>

                      {/* 箭头指示 */}
                      <div className="relative ml-auto flex shrink-0 items-center text-sm font-medium text-[#6B9A68] transition-transform group-hover:translate-x-1">
                        开始测试
                        <svg
                          className="ml-1 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </Link>
                  </div>
                </section>

                {/* 我的社会角色 */}
                <section
                  id="social-roles"
                  className="scroll-mt-24 rounded-xl border border-[#E8E4DD] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] sm:p-7 lg:p-10"
                >
                  <h2 className="text-[24px] font-bold text-[#4A3728]">
                    我的社会角色
                  </h2>
                  <div className="mt-3 h-[3px] w-10 bg-[#4A3728]" />
                  <div className="mt-4 space-y-4 text-[17px] leading-[1.85] tracking-[-0.01em] text-[#3D3D3D]">
                    <p className="indent-[2em]">
                      我们从出生起，就被赋予了各种角色：孩子、学生、员工、父母、伴侣……有些角色是命运的安排，有些是我们主动选择的结果。每一个角色都在我们的生命中留下了痕迹，占据着时间和心力。
                    </p>
                    <p className="indent-[2em]">
                      但你有没有想过：这些角色中，哪些是你真正看重的？哪些又只是在消耗你？你花最多时间的角色，是不是你内心最在意的那个？很多人在不知不觉中，把最好的精力给了最不重要的角色，而真正珍视的却总被搁置。
                    </p>
                    <p className="indent-[2em]">
                      「人生角色饼图」将帮助你梳理自己承担的各种社会角色，从<strong>重视程度</strong>和<strong>时间分配</strong>两个维度进行评估，让你直观地看到：你的时间和心力，究竟花在了哪里——以及它们是否花在了你真正在意的地方。
                    </p>
                  </div>
                  {/* 人生角色饼图 */}
                  <div className="mt-6">
                    <Link
                      href="/tools/role-pie-chart"
                      className="group relative flex items-center gap-5 overflow-hidden rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(200,121,65,0.12)]"
                    >
                      {/* 背景渐变装饰 */}
                      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-to-br from-[#E8B878] to-[#C87941] opacity-10 blur-2xl transition-opacity group-hover:opacity-20" />

                      {/* 图标 */}
                      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FDF5EE] to-white text-3xl shadow-sm">
                        🥧
                      </div>

                      {/* 文字内容 */}
                      <div className="relative min-w-0">
                        <h3 className="text-xl font-semibold text-[#2F2A24] transition-colors group-hover:text-[#C87941]">
                          人生角色饼图
                        </h3>
                        <p className="mt-1 text-sm font-medium text-[#8A7E6A]">
                          Life Role Pie Chart
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-[#6A6256]">
                          选择你的社会角色，评估重视程度与时间分配，发现你生命中真正的重心。
                        </p>
                      </div>

                      {/* 开始测评按钮 */}
                      <div className="relative ml-auto flex shrink-0 items-center gap-1 rounded-full bg-[#FDF5EE] px-4 py-2 text-sm font-medium text-[#C87941] transition-all group-hover:bg-[#C87941] group-hover:text-white">
                        开始测评
                        <svg
                          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </Link>
                  </div>
                </section>



                {/* 剥去角色后的自己 */}
                <section
                  id="true-self"
                  className="scroll-mt-24 rounded-xl border border-[#E8E4DD] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] sm:p-7 lg:p-10"
                >
                  <h2 className="text-[24px] font-bold text-[#4A3728]">
                    剥去角色后的自己
                  </h2>
                  <div className="mt-3 h-[3px] w-10 bg-[#4A3728]" />
                  <div className="mt-4 space-y-4 text-[17px] leading-[1.85] tracking-[-0.01em] text-[#3D3D3D]">
                    <p className="indent-[2em]">
                      如果你去掉所有的社会角色——不是谁的父母、不是谁的伴侣、不是谁的下属或上司——你还剩下什么？
                    </p>
                    <p className="indent-[2em]">
                      这个问题可能会让你感到不安，也可能会让你感到释然。有人发现自己其实很空虚，所有的意义都寄托在了角色上；有人则发现，去掉角色之后，反而触碰到了最真实的渴望和热爱。
                    </p>
                    <p className="indent-[2em]">
                      无论结果如何，这都是认识自己的重要一步。当你清楚地知道「角色之外的我」是什么样子，你才能更有意识地选择：哪些角色值得全力以赴，哪些可以轻轻放下。
                    </p>
                  </div>
                  <div className="mt-6 rounded-lg border border-[#E8E4DD] bg-[#FAF8F3] p-6 text-center text-[#7A6A52]">
                    工具开发中...
                  </div>
                </section>

                {/* 重新认识自己 */}
                <section
                  id="summary"
                  className="scroll-mt-24 rounded-xl border border-[#E8E4DD] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] sm:p-7 lg:p-10"
                >
                  <h2 className="text-[24px] font-bold text-[#4A3728]">
                    重新认识自己
                  </h2>
                  <div className="mt-3 h-[3px] w-10 bg-[#4A3728]" />
                  <div className="mt-4 space-y-4 text-[17px] leading-[1.85] tracking-[-0.01em] text-[#3D3D3D]">
                    <p className="indent-[2em]">
                      通过这一章的练习，你可能对自己有了新的认识。也许你发现了性格中未曾留意的面向，也许你重新审视了哪些价值观真正驱动着你的选择，也许你第一次看到了角色和时间之间的落差。
                    </p>
                    <p className="indent-[2em]">
                      这些认识可能并不完整，也可能并不准确——但这正是自我认识的常态。它不是一道可以得出标准答案的数学题，而是一段持续的旅程。保持耐心，保持好奇，也保持对自己的善意。
                    </p>
                    <p className="indent-[2em]">
                      带着这些新的发现，继续前行。下一章，我们将一起探索如何在看清自己之后，更积极地活出想要的人生。
                    </p>
                  </div>
                  <div className="mt-6 rounded-lg border border-[#E8E4DD] bg-[#FAF8F3] p-6">
                    <div className="text-sm font-semibold text-[#4A3728] mb-3">
                      思考题：
                    </div>
                    <ul className="list-disc space-y-2 pl-5 text-sm text-[#6A6256]">
                      <li>哪个社会角色让你感到最累？为什么？</li>
                      <li>在你的角色饼图中，时间和重视程度的落差最大的是哪个角色？</li>
                      <li>如果用一个词来形容剥去角色后的自己，你会用什么词？</li>
                      <li>你希望如何重新定义自己？</li>
                    </ul>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </main>
        <ScrollTopButton />
      </div>
    </div>
  );
}
