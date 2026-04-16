import { Injectable, signal } from '@angular/core';

export type NotificationType = 'error' | 'info';

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly notifications = signal<Notification[]>([]);

  private nextId = 0;

  show(message: string, type: NotificationType = 'info'): void {
    const id = ++this.nextId;
    this.notifications.update(list => [...list, { id, type, message }]);
    setTimeout(() => this.dismiss(id), 6000);
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  dismiss(id: number): void {
    this.notifications.update(list => list.filter(n => n.id !== id));
  }
}
