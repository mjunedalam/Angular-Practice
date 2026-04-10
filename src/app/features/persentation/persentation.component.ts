import { ChangeDetectionStrategy, Component, inject, OnInit, signal, ElementRef, ViewChild, HostListener } from '@angular/core';
import { trigger, transition, animate, style, keyframes } from '@angular/animations';
import { WellStore } from 'src/app/core/store/well.store';
import { ResizeDividerComponent } from '../../shared/components/resize-divider/resize-divider.component';
import { WellBoreViewComponent } from './well-bore-view/well-bore-view.component';
import { DepthScaleComponent } from './depth-scale/depth-scale.component';
import { WellNameChipsComponent } from './well-name-chips/well-name-chips.component';
import { MiscPresWellDataComponent } from './misc-pres-well-data/misc-pres-well-data.component';
import { PickedFormationTopsComponent } from './picked-formation-tops/picked-formation-tops.component';
import { ActiveWwellMapComponent } from './active-wwell-map/active-wwell-map.component';
import { OffsetWwellsComponent } from './offset-wwells/offset-wwells.component';
import { WwellsLogsIndicatorsComponent } from './wwells-logs-indicators/wwells-logs-indicators.component';
import { WwellTestResultComponent } from './wwell-test-result/wwell-test-result.component';
import { PresentationSkeletonComponent } from './presentation-skeleton/presentation-skeleton.component';

const LEFT_DEFAULT = 340; const LEFT_MIN = 220; const LEFT_MAX = 520;
const RIGHT_DEFAULT = 360; const RIGHT_MIN = 240; const RIGHT_MAX = 560;

@Component({
  selector: 'app-persentation',
  standalone: true,
  imports: [

    ResizeDividerComponent,
    WellBoreViewComponent,
    DepthScaleComponent,
    WellNameChipsComponent,
    MiscPresWellDataComponent,
    PickedFormationTopsComponent,
    ActiveWwellMapComponent,
    OffsetWwellsComponent,
    WwellsLogsIndicatorsComponent,
    WwellTestResultComponent,
    PresentationSkeletonComponent,
  ],
  templateUrl: './persentation.component.html',
  styleUrl: './persentation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('backdropAnim', [
      transition(':enter', [
        style({ opacity: 0, background: 'rgba(0,0,0,0)' }),
        animate('400ms cubic-bezier(0.16, 1, 0.3, 1)',
          style({ opacity: 1, background: 'rgba(0,0,0,0.6)' })
        ),
      ]),
      transition(':leave', [
        animate('280ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 0, background: 'rgba(0,0,0,0)' })
        ),
      ]),
    ]),
    trigger('modalAnim', [
      transition(':enter', [
        animate('580ms cubic-bezier(0.34, 1.4, 0.64, 1)', keyframes([
          style({
            opacity: 0,
            transform: 'perspective(1400px) rotateX(42deg) translateY(-140px) scale(0.45)',
            filter: 'blur(24px)',
            offset: 0,
          }),
          style({
            opacity: 1,
            transform: 'perspective(1400px) rotateX(-5deg) translateY(10px) scale(1.04)',
            filter: 'blur(0px)',
            offset: 0.62,
          }),
          style({
            transform: 'perspective(1400px) rotateX(2deg) translateY(-4px) scale(0.98)',
            offset: 0.8,
          }),
          style({
            transform: 'perspective(1400px) rotateX(0deg) translateY(0) scale(1)',
            offset: 1,
          }),
        ])),
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.55, 0, 0.85, 0.05)', keyframes([
          style({
            opacity: 1,
            transform: 'perspective(1400px) rotateX(0deg) scale(1)',
            filter: 'blur(0px)',
            offset: 0,
          }),
          style({
            opacity: 0.7,
            transform: 'perspective(1400px) rotateX(-10deg) scale(1.05)',
            filter: 'blur(4px)',
            offset: 0.18,
          }),
          style({
            opacity: 0,
            transform: 'perspective(1400px) rotateX(48deg) translateY(100px) scale(0.4)',
            filter: 'blur(28px)',
            offset: 1,
          }),
        ])),
      ]),
    ]),
  ],
})
export class PersentationComponent implements OnInit {
  protected readonly store = inject(WellStore);

  /** false = fixed three-column (default), true = free draggable canvas */
  protected readonly draggableMode = signal(false);

  /** Active tab in the unified info panel (Free Mode) */
  protected readonly activeTab = signal<'info' | 'formation' | 'map' | 'offset' | 'test'>('info');

  protected readonly leftWidth = signal(LEFT_DEFAULT);
  protected readonly rightWidth = signal(RIGHT_DEFAULT);

  // ── Modal drag state ──────────────────────────────────────────────────────
  protected readonly modalX = signal(0);
  protected readonly modalY = signal(0);
  private _dragging = false;
  private _dragStartX = 0;
  private _dragStartY = 0;
  private _modalStartX = 0;
  private _modalStartY = 0;

  @ViewChild('presModal') presModal!: ElementRef<HTMLElement>;

  ngOnInit(): void {
    this.store.loadWellNames();
  }

  protected toggleDraggable(): void {
    this.draggableMode.update(v => !v);
    if (!this.draggableMode()) {
      this.modalX.set(0);
      this.modalY.set(0);
    }
  }

  protected onModalHeaderMouseDown(event: MouseEvent): void {
    if ((event.target as HTMLElement).closest('button')) return;
    this._dragging = true;
    this._dragStartX = event.clientX;
    this._dragStartY = event.clientY;
    this._modalStartX = this.modalX();
    this._modalStartY = this.modalY();
    event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this._dragging) return;
    this.modalX.set(this._modalStartX + event.clientX - this._dragStartX);
    this.modalY.set(this._modalStartY + event.clientY - this._dragStartY);
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    this._dragging = false;
  }

  protected setTab(tab: 'info' | 'formation' | 'map' | 'offset' | 'test'): void {
    this.activeTab.set(tab);
  }

  protected onLeftDrag(delta: number): void {
    this.leftWidth.update(w => Math.min(LEFT_MAX, Math.max(LEFT_MIN, w + delta)));
  }

  protected onRightDrag(delta: number): void {
    this.rightWidth.update(w => Math.min(RIGHT_MAX, Math.max(RIGHT_MIN, w - delta)));
  }
}