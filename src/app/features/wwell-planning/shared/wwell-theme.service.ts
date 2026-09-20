import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';

export type WwellTheme = 'light' | 'dark';
/** What the user picked: a fixed theme, or `system` to follow the OS. */
export type WwellThemeMode = WwellTheme | 'system';

const THEME_STORAGE_KEY = 'wwell-theme';
/** Dark keeps the key it shipped with, so a value saved before light gained a dial still applies. */
const CONTRAST_STORAGE_KEYS: Readonly<Record<WwellTheme, string>> = {
  dark: 'wwell-contrast',
  light: 'wwell-contrast-light',
};
const CONTRAST_PROPERTIES: Readonly<Record<WwellTheme, string>> = {
  dark: '--wp-contrast-dark',
  light: '--wp-contrast-light',
};
const THEMES: readonly WwellTheme[] = ['dark', 'light'];
const THEME_ATTRIBUTE = 'data-wp-theme';
const SWITCHING_CLASS = 'wp-theme-switching';
const DARK_QUERY = '(prefers-color-scheme: dark)';
/** Slightly longer than the 200ms cross-fade in _wwell-theme.scss, so it can finish before the class drops. */
const SWITCHING_MS = 260;

export const MIN_CONTRAST = 0;
export const MAX_CONTRAST = 100;
/** Where each theme rests until the user moves its dial. Keep in step with the `var(--wp-contrast-*, N%)`
 *  fallbacks in _wwell-theme.scss. Light's standard look is its High end; dark opens softer than its own. */
export const DEFAULT_CONTRASTS: Readonly<Record<WwellTheme, number>> = { dark: 50, light: 100 };

/**
 * Light/dark theme for the wwell-planning module.
 *
 * Writes `data-wp-theme` and both contrast variables on <html> (not on a module element) because
 * dialogs, select panels and tooltips render on <body>, outside the module's DOM — they only pick up
 * the `--wp-*` tokens from _wwell-theme.scss by inheriting from the root. The tokens are `--wp-`
 * prefixed, so no other feature reacts to any of them.
 *
 * Follows the OS `prefers-color-scheme` until the user picks a theme; from then on the explicit
 * choice wins and is remembered in localStorage. Each theme has its own contrast dial (0 soft – 100
 * high, see `dark-tone` / `light-tone` in _wwell-theme.scss); both are always written, so switching
 * theme never waits on a second update to repaint at the right contrast.
 */
@Injectable({ providedIn: 'root' })
export class WwellThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly systemQuery = this.document.defaultView?.matchMedia?.(DARK_QUERY) ?? null;

  /** The user's explicit pick; null means "follow the OS". */
  private readonly chosen = signal<WwellTheme | null>(this.readStoredTheme());
  private readonly system = signal<WwellTheme>(this.systemQuery?.matches ? 'dark' : 'light');
  private readonly contrasts = signal<Readonly<Record<WwellTheme, number>>>({
    dark: this.readStoredContrast('dark'),
    light: this.readStoredContrast('light'),
  });
  private switchingTimer: ReturnType<typeof setTimeout> | undefined;

  readonly theme = computed<WwellTheme>(() => this.chosen() ?? this.system());
  readonly isDark = computed(() => this.theme() === 'dark');
  readonly mode = computed<WwellThemeMode>(() => this.chosen() ?? 'system');
  /** Contrast of the theme that is showing, 0 (soft) – 100 (high). */
  readonly contrast = computed(() => this.contrasts()[this.theme()]);
  readonly isContrastDefault = computed(() => this.contrast() === DEFAULT_CONTRASTS[this.theme()]);

  constructor() {
    this.systemQuery?.addEventListener('change', (event) => {
      this.system.set(event.matches ? 'dark' : 'light');
    });

    // Applied synchronously so the first paint of a wwell-planning page is already in the right
    // theme; the effects keep the root in sync with later changes (toggle, OS switch, dial).
    this.apply(this.theme());
    this.applyContrasts(this.contrasts());
    effect(() => {
      this.apply(this.theme());
    });
    effect(() => {
      this.applyContrasts(this.contrasts());
    });
  }

  toggle(): void {
    this.set(this.isDark() ? 'light' : 'dark');
  }

  set(theme: WwellTheme): void {
    this.setMode(theme);
  }

  setMode(mode: WwellThemeMode): void {
    if (mode === this.mode()) return;
    this.flagSwitching();
    this.chosen.set(mode === 'system' ? null : mode);
    this.writeStored(THEME_STORAGE_KEY, mode === 'system' ? null : mode);
  }

  /** Sets the contrast of the theme that is showing. */
  setContrast(value: number): void {
    const theme = this.theme();
    const next = clampContrast(value);
    if (next === this.contrasts()[theme]) return;
    this.contrasts.update((all) => ({ ...all, [theme]: next }));
    this.writeStored(CONTRAST_STORAGE_KEYS[theme], next === DEFAULT_CONTRASTS[theme] ? null : String(next));
  }

  resetContrast(): void {
    this.setContrast(DEFAULT_CONTRASTS[this.theme()]);
  }

  private apply(theme: WwellTheme): void {
    this.document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
  }

  private applyContrasts(all: Readonly<Record<WwellTheme, number>>): void {
    const style = this.document.documentElement.style;
    for (const theme of THEMES) {
      style.setProperty(CONTRAST_PROPERTIES[theme], `${all[theme]}%`);
    }
  }

  /** Adds the cross-fade class for the duration of the switch only, so it never animates on load. */
  private flagSwitching(): void {
    const root = this.document.documentElement;
    root.classList.add(SWITCHING_CLASS);
    clearTimeout(this.switchingTimer);
    this.switchingTimer = setTimeout(() => {
      root.classList.remove(SWITCHING_CLASS);
    }, SWITCHING_MS);
  }

  private readStoredTheme(): WwellTheme | null {
    const value = this.readStored(THEME_STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  }

  private readStoredContrast(theme: WwellTheme): number {
    const value = this.readStored(CONTRAST_STORAGE_KEYS[theme]);
    if (value === null) return DEFAULT_CONTRASTS[theme];
    const parsed = Number(value);
    return Number.isFinite(parsed) ? clampContrast(parsed) : DEFAULT_CONTRASTS[theme];
  }

  // Storage can throw (private mode, blocked site data). The appearance still works for the
  // session; it just isn't remembered — nothing the user needs to be told about.
  private readStored(key: string): string | null {
    try {
      return this.document.defaultView?.localStorage.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  /** `null` clears the key, so a choice equal to the default doesn't linger in storage. */
  private writeStored(key: string, value: string | null): void {
    try {
      const storage = this.document.defaultView?.localStorage;
      if (value === null) storage?.removeItem(key);
      else storage?.setItem(key, value);
    } catch {
      // See readStored: an unwritable store only costs persistence.
    }
  }
}

function clampContrast(value: number): number {
  return Math.min(MAX_CONTRAST, Math.max(MIN_CONTRAST, Math.round(value)));
}
