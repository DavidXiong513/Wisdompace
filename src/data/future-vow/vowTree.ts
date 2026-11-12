// ── 来生志愿 · 路径树 ──
//
// 结构：一个问题（S1）分出七条路径；只有四条带追问，其中「去一个地方」再深一层。
// 深链可用 /tools/future-vow?path=<VowPathId> 直达某一支。
//
// 三条边界（改文案时别越线）：
// 1. 不自建宗教实践内容——不写往生条件、修行方法、仪轨、功德、回向、超度；
// 2. 宗教名词只作文化常识对照，并列列出，不分先后、不作比较、不评高下；
// 3. 不与任何付费、捐赠、外部宗教服务绑定。
// 《互联网宗教信息服务管理办法》（2022.3.1 施行）要求提供宗教信息服务须取得许可，
// 所以这里只做「名词对照 + 写一句话的容器」，不做服务，也不代行任何仪式。

export type VowPathId =
  | 'remember'
  | 'nature'
  | 'reborn'
  | 'place'
  | 'oneness'
  | 'end'
  | 'blank';

/** 书写区配置。留白路径没有书写区，用 null 表示。 */
export interface VowWrite {
  /** 书写区小标题 */
  question: string;
  /** 标题下的一句引导 */
  prompt: string;
  placeholder: string;
  /** 可点选的示例，点了只是填进输入框，不强制 */
  samples: string[];
}

export interface VowOption {
  id: string;
  label: string;
  /** 括注：只说出处，不解释含义 */
  note?: string;
  /** 选中后显示在书写区上方的一句提醒，仅个别选项需要 */
  tip?: string;
  /** 再往下一层的问题 */
  next?: VowAsk;
  /** 覆盖该路径默认的书写配置（如「再活一次」选人还是选别的生命） */
  overrides?: Partial<VowWrite>;
}

export interface VowAsk {
  id: string;
  question: string;
  /** 选项下方的一句限定语 */
  note?: string;
  options: VowOption[];
}

export interface VowPath {
  id: VowPathId;
  label: string;
  sub: string;
  ask?: VowAsk;
  write: VowWrite | null;
}

export const VOW_PATH_IDS: VowPathId[] = [
  'remember',
  'nature',
  'reborn',
  'place',
  'oneness',
  'end',
  'blank',
];

