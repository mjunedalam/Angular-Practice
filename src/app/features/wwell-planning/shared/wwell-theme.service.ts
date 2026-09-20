import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';

export type WwellTheme = 'light' | 'dark';

const STORAGE_KEY = 'wwell-theme';
const THEME_ATTRIBUTE = 'data-wp-theme';
const SWITCHING_CLASS = 'wp-theme-switching';
const DARK_QUERY = '(prefers-color-scheme: dark)';
/** Slightly longer than the 200ms cross-fade in _wwell-theme.scss, so it can finish before the class drops. */
const SWITCHING_MS = 260;

/**
 * Light/dark theme for the wwell-planning module.
 *
 * Writes `data-wp-theme` on <html> (not on a module element) because dialogs, select panels and
 * tooltips render on <body>, outside the module's DOM — they only pick up the `--wp-*` tokens from
 * _wwell-theme.scss by inheriting from the root. The tokens are `--wp-` prefixed, so no other
 * feature reacts to the attribute.
 *
 * Follows the OS `prefers-color-scheme` until the user picks a theme; from then on the explicit
 * choice wins and is remembered in localStorage.
 */
@Injectable({ providedIn: 'root' })
export class WwellThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly systemQuery = this.document.defaultView?.matchMedia?.(DARK_QUERY) ?? null;

  /** The user's explicit pick; null means "follow the OS". */
  private readonly chosen = signal<WwellTheme | null>(this.readStored());
  private readonly system = signal<WwellTheme>(this.systemQuery?.matches ? 'dark' : 'light');
  private switchingTimer: ReturnType<typeof setTimeout> | undefined;

  readonly theme = computed<WwellTheme>(() => this.chosen() ?? this.system());
  readonly isDark = computed(() => this.theme() === 'dark');

  constructor() {
    this.systemQuery?.addEventListener('change', (event) => {
      this.system.set(event.matches ? 'dark' : 'light');
    });

    // Applied synchronously so the first paint of a wwell-planning page is already in the right
    // theme; the effect keeps the attribute in sync with later changes (toggle, OS switch).
    this.apply(this.theme());
    effect(() => {
      this.apply(this.theme());
    });
  }

  toggle(): void {
    this.set(this.isDark() ? 'light' : 'dark');
  }

  set(theme: WwellTheme): void {
    this.flagSwitching();
    this.chosen.set(theme);
    this.store(theme);
  }

  private apply(theme: WwellTheme): void {
    this.document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
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

  // Storage can throw (private mode, blocked site data). The theme still works for the session;
  // it just isn't remembered — nothing the user needs to be told about.
  private readStored(): WwellTheme | null {
    try {
      const value = this.document.defaultView?.localStorage.getItem(STORAGE_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch {
      return null;
    }
  }

  private store(theme: WwellTheme): void {
    try {
      this.document.defaultView?.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // See readStored: an unwritable store only costs persistence.
    }
  }
}
