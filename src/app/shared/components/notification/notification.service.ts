import { Injectable, signal } from '@angular/core';

export type NotificationType = 'error' | 'info' | 'warn';
export const DEFAULT_NOTIFICATION_DURATION_MS = 6000;

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  durationMs: number;
}

export interface NotificationOptions {
  durationMs?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly notifications = signal<Notification[]>([]);
  readonly defaultDurationMs = signal(DEFAULT_NOTIFICATION_DURATION_MS);

  private nextId = 0;

  show(
    message: string,
    type: NotificationType = 'info',
    options?: NotificationOptions,
  ): void {
    // The same failure is often reported twice (global interceptor + the caller's own handler).
    if (this.notifications().some(n => n.type === type && n.message === message)) return;
    const id = ++this.nextId;
    const durationMs = Math.max(1000, options?.durationMs ?? this.defaultDurationMs());
    this.notifications.update(list => [...list, { id, type, message, durationMs }]);
    setTimeout(() => this.dismiss(id), durationMs);
  }

  setDefaultDuration(durationMs: number): void {
    this.defaultDurationMs.set(Math.max(1000, Math.floor(durationMs)));
  }

  error(message: string, options?: NotificationOptions): void {
    this.show(message, 'error', options);
  }

  info(message: string, options?: NotificationOptions): void {
    this.show(message, 'info', options);
  }

  warn(message: string, options?: NotificationOptions): void {
    this.show(message, 'warn', options);
  }

  dismiss(id: number): void {
    this.notifications.update(list => list.filter(n => n.id !== id));
  }
}