export const vowPaths: VowPath[] = [
  {
    id: 'remember',
    label: '但求被记住',
    sub: '不以「我」继续',
    write: {
      question: '写一句，你希望他们记得的',
      prompt: '把「愿」换成「希望」——希望他们记得你什么，希望你留下的那点东西怎么被用下去。',
      placeholder: '希望他们提起我时……',
      samples: [
        '先笑一下，再想起我添过的那些麻烦',
        '把我做菜的手艺学下去',
        '别为我立碑，把钱留给孙辈读书',
      ],
    },
  },
  {
    id: 'nature',
    label: '回到自然',
    sub: '成为土、水、树、风',
    ask: {
      id: 'form',
      question: '你希望成为什么？',
      options: [
        { id: 'soil', label: '土' },
        { id: 'water', label: '水' },
        { id: 'tree', label: '树' },
        { id: 'wind', label: '风' },
        { id: 'sea', label: '海' },
        { id: 'star', label: '星' },
        { id: 'any', label: '随它去' },
      ],
    },
    write: {
      question: '写你想到的那个画面',
      prompt: '不必讲道理，写你想到的那个画面就行。',
      placeholder: '愿成为……',
      samples: [
        '愿化作一棵树，长在他们常走的路边',
        '愿回到海里，不必留名字',
        '愿散在风里，哪儿都到一点',
      ],
    },
  },
  {
    id: 'reborn',
    label: '再活一次',
    sub: '人，或别的生命',
    ask: {
      id: 'form',
      question: '你想成为什么？',
      options: [
        {
          id: 'human',
          label: '人',
          overrides: {
            question: '想做一个什么样的人',
            prompt: '写性情、处境，或者想补上的那一件事。',
            placeholder: '愿再做一次人，……',
            samples: [
              '愿做一个不着急的人',
              '愿生在一个读得起书的家里',
              '愿还记得这一世的人',
            ],
          },
        },
        { id: 'cat', label: '猫' },
        { id: 'dog', label: '狗' },
        { id: 'panda', label: '大熊猫' },
        { id: 'eagle', label: '鹰' },
        { id: 'whale', label: '鲸' },
        { id: 'other', label: '其他', tip: '想成为什么都不限，写在下面就是。' },
      ],
    },
    write: {
      question: '为什么是它',
      prompt: '不必说得漂亮，写一句就够。',
      placeholder: '愿做一只……',
      samples: [
        '愿做大熊猫，一天只操心竹子',
        '愿做一只鹰，看得远一点',
        '愿做一条鲸，深一点、慢一点',
      ],
    },
  },
  {
    id: 'place',
    label: '去一个地方',
    sub: '说得出名的地方',
    ask: {
      id: 'tradition',
      question: '你说的「那里」，是哪个传统里的说法？',
      note: '以下并列，不分先后，不作比较。',
      options: [
        {
          id: 'pureland',
          label: '净土',
          note: '佛教',
          next: {
            id: 'school',
            question: '按佛教的说法，净土不止一处。你更接近哪一处？',
            note: '以上并列，不作比较。本页不解释各处差别，也不涉及往生条件与修行方法。',
            options: [
              { id: 'xifang', label: '西方极乐世界', note: '阿弥陀佛' },
              { id: 'doushuai', label: '兜率内院', note: '弥勒' },
              { id: 'liuli', label: '净琉璃世界', note: '药师佛' },
              { id: 'huayan', label: '华严世界' },
              { id: 'other-pureland', label: '十方其他净土' },
              { id: 'unsure-pureland', label: '说不清' },
            ],
          },
        },
        { id: 'heaven', label: '天堂', note: '如基督教、伊斯兰教所说' },
        {
          id: 'xianjie',
          label: '仙界',
          note: '道教',
          tip: '道教所说的仙界，是修行所归之处。如果你想表达的是「与道合一」，也可以回到上一层选「与更大的合一」。',
        },
        { id: 'ancestors', label: '先人所在之处', note: '民间说法' },
        { id: 'unsure', label: '说不清', note: '只知道不是这里' },
      ],
    },
    write: {
      question: '写你想到那里去的原因',
      prompt: '也可以写到了以后想做什么。一句就够。',
      placeholder: '愿往……',
      samples: [
        '愿往生西方极乐世界',
        '愿与先人团聚，把这几年的话说完',
        '愿到有光的地方，不必是哪里',
      ],
    },
  },
  {
    id: 'oneness',
    label: '与更大的合一',
    sub: '道、梵、天地',
    ask: {
      id: 'form',
      question: '你习惯用哪个说法？',
      note: '说法不同，意思相近：不再是一个单独的我。',
      options: [
        { id: 'dao', label: '与道' },
        { id: 'brahman', label: '与梵' },
        { id: 'cosmos', label: '与天地' },
        { id: 'beings', label: '与众生' },
      ],
    },
    write: {
      question: '用你习惯的说法写下来',
      prompt: '不必换成别的词，你平时怎么说就怎么写。',
      placeholder: '愿与……合一',
      samples: [
        '愿与道合真，不再分别',
        '愿归于天地，如滴水入海',
        '愿与众生同体，不分彼此',
      ],
    },
  },
  {
    id: 'end',
    label: '就此结束',
    sub: '不再回来',
    write: {
      question: '写下这一句',
      prompt: '这一句可以很短。',
      placeholder: '就此……',
      samples: ['就此结束，不必再来', '愿不再受生', '不必留什么，本来就是借来的'],
    },
  },
  {
    id: 'blank',
    label: '还不想回答',
    sub: '留白',
    write: null,
  },
];

// ── 页面级文案 ──

export const vowIntro = {
  lead: '下面七条路，选一条走。选哪条都不需要解释，也可以一条都不选。',
  firstQuestion: '关于「之后」，你更接近下面哪一种？',
  fairnessNote: '七条没有高下。选哪一条，都不欠谁一个解释。',
  blankHint: '这一格先空着。想好了再回来。',
  cardTitle: '我的来生志愿',
  privacy: '这里写的任何内容都不会上传，只存在你这台设备的浏览器里。清空即消失，没有云端副本。',
  closing: '不必一次写完。它和这份整理一样，可以随时回来改。',
  disclaimer:
    '本页不提供宗教服务，不代表任何宗教立场。所引名词只作文化常识对照，不构成教义解释、修行指导或任何承诺。',
};

