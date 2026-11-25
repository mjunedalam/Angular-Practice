import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { S3Service } from '@services/s3/s3.service';
import { NotificationService } from '@shared/components/notification/notification.service';
import { WwellIrAttachmentViewerComponent } from '../../wwell-ir/wwell-ir-attachment-viewer/wwell-ir-attachment-viewer.component';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { WldaAttachment, WldaLetterView } from '@models/wwell-planning/wlda.model';
import {
  WLDA_DISTRIBUTION_PLACEHOLDER,
  WLDA_FORM_NUMBER,
  WLDA_FORM_TITLE,
  WLDA_TO_LINE,
  WLDA_WORKFLOW_COLUMNS,
  WLDA_WORKFLOW_PLACEHOLDER,
} from '../wlda.config';

const IMAGE_NAME = /\.(png|jpe?g|gif|webp|bmp)$/i;

/**
 * The Aramco Form 6208 "Well Location & Drilling Approval" sheet, read-only: it renders whatever the
 * form beside it holds (or a saved letter). Cells with no table column stay blank like the paper form.
 */
@Component({
  selector: 'app-wlda-sheet',
  standalone: true,
  imports: [DatePipe, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './wlda-sheet.component.html',
  styleUrl: './wlda-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.--ws-zoom]': 'zoom()' },
})
export class WldaSheetComponent {
  readonly view = input.required<WldaLetterView>();
  /** The draft's not-yet-uploaded picks, indexed like `WldaAttachment.pendingIndex`, so they can be opened too. */
  readonly pendingFiles = input<readonly File[]>([]);

  private readonly s3 = inject(S3Service);
  private readonly dialog = inject(MatDialog);
  private readonly notify = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  /** Attachment (object key) currently being fetched for the viewer — disables just that row's button. */
  protected readonly openingName = signal<string | null>(null);
  /** Object-URL thumbnails of stored image attachments (PDFs keep their icon), keyed by object key. */
  protected readonly thumbnails = signal<Readonly<Record<string, string>>>({});
  private readonly requestedThumbnails = new Set<string>();

  /** Width the sheet was designed for; wider panes scale it up (capped) instead of leaving it a small centred card. */
  private static readonly BASE_WIDTH_PX = 920;
  private static readonly MAX_ZOOM = 3;
  private readonly hostWidth = signal(0);
  protected readonly zoom = computed(() => Math.min(WldaSheetComponent.MAX_ZOOM, Math.max(1, this.hostWidth() / WldaSheetComponent.BASE_WIDTH_PX)));

  constructor() {
    effect(() => {
      for (const file of this.view().attachments) {
        if (!file.key || !IMAGE_NAME.test(file.name) || this.requestedThumbnails.has(file.key)) continue;
        const key = file.key;
        this.requestedThumbnails.add(key);
        this.s3
          .download(key, file.name)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: blob => this.thumbnails.update(current => ({ ...current, [key]: URL.createObjectURL(blob) })),
            // A missing thumbnail just leaves the icon; the View button reports real failures.
            error: () => undefined,
          });
      }
    });
    this.destroyRef.onDestroy(() => Object.values(this.thumbnails()).forEach(url => URL.revokeObjectURL(url)));

    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => this.hostWidth.set(entry.contentRect.width));
    observer.observe(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement);
    inject(DestroyRef).onDestroy(() => observer.disconnect());
  }

  protected readonly formTitle = WLDA_FORM_TITLE;
  protected readonly formNumber = WLDA_FORM_NUMBER;
  protected readonly toLine = WLDA_TO_LINE;
  protected readonly workflowColumns = WLDA_WORKFLOW_COLUMNS;
  protected readonly workflowPlaceholder = WLDA_WORKFLOW_PLACEHOLDER;
  protected readonly distributionPlaceholder = WLDA_DISTRIBUTION_PLACEHOLDER;
  protected readonly today = new Date().toISOString();

  /** Opens an attachment in the same full-screen viewer IR uses: a stored one is fetched from S3, a pending one is already local. */
  protected viewAttachment(attachment: WldaAttachment): void {
    const open = (file: File) => this.dialog.open(WwellIrAttachmentViewerComponent, {
      data: { file, label: 'WLDA attachment' },
      panelClass: 'ir-viewer-panel',
      width: '92vw',
      maxWidth: '1500px',
      height: '92vh',
      autoFocus: false,
    });
    if (!attachment.key) {
      const local = attachment.pendingIndex === null ? undefined : this.pendingFiles()[attachment.pendingIndex];
      if (local) open(local);
      return;
    }
    this.openingName.set(attachment.key);
    this.s3
      .download(attachment.key, attachment.name)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: file => {
          this.openingName.set(null);
          open(file);
        },
        error: () => {
          this.openingName.set(null);
          this.notify.error(`Failed to open ${attachment.name}.`);
        },
      });
  }

  protected orDash(value: string): string {
    return value.trim() || '—';
  }
}
