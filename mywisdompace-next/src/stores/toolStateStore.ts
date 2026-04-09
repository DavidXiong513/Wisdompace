import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { validateStorageData } from '@/lib/security';

// ── Types ──────────────────────────────────────────────────────────────────

export interface ToolEntry {
  data: unknown;
  timestamp: number;
  version: number; // for future schema migrations
}

interface ToolStateState {
  tools: Record<string, ToolEntry>; // keyed by toolId
  saveToolState: (toolId: string, data: unknown) => void;
  getToolState: (toolId: string) => ToolEntry | null;
  clearToolState: (toolId: string) => void;
  clearAllTools: () => void;
}

// ── Store ──────────────────────────────────────────────────────────────────

export const useToolStateStore = create<ToolStateState>()(
  persist(
    (set, get) => ({
      tools: {},

      saveToolState: (toolId, data) => {
        // Validate toolId format before writing
        if (!toolId || !/^[a-z0-9-]+$/i.test(toolId)) {
          console.error('toolStateStore: invalid toolId', toolId);
          return;
        }
        set((state) => ({
          tools: {
            ...state.tools,
            [toolId]: {
              data,
              timestamp: Date.now(),
              version: 1,
            },
          },
        }));
      },

      getToolState: (toolId) => get().tools[toolId] ?? null,

      clearToolState: (toolId) =>
        set((state) => {
          const next = { ...state.tools };
          delete next[toolId];
          return { tools: next };
        }),

      clearAllTools: () => set({ tools: {} }),
    }),
    { name: 'wp-tool-states' }
  )
);

// ── Safe import from external source ──────────────────────────────────────

/**
 * Imports tool states from an external data object.
 * Runs validateStorageData first; only writes if validation passes.
 * Returns { success, errors } — never throws.
 */
export function importToolStates(raw: unknown): {
  success: boolean;
  errors: string[];
} {
  const { errors } = validateStorageData(raw);
  // toolStates import is intentionally blocked by validateStorageData for security.
  // This function is a placeholder for future controlled import flows.
  if (errors.length > 0) {
    return { success: false, errors };
  }
  return { success: true, errors: [] };
}
