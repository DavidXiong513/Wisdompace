// ── 写给家人的信 · 数据与本地存储 ──

export type ConceptRow = {
  term: string;
  what: string;
  effect: string;
  when: string;
  tone: 'legal' | 'mixed' | 'private';
};

/** 三个词的辨析：遗嘱 / 遗书 / 这封信 */
export const conceptRows: ConceptRow[] = [
  {
    term: '遗嘱',
    what: '处分财产的单方意思表示，是要式法律行为',
    effect: '有法律效力，但形式极严：自书须全文亲笔书写、签名、注明年月日',
    when: '你走以后，财产怎么分',
    tone: 'legal',
  },
  {
    term: '遗书',
    what: '不是法律术语。日常用来指临终前留下的文字，常把财产和情感混在一起写',
    effect: '没有法律效力。里面关于财产的部分，不产生任何分配效果',
    when: '正因为它混着写，才最容易让家人误以为「已经交代过了」',
    tone: 'mixed',
  },
  {
    term: '这封信',
    what: '写给具体某个人的私信，只谈人，不谈钱',
    effect: '没有法律效力，也不需要公证或见证',
    when: '感谢、道歉、嘱托、放心不下的事',
    tone: 'private',
  },
];

export type LetterPrompt = {
  id: string;
  title: string;
  hint: string;
  rows: number;
};

/** 八个起笔提示 */
export const letterPrompts: LetterPrompt[] = [
  {
    id: 'to',
    title: '想对谁说',
    hint: '写一个人，也写不止一个人。如果心里有好几封，就一封一封来。',
    rows: 2,
  },
  {
    id: 'unsaid',
    title: '我一直想说但没说的那句话',
    hint: '那句在心里排练过很多次、始终没出口的话。不必委婉，写下来就好。',
    rows: 4,
  },
  {
    id: 'thanks',
    title: '谢谢你——具体到一件事',
    hint: '不要写「谢谢你的一切」。写那天发生了什么、她做了什么、你当时是什么感受。',
    rows: 4,
  },
  {
    id: 'sorry',
    title: '对不起——同样要具体',
    hint: '不为求原谅，只为把该说的说了。哪件事、你后悔什么、你后来想明白了什么。',
    rows: 4,
  },
  {
    id: 'proud',
    title: '我这一生最骄傲的一件小事',
    hint: '往往不是你以为的那件。不是职位和收入，是某个下午、某次选择、某个没人看见的瞬间。',
    rows: 4,
  },
  {
    id: 'remember',
    title: '我希望你怎么记住我',
    hint: '你希望他们想起你时，先想起什么？一个画面、一种语气、一句口头禅。',
    rows: 3,
  },
  {
    id: 'worry',
    title: '我担心你放不下什么',
    hint: '这是给对方的嘱咐：别为哪件事自责，别守着哪件东西，别停下你自己的生活。',
    rows: 4,
  },
  {
    id: 'last',
    title: '最后一句',
    hint: '如果只能说一句，你会说什么。',
    rows: 2,
  },
];

export type LetterDraft = Record<string, string>;

const STORAGE_KEY = 'wisdompace:farewell-letter:v1';

function emptyDraft(): LetterDraft {
  const draft: LetterDraft = {};
  for (const p of letterPrompts) draft[p.id] = '';
  return draft;
}

export function loadDraft(): LetterDraft {
  if (typeof window === 'undefined') return emptyDraft();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyDraft();
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return emptyDraft();
    const draft = emptyDraft();
    for (const p of letterPrompts) {
      const value = (parsed as Record<string, unknown>)[p.id];
      if (typeof value === 'string') draft[p.id] = value;
    }
    return draft;
  } catch {
    return emptyDraft();
  }
}

export function saveDraft(draft: LetterDraft) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // 隐私模式或存储已满时静默失败，不打断写作
  }
}

export function clearDraft() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 同上
  }
}

/** 统计已写字数（去掉空白与换行） */
export function countChars(draft: LetterDraft): number {
  return Object.values(draft)
    .join('')
    .replace(/\s/g, '').length;
}

/** 已填写几项 */
export function countFilled(draft: LetterDraft): number {
  return letterPrompts.filter(p => (draft[p.id] || '').trim().length > 0).length;
}

/** 拼成可直接粘贴的纯文本 */
export function buildPlainText(draft: LetterDraft): string {
  const today = new Date();
  const stamp = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
  const lines: string[] = ['写给家人的信', `（草稿 · ${stamp}）`, ''];
  for (const p of letterPrompts) {
    const content = (draft[p.id] || '').trim();
    if (!content) continue;
    lines.push(`【${p.title}】`, content, '');
  }
  if (lines.length === 3) return '';
  return lines.join('\n').trimEnd();
}
