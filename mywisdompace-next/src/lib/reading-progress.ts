type ReadingProgressEntry = {
  sectionId: string;
  timestamp: number;
};

type StorageShape = {
  readingProgress?: Record<string, ReadingProgressEntry>;
};

const STORAGE_KEY = "mywisdompace";

function safeParse(json: string | null): StorageShape {
  if (!json) return {};
  try {
    return JSON.parse(json) as StorageShape;
  } catch {
    return {};
  }
}

export function getReadingProgress(chapterSlug: string): ReadingProgressEntry | null {
  if (typeof window === "undefined") return null;
  const data = safeParse(window.localStorage.getItem(STORAGE_KEY));
  return data.readingProgress?.[chapterSlug] ?? null;
}

export function saveReadingProgress(chapterSlug: string, sectionId: string) {
  if (typeof window === "undefined") return;

  const data = safeParse(window.localStorage.getItem(STORAGE_KEY));
  const next: StorageShape = {
    ...data,
    readingProgress: {
      ...(data.readingProgress ?? {}),
      [chapterSlug]: { sectionId, timestamp: Date.now() },
    },
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}
