import { TestBed } from '@angular/core/testing';

import { WwellThemeService } from './wwell-theme.service';

const SHELL_STORAGE_KEY = 'wwell-shell';
const SHELL_ATTRIBUTE = 'data-shell';

describe('WwellThemeService shell layout', () => {
  const root = document.documentElement;

  beforeEach(() => {
    localStorage.clear();
    root.removeAttribute(SHELL_ATTRIBUTE);
    TestBed.resetTestingModule();
  });

  it('defaults to the mono shell and stamps it on <html>', () => {
    const service = TestBed.inject(WwellThemeService);

    expect(service.shell()).toBe('mono');
    expect(service.isLegacyShell()).toBe(false);
    expect(root.getAttribute(SHELL_ATTRIBUTE)).toBe('mono');
  });

  it('switches to the legacy shell, updates <html> and remembers the choice', () => {
    const service = TestBed.inject(WwellThemeService);

    service.setLegacyShell(true);
    TestBed.tick();

    expect(service.shell()).toBe('legacy');
    expect(service.isLegacyShell()).toBe(true);
    expect(root.getAttribute(SHELL_ATTRIBUTE)).toBe('legacy');
    expect(localStorage.getItem(SHELL_STORAGE_KEY)).toBe('legacy');
  });

  it('restores a remembered legacy choice on the next visit', () => {
    localStorage.setItem(SHELL_STORAGE_KEY, 'legacy');

    const service = TestBed.inject(WwellThemeService);

    expect(service.isLegacyShell()).toBe(true);
    expect(root.getAttribute(SHELL_ATTRIBUTE)).toBe('legacy');
  });

  it('forgets the stored choice once the user returns to mono', () => {
    localStorage.setItem(SHELL_STORAGE_KEY, 'legacy');
    const service = TestBed.inject(WwellThemeService);

    service.setLegacyShell(false);
    TestBed.tick();

    expect(service.shell()).toBe('mono');
    expect(root.getAttribute(SHELL_ATTRIBUTE)).toBe('mono');
    expect(localStorage.getItem(SHELL_STORAGE_KEY)).toBeNull();
  });

  it('falls back to mono when the stored value is not recognised', () => {
    localStorage.setItem(SHELL_STORAGE_KEY, 'sepia');

    const service = TestBed.inject(WwellThemeService);

    expect(service.shell()).toBe('mono');
  });

  it('leaves the light/dark theme alone when the shell changes', () => {
    const service = TestBed.inject(WwellThemeService);
    const before = service.theme();

    service.setLegacyShell(true);
    TestBed.tick();

    expect(service.theme()).toBe(before);
  });
});

/* ── Switching light/dark ─────────────────────────────────────────────────────
 * The visible half is the browser's own default view-transition cross-fade — there are no keyframes of ours
 * to test. What the service owns is which path a switch takes, and the ordering the stylesheet depends on.
 */
