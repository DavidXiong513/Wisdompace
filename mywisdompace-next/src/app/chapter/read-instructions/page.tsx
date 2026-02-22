import ChapterTopNav from "@/components/ChapterTopNav";
import ReadInstructionsToc from "@/app/chapter/read-instructions/ReadInstructionsToc";
import PreparednessSlider from "@/app/chapter/read-instructions/PreparednessSlider";
import ScrollTopButton from "@/app/chapter/read-instructions/ScrollTopButton";


const tocItems = [
  { id: "origin", label: "缘起" },
  { id: "intention", label: "初衷" },
  { id: "preparedness", label: "预备自测" },
  { id: "framework", label: "框架" },
  { id: "usage", label: "使用说明" },
  { id: "reminders", label: "五点提醒" },
];

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

const reminderCards = [
  {
    title: "① 缓慢阅读，允许暂停",
    desc: "网站中的内容与工具，可以被视为贯穿人生不同阶段的一系列重要功课。在阅读与练习的过程中，并不需要急于求成，更不必一气呵成。你可以从「看见自己」的相关内容开始，慢慢寻找属于自己的节奏。当状态不佳、感受不到连接，或只是单纯觉得累了，随时放下，都是被允许的。建议尽量在头脑清晰、身体不疲惫、情绪相对稳定的时候，进行重要的思考与练习。",
  },
  {
    title: "② 坦诚细致，对己负责",
    desc: "本网站的内容并不是一份需要对他人展示的答卷。所有问题，最终只服务于你自己，并且帮助你逐步形成生命的自洽。因此，在填写与思考的过程中，请尽量对自己保持充分的坦诚。不需要为了给谁看而写得好看，也不需要迎合任何“应该如此”的期待。哪怕答案并不光彩、不够体面，甚至尚未想清楚、显得不够成熟和完善——但只要它是真实的，这便已足够。",
  },
  {
    title: "③ 反复修改，允许变化",
    desc: "网站中的许多问题，都不存在一次就能完成的版本。今天的你，与多年后的你，可能会在同一件事上给出完全不同的答案。请允许这些变化发生。你可以随时回到某一页，涂改、补充、推翻乃至重写。每个人的人生轨道本就不会是一条笔直的铁轨，而更像是一条蜿蜒起伏的山路——当你站在山脚、山腰或山顶，回眼望去，眼中都会出现不一样的景致。",
  },
  {
    title: "④ 定期复盘，照见变化",
    desc: "如果条件允许，你可以为自己设定一个“复盘周期”。譬如半年或一年一次，或在人生发生重要变化或重大事件之后，再去重新翻看一下曾经的记录。你不必强迫自己马上要得出结论或写上新的东西，可以先只是看看：细细观察哪些地方已发生了改变，哪些地方相关的问题依然存在。这本身，就是一种极其珍贵的穿越时空的自我对话。",
  },
  {
    title: "⑤ 妥善保管，尊重边界",
    desc: "在这个网站上，可能会逐渐记录下你最真实、最私密的思考与选择。建议将你的记录存放在一个你觉得安全、安心的位置。是否与他人分享、分享多少、在什么时候分享，都应由你自己决定。你的整理，你的隐私，有权被保护妥当。",
  },
];

