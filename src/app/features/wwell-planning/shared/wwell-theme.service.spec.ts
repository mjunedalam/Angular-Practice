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
