import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthStore } from '../../../features/auth/store/auth.store';

export type DeniedReason = 'no-permission' | 'stale-session' | 'rbac-unavailable';

export interface AccessDeniedData {
  readonly routeId:  string;
  readonly userRoles: string[];
  readonly reason:   DeniedReason;
  readonly rbacError?: string;
}

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="denied-shell">
      <mat-icon class="denied-icon">{{ icon }}</mat-icon>

      <h2 mat-dialog-title>{{ title }}</h2>

      <mat-dialog-content>
        <p>{{ message }}</p>

        @if (data.reason === 'no-permission' && data.userRoles.length) {
          <p class="roles-row">
            <span class="roles-label">
              Your role{{ data.userRoles.length > 1 ? 's' : '' }}:
            </span>
            @for (role of data.userRoles; track role) {
              <span class="role-chip">{{ role }}</span>
            }
          </p>
        }

        @if (data.reason === 'rbac-unavailable' && data.rbacError) {
          <p class="error-detail">{{ data.rbacError }}</p>
        }
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        @if (data.reason === 'stale-session') {
          <button mat-flat-button color="primary" (click)="logout()">Log Out & Re-Login</button>
        } @else {
          <button mat-flat-button color="primary" (click)="close()">Got it</button>
        }
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .denied-shell {
      text-align: center;
      padding: 8px 4px;
    }

    .denied-icon {
      font-size: 52px;
      width: 52px;
      height: 52px;
      color: #e53935;
      margin-bottom: 4px;
    }

    h2[mat-dialog-title] { margin: 0 0 4px; }

    mat-dialog-content { text-align: left; }

    .roles-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px;
      margin: 12px 0;
    }

    .roles-label {
      font-size: 13px;
      color: var(--mat-sys-on-surface-variant, #666);
    }

    .role-chip {
      padding: 2px 10px;
      border-radius: 12px;
      background: var(--mat-sys-surface-variant, #e0e0e0);
      font-size: 12px;
      font-weight: 500;
    }

    .error-detail {
      font-size: 12px;
      color: #e53935;
      font-family: monospace;
      background: #fce8e8;
      padding: 6px 10px;
      border-radius: 4px;
      margin: 8px 0 0;
      word-break: break-word;
    }

    .hint {
      font-size: 13px;
      color: var(--mat-sys-on-surface-variant, #666);
      margin: 8px 0 0;
    }
  `],
})
export class AccessDeniedComponent {
  protected readonly data      = inject<AccessDeniedData>(MAT_DIALOG_DATA);
  private   readonly dialogRef = inject(MatDialogRef<AccessDeniedComponent>);
  private   readonly authStore = inject(AuthStore);

  protected get icon(): string {
    return this.data.reason === 'rbac-unavailable' ? 'error_outline' : 'lock';
  }

  protected get title(): string {
    switch (this.data.reason) {
      case 'stale-session':    return 'Session Outdated';
      case 'rbac-unavailable': return 'Configuration Error';
      default:                 return 'Access Restricted';
    }
  }

  protected get message(): string {
    switch (this.data.reason) {
      case 'stale-session':
        return 'Your session does not contain group claims. Please log out and log back in to refresh your credentials.';
      case 'rbac-unavailable':
        return 'Role configuration could not be loaded. Contact your administrator.';
      default:
        return `You don't have permission to access ${this.data.routeId}. Contact your administrator to request access.`;
    }
  }

  protected logout(): void {
    this.dialogRef.close();
    this.authStore.logout();
  }

  protected close(): void {
    this.dialogRef.close();
  }
}
