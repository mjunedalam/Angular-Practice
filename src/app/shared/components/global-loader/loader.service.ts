import { Injectable, computed, signal } from '@angular/core';

type LoaderMode = 'idle' | 'login';

const LOGIN_PROGRESS_MAX = 92;
const LOGIN_PROGRESS_STEP = 6;
const LOGIN_PROGRESS_INTERVAL_MS = 180;
const LOADER_HIDE_DELAY_MS = 160;

declare global {
  interface Window {
    __agwaBootLoader?: {
      complete: () => void;
      setProgress: (progress: number) => void;
    };
  }
}

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private readonly _mode = signal<LoaderMode>('idle');
  private readonly _progress = signal(0);
  private readonly _message = signal('Preparing your workspace...');
  private progressTimer: number | null = null;
  private hideTimer: number | null = null;
  private readonly bootTasks = new Set<string>();
  private appShellReady = false;
  private bootCompleted = false;

  readonly isLoading = computed(() => this._mode() !== 'idle');
  readonly isLoginLoading = computed(() => this._mode() === 'login');
  readonly progress = computed(() => this._progress());
  readonly message = computed(() => this._message());

  startLogin(message = 'Signing you in...'): void {
    this.clearHideTimer();
    this.clearTimer();
    this._mode.set('login');
    this._message.set(message);
    this._progress.set(12);

    this.progressTimer = window.setInterval(() => {
      this._progress.update((value) => Math.min(LOGIN_PROGRESS_MAX, value + LOGIN_PROGRESS_STEP));
    }, LOGIN_PROGRESS_INTERVAL_MS);
  }

  setLoginMessage(message: string): void {
    if (this._mode() !== 'login') return;
    this._message.set(message);
  }

  setProgress(progress: number): void {
    if (this._mode() !== 'login') return;
    const clamped = Math.max(0, Math.min(100, progress));
    this._progress.set(clamped);
    if (clamped >= LOGIN_PROGRESS_MAX) {
      this.clearTimer();
    }
  }

  completeLogin(): void {
    if (this._mode() !== 'login') return;
    this.clearTimer();
    this._progress.set(100);

    this.hideTimer = window.setTimeout(() => {
      this._mode.set('idle');
      this._progress.set(0);
    }, LOADER_HIDE_DELAY_MS);
  }

  fail(): void {
    this.clearHideTimer();
    this.clearTimer();
    this._mode.set('idle');
    this._progress.set(0);
  }

  registerBootTask(taskId: string): void {
    if (this.bootCompleted || !taskId) return;
    this.bootTasks.add(taskId);
    this.pushBootProgress(this.appShellReady ? 88 : 56);
  }

  resolveBootTask(taskId: string): void {
    if (!this.bootTasks.delete(taskId) || this.bootCompleted) return;
    this.pushBootProgress(this.appShellReady ? 96 : 72);
    this.completeBootIfReady();
  }

  markAppShellReady(): void {
    if (this.bootCompleted) return;
    this.appShellReady = true;
    this.pushBootProgress(96);
    this.completeBootIfReady();
  }

  private clearTimer(): void {
    if (this.progressTimer !== null) {
      window.clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  }

  private clearHideTimer(): void {
    if (this.hideTimer !== null) {
      window.clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }

  /** Call from pages that have no app shell (e.g. login) to close the native bar. */
  completeBoot(): void {
    if (this.bootCompleted) return;
    this.bootCompleted = true;
    this.appShellReady = true;
    window.__agwaBootLoader?.complete();
  }

  private completeBootIfReady(): void {
    if (!this.appShellReady || this.bootCompleted || this.bootTasks.size > 0) return;
    this.bootCompleted = true;
    this.pushBootProgress(100);
    window.__agwaBootLoader?.complete();
  }

  private pushBootProgress(progress: number): void {
    window.__agwaBootLoader?.setProgress(progress);
  }
}
