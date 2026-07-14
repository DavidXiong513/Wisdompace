import { chapters } from '@/data/chapters';
import zhCN from '@/i18n/locales/zh-CN.json';
import en from '@/i18n/locales/en.json';

type ReadInstructionSection = {
  title?: string;
  paragraphs?: string[];
};

type ChapterSection = {
  title?: string;
  paragraphs?: string[];
};

type TranslationData = {
  chapter?: Record<string, string>;
  chapterContent?: {
    'read-instructions'?: Record<string, ReadInstructionSection>;
    [chapterSlug: string]: Record<string, ChapterSection> | undefined;
  };
};

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
  lng: string;
};

function buildDocs(): Doc[] {
  const docs: Doc[] = [];

  const languages = [
    { code: 'zh-CN', data: zhCN },
    { code: 'en', data: en },
  ];

  for (const { code, data } of languages) {
    const typedData = data as TranslationData;
    const chapterContent = typedData.chapterContent || {};
    const chapterLabels = typedData.chapter || {};

    // 1. Read Instructions
    const riData = chapterContent['read-instructions'] || {};
    const riTitle =
      chapterLabels.readInstructions || (code.startsWith('zh') ? '阅读说明' : "Reader's Guide");

    // Index full page
    const riFullText = Object.values(riData)
      .map((s: ReadInstructionSection) => (s.paragraphs ? s.paragraphs.join(' ') : ''))
      .join('\n');

    docs.push({
      href: '/chapter/read-instructions',
      title: riTitle,
      text: riFullText,
      lng: code,
    });

    // Index sections
    for (const [id, section] of Object.entries(riData)) {
      const s = section as ReadInstructionSection;
      if (s.title && s.paragraphs) {
        docs.push({
          href: `/chapter/read-instructions#${id}`,
          title: `${riTitle} · ${s.title}`,
          text: s.paragraphs.join('\n'),
          lng: code,
        });
      }
    }

    // 2. Regular Chapters
    for (const ch of chapters) {
      const chKey = ch.slug.replace(/-([a-z0-9])/g, (_, g) => g.toUpperCase());
      const chTitle = chapterLabels[chKey] || ch.title;
      const chSub = chapterLabels[`${chKey}Sub`] || ch.subtitle;
      const chDesc = chapterLabels[`${chKey}Desc`] || ch.description;

      docs.push({
        href: `/chapter/${ch.slug}`,
        title: chTitle,
        text: [chTitle, chSub, chDesc].join('\n'),
        lng: code,
      });

      const chSectionsData = chapterContent[ch.slug] || {};
      for (const s of ch.sections) {
        const sData = chSectionsData[s.id] || {};
        const sTitle = sData.title || s.title;
        const sParagraphs = sData.paragraphs || s.paragraphs;

        docs.push({
          href: `/chapter/${ch.slug}#${s.id}`,
          title: `${chTitle} · ${sTitle}`,
          text: [sTitle, ...sParagraphs].join('\n'),
          lng: code,
        });
      }
    }
  }

  return docs;
}

const DOCS = buildDocs();

export function searchAll(query: string, lng = 'zh-CN', limit = 12): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  // Filter docs by current language, but fall back to Chinese if English has no results
  // Actually, searching both might be better if the query matches either.
  // For now, let's prioritize the current language.

  const hits = DOCS.filter(
    d =>
      d.lng === lng ||
      (lng.startsWith('en') && d.lng === 'en') ||
      (lng.startsWith('zh') && d.lng.startsWith('zh'))
  )
    .map(d => {
      const t = d.text.toLowerCase();
      const titleMatch = d.title.toLowerCase().indexOf(q);
      const textMatch = t.indexOf(q);

      if (titleMatch === -1 && textMatch === -1) return null;

      // naive scoring: title match is better
      let score = 0;
      if (titleMatch !== -1) score += 2000 - titleMatch;
      if (textMatch !== -1) score += 1000 - textMatch;

      score += Math.max(0, 200 - d.text.length / 10);

      const matchIdx = textMatch !== -1 ? textMatch : 0;
      const start = Math.max(0, matchIdx - 18);
      const end = Math.min(d.text.length, matchIdx + q.length + 24);
      const excerpt = d.text.slice(start, end).replace(/\s+/g, ' ').trim();

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
