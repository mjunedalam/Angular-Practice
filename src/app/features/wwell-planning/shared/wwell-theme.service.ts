import { DOCUMENT } from '@angular/common';
import { ApplicationRef, Injectable, computed, effect, inject, signal } from '@angular/core';

export type WwellTheme = 'light' | 'dark';
/** What the user picked: a fixed theme, or `system` to follow the OS. */
export type WwellThemeMode = WwellTheme | 'system';
/** Which top bar + left nav is showing: the redesigned `mono` shell, or the navy `legacy` one it replaced. */
export type WwellShell = 'mono' | 'legacy';

const THEME_STORAGE_KEY = 'wwell-theme';
const SHELL_STORAGE_KEY = 'wwell-shell';
const SHELL_ATTRIBUTE = 'data-shell';
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
/** Restores the root's view-transition-name for the length of the switch; see _wwell-theme.scss. */
const CROSSFADE_CLASS = 'wp-theme-crossfade';
/** Carries the stylesheet's own colour transition, for browsers with no view transitions. */
const SWITCHING_CLASS = 'wp-theme-switching';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
/**
 * The fallback cross-fade's duration, for browsers with no view transitions. Roughly what the browser's own
 * default transition runs to, so the swap feels the same either way. Short on purpose: the fallback transitions
 * colour on `*`, which repaints every element on screen for its whole length.
 */
const THEME_MS = 250;
const DARK_QUERY = '(prefers-color-scheme: dark)';
/** Slightly longer than the fade, so it finishes before the class — and with it the declaration — is dropped. */
const SWITCHING_MS = THEME_MS + 60;

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
 *
 * The same attribute mechanism carries the shell layout: `data-shell="mono" | "legacy"` on <html>
 * (see layout/_shell-theme.scss). Legacy is opt-in and remembered; mono is what everyone gets by default.
 *
 * Switching light/dark cross-fades: `commit()` runs the change inside a view transition and the browser fades
 * between its own before/after snapshots. Browsers without view transitions get the stylesheet's colour
 * transition instead.
 * See the switching section of _wwell-theme.scss.
 */
