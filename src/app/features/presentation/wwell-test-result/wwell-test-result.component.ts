import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DecimalPipe } from '@angular/common';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { trigger, transition, animate, style } from '@angular/animations';
import { PresentationStore } from '../store/presentation.store';
import { WwellTestViewModel } from '@models/active-wwell/active-wwell-view.model';

@Component({
  selector: 'app-wwell-test-result',
  standalone: true,
  imports: [DecimalPipe, MatDialogModule, CdkDrag, CdkDragHandle],
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
  private dialogRef?: MatDialogRef<unknown>;

  private readonly mobileQuery = window.matchMedia(WwellTestResultComponent.MOBILE_QUERY);
  protected readonly isMobile = signal(this.mobileQuery.matches);

  protected readonly selectedResult = signal<WwellTestViewModel | null>(null);
  protected readonly dialogVisible = signal(false);

  constructor() {
    const onMobileChange = (e: MediaQueryListEvent) => this.isMobile.set(e.matches);
    this.mobileQuery.addEventListener('change', onMobileChange);
    this.destroyRef.onDestroy(() => this.mobileQuery.removeEventListener('change', onMobileChange));
  }

  protected readonly isFlowTest = computed(() => {
    const data = this.store.wwellTest();
    if (!data) return false;
    return data.flowType === 'FLOW';
  });

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
    event.preventDefault();
    event.stopPropagation();
    if (this.isMobile()) return;

    const el = (event.currentTarget as HTMLElement)?.closest('.dialog__wrapper') as HTMLElement | null;
    if (!el) return;

    const pane = el.closest('.cdk-overlay-pane') as HTMLElement | null;

    const startX = event.clientX;
    const startY = event.clientY;
    const startW = el.offsetWidth;
    const startH = el.offsetHeight;

    let pendingEvent: MouseEvent | null = null;
    let frameId = 0;

    const applyResize = () => {
      frameId = 0;
      if (!pendingEvent) return;
      const w = axis === 'height'
        ? startW
        : Math.min(
            Math.max(WwellTestResultComponent.MIN_DIALOG_WIDTH, startW + (pendingEvent.clientX - startX)),
            window.innerWidth - WwellTestResultComponent.VIEWPORT_MARGIN,
          );
      const h = axis === 'width'
        ? startH
        : Math.min(
            Math.max(WwellTestResultComponent.MIN_DIALOG_HEIGHT, startH + (pendingEvent.clientY - startY)),
            window.innerHeight - WwellTestResultComponent.VIEWPORT_MARGIN,
          );
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;
      if (pane) {
        pane.style.width = `${w}px`;
        pane.style.height = `${h}px`;
      }
    };

    const onMove = (e: MouseEvent) => {
      pendingEvent = e;
      if (!frameId) frameId = requestAnimationFrame(applyResize);
    };

    const onUp = () => {
      if (frameId) cancelAnimationFrame(frameId);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      el.classList.remove('dialog__wrapper--resizing');
    };

    const cursor = axis === 'width' ? 'ew-resize' : axis === 'height' ? 'ns-resize' : 'se-resize';
    document.body.style.cursor = cursor;
    document.body.style.userSelect = 'none';
    el.classList.add('dialog__wrapper--resizing');
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }
}
