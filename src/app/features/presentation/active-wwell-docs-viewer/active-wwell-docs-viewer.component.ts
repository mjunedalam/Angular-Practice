import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { DrillingDataStore } from '@store/drilling-data/drilling-data.store';
import { WellDoc } from 'src/app/core/models/well-design/well-docs.model';
import { WellDocsStore } from './well-docs.store';

@Component({
  selector: 'app-active-wwell-docs-viewer',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './active-wwell-docs-viewer.component.html',
  styleUrl: './active-wwell-docs-viewer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('expandCollapse', [
      transition(':enter', [
        style({ height: 0, opacity: 0, overflow: 'hidden' }),
        animate('280ms cubic-bezier(0.4, 0, 0.2, 1)', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [
        style({ height: '*', opacity: 1, overflow: 'hidden' }),
        animate('220ms cubic-bezier(0.4, 0, 0.2, 1)', style({ height: 0, opacity: 0 })),
      ]),
    ]),
    trigger('listStagger', [
      transition(':enter', [
        query('.doc-row', [
          style({ opacity: 0, transform: 'translateX(-10px)' }),
          stagger(60, animate('240ms ease', style({ opacity: 1, transform: 'translateX(0)' }))),
        ], { optional: true }),
      ]),
    ]),
  ],
})
export class ActiveWwellDocsViewerComponent {
  protected readonly wellStore = inject(DrillingDataStore);
  protected readonly docsStore = inject(WellDocsStore);
  private readonly el = inject(ElementRef<HTMLElement>);

  protected readonly collapsed = signal(true);

  protected toggleCollapse(): void {
    this.collapsed.update(v => {
      if (v) setTimeout(() => this.scrollToSelf(), 300);
      return !v;
    });
  }

  private scrollToSelf(): void {
    const el: HTMLElement = this.el.nativeElement;
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

  protected openDoc(doc: WellDoc): void {
    this.docsStore.openViewer(doc);
  }

  protected closeViewer(): void {
    this.docsStore.closeViewer();
  }

  protected formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
