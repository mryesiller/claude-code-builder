'use client';

import { create } from 'zustand';

interface ThemeStore {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: 'light',
  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light';
    set({ theme: next });
    document.documentElement.classList.toggle('dark', next === 'dark');
    localStorage.setItem('claude-builder-theme', next);
  },
  initTheme: () => {
    const saved = localStorage.getItem('claude-builder-theme') as 'light' | 'dark' | null;
    const preferred = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    set({ theme: preferred });
    document.documentElement.classList.toggle('dark', preferred === 'dark');
  },
}));
