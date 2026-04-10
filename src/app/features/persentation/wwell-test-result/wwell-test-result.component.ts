import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { trigger, transition, animate, style, keyframes } from '@angular/animations';
import { WellStore } from 'src/app/core/store/well.store';
import { WellTestResult } from 'src/app/core/store/well.store';

@Component({
  selector: 'app-wwell-test-result',
  standalone: true,
  imports: [DecimalPipe, TitleCasePipe],
  templateUrl: './wwell-test-result.component.html',
  styleUrl: './wwell-test-result.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('backdropAnim', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('280ms ease', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('240ms ease', style({ opacity: 0 })),
      ]),
    ]),
    trigger('dialogAnim', [
      transition(':enter', [
        style({ transformOrigin: 'top center' }),
        animate('520ms cubic-bezier(0.34, 1.15, 0.64, 1)', keyframes([
          style({ opacity: 0, transform: 'scaleY(0) scaleX(0.5)',   offset: 0    }),
          style({ opacity: 1, transform: 'scaleY(0.12) scaleX(0.75)', offset: 0.18 }),
          style({ opacity: 1, transform: 'scaleY(0.55) scaleX(0.92)', offset: 0.5  }),
          style({ opacity: 1, transform: 'scaleY(1.04) scaleX(1.01)', offset: 0.78 }),
          style({ opacity: 1, transform: 'scaleY(1) scaleX(1)',     offset: 1    }),
        ])),
      ]),
      transition(':leave', [
        style({ transformOrigin: 'top center' }),
        animate('340ms cubic-bezier(0.55, 0, 0.8, 0.1)', keyframes([
          style({ opacity: 1, transform: 'scaleY(1) scaleX(1)',       offset: 0    }),
          style({ opacity: 0.9, transform: 'scaleY(1.03) scaleX(1.01)', offset: 0.08 }),
          style({ opacity: 0.5, transform: 'scaleY(0.45) scaleX(0.88)', offset: 0.55 }),
          style({ opacity: 0,   transform: 'scaleY(0) scaleX(0.5)',   offset: 1    }),
        ])),
      ]),
    ]),
  ],
})
export class WwellTestResultComponent {
  protected readonly store = inject(WellStore);

  protected readonly selectedResult = signal<WellTestResult | null>(null);

  // ── Drag state ─────────────────────────────────────────────────────────────
  protected readonly dialogX = signal(0);
  protected readonly dialogY = signal(0);
  private _dragging = false;
  private _dragStartX = 0;
  private _dragStartY = 0;
  private _dlgStartX = 0;
  private _dlgStartY = 0;

  protected openDialog(result: WellTestResult): void {
    this.dialogX.set(0);
    this.dialogY.set(0);
    this.selectedResult.set(result);
  }

  protected closeDialog(): void {
    this.selectedResult.set(null);
  }

  protected stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }

  protected onHeaderMouseDown(event: MouseEvent): void {
    if ((event.target as HTMLElement).closest('button')) return;
    this._dragging = true;
    this._dragStartX = event.clientX;
    this._dragStartY = event.clientY;
    this._dlgStartX = this.dialogX();
    this._dlgStartY = this.dialogY();
    event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this._dragging) return;
    this.dialogX.set(this._dlgStartX + event.clientX - this._dragStartX);
    this.dialogY.set(this._dlgStartY + event.clientY - this._dragStartY);
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    this._dragging = false;
  }
}