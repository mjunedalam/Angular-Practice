import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ActionConfirmDialogRow {
  label: string;
  value: string;
}

/**
 * Plain generic confirm/reject gate — resets, row deletes, whole-record deletes, any yes/no
 * action with nothing to do with sending an email. Deliberately its own component/service, not a
 * variant of ConfirmDialogService (which is scoped to morning-report's "Send Daily Report" flow
 * and its cybersecurity-disclosure copy) — that dialog's design doesn't fit an action like
 * "Delete this casing row?", and this one has no reason to carry any of that email-specific baggage.
 */
export interface ActionConfirmDialogData {
  title: string;
  subtitle?: string;
  rows?: ActionConfirmDialogRow[];
  confirmLabel?: string;
  cancelLabel?: string;
  severity?: 'info' | 'warning' | 'danger';
  /** Short footer note. Defaults per `severity` (see DEFAULT_HINT) when omitted; pass '' to show
   *  no hint at all. */
  hint?: string;
}

const DEFAULT_HINT: Record<NonNullable<ActionConfirmDialogData['severity']>, string> = {
  info: '',
  warning: 'Please review before continuing.',
  danger: 'This action cannot be undone.',
};

@Component({
  selector: 'app-action-confirm-dialog',
  standalone: true,
  templateUrl: './action-confirm-dialog.component.html',
  styleUrl: './action-confirm-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ActionConfirmDialogComponent {
  protected readonly data = inject<ActionConfirmDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ActionConfirmDialogComponent>);

  protected readonly rows         = this.data.rows ?? [];
  protected readonly confirmLabel = this.data.confirmLabel ?? 'Confirm';
  protected readonly cancelLabel  = this.data.cancelLabel  ?? 'Cancel';
  protected readonly severity     = this.data.severity     ?? 'info';
  protected readonly hint         = this.data.hint ?? DEFAULT_HINT[this.severity];

  protected confirm(): void { this.dialogRef.close(true); }
  protected cancel(): void  { this.dialogRef.close(false); }
}
