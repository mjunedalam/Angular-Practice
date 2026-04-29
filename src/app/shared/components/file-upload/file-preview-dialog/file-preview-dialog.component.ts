import { ChangeDetectionStrategy, Component, ElementRef, Inject, OnDestroy, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';

type PreviewType = 'image' | 'pdf' | 'document' | 'unsupported';

@Component({
  selector: 'app-file-preview-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatIconModule, MatTooltipModule, CdkDrag, CdkDragHandle],
  templateUrl: './file-preview-dialog.component.html',
  styleUrl: './file-preview-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilePreviewDialogComponent implements OnDestroy {
  @ViewChild('dialogEl', { static: true }) private dialogEl!: ElementRef<HTMLDivElement>;

  protected readonly fileName: string;
  protected readonly previewType: PreviewType;
  protected readonly safeUrl: SafeResourceUrl | null;
  protected readonly fileSize: string;
  protected readonly typeIcon: string;
  protected readonly fileTypeLabel: string;
  protected readonly zoomLevel = signal(1);

  private readonly objectUrl: string | null;
  private readonly zoomStep = 0.25;

  constructor(
    @Inject(MAT_DIALOG_DATA) readonly file: File,
    private readonly dialogRef: MatDialogRef<FilePreviewDialogComponent>,
    private readonly sanitizer: DomSanitizer,
  ) {
    this.fileName = file.name;
    this.previewType = this.resolveType(file);
    this.fileSize = this.formatSize(file.size);
    this.typeIcon = this.resolveIcon();
    this.fileTypeLabel = file.name.split('.').pop()?.toUpperCase() ?? 'FILE';

    if (this.previewType !== 'unsupported') {
      this.objectUrl = URL.createObjectURL(file);
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.objectUrl);
    } else {
      this.objectUrl = null;
      this.safeUrl = null;
    }

  }

  ngOnDestroy(): void {
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
  }

  protected get zoomPercent(): number {
    return Math.round(this.zoomLevel() * 100);
  }

  protected zoomIn(): void {
    this.zoomLevel.update(z => Math.min(3, z + this.zoomStep));
  }

  protected zoomOut(): void {
    this.zoomLevel.update(z => Math.max(0.25, z - this.zoomStep));
  }

  protected resetZoom(): void {
    this.zoomLevel.set(1);
  }

  protected close(): void {
    this.dialogRef.close();
  }

  protected download(): void {
    const url = URL.createObjectURL(this.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  protected onResizeStart(event: MouseEvent): void {
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const startW = this.dialogEl.nativeElement.offsetWidth;
    const startH = this.dialogEl.nativeElement.offsetHeight;

    const onMove = (e: MouseEvent) => {
      const w = Math.max(420, startW + (e.clientX - startX));
      const h = Math.max(300, startH + (e.clientY - startY));
      this.dialogRef.updateSize(`${w}px`, `${h}px`);
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  private resolveType(file: File): PreviewType {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const mime = file.type.toLowerCase();
    if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (mime === 'application/pdf' || ext === 'pdf') return 'pdf';
    // txt/csv render as plain text in iframe; office binaries cannot be rendered by the browser natively
    if (['txt', 'csv'].includes(ext)) return 'document';
    return 'unsupported';
  }

  private resolveIcon(): string {
    if (this.previewType === 'image') return 'image';
    if (this.previewType === 'pdf') return 'picture_as_pdf';
    const ext = this.file.name.split('.').pop()?.toLowerCase() ?? '';
    if (['doc', 'docx'].includes(ext)) return 'article';
    if (['xls', 'xlsx'].includes(ext)) return 'table_chart';
    if (['ppt', 'pptx'].includes(ext)) return 'slideshow';
    if (['txt', 'csv'].includes(ext)) return 'description';
    return 'insert_drive_file';
  }

  private formatSize(size: number): string {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }
}
