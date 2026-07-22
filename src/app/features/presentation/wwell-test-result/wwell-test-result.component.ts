import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  LOCALE_ID,
  signal,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { formatNumber } from '@angular/common';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { trigger, transition, animate, style } from '@angular/animations';
import { PresentationStore } from '../store/presentation.store';
import { WwellTestViewModel } from '@models/active-wwell/active-wwell-view.model';
import { createMobileQuerySignal, startDialogResize } from '@shared/utils/dialog-interaction.util';

@Component({
  selector: 'app-wwell-test-result',
  standalone: true,
  imports: [MatDialogModule, CdkDrag, CdkDragHandle],
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

  private static readonly MIN_DIALOG_WIDTH = 480;
  private static readonly MIN_DIALOG_HEIGHT = 320;
  private static readonly VIEWPORT_MARGIN = 24;
  private static readonly MOBILE_QUERY = '(max-width: 640px)';

  protected readonly store = inject(PresentationStore);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly locale = inject(LOCALE_ID);
  private dialogRef?: MatDialogRef<unknown>;

  protected readonly isMobile = createMobileQuerySignal(WwellTestResultComponent.MOBILE_QUERY, this.destroyRef);

  protected readonly selectedResult = signal<WwellTestViewModel | null>(null);
  protected readonly dialogVisible = signal(false);

  protected readonly isFlowTest = computed(() => {
    const data = this.store.wwellTest();
    if (!data) return false;
    return data.flowType === 'FLOW';
  });

  protected fmtNum(value: number | string | null | undefined, digitsInfo?: string): string {
    if (value === null || value === undefined || value === '') return '';
    const num = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(num)) return '';
    return formatNumber(num, this.locale, digitsInfo);
  }

  protected openDialog(result: WwellTestViewModel): void {
    this.selectedResult.set(result);
    this.dialogVisible.set(true);
    if (!this.resultDialog) return;

    this.dialogRef = this.dialog.open(this.resultDialog, {
      autoFocus: false,
      panelClass: 'well-result-dialog',
      backdropClass: 'well-result-backdrop',
      maxWidth: this.isMobile() ? '100vw' : '96vw',
      maxHeight: this.isMobile() ? '100dvh' : '96vh',
      enterAnimationDuration: '260ms',
      exitAnimationDuration: '200ms',
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

  protected onResizeStart(event: MouseEvent, axis: 'width' | 'height' | 'both'): void {
    if (this.isMobile()) return;
    startDialogResize(event, axis, {
      minWidth: WwellTestResultComponent.MIN_DIALOG_WIDTH,
      minHeight: WwellTestResultComponent.MIN_DIALOG_HEIGHT,
      viewportMargin: WwellTestResultComponent.VIEWPORT_MARGIN,
    });
  }
}
