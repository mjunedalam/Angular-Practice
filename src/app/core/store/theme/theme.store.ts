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

export type ThemeMode = 'light' | 'dark' | 'custom';

export interface ThemeOption {
  mode:  ThemeMode;
  label: string;
  icon:  string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  { mode: 'dark',   label: 'Dark',   icon: '🌙' },
  { mode: 'light',  label: 'Light',  icon: '☀️' },
  { mode: 'custom', label: 'Teal',   icon: '🎨' },
];

const STORAGE_KEY = 'agwa-theme';

interface ThemeState {
  readonly mode: ThemeMode;
}

function getInitialTheme(): ThemeMode {
  try {
    return (localStorage.getItem(STORAGE_KEY) as ThemeMode) ?? 'dark';
  } catch {
    return 'dark';
  }
}

export const ThemeStore = signalStore(
  { providedIn: 'root' },

  withState<ThemeState>({ mode: getInitialTheme() }),

  // Angular 19 pattern: inject dependencies via withProps
  // inject() is called in the factory function scope — valid injection context
  withProps(() => ({
    _doc: inject(DOCUMENT),
  })),

  withComputed(({ mode }) => ({
    isDark:   computed(() => mode() === 'dark'),
    isLight:  computed(() => mode() === 'light'),
    isCustom: computed(() => mode() === 'custom'),
  })),

  withMethods((store) => ({
    setTheme(mode: ThemeMode): void {
      patchState(store, { mode });
      store._doc.documentElement.setAttribute('data-theme', mode);
      try { localStorage.setItem(STORAGE_KEY, mode); } catch { /* noop */ }
    },
  })),

  // withHooks factory runs in injection context — inject() is valid here
  // Apply the initial theme as soon as the store is instantiated
  withHooks((store) => ({
    onInit() {
      // Apply persisted/initial theme to <html> immediately
      store._doc.documentElement.setAttribute('data-theme', store.mode());

      // Reactively keep data-theme in sync whenever mode changes
      effect(() => {
        store._doc.documentElement.setAttribute('data-theme', store.mode());
      });
    },
  })),
);