export default function ReadInstructionsPage() {
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
                <section
                  id="origin"
                  className="scroll-mt-24 rounded-xl border border-[#E8E4DD] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] sm:p-7 lg:p-10"
                >
                  <h2 className="text-[24px] font-bold text-[#4A3728]">
                    缘起
                  </h2>
                  <div className="mt-3 h-[3px] w-10 bg-[#4A3728]" />
                  <div className="mt-4 space-y-4 text-[17px] leading-[1.85] tracking-[-0.01em] text-[#3D3D3D]">
                    <p className="indent-[2em]">
                      这个网站的构想，其实在早几年就已经存在。只是那时的我，总觉得还不急，还太早，还可以再等等……
                    </p>
                    <p className="indent-[2em]">
                      但在最近这一年里，我愈发清晰地感受到：
                    </p>
                    <p className="indent-[2em]">
                      在这个充满不确定性的时代，无常的来袭往往不打招呼，也不讲道理。
                    </p>
                    <p className="indent-[2em]">
                      一些看似毫无征兆的中年同龄人生病与离世的事件愈发增多；单身、不婚不育、丁克、离异与孤寡家庭结构已开始逐渐变得常态化；互联网上各自媒体平台关于生命意义的焦虑与迷茫不断蔓延；以及，家中两方奔八的父母亲们，也正在一年年、一天天地走在衰老的路上……
                    </p>
                    <p className="indent-[2em]">
                      这些现实，让我越来越难以继续告诉自己：“这件事，可以再等等。”
                    </p>
                  </div>
                  <div className="my-6 rounded-[6px] border-l-[4px] border-[#4A3728] bg-[#F0E8DC] px-6 py-5 text-[17px] font-medium text-[#4A3728]">
                    “这件事，可以再等等。”
                  </div>
                </section>

                <section
                  id="intention"
                  className="scroll-mt-24 rounded-xl border border-[#E8E4DD] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] sm:p-7 lg:p-10"
                >
                  <h2 className="text-[24px] font-bold text-[#4A3728]">
                    初衷
                  </h2>
                  <div className="mt-3 h-[3px] w-10 bg-[#4A3728]" />
                  <div className="mt-4 space-y-4 text-[17px] leading-[1.85] tracking-[-0.01em] text-[#3D3D3D]">
                    <p className="indent-[2em]">
                      创建这个网站，并不是因为我已经参透了生死，从而来给大家煲些所谓的人生鸡汤……
                    </p>
                    <p className="indent-[2em]">
                      恰恰相反，是因为我一次又一次地意识到：我们绝大多数人，对“无常”的准备，几乎为零。
                    </p>
                    <p className="indent-[2em]">
                      我们习惯为学业、职业、家庭、资产做出详尽的长期规划，却很少正面去回答一个更基础的问题：
                    </p>
                  </div>
                  <div className="my-6 rounded-[6px] border-l-[4px] border-[#4A3728] bg-[#F0E8DC] px-6 py-5 text-[17px] font-medium text-[#4A3728]">
                    “如果人生不能按预期的计划继续，我是否提前为自己预留过应对无常的空间？”
                  </div>
                  <div className="space-y-4 text-[17px] leading-[1.85] tracking-[-0.01em] text-[#3D3D3D]">
                    <p className="indent-[2em]">
                      现实中，真正让人崩溃的，往往不是“生死无常”本身，而是在这类事情发生时——毫无预想、毫无交代、毫无共识、毫无选择权。
                    </p>
                    <p className="indent-[2em]">
                      于是，决定被仓促做出，责任被情绪裹挟，混乱被留给了最亲近的人。
                    </p>
                    <p className="indent-[2em]">
                      这个网站，与其说是“关于死亡”，不如说更像是一份“关于我们如何认真回顾此生的使用说明书”。
                    </p>
                    <p className="indent-[2em]">
                      它关心的是：
                    </p>
                  </div>
                  <ul className="mt-4 list-disc space-y-3 pl-6 text-[17px] leading-[1.8] tracking-[-0.01em] text-[#3D3D3D] marker:text-[#8B7355]">
                    <li>如何如实地面对自己</li>
                    <li>如何系统地归纳一生</li>
                    <li>如何在接受无常的前提下，为自己预留一些选择权</li>
                  </ul>
                  <div className="mt-5 space-y-4 text-[17px] leading-[1.85] tracking-[-0.01em] text-[#3D3D3D]">
                    <p className="indent-[2em]">
                      从而能够认真、清醒、有尊严及有趣味地活着。
                    </p>
                    <p className="indent-[2em]">
                      它并不只写给老年人、病人，也不只写给那些站在人生终点附近的人。
                    </p>
                    <p className="indent-[2em]">
                      它是写给所有已经开始思考这样一个问题的人：
                    </p>
                  </div>
                  <div className="my-6 rounded-[6px] border-l-[4px] border-[#4A3728] bg-[#F0E8DC] px-6 py-5 text-[17px] font-medium text-[#4A3728]">
                    “如果此生无法被预测和控制，那我是否至少可以，提前在因地做一些让自己身体与心灵得到安顿的筹备？”
                  </div>
                </section>

                <section
                  id="preparedness"
                  className="scroll-mt-24 rounded-xl border border-[#E8E4DD] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] sm:p-7 lg:p-10"
                >
                  <h2 className="text-[24px] font-bold text-[#4A3728]">
                    预备自测
                  </h2>
                  <div className="mt-3 h-[3px] w-10 bg-[#4A3728]" />
                  <div className="mt-4 space-y-3 text-[16px] leading-[1.85] tracking-[-0.01em] text-[#3D3D3D]">
                    <p className="indent-[2em]">
                      这不是一场考试，只是帮你辨识当下的准备程度。你可以随时调整分值，记录真实的当下即可。
                    </p>
                    <p className="indent-[2em]">
                      如果你觉得难以判断，也没关系——从直觉出发，先给出一个大致区间。
                    </p>
                  </div>
                  <div className="mt-6 rounded-lg border border-[#E8E4DD] bg-[#FAF8F3] p-6">
                    <PreparednessSlider />
                  </div>
                </section>

                <section
                  id="framework"
                  className="scroll-mt-24 rounded-xl border border-[#E8E4DD] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] sm:p-7 lg:p-10"
                >
                  <h2 className="text-[24px] font-bold text-[#4A3728]">
                    框架
                  </h2>
                  <div className="mt-3 h-[3px] w-10 bg-[#4A3728]" />
                  <div className="mt-4 space-y-4 text-[17px] leading-[1.85] tracking-[-0.01em] text-[#3D3D3D]">
                    <p className="indent-[2em]">本网站分为两大部分和四大篇章。</p>
                  </div>
                  <div className="mt-6 grid gap-6 md:grid-cols-2 md:items-stretch">
                    {frameworkCards.map((card) => (
                      <div
                        key={card.title}
                        className="flex h-full flex-col gap-4 rounded-lg border border-[#E8E4DD] bg-[#FAF8F3] p-6"
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
                  <div className="mt-6 space-y-4 text-[17px] leading-[1.85] tracking-[-0.01em] text-[#3D3D3D]">
                    <p className="indent-[2em]">
                      在这个单身、不婚、不育、家庭结构不断变化的时代，我们越来越不能假设：总会有人替我们收拾残局。
                    </p>
                    <p className="indent-[2em]">
                      也正因如此，提前为自己搭建一套“人生与终局”的准备系统，不再是悲观，而是一种成熟。
                    </p>
                    <p className="indent-[2em]">
                      如果你对以上这些内容产生了共鸣，很可能内心敏锐的你早已意识到：面对无常，逃避并不会让事情更轻松。
                    </p>
                    <p className="indent-[2em]">
                      衷心希望，这个网站能成为你的一个安静空间——不催促你，不吓唬你，只陪你把这一生，慢慢整理清楚。
                    </p>
                    <p className="indent-[2em]">
                      当有一天，你回望此生时，或许不能说一切都完美，但至少可以说一句：
                    </p>
                  </div>
                  <div className="my-6 rounded-[6px] border-l-[4px] border-[#4A3728] bg-[#F0E8DC] px-6 py-5 text-[17px] font-medium text-[#4A3728]">
                    “我已经认真地活过，也已经为无常，做好了该做的整理与筹备。”
                  </div>
                </section>

                <section
                  id="usage"
                  className="scroll-mt-24 rounded-xl border border-[#E8E4DD] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] sm:p-7 lg:p-10"
                >
                  <h2 className="text-[24px] font-bold text-[#4A3728]">
                    使用说明
                  </h2>
                  <div className="mt-3 h-[3px] w-10 bg-[#4A3728]" />
                  <div className="mt-4 space-y-4 text-[16px] leading-[1.85] tracking-[-0.01em] text-[#3D3D3D]">
                    <p className="indent-[2em]">
                      本网站共分为四个篇章。在不同篇章中，我们会引导你结合相应章节的工具与模板，围绕自己真实的人生处境，进行深入的思考与整理。
                    </p>
                    <p className="indent-[2em]">
                      为了便于理解和使用，网站中会提供相应的示范案例（Demo），并尽量将练习设计为手册表格或可选项的形式，以减少大量书写与理解工具本身所带来的负担。
                    </p>
                    <p className="indent-[2em]">但需要郑重说明的是：</p>
                  </div>
                  <div className="my-6 rounded-[6px] border-l-[4px] border-[#4A3728] bg-[#F0E8DC] px-6 py-5 text-[17px] font-medium text-[#4A3728]">
                    “无论我们提供多少辅助，真正的思考与整理，始终只能由你自己完成。”
                  </div>
                  <div className="space-y-4 text-[16px] leading-[1.85] tracking-[-0.01em] text-[#3D3D3D]">
                    <p className="indent-[2em]">
                      这些练习，并不是为了“完成任务”，而是一次次认真对待自己人生的过程。
                    </p>
                  </div>
                </section>

                <section
                  id="reminders"
                  className="scroll-mt-24 rounded-xl border border-[#E8E4DD] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] sm:p-7 lg:p-10"
                >
                  <h2 className="text-[24px] font-bold text-[#4A3728]">
                    五点提醒
                  </h2>
                  <div className="mt-3 h-[3px] w-10 bg-[#4A3728]" />
                  <div className="mt-6 flex flex-col gap-4">
                    {reminderCards.map((card) => (
                      <div
                        key={card.title}
                        className="rounded-lg border border-[#E8E4DD] bg-[#FAF8F3] p-5"
                      >
                        <div className="text-[18px] font-semibold text-[#4A3728]">
                          {card.title}
                        </div>
                        <p className="mt-3 text-[15px] leading-[1.7] text-[#5A5A5A]">
                          {card.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-6 text-[14px] italic text-[#888888]">
                    如果你在使用过程中感到长时间的强烈不适或情绪困扰，请优先照顾好自己，并考虑寻求身边的专业人士进行相关支持。
                  </p>
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
