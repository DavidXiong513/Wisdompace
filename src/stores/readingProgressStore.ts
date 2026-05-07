import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Types ──────────────────────────────────────────────────────────────────

export interface ReadingProgressEntry {
  sectionId: string;
  timestamp: number;
  percentComplete?: number; // 0–100
}

interface ReadingProgressState {
  progress: Record<string, ReadingProgressEntry>; // keyed by chapterSlug
  saveProgress: (chapterSlug: string, sectionId: string) => void;
  getProgress: (chapterSlug: string) => ReadingProgressEntry | null;
  clearProgress: () => void;
}

// ── Store ──────────────────────────────────────────────────────────────────

export const useReadingProgressStore = create<ReadingProgressState>()(
  persist(
    (set, get) => ({
      progress: {},

      saveProgress: (chapterSlug, sectionId) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [chapterSlug]: {
              sectionId,
              timestamp: Date.now(),
            },
          },
        })),

      getProgress: (chapterSlug) =>
        get().progress[chapterSlug] ?? null,

      clearProgress: () => set({ progress: {} }),
    }),
    { name: 'wp-reading-progress' }
  )
);

// ── Test factory (creates an isolated in-memory store instance) ────────────

/**
 * Creates a fresh store instance for unit/property-based testing.
 * Does NOT use localStorage persistence.
 */
export function createReadingProgressStore() {
  return create<ReadingProgressState>()((set, get) => ({
    progress: {},

    saveProgress: (chapterSlug, sectionId) =>
      set((state) => ({
        progress: {
          ...state.progress,
          [chapterSlug]: {
            sectionId,
            timestamp: Date.now(),
          },
        },
      })),

    getProgress: (chapterSlug) =>
      get().progress[chapterSlug] ?? null,

    clearProgress: () => set({ progress: {} }),
  }));
}
