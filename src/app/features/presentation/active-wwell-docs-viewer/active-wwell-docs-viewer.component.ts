import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  Injector,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { WellStore } from 'src/app/core/store/well.store';
import { WellDoc } from 'src/app/core/models/well-design/well-docs.model';
import { WellDocsStore } from './well-docs.store';
import { formatDateForInput } from 'src/app/utils/date.util';

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
  protected readonly wellStore = inject(WellStore);
  protected readonly docsStore = inject(WellDocsStore);
  private readonly injector = inject(Injector);

  protected readonly collapsed = signal(true);

  constructor() {
    effect(() => {
      const epANum = this.wellStore.selectedEpANum();
      const date = formatDateForInput(this.wellStore.selectedDate());
      const wellDetails = this.wellStore.wellDetails();
      const wellName = (wellDetails as { WELL_MASTER?: Array<{ wGnrName?: string }> } | null)
        ?.WELL_MASTER?.[0]?.wGnrName;
      if (epANum == null || !wellName) return;
      this.docsStore.loadDocs({ wellName, date });
    }, { injector: this.injector });
  }

  protected toggleCollapse(): void {
    this.collapsed.update(v => !v);
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