describe('WwellThemeService theme switch', () => {
  const root = document.documentElement;
  const THEME_ATTRIBUTE = 'data-wp-theme';
  const CROSSFADE_CLASS = 'wp-theme-crossfade';
  const SWITCHING_CLASS = 'wp-theme-switching';

  /** Captures the colour-scheme listener so a test can drive an OS appearance change. */
  let fireSystemChange: ((dark: boolean) => void) | null = null;
  let startViewTransition: jest.Mock;

  const stubMedia = ({ dark = false, reducedMotion = false } = {}): void => {
    fireSystemChange = null;
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: (query: string) => {
        const isMotion = query.includes('prefers-reduced-motion');
        const listeners: ((e: { matches: boolean }) => void)[] = [];
        if (!isMotion) {
          fireSystemChange = (next: boolean) => listeners.forEach(fn => fn({ matches: next }));
        }
        return {
          matches: isMotion ? reducedMotion : dark,
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn((_: string, fn: (e: { matches: boolean }) => void) => listeners.push(fn)),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        } as unknown as MediaQueryList;
      },
    });
  };

  /** jsdom has no view transitions, so the primary path has to be stubbed in. */
  const installViewTransitions = (): void => {
    startViewTransition = jest.fn((update: () => void) => {
      update();
      return { finished: Promise.resolve(), ready: Promise.resolve(), updateCallbackDone: Promise.resolve() };
    });
    (document as unknown as Record<string, unknown>)['startViewTransition'] = startViewTransition;
  };

  beforeEach(() => {
    localStorage.clear();
    root.className = '';
    root.removeAttribute(THEME_ATTRIBUTE);
    root.style.removeProperty('--wp-theme-ms');
    stubMedia();
    installViewTransitions();
    TestBed.resetTestingModule();
  });

  afterEach(() => {
    delete (document as unknown as Record<string, unknown>)['startViewTransition'];
    delete (window as unknown as Record<string, unknown>)['matchMedia'];
    jest.restoreAllMocks();
  });

  it('cross-fades through a view transition when the theme changes', () => {
    const service = TestBed.inject(WwellThemeService);

    service.toggle();

    expect(startViewTransition).toHaveBeenCalledTimes(1);
    expect(root.classList.contains(CROSSFADE_CLASS)).toBe(true);
    // The stylesheet's own transition must NOT also run, or the second snapshot would be taken mid-fade.
    expect(root.classList.contains(SWITCHING_CLASS)).toBe(false);
    expect(service.isDark()).toBe(true);
  });

  it('marks the root before starting the transition, not after', () => {
    // Load-bearing ordering. ArcGIS declares `:root { view-transition-name: none }`, and _wwell-theme.scss
    // only restores it under this class — so if the class landed after `startViewTransition()`, the root
    // would be captured nameless, there would be no pseudo-elements to fade, and the theme would just snap.
    let classAtStart: boolean | undefined;
    startViewTransition.mockImplementation((update: () => void) => {
      classAtStart = root.classList.contains(CROSSFADE_CLASS);
      update();
      return { finished: Promise.resolve(), ready: Promise.resolve(), updateCallbackDone: Promise.resolve() };
    });
    const service = TestBed.inject(WwellThemeService);

    service.toggle();

    expect(classAtStart).toBe(true);
  });

  it('flips the attribute inside the callback, so the second snapshot has the new theme', () => {
    const service = TestBed.inject(WwellThemeService);

    service.toggle();

    // Written synchronously rather than left to the effect, which would land after the snapshot is taken
    // and pop in once the fade was over.
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe('dark');
  });

  it('drops the class once the transition settles', async () => {
    const service = TestBed.inject(WwellThemeService);

    service.toggle();
    await Promise.resolve();
    await Promise.resolve();

    expect(root.classList.contains(CROSSFADE_CLASS)).toBe(false);
  });

  it('falls back to the stylesheet transition with no view-transition support', () => {
    delete (document as unknown as Record<string, unknown>)['startViewTransition'];
    const service = TestBed.inject(WwellThemeService);

    service.toggle();

    expect(root.classList.contains(SWITCHING_CLASS)).toBe(true);
    expect(root.classList.contains(CROSSFADE_CLASS)).toBe(false);
    expect(root.style.getPropertyValue('--wp-theme-ms')).toBe('250ms');
    expect(service.isDark()).toBe(true);
  });

  it('drops the fallback class only after its transition has had time to finish', () => {
    jest.useFakeTimers();
    delete (document as unknown as Record<string, unknown>)['startViewTransition'];
    const service = TestBed.inject(WwellThemeService);

    service.toggle();
    jest.advanceTimersByTime(250);
    expect(root.classList.contains(SWITCHING_CLASS)).toBe(true);
    jest.advanceTimersByTime(60);
    expect(root.classList.contains(SWITCHING_CLASS)).toBe(false);

    jest.useRealTimers();
  });

  it('does neither under reduced motion, but still changes the theme', () => {
    stubMedia({ reducedMotion: true });
    const service = TestBed.inject(WwellThemeService);

    service.toggle();

    expect(startViewTransition).not.toHaveBeenCalled();
    expect(root.classList.contains(SWITCHING_CLASS)).toBe(false);
    expect(service.isDark()).toBe(true);
  });

  it('does nothing visible when the pick lands on the theme already showing', () => {
    // Following the OS, which reports light — choosing Light explicitly pins it but repaints nothing, and
    // fading onto an identical picture reads as a glitch.
    const service = TestBed.inject(WwellThemeService);
    expect(service.theme()).toBe('light');

    service.set('light');

    expect(startViewTransition).not.toHaveBeenCalled();
    expect(localStorage.getItem('wwell-theme')).toBe('light');
  });

  it('remembers the theme the user picked', () => {
    const service = TestBed.inject(WwellThemeService);

    service.toggle();

    expect(localStorage.getItem('wwell-theme')).toBe('dark');
  });

  it('restores a remembered theme on the next visit, over what the OS reports', () => {
    localStorage.setItem('wwell-theme', 'dark');

    const service = TestBed.inject(WwellThemeService);

    expect(service.isDark()).toBe(true);
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe('dark');
  });

  it('cross-fades when the OS appearance changes and we are following it', () => {
    // Nothing picked yet means "follow the OS", so this is the common case, not an edge one — and it used to
    // set the signal directly and skip the animation entirely.
    const service = TestBed.inject(WwellThemeService);

    fireSystemChange?.(true);

    expect(service.theme()).toBe('dark');
    expect(startViewTransition).toHaveBeenCalledTimes(1);
  });

  it('does nothing when the OS moves but an explicit theme is pinned', () => {
    const service = TestBed.inject(WwellThemeService);
    service.set('light');
    startViewTransition.mockClear();

    fireSystemChange?.(true);

    expect(service.theme()).toBe('light');
    expect(startViewTransition).not.toHaveBeenCalled();
  });
});
