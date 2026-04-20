/**
 * OffsetWwellsComponent — SMART
 * Reads store.offsetWells() directly.
 * No @Input needed.
 */
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { WellStore } from '@store/active-wwell/active-wwell.store';

@Component({
  selector: 'app-offset-wwells',
  standalone: true,
  imports: [DecimalPipe, MatExpansionModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './offset-wwells.component.html',
  styleUrl: './offset-wwells.component.scss',
})
export class OffsetWwellsComponent {
  protected readonly store = inject(WellStore);
  protected readonly activeValue = signal<string>('-1');

  protected onPanelOpen(index: string, container: HTMLElement): void {
    this.activeValue.set(index);
    setTimeout(() => this.scrollToPanel(container), 260);
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