// ── 取值与解析 ──

export function getVowPath(id: VowPathId | null): VowPath | null {
  if (!id) return null;
  return vowPaths.find(p => p.id === id) ?? null;
}

export interface VowWalk {
  /** 已选的选项，按层级顺序 */
  trail: VowOption[];
  /** 规范化后的 picks（非法项已截断） */
  picks: string[];
  /** 还要回答的问题；为 null 表示可以进入书写 */
  ask: VowAsk | null;
  /** 生效的书写配置（可能被选项 overrides 覆盖） */
  write: VowWrite | null;
  /** 结果卡的路径标签，如「去一个地方 · 净土 · 西方极乐世界」 */
  label: string;
}

/**
 * 按 picks 逐层下行，返回当前该问什么、该写什么。
 * picks 里任何一层对不上（数据结构改过、旧草稿），就地截断，不抛错。
 */
export function walkVow(path: VowPath | null, picks: string[]): VowWalk {
  const trail: VowOption[] = [];
  const valid: string[] = [];
  let ask: VowAsk | null = path?.ask ?? null;
  let write: VowWrite | null = path?.write ?? null;

  if (path) {
    for (const id of picks) {
      const hit = ask?.options.find(o => o.id === id);
      if (!hit) break;
      trail.push(hit);
      valid.push(hit.id);
      if (hit.overrides && write) write = { ...write, ...hit.overrides };
      ask = hit.next ?? null;
    }
  }

  const label = path
    ? [path.label, ...trail.map(o => o.label)].join(' · ')
    : '';

  return { trail, picks: valid, ask, write, label };
}

/** 选项上挂的提醒句，最多显示一条（取最深层有 tip 的那个） */
export function trailTip(trail: VowOption[]): string | null {
  for (let i = trail.length - 1; i >= 0; i--) {
    if (trail[i].tip) return trail[i].tip ?? null;
  }
  return null;
}

// ── 本地存储 ──

const KEY_V2 = 'wisdompace:future-vow:v2';
const KEY_V1 = 'wisdompace:future-vow:v1';
const LINE_MAX = 600;

export interface VowDraft {
  path: VowPathId | null;
  picks: string[];
  line: string;
}

export function emptyVowDraft(): VowDraft {
  return { path: null, picks: [], line: '' };
}

export function loadVowDraft(): VowDraft {
  if (typeof window === 'undefined') return emptyVowDraft();
  try {
    const raw = window.localStorage.getItem(KEY_V2);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return emptyVowDraft();
      const o = parsed as Record<string, unknown>;
      const path =
        typeof o.path === 'string' && VOW_PATH_IDS.includes(o.path as VowPathId)
          ? (o.path as VowPathId)
          : null;
      const picks = Array.isArray(o.picks)
        ? o.picks.filter((p): p is string => typeof p === 'string').slice(0, 4)
        : [];
      const line = typeof o.line === 'string' ? o.line.slice(0, LINE_MAX) : '';
      return { path, picks, line };
    }

    // v1 → v2：旧版只有 faith / memory / blank 三支，无法映射到新七支，
    // 所以只保留文字、清空路径，让用户自己重选，不猜。
    const legacy = window.localStorage.getItem(KEY_V1);
    if (legacy) {
      const parsed: unknown = JSON.parse(legacy);
      if (parsed && typeof parsed === 'object') {
        const o = parsed as Record<string, unknown>;
        const line = typeof o.text === 'string' ? o.text.slice(0, LINE_MAX) : '';
        return { path: null, picks: [], line };
      }
    }
    return emptyVowDraft();
  } catch {
    return emptyVowDraft();
  }
}

export function saveVowDraft(draft: VowDraft): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY_V2, JSON.stringify(draft));
    window.localStorage.removeItem(KEY_V1);
  } catch {
    /* 本地存储不可用时静默降级，页面仍可用 */
  }
}

export function clearVowDraft(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY_V2);
    window.localStorage.removeItem(KEY_V1);
  } catch {
    /* 同上 */
  }
}
