import { ChangeDetectionStrategy, Component, OnDestroy, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface WwellIrAttachmentViewerData {
  readonly file: File;
  /** Slot name ("Location Map") shown above the file name, so the viewer says which slot it's from. */
  readonly label: string;
}

/** What the body renders — images get zoom/rotate, PDFs get the browser's own viewer in a frame. */
type ViewerKind = 'image' | 'pdf' | 'unsupported';

const ZOOM_STEP = 0.25;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const QUARTER_TURN_DEGREES = 90;

/**
 * Full-bleed viewer for one IR attachment.
 *
 * Deliberately not the shared FilePreviewDialogComponent: that one is a small draggable panel sized
 * for a quick glance at an upload in a form, and a location map or a signed initiation request needs
 * the opposite — as much of the screen as possible, since the whole point is reading a scanned
 * document. This one takes over the viewport, puts the document on a dark stage so the page edges
 * read clearly, and keeps the chrome to a single header bar.
 *
 * `ViewEncapsulation.None` because the dialog's own panel/backdrop live in the CDK overlay, outside
 * this component's DOM — the `.ir-viewer` panel rules in the stylesheet can't reach them otherwise.
 */
@Component({
  selector: 'app-wwell-ir-attachment-viewer',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './wwell-ir-attachment-viewer.component.html',
  styleUrl: './wwell-ir-attachment-viewer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class WwellIrAttachmentViewerComponent implements OnDestroy {
  private readonly data = inject<WwellIrAttachmentViewerData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<WwellIrAttachmentViewerComponent>);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly label = this.data.label;
  protected readonly fileName = this.data.file.name;
  protected readonly kind: ViewerKind = resolveKind(this.data.file);
  protected readonly typeLabel = this.data.file.name.split('.').pop()?.toUpperCase() ?? 'FILE';
  protected readonly sizeLabel = formatBytes(this.data.file.size);

  protected readonly zoom = signal(1);
  protected readonly rotation = signal(0);

  /** Single transform for both controls, so zooming a rotated page keeps its orientation. */
  protected readonly imageTransform = computed(() => `scale(${this.zoom()}) rotate(${this.rotation()}deg)`);
  protected readonly zoomLabel = computed(() => `${Math.round(this.zoom() * 100)}%`);
  protected readonly canZoomIn = computed(() => this.zoom() < MAX_ZOOM);
  protected readonly canZoomOut = computed(() => this.zoom() > MIN_ZOOM);

  /** Held so it can be revoked on close — an un-revoked object URL pins the whole file in memory. */
  private readonly objectUrl = URL.createObjectURL(this.data.file);
  protected readonly safeUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.objectUrl);

  ngOnDestroy(): void {
    URL.revokeObjectURL(this.objectUrl);
  }

  protected zoomIn(): void {
    this.zoom.update(value => Math.min(MAX_ZOOM, value + ZOOM_STEP));
  }

  protected zoomOut(): void {
    this.zoom.update(value => Math.max(MIN_ZOOM, value - ZOOM_STEP));
  }

  /** Back to 100% and upright — one control to undo any amount of fiddling. */
  protected resetView(): void {
    this.zoom.set(1);
    this.rotation.set(0);
  }

  protected rotate(): void {
    this.rotation.update(value => (value + QUARTER_TURN_DEGREES) % 360);
  }

  protected download(): void {
    const link = document.createElement('a');
    link.href = this.objectUrl;
    link.download = this.fileName;
    link.click();
  }

  protected close(): void {
    this.dialogRef.close();
  }
}

function resolveKind(file: File): ViewerKind {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (file.type.startsWith('image/') || ['jpg', 'jpeg', 'png'].includes(extension)) return 'image';
  if (file.type === 'application/pdf' || extension === 'pdf') return 'pdf';
  // Only PDFs and images preview inline; every other allowed type (see core/config/file-upload.config.ts)
  // offers a download rather than rendering a broken frame.
  return 'unsupported';
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
