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

function buildDocs(): Doc[] {
  const docs: Doc[] = [];

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
