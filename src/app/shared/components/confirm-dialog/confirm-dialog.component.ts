import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDialogRow {
  label: string;
  value: string;
}

export interface ConfirmDialogData {
  title: string;
  subtitle?: string;
  rows: ConfirmDialogRow[];
  confirmLabel?: string;
  cancelLabel?: string;
  severity?: 'info' | 'warning' | 'danger';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ConfirmDialogComponent {
  protected readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);

  protected readonly confirmLabel = this.data.confirmLabel ?? 'Confirm';
  protected readonly cancelLabel  = this.data.cancelLabel  ?? 'Cancel';
  protected readonly severity     = this.data.severity     ?? 'info';

  protected confirm(): void { this.dialogRef.close(true); }
  protected cancel(): void  { this.dialogRef.close(false); }

  protected isEmail(value: string): boolean {
    return value.includes('@');
  }
}
