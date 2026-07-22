import { DestroyRef, WritableSignal, signal } from '@angular/core';

export type DialogResizeAxis = 'width' | 'height' | 'both';

export interface DialogResizeConfig {
  readonly minWidth: number;
  readonly minHeight: number;
  readonly viewportMargin: number;
}

/**
 * Drag-resizes the closest `.dialog__wrapper` (and its CDK overlay pane) from a
 * mousedown on a resize handle. Extracted so dialog-based detail views can share
 * the resize math and cursor/selection handling instead of copy-pasting it.
 */
export function startDialogResize(event: MouseEvent, axis: DialogResizeAxis, config: DialogResizeConfig): void {
  event.preventDefault();
  event.stopPropagation();

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
          Math.max(config.minWidth, startW + (pendingEvent.clientX - startX)),
          window.innerWidth - config.viewportMargin,
        );
    const h = axis === 'width'
      ? startH
      : Math.min(
          Math.max(config.minHeight, startH + (pendingEvent.clientY - startY)),
          window.innerHeight - config.viewportMargin,
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

/** Tracks a media query as a signal, cleaning up the listener on component destroy. */
export function createMobileQuerySignal(query: string, destroyRef: DestroyRef): WritableSignal<boolean> {
  const mediaQuery = window.matchMedia(query);
  const isMobile = signal(mediaQuery.matches);
  const onChange = (e: MediaQueryListEvent) => isMobile.set(e.matches);
  mediaQuery.addEventListener('change', onChange);
  destroyRef.onDestroy(() => mediaQuery.removeEventListener('change', onChange));
  return isMobile;
}
