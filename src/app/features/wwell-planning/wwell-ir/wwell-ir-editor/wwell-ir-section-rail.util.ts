import { DestroyRef, ElementRef, QueryList, signal } from '@angular/core';

/** A section counts as "active" once its top has scrolled up to within this band of the
 *  scrollable host's own top edge — the reader is "at" that section once it's this close, not
 *  only once it's exactly flush with the top. */
const ACTIVE_BAND_PX = 96;

/**
 * Scroll-spy + click-to-scroll for the IR SECTIONS rail. Unlike the old wizard's rail (which had
 * to track each chip's live Y-position against an accordion panel that resized as it expanded/
 * collapsed), every section here is always rendered — so the rail itself needs no positioning
 * logic, just "which section is the reader at" (for highlighting) and "scroll to section N" (for
 * clicks). One instance per `WwellIrEditorComponent`.
 */
export class SectionRailController {
  private readonly activeIndexSignal = signal(0);
  readonly activeIndex = this.activeIndexSignal.asReadonly();

  private hostEl?: ElementRef<HTMLElement>;
  private sectionEls?: QueryList<ElementRef<HTMLElement>>;
  private scheduled = false;

  constructor(private readonly destroyRef: DestroyRef) {}

  /** Call once from `ngAfterViewInit` with the scrollable container (the editor's header/footer
   *  stay fixed — only this element scrolls) and the section anchors, in the same order as
   *  `wwellIrRailLeaves()` — index-aligned, so `activeIndex()` drives the matching nav row. */
  attach(hostEl: ElementRef<HTMLElement>, sectionEls: QueryList<ElementRef<HTMLElement>>): void {
    this.hostEl = hostEl;
    this.sectionEls = sectionEls;
    const controller = new AbortController();
    this.destroyRef.onDestroy(() => controller.abort());

    hostEl.nativeElement.addEventListener('scroll', () => this.schedule(), {
      passive: true,
      signal: controller.signal,
    });
    window.addEventListener('resize', () => this.schedule(), { passive: true, signal: controller.signal });

    this.sync();
  }

  scrollToIndex(index: number): void {
    this.sectionEls?.get(index)?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private schedule(): void {
    if (this.scheduled) return;
    this.scheduled = true;
    requestAnimationFrame(() => {
      this.scheduled = false;
      this.sync();
    });
  }

  private sync(): void {
    const sections = this.sectionEls;
    const hostEl = this.hostEl;
    if (!sections?.length || !hostEl) return;

    const hostTop = hostEl.nativeElement.getBoundingClientRect().top;
    let activeIndex = 0;
    sections.forEach((sectionRef, index) => {
      const top = sectionRef.nativeElement.getBoundingClientRect().top - hostTop;
      if (top <= ACTIVE_BAND_PX) activeIndex = index;
    });
    this.activeIndexSignal.set(activeIndex);
  }
}
