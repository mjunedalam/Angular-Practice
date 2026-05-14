import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthStore } from '../../../features/auth/store/auth.store';

export type DeniedReason = 'no-permission' | 'stale-session' | 'rbac-unavailable';

export interface AccessDeniedData {
  readonly routeId:   string;
  readonly userRoles: string[];
  readonly reason:    DeniedReason;
  readonly rbacError?: string;
}

const CLOSE_DURATION_MS = 200;

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './access-denied.component.html',
  styleUrl: './access-denied.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('dialog', [
      state('open',    style({ opacity: 1, transform: 'scale(1) translateY(0)' })),
      state('closing', style({ opacity: 0, transform: 'scale(0.93) translateY(-10px)' })),
      transition('void => open', [
        style({ opacity: 0, transform: 'scale(0.86) translateY(-22px)' }),
        animate(`320ms cubic-bezier(0.34, 1.56, 0.64, 1)`),
      ]),
      transition('open => closing', [
        animate(`${CLOSE_DURATION_MS}ms cubic-bezier(0.4, 0, 1, 1)`),
      ]),
    ]),
  ],
})
export class AccessDeniedComponent {
  protected readonly data      = inject<AccessDeniedData>(MAT_DIALOG_DATA);
  private   readonly dialogRef = inject(MatDialogRef<AccessDeniedComponent>);
  private   readonly authStore = inject(AuthStore);

  protected readonly animState = signal<'open' | 'closing'>('open');

  protected get icon(): string {
    const icons: Record<DeniedReason, string> = {
      'no-permission':    'lock',
      'stale-session':    'schedule',
      'rbac-unavailable': 'error_outline',
    };
    return icons[this.data.reason];
  }

  protected get iconClass(): string {
    const classes: Record<DeniedReason, string> = {
      'no-permission':    'icon-lock',
      'stale-session':    'icon-session',
      'rbac-unavailable': 'icon-error',
    };
    return classes[this.data.reason];
  }

  protected get title(): string {
    const titles: Record<DeniedReason, string> = {
      'no-permission':    'Access Restricted',
      'stale-session':    'Session Outdated',
      'rbac-unavailable': 'Configuration Error',
    };
    return titles[this.data.reason];
  }

  protected get subtitle(): string {
    const subtitles: Record<DeniedReason, string> = {
      'no-permission':    this.data.routeId,
      'stale-session':    'Credentials need refresh',
      'rbac-unavailable': 'RBAC could not be loaded',
    };
    return subtitles[this.data.reason];
  }

  protected get message(): string {
    const messages: Record<DeniedReason, string> = {
      'no-permission':
        'You don\'t have the required permissions for this module. Contact your administrator to request access.',
      'stale-session':
        'Your session is missing group claims. Log out and re-authenticate to refresh your credentials.',
      'rbac-unavailable':
        'Role configuration failed to load. The administrator needs to check the RBAC configuration.',
    };
    return messages[this.data.reason];
  }

  protected dismiss(): void {
    this.animState.set('closing');
    setTimeout(() => this.dialogRef.close(), CLOSE_DURATION_MS);
  }

  protected logout(): void {
    this.animState.set('closing');
    setTimeout(() => {
      this.dialogRef.close();
      this.authStore.logout();
    }, CLOSE_DURATION_MS);
  }
}
