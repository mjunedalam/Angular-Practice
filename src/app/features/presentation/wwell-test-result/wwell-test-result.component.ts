import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { trigger, transition, animate, style } from '@angular/animations';
import { WellStore } from 'src/app/core/store/well.store';
import { WellTestResult } from 'src/app/core/store/well.store';

@Component({
  selector: 'app-wwell-test-result',
  standalone: true,
  imports: [DecimalPipe, TitleCasePipe, MatDialogModule],
  templateUrl: './wwell-test-result.component.html',
  styleUrl: './wwell-test-result.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('resultTabAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-8px)' }),
        animate('300ms ease', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ]),
  ],
})
export class WwellTestResultComponent {
  @ViewChild('resultDialog') private resultDialog?: TemplateRef<unknown>;

  protected readonly store = inject(WellStore);
  private readonly dialog = inject(MatDialog);
  private dialogRef?: MatDialogRef<unknown>;

  protected readonly selectedResult = signal<WellTestResult | null>(null);
  protected readonly dialogVisible = signal(false);

  protected openDialog(result: WellTestResult): void {
    this.selectedResult.set(result);
    this.dialogVisible.set(true);
    if (!this.resultDialog) return;

    this.dialogRef = this.dialog.open(this.resultDialog, {
      autoFocus: false,
      panelClass: 'well-result-dialog',
      width: '520px',
      maxWidth: '92vw',
    });
    this.dialogRef.afterClosed().subscribe(() => this.onDialogHide());
  }

  protected onDialogHide(): void {
    this.selectedResult.set(null);
    this.dialogVisible.set(false);
    this.dialogRef = undefined;
  }

  protected closeDialog(): void {
    this.dialogRef?.close();
  }
}
