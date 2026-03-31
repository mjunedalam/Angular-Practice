import {
  ChangeDetectionStrategy,
  Component,
  input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';

type ResizeEdge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
interface Rect { x: number; y: number; w: number; h: number; }

const MIN_W = 180;
const MIN_H = 80;

@Component({
  selector: 'app-draggable-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="dc-card"
      [class.dc-card--draggable]="draggable()"
      [class.dc-card--dragging]="dragging()"
      [class.dc-card--resizing]="resizing()"
      [style.transform]="draggable() ? 'translate(' + x() + 'px,' + y() + 'px)' : null"
      [style.width.px]="draggable() ? w() : null"
      [style.height.px]="draggable() ? h() : null"
    >
      <!-- Header — shows drag grip only when draggable mode is on -->
      <div
        class="dc-card__header"
        [class.dc-card__header--draggable]="draggable()"
        (mousedown)="draggable() && startDrag($event)"
      >
        <span class="dc-card__title">{{ title() }}</span>
        @if (draggable()) {
          <span class="dc-card__grip" title="Drag to move">
            <svg viewBox="0 0 20 6" fill="none">
              <circle cx="2"  cy="3" r="1.5" fill="currentColor"/>
              <circle cx="7"  cy="3" r="1.5" fill="currentColor"/>
              <circle cx="12" cy="3" r="1.5" fill="currentColor"/>
              <circle cx="17" cy="3" r="1.5" fill="currentColor"/>
            </svg>
          </span>
        }
      </div>

      <!-- Content -->
      <div class="dc-card__body">
        <ng-content />
      </div>

      <!-- Resize edges — only rendered when draggable -->
      @if (draggable()) {
        <div class="dc-edge dc-edge--n"  (mousedown)="startResize($event, 'n')"></div>
        <div class="dc-edge dc-edge--s"  (mousedown)="startResize($event, 's')"></div>
        <div class="dc-edge dc-edge--e"  (mousedown)="startResize($event, 'e')"></div>
        <div class="dc-edge dc-edge--w"  (mousedown)="startResize($event, 'w')"></div>
        <div class="dc-edge dc-edge--ne" (mousedown)="startResize($event, 'ne')"></div>
        <div class="dc-edge dc-edge--nw" (mousedown)="startResize($event, 'nw')"></div>
        <div class="dc-edge dc-edge--se" (mousedown)="startResize($event, 'se')"></div>
        <div class="dc-edge dc-edge--sw" (mousedown)="startResize($event, 'sw')"></div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      /* In fixed mode: host is a normal flex child, fills parent naturally */
      /* In draggable mode: host is absolute-positioned by the parent */
    }

    /* ── Card shell ────────────────────────────────────────────── */
    .dc-card {
      display: flex;
      flex-direction: column;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      height: 100%;
    }

    /* In draggable mode card is positioned absolutely — needs relative self */
    .dc-card--draggable {
      position: relative;
      height: unset;
      box-shadow: 0 3px 14px rgba(0,0,0,0.14);
      transition: box-shadow 0.15s;
      will-change: transform;
    }

    .dc-card--dragging {
      box-shadow: 0 14px 44px rgba(0,0,0,0.32), 0 0 0 2px var(--accent);
      z-index: 1000;
      opacity: 0.96;
    }

    .dc-card--resizing {
      box-shadow: 0 8px 28px rgba(0,0,0,0.22), 0 0 0 1.5px var(--accent);
      z-index: 999;
    }

    /* ── Header ────────────────────────────────────────────────── */
    .dc-card__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 7px 10px 7px 12px;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
      user-select: none;
    }

    .dc-card__header--draggable {
      cursor: grab;
      &:active { cursor: grabbing; }
    }

    .dc-card__title {
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--text-muted);
    }

    .dc-card__grip {
      color: var(--text-muted);
      opacity: 0.5;
      display: flex;
      align-items: center;
      transition: opacity 0.15s, color 0.15s;
      svg { width: 22px; height: 8px; }
    }

    .dc-card__header--draggable:hover .dc-card__grip {
      opacity: 1;
      color: var(--accent);
    }

    /* ── Body ──────────────────────────────────────────────────── */
    .dc-card__body {
      flex: 1;
      overflow: auto;
      min-height: 0;
      &::-webkit-scrollbar { width: 4px; height: 4px; }
      &::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
    }

    /* ── Resize edge hit areas ─────────────────────────────────── */
    .dc-edge {
      position: absolute;
      z-index: 10;
    }
    .dc-edge--n  { top: -4px;    left: 8px;   right: 8px;   height: 8px;  cursor: n-resize;  }
    .dc-edge--s  { bottom: -4px; left: 8px;   right: 8px;   height: 8px;  cursor: s-resize;  }
    .dc-edge--e  { right: -4px;  top: 8px;    bottom: 8px;  width: 8px;   cursor: e-resize;  }
    .dc-edge--w  { left: -4px;   top: 8px;    bottom: 8px;  width: 8px;   cursor: w-resize;  }
    .dc-edge--ne { top: -4px;    right: -4px;  width: 14px; height: 14px; cursor: ne-resize; }
    .dc-edge--nw { top: -4px;    left: -4px;   width: 14px; height: 14px; cursor: nw-resize; }
    .dc-edge--se { bottom: -4px; right: -4px;  width: 14px; height: 14px; cursor: se-resize; }
    .dc-edge--sw { bottom: -4px; left: -4px;   width: 14px; height: 14px; cursor: sw-resize; }

    .dc-edge--se::after, .dc-edge--sw::after,
    .dc-edge--ne::after, .dc-edge--nw::after {
      content: '';
      position: absolute;
      inset: 3px;
      border-radius: 2px;
      background: transparent;
      transition: background 0.15s;
    }
    .dc-edge--se:hover::after, .dc-edge--sw:hover::after,
    .dc-edge--ne:hover::after, .dc-edge--nw:hover::after {
      background: var(--accent);
      opacity: 0.6;
    }
  `],
})
export class DraggableCardComponent implements OnInit, OnDestroy {
  readonly title      = input<string>('');
  readonly draggable  = input<boolean>(false);   // controlled by parent
  readonly initialW   = input<number>(300);
  readonly initialH   = input<number>(240);

  protected readonly x        = signal(0);
  protected readonly y        = signal(0);
  protected readonly w        = signal(300);
  protected readonly h        = signal(240);
  protected readonly dragging = signal(false);
  protected readonly resizing = signal(false);

  private startMouse = { x: 0, y: 0 };
  private startRect: Rect = { x: 0, y: 0, w: 0, h: 0 };
  private activeEdge: ResizeEdge | null = null;

  private readonly onMove = this.handleMove.bind(this);
  private readonly onUp   = this.handleUp.bind(this);

  ngOnInit(): void {
    this.w.set(this.initialW());
    this.h.set(this.initialH());
  }

  startDrag(e: MouseEvent): void {
    e.preventDefault();
    this.dragging.set(true);
    this.startMouse = { x: e.clientX, y: e.clientY };
    this.startRect  = { x: this.x(), y: this.y(), w: this.w(), h: this.h() };
    document.body.style.cursor     = 'grabbing';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', this.onMove);
    window.addEventListener('mouseup',   this.onUp);
  }

  startResize(e: MouseEvent, edge: ResizeEdge): void {
    e.preventDefault();
    e.stopPropagation();
    this.resizing.set(true);
    this.activeEdge = edge;
    this.startMouse = { x: e.clientX, y: e.clientY };
    this.startRect  = { x: this.x(), y: this.y(), w: this.w(), h: this.h() };
    document.body.style.cursor     = edge + '-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', this.onMove);
    window.addEventListener('mouseup',   this.onUp);
  }

  private handleMove(e: MouseEvent): void {
    const dx = e.clientX - this.startMouse.x;
    const dy = e.clientY - this.startMouse.y;

    if (this.dragging()) {
      this.x.set(this.startRect.x + dx);
      this.y.set(this.startRect.y + dy);
      return;
    }

    if (this.resizing() && this.activeEdge) {
      const { x: ox, y: oy, w: ow, h: oh } = this.startRect;
      let nx = ox, ny = oy, nw = ow, nh = oh;
      const edge = this.activeEdge;
      if (edge.includes('e'))  nw = Math.max(MIN_W, ow + dx);
      if (edge.includes('w')) { nw = Math.max(MIN_W, ow - dx); nx = ox + (ow - nw); }
      if (edge.includes('s'))  nh = Math.max(MIN_H, oh + dy);
      if (edge.includes('n')) { nh = Math.max(MIN_H, oh - dy); ny = oy + (oh - nh); }
      this.x.set(nx); this.y.set(ny);
      this.w.set(nw); this.h.set(nh);
    }
  }

  private handleUp(): void {
    this.dragging.set(false);
    this.resizing.set(false);
    this.activeEdge = null;
    document.body.style.cursor     = '';
    document.body.style.userSelect = '';
    window.removeEventListener('mousemove', this.onMove);
    window.removeEventListener('mouseup',   this.onUp);
  }

  ngOnDestroy(): void {
    window.removeEventListener('mousemove', this.onMove);
    window.removeEventListener('mouseup',   this.onUp);
  }
}