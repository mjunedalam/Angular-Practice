import { computed, effect, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'agwa-theme';

interface ThemeState {
  readonly mode: ThemeMode;
}

function getInitialTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode;
    return saved === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export const ThemeStore = signalStore(
  { providedIn: 'root' },

  withState<ThemeState>({ mode: getInitialTheme() }),

  withProps(() => ({
    _doc: inject(DOCUMENT),
  })),

  withComputed(({ mode }) => ({
    isDark:  computed(() => mode() === 'dark'),
    isLight: computed(() => mode() === 'light'),
  })),

  withMethods((store) => ({
    toggle(): void {
      const next: ThemeMode = store.mode() === 'dark' ? 'light' : 'dark';
      patchState(store, { mode: next });
      store._doc.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch { /* noop */ }
    },
    setTheme(mode: ThemeMode): void {
      patchState(store, { mode });
      store._doc.documentElement.setAttribute('data-theme', mode);
      try { localStorage.setItem(STORAGE_KEY, mode); } catch { /* noop */ }
    },
  })),

  withHooks((store) => ({
    onInit() {
      store._doc.documentElement.setAttribute('data-theme', store.mode());
      effect(() => {
        store._doc.documentElement.setAttribute('data-theme', store.mode());
      });
    },
  })),
);