@Injectable({ providedIn: 'root' })
export class WwellThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly appRef = inject(ApplicationRef);
  private readonly systemQuery = this.document.defaultView?.matchMedia?.(DARK_QUERY) ?? null;
  private readonly motionQuery = this.document.defaultView?.matchMedia?.(REDUCED_MOTION_QUERY) ?? null;

  /** The user's explicit pick; null means "follow the OS". */
  private readonly chosen = signal<WwellTheme | null>(this.readStoredTheme());
  private readonly system = signal<WwellTheme>(this.systemQuery?.matches ? 'dark' : 'light');
  private readonly contrasts = signal<Readonly<Record<WwellTheme, number>>>({
    dark: this.readStoredContrast('dark'),
    light: this.readStoredContrast('light'),
  });
  private readonly legacyChosen = signal<boolean>(this.readStored(SHELL_STORAGE_KEY) === 'legacy');
  private switchingTimer: ReturnType<typeof setTimeout> | undefined;

  readonly shell = computed<WwellShell>(() => (this.legacyChosen() ? 'legacy' : 'mono'));
  readonly isLegacyShell = computed(() => this.legacyChosen());
  readonly theme = computed<WwellTheme>(() => this.chosen() ?? this.system());
  readonly isDark = computed(() => this.theme() === 'dark');
  readonly mode = computed<WwellThemeMode>(() => this.chosen() ?? 'system');
  /** Contrast of the theme that is showing, 0 (soft) – 100 (high). */
  readonly contrast = computed(() => this.contrasts()[this.theme()]);
  readonly isContrastDefault = computed(() => this.contrast() === DEFAULT_CONTRASTS[this.theme()]);

  constructor() {
    this.systemQuery?.addEventListener('change', (event) => {
      const next: WwellTheme = event.matches ? 'dark' : 'light';
      // Through `commit` like every other route in. Setting the signal directly meant that following the
      // OS — which is the DEFAULT mode, so the common case — repainted the whole app with no transition at
      // all: flip the appearance in system settings and the page simply snapped.
      //
      // It only repaints while we are actually following the OS. With an explicit theme picked, the OS
      // moving underneath changes `system()` but not `theme()`, and there is nothing to show.
      this.commit(() => this.system.set(next), this.chosen() === null && next !== this.theme());
    });

    // Applied synchronously so the first paint of a wwell-planning page is already in the right
    // theme; the effects keep the root in sync with later changes (toggle, OS switch, dial).
    this.apply(this.theme());
    this.applyContrasts(this.contrasts());
    this.applyShell(this.shell());
    effect(() => {
      this.apply(this.theme());
    });
    effect(() => {
      this.applyContrasts(this.contrasts());
    });
    effect(() => {
      this.applyShell(this.shell());
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
    const chosen = mode === 'system' ? null : mode;
    // Picking "System" while it already resolves to the theme on screen changes nothing visible, so it gets
    // the plain commit — turning a page onto an identical one would just read as a glitch.
    const repaints = (chosen ?? this.system()) !== this.theme();
    this.commit(() => {
      this.chosen.set(chosen);
      this.writeStored(THEME_STORAGE_KEY, chosen);
    }, repaints);
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

  /** `true` shows the legacy navy shell; `false` is the default mono one. Independent of light/dark. */
  setLegacyShell(legacy: boolean): void {
    if (legacy === this.legacyChosen()) return;
    this.flagSwitching();
    this.legacyChosen.set(legacy);
    this.writeStored(SHELL_STORAGE_KEY, legacy ? 'legacy' : null);
  }

  private apply(theme: WwellTheme): void {
    this.document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
  }

  private applyShell(shell: WwellShell): void {
    this.document.documentElement.setAttribute(SHELL_ATTRIBUTE, shell);
  }

  private applyContrasts(all: Readonly<Record<WwellTheme, number>>): void {
    const style = this.document.documentElement.style;
    for (const theme of THEMES) {
      style.setProperty(CONTRAST_PROPERTIES[theme], `${all[theme]}%`);
    }
  }

  /**
   * Applies a theme change and shows it.
   *
   * `repaints` is false when the pick changes the stored mode but not what is on screen — choosing "System"
   * while it already resolves to the current theme. Transitioning onto an identical picture just reads as a
   * glitch, so that case commits silently.
   */
  private commit(change: () => void, repaints: boolean): void {
    if (!repaints || this.prefersReducedMotion()) {
      change();
      return;
    }

    if (typeof this.document.startViewTransition === 'function') {
      this.crossfade(change);
      return;
    }

    // No view transitions: the stylesheet's own colour transition instead.
    this.flagSwitching();
    change();
  }

  /**
   * Cross-fades to the new theme.
   *
   * The browser snapshots the page on either side of `change()` and fades between the two itself — no keyframes
   * of our own, which is the point: this is the default transition, the same one most products use for a theme
   * swap. See the switching section of _wwell-theme.scss for what the class is for.
   */
  private crossfade(change: () => void): void {
    const root = this.document.documentElement;
    // Before `startViewTransition`, not after: this class restores `view-transition-name: root` (ArcGIS
    // removes it), and it has to be there when the first snapshot is taken.
    root.classList.add(CROSSFADE_CLASS);

    const transition = this.document.startViewTransition(() => {
      change();
      // The attribute is written by an effect, and the second snapshot is taken as soon as this callback
      // settles — so everything signal-driven is flushed here, or it lands after that snapshot and pops in
      // once the fade is over.
      this.apply(this.theme());
      try {
        this.appRef.tick();
      } catch {
        // Already inside change detection. `apply()` above has put the theme on <html>, which is the part the
        // snapshot must have.
      }
    });

    const done = () => root.classList.remove(CROSSFADE_CLASS);
    transition.finished.then(done, done);
  }

  private prefersReducedMotion(): boolean {
    return this.motionQuery?.matches ?? false;
  }

  /** Adds the fallback transition's class for the length of the switch only, so it never runs on load. */
  private flagSwitching(): void {
    const root = this.document.documentElement;
    root.style.setProperty('--wp-theme-ms', `${THEME_MS}ms`);
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

