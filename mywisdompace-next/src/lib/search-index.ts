import { chapters } from "@/data/chapters";

export type SearchHit = {
  href: string;
  title: string;
  excerpt: string;
  score: number;
};

type Doc = {
  href: string;
  title: string;
  text: string;
};

// Read Instructions page content
const readInstructionsContent = {
  title: "预备此生",
  sections: [
    {
      id: "origin",
      title: "缘起",
      text: `这个网站的构想，其实在早几年就已经存在。只是那时的我，总觉得还不急，还太早，还可以再等等……但在最近这一年里，我愈发清晰地感受到：在这个充满不确定性的时代，无常的来袭往往不打招呼，也不讲道理。一些看似毫无征兆的中年同龄人生病与离世的事件愈发增多；单身、不婚不育、丁克、离异与孤寡家庭结构已开始逐渐变得常态化；互联网上各自媒体平台关于生命意义的焦虑与迷茫不断蔓延；以及，家中两方奔八的父母亲们，也正在一年年、一天天地走在衰老的路上……这些现实，让我越来越难以继续告诉自己：这件事，可以再等等。`
    },
    {
      id: "intention",
      title: "初衷",
      text: `创建这个网站，并不是因为我已经参透了生死，从而来给大家煲些所谓的人生鸡汤……恰恰相反，是因为我一次又一次地意识到：我们绝大多数人，对无常的准备，几乎为零。我们习惯为学业、职业、家庭、资产做出详尽的长期规划，却很少正面去回答一个更基础的问题：如果人生不能按预期的计划继续，我是否提前为自己预留过应对无常的空间？现实中，真正让人崩溃的，往往不是生死无常本身，而是在这类事情发生时——毫无预想、毫无交代、毫无共识、毫无选择权。于是，决定被仓促做出，责任被情绪裹挟，混乱被留给了最亲近的人。这个网站，与其说是关于死亡，不如说更像是一份关于我们如何认真回顾此生的使用说明书。它关心的是：如何如实地面对自己、如何系统地归纳一生、如何在接受无常的前提下，为自己预留一些选择权。从而能够认真、清醒、有尊严及有趣味地活着。`
    },
    {
      id: "preparedness",
      title: "预备自测",
      text: `这不是一场考试，只是帮你辨识当下的准备程度。你可以随时调整分值，记录真实的当下即可。如果你觉得难以判断，也没关系——从直觉出发，先给出一个大致区间。`
    },
    {
      id: "framework",
      title: "框架",
      text: `本网站分为两大部分和四大篇章。上半部分：如何积极地活「看见自己」「积极去活」认识自己是谁，状态怎么样，珍惜过什么，喜欢过什么，还有哪些尚未完成的、藏在内心深处的心愿。下半部分：如何坦然地死「清楚交代」「好好告别」把该建立的深度生死信仰建立到位；把想说的重要的话说完；把此生看重的事情安排好。在这个单身、不婚、不育、家庭结构不断变化的时代，我们越来越不能假设：总会有人替我们收拾残局。也正因如此，提前为自己搭建一套人生与终局的准备系统，不再是悲观，而是一种成熟。如果你对以上这些内容产生了共鸣，很可能内心敏锐的你早已意识到：面对无常，逃避并不会让事情更轻松。衷心希望，这个网站能成为你的一个安静空间——不催促你，不吓唬你，只陪你把这一生，慢慢整理清楚。`
    },
    {
      id: "usage",
      title: "使用说明",
      text: `本网站共分为四个篇章。在不同篇章中，我们会引导你结合相应章节的工具与模板，围绕自己真实的人生处境，进行深入的思考与整理。为了便于理解和使用，网站中会提供相应的示范案例（Demo），并尽量将练习设计为手册表格或可选项的形式，以减少大量书写与理解工具本身所带来的负担。但需要郑重说明的是：无论我们提供多少辅助，真正的思考与整理，始终只能由你自己完成。这些练习，并不是为了完成任务，而是一次次认真对待自己人生的过程。`
    },
    {
      id: "reminders",
      title: "五点提醒",
      text: `① 缓慢阅读，允许暂停：网站中的内容与工具，可以被视为贯穿人生不同阶段的一系列重要功课。在阅读与练习的过程中，并不需要急于求成，更不必一气呵成。② 坦诚细致，对己负责：本网站的内容并不是一份需要对他人展示的答卷。所有问题，最终只服务于你自己，并且帮助你逐步形成生命的自洽。③ 反复修改，允许变化：网站中的许多问题，都不存在一次就能完成的版本。今天的你，与多年后的你，可能会在同一件事上给出完全不同的答案。④ 定期复盘，照见变化：如果条件允许，你可以为自己设定一个复盘周期。譬如半年或一年一次，或在人生发生重要变化或重大事件之后，再去重新翻看一下曾经的记录。⑤ 妥善保管，尊重边界：在这个网站上，可能会逐渐记录下你最真实、最私密的思考与选择。建议将你的记录存放在一个你觉得安全、安心的位置。`
    }
  ]
};

function buildDocs(): Doc[] {
  const docs: Doc[] = [];

  // Add read-instructions page
  docs.push({
    href: `/chapter/read-instructions`,
    title: readInstructionsContent.title,
    text: readInstructionsContent.sections.map(s => s.text).join("\n"),
  });

  // Add read-instructions sections
  for (const s of readInstructionsContent.sections) {
    docs.push({
      href: `/chapter/read-instructions#${s.id}`,
      title: `${readInstructionsContent.title} · ${s.title}`,
      text: s.text,
    });
  }

  // Add regular chapters
  for (const ch of chapters) {
    docs.push({
      href: `/chapter/${ch.slug}`,
      title: ch.title,
      text: [ch.title, ch.subtitle, ch.description].join("\n"),
    });

    for (const s of ch.sections) {
      docs.push({
        href: `/chapter/${ch.slug}#${s.id}`,
        title: `${ch.title} · ${s.title}`,
        text: [s.title, ...s.paragraphs].join("\n"),
      });
    }
  }

  return docs;
}

const DOCS = buildDocs();

export function searchAll(query: string, limit = 12): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits = DOCS.map((d) => {
    const t = d.text.toLowerCase();
    const idx = t.indexOf(q);
    if (idx === -1) return null;

    // naive scoring: earlier + shorter doc gets a bit higher
    const score = Math.max(1, 1000 - idx) + Math.max(0, 200 - t.length / 10);

    const start = Math.max(0, idx - 18);
    const end = Math.min(d.text.length, idx + q.length + 24);
    const excerpt = d.text.slice(start, end).replace(/\s+/g, " ").trim();

    return {
      href: d.href,
      title: d.title,
      excerpt,
      score,
    } satisfies SearchHit;
  })
    .filter(Boolean)
    .sort((a, b) => (b!.score ?? 0) - (a!.score ?? 0))
    .slice(0, limit) as SearchHit[];

  return hits;
}
