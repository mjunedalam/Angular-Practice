import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  output,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-resize-divider',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="divider"
      [class.divider--active]="dragging()"
      (mousedown)="onMouseDown($event)"
      title="Drag to resize"
    >
      <!-- thin track line behind the handle -->
      <div class="divider__track"></div>

      <!-- centred pill handle -->
      <div class="divider__handle">
        <!-- three vertical bars — the classic resize grip -->
        <svg class="divider__grip" viewBox="0 0 10 28" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="3" width="2" height="22" rx="1" fill="currentColor"/>
          <rect x="4.5" y="3" width="2" height="22" rx="1" fill="currentColor"/>
          <rect x="8" y="3" width="2" height="22" rx="1" fill="currentColor"/>
        </svg>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      align-items: stretch;
      flex-shrink: 0;
      width: 16px;
      cursor: col-resize;
      position: relative;
      z-index: 20;
    }

    .divider {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      user-select: none;
    }

    /* ── Full-height track ──────────────────────────────────── */
    .divider__track {
      position: absolute;
      top: 0; bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 1px;
      background: var(--border);
      opacity: 0.5;
      transition: opacity 0.18s, background 0.18s, width 0.15s;
    }

    /* ── Pill handle ────────────────────────────────────────── */
    .divider__handle {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 52px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text-muted);
      opacity: 0.55;
      transition:
        opacity      0.18s,
        background   0.18s,
        border-color 0.18s,
        box-shadow   0.18s,
        transform    0.12s;
    }

    /* ── Three-bar grip icon ────────────────────────────────── */
    .divider__grip {
      width: 10px;
      height: 28px;
      display: block;
      transition: color 0.18s;
    }

    /* ── Hover state ────────────────────────────────────────── */
    .divider:hover .divider__track,
    .divider--active .divider__track {
      width: 2px;
      background: var(--accent);
      opacity: 0.8;
    }

    .divider:hover .divider__handle,
    .divider--active .divider__handle {
      opacity: 1;
      background: var(--bg-card);
      border-color: var(--accent);
      color: var(--accent);
      box-shadow:
        0 0 0 3px rgba(14, 165, 233, 0.12),
        0 2px 12px rgba(0, 0, 0, 0.2);
    }

    /* ── Active / dragging ──────────────────────────────────── */
    .divider--active .divider__track {
      width: 2px;
      opacity: 1;
    }

    .divider--active .divider__handle {
      transform: scaleX(1.12);
      background: var(--accent-muted);
      border-color: var(--accent);
      color: var(--accent);
      box-shadow:
        0 0 0 4px rgba(14, 165, 233, 0.18),
        0 4px 16px rgba(0, 0, 0, 0.25);
    }
  `],
})
export class ResizeDividerComponent implements OnDestroy {
  readonly drag    = output<number>();
  readonly dragEnd = output<void>();

  protected readonly dragging = signal(false);

  private lastX = 0;
  private readonly onMove = this.handleMove.bind(this);
  private readonly onUp   = this.handleUp.bind(this);

  onMouseDown(e: MouseEvent): void {
    e.preventDefault();
    this.dragging.set(true);
    this.lastX = e.clientX;
    document.body.style.cursor     = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', this.onMove);
    window.addEventListener('mouseup',   this.onUp);
  }

  private handleMove(e: MouseEvent): void {
    const delta = e.clientX - this.lastX;
    this.lastX  = e.clientX;
    if (delta !== 0) this.drag.emit(delta);
  }

  private handleUp(): void {
    this.dragging.set(false);
    document.body.style.cursor     = '';
    document.body.style.userSelect = '';
    window.removeEventListener('mousemove', this.onMove);
    window.removeEventListener('mouseup',   this.onUp);
    this.dragEnd.emit();
  }

  ngOnDestroy(): void {
    window.removeEventListener('mousemove', this.onMove);
    window.removeEventListener('mouseup',   this.onUp);
  }
}