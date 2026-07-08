import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-well-test-dialog',
  standalone: true,
  imports: [MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dwt-dialog">
      <div class="dwt-dialog__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke-linecap="round"/>
        </svg>
      </div>
      <h2 class="dwt-dialog__title">Delete Well Test</h2>
      <p class="dwt-dialog__message">Are you sure you want to delete this well test? This action cannot be undone.</p>
      <div class="dwt-dialog__actions">
        <button mat-button class="dwt-btn dwt-btn--cancel" (click)="cancel()">Cancel</button>
        <button mat-raised-button class="dwt-btn dwt-btn--delete" (click)="confirm()">Delete</button>
      </div>
    </div>
  `,
  styles: [`
    .dwt-dialog {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 2rem 2rem 1.5rem;
      min-width: 320px;
      max-width: 400px;
      text-align: center;
    }

    .dwt-dialog__icon {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: #fee2e2;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #dc2626;

      svg {
        width: 26px;
        height: 26px;
      }
    }

    .dwt-dialog__title {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 700;
      color: #1e293b;
    }

    .dwt-dialog__message {
      margin: 0;
      font-size: 0.875rem;
      color: #64748b;
      line-height: 1.5;
    }

    .dwt-dialog__actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }

    .dwt-btn--cancel {
      color: #64748b !important;
      font-weight: 600 !important;
    }

    .dwt-btn--delete {
      background: #dc2626 !important;
      color: #fff !important;
      font-weight: 700 !important;
      box-shadow: 0 2px 8px rgba(220, 38, 38, 0.28) !important;

      &:hover {
        background: #b91c1c !important;
      }
    }
  `],
})
export class DeleteWellTestDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<DeleteWellTestDialogComponent>);

  protected confirm(): void { this.dialogRef.close(true); }
  protected cancel(): void  { this.dialogRef.close(false); }
}
