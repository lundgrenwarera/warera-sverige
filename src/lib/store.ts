import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RecentEntry {
  username: string;
  avatarUrl: string | null;
  level: number | null;
}

interface AppState {
  recents: RecentEntry[];
  addRecent: (entry: RecentEntry) => void;
  removeRecent: (username: string) => void;
}

const MAX_RECENT = 8;

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      recents: [],
      addRecent: (entry) =>
        set((s) => {
          if (!entry.username) return s;
          const rest = s.recents.filter((r) => r.username.toLowerCase() !== entry.username.toLowerCase());
          return { recents: [entry, ...rest].slice(0, MAX_RECENT) };
        }),
      removeRecent: (username) =>
        set((s) => ({ recents: s.recents.filter((r) => r.username.toLowerCase() !== username.toLowerCase()) })),
    }),
    { name: "warera-sverige" },
  ),
);
