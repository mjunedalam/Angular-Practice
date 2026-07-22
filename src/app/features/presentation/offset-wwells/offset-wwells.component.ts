/**
 * OffsetWwellsComponent — SMART
 * Reads store.offsetWells() directly.
 * No @Input needed.
 */
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { trigger, transition, animate, style } from '@angular/animations';
import { PresentationStore } from '../store/presentation.store';

@Component({
  selector: 'app-offset-wwells',
  standalone: true,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './offset-wwells.component.html',
  styleUrl: './offset-wwells.component.scss',
  animations: [
    trigger('owTabAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-8px)' }),
        animate('300ms ease', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ]),
  ],
})
export class OffsetWwellsComponent {
  protected readonly store = inject(PresentationStore);
  protected readonly expandedWell = signal<string | null>(null);

  protected toggleWell(wellName: string, container: HTMLElement): void {
    const next = this.expandedWell() === wellName ? null : wellName;
    this.expandedWell.set(next);
    if (next) setTimeout(() => this.scrollToPanel(container), 260);
  }

  private scrollToPanel(el: HTMLElement): void {
    const scrollParent = this.findScrollParent(el);
    if (!scrollParent) return;
    const offset = el.getBoundingClientRect().top - scrollParent.getBoundingClientRect().top;
    scrollParent.scrollTo({ top: scrollParent.scrollTop + offset, behavior: 'smooth' });
  }

  private findScrollParent(el: HTMLElement): HTMLElement | null {
    let parent = el.parentElement;
    while (parent && parent !== document.body) {
      const { overflowY } = window.getComputedStyle(parent);
      if (overflowY === 'auto' || overflowY === 'scroll') return parent;
      parent = parent.parentElement;
    }
    return null;
  }
}
