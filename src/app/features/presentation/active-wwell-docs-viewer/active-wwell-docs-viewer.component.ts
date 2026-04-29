import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { DrillingDataStore } from '@store/drilling-data/drilling-data.store';
import { WellDocsStore } from '@store/well-docs/well-docs.store';
import { PresDocsService } from '@services/pres-docs.service';
import { formatDateForInput } from 'src/app/shared/utils/date.util';

@Component({
  selector: 'app-active-wwell-docs-viewer',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatIconModule, MatTooltipModule],
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
export class ActiveWwellDocsViewerComponent implements OnDestroy {
  protected readonly wellStore = inject(DrillingDataStore);
  protected readonly docsStore = inject(WellDocsStore);
  private readonly svc = inject(PresDocsService);
  private readonly el = inject(ElementRef<HTMLElement>);

  protected readonly collapsed = signal(true);
  protected readonly actionLoading = signal<Set<string>>(new Set());
  protected readonly viewerDocName = signal<string | null>(null);
  protected readonly viewerBlobUrl = signal<string | null>(null);
  protected readonly viewerDocType = signal<string>('other');

  constructor() {
    effect(() => {
      const epANum = this.wellStore.selectedEpANum();
      const date = formatDateForInput(this.wellStore.selectedDate());
      if (epANum == null) return;
      this.docsStore.loadDocList({ epANum, date });
    });
  }

  ngOnDestroy(): void {
    this.revokeBlobUrl();
  }

  protected toggleCollapse(): void {
    this.collapsed.update(v => {
      if (v) setTimeout(() => this.scrollToSelf(), 300);
      return !v;
    });
  }

  protected viewDoc(docName: string): void {
    const context = this.getContext();
    if (!context || this.isLoading(docName)) return;

    this.setLoading(docName, true);
    this.svc.fetchDoc(docName, context.epANum, context.date).subscribe({
      next: (blob) => {
        this.revokeBlobUrl();
        const url = URL.createObjectURL(blob);
        this.viewerBlobUrl.set(url);
        this.viewerDocName.set(docName);
        this.viewerDocType.set(this.inferDocType(docName, blob.type));
        this.setLoading(docName, false);
      },
      error: () => this.setLoading(docName, false),
    });
  }

  protected downloadDoc(docName: string): void {
    const context = this.getContext();
    if (!context || this.isLoading(docName)) return;

    this.setLoading(docName, true);
    this.svc.fetchDoc(docName, context.epANum, context.date).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = docName;
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        this.setLoading(docName, false);
      },
      error: () => this.setLoading(docName, false),
    });
  }

  protected closeViewer(): void {
    this.revokeBlobUrl();
    this.viewerDocName.set(null);
    this.viewerDocType.set('other');
  }

  protected isLoading(docName: string): boolean {
    return this.actionLoading().has(docName);
  }

  protected fileIcon(docName: string): string {
    const ext = docName.split('.').pop()?.toLowerCase() ?? '';
    if (ext === 'pdf') return 'picture_as_pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (['xls', 'xlsx'].includes(ext)) return 'table_chart';
    if (['doc', 'docx'].includes(ext)) return 'article';
    return 'insert_drive_file';
  }

  protected fileTypeClass(docName: string): string {
    const ext = docName.split('.').pop()?.toLowerCase() ?? '';
    if (ext === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (['xls', 'xlsx'].includes(ext)) return 'excel';
    if (['doc', 'docx'].includes(ext)) return 'word';
    return 'other';
  }

  private getContext(): { epANum: number; date: string } | null {
    const epANum = this.wellStore.selectedEpANum();
    if (epANum == null) return null;
    return { epANum, date: formatDateForInput(this.wellStore.selectedDate()) };
  }

  private setLoading(docName: string, loading: boolean): void {
    this.actionLoading.update(set => {
      const next = new Set(set);
      loading ? next.add(docName) : next.delete(docName);
      return next;
    });
  }

  private inferDocType(docName: string, mimeType: string): string {
    const ext = docName.split('.').pop()?.toLowerCase() ?? '';
    if (mimeType === 'application/pdf' || ext === 'pdf') return 'pdf';
    if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    return 'other';
  }

  private revokeBlobUrl(): void {
    const url = this.viewerBlobUrl();
    if (url) URL.revokeObjectURL(url);
    this.viewerBlobUrl.set(null);
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
}
