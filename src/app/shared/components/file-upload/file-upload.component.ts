import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UploadFileItem } from '@models/active-wwell/active-wwell-view.model';
import { WellDocsStore } from '@store/well-docs/well-docs.store';
import { PresDocsService } from '@services/pres-docs.service';
import { FilePreviewDialogComponent } from './file-preview-dialog/file-preview-dialog.component';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule, MatProgressSpinnerModule],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadComponent {
  readonly epANum = input<number | null>(null);
  readonly date = input<string>('');

  private readonly dialog = inject(MatDialog);
  private readonly svc = inject(PresDocsService);
  protected readonly docsStore = inject(WellDocsStore);

  protected readonly files = signal<UploadFileItem[]>([]);
  protected readonly isDragOver = signal(false);
  protected readonly viewLoading = signal<Set<string>>(new Set());

  constructor() {
    // On well or date change: clear pending files + fetch server doc list
    effect(() => {
      const epANum = this.epANum();
      const date = this.date();
      this.files.set([]);
      if (epANum != null && date) {
        this.docsStore.loadDocList({ epANum, date });
      }
    }, { allowSignalWrites: true });
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
    const dropped = Array.from(event.dataTransfer?.files ?? []);
    if (!dropped.length) return;
    this.addFiles(dropped);
  }

  protected onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const selected = Array.from(input?.files ?? []);
    if (!selected.length) return;
    this.addFiles(selected);
    if (input) input.value = '';
  }

  private addFiles(selected: File[]): void {
    this.files.update((existing) => [
      ...existing,
      ...selected.map((file, index) => ({
        file,
        id: `${file.name}-${file.size}-${existing.length + index}`,
      })),
    ]);
  }

  protected previewFile(file: File): void {
    this.dialog.open(FilePreviewDialogComponent, {
      data: file,
      width: '60vw',
      height: '70vh',
      maxWidth: '98vw',
      maxHeight: '98vh',
      panelClass: 'file-preview-panel',
      autoFocus: false,
      enterAnimationDuration: '220ms',
    });
  }

  protected viewServerDoc(docName: string): void {
    const epANum = this.epANum();
    const date = this.date();
    if (epANum == null || !date || this.isViewLoading(docName)) return;

    this.setViewLoading(docName, true);
    this.svc.fetchDoc(docName, epANum, date).subscribe({
      next: (blob) => {
        const ext = docName.split('.').pop()?.toLowerCase() ?? '';
        const mimeMap: Record<string, string> = {
          pdf: 'application/pdf',
          jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
          doc: 'application/msword',
          docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          xls: 'application/vnd.ms-excel',
          xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        };
        const mime = blob.type && blob.type !== 'application/octet-stream'
          ? blob.type : (mimeMap[ext] ?? 'application/octet-stream');
        const file = new File([blob], docName, { type: mime });
        this.setViewLoading(docName, false);
        this.dialog.open(FilePreviewDialogComponent, {
          data: file,
          width: '60vw',
          height: '70vh',
          maxWidth: '98vw',
          maxHeight: '98vh',
          panelClass: 'file-preview-panel',
          autoFocus: false,
          enterAnimationDuration: '220ms',
        });
      },
      error: () => this.setViewLoading(docName, false),
    });
  }

  protected removeFile(id: string): void {
    this.files.update((items) => items.filter((item) => item.id !== id));
  }

  protected deleteServerDoc(docName: string): void {
    const epANum = this.epANum();
    const uploadDate = this.date();
    if (epANum == null || !uploadDate || !docName) return;
    this.docsStore.removeSingleFile({ uploadDate, epANum, fileName: docName });
  }

  protected submitUpload(): void {
    const epANum = this.epANum();
    const date = this.date();
    const pending = this.files();
    if (epANum == null || !date || !pending.length) return;
    this.docsStore.uploadDocs({ files: pending.map(i => i.file), epANum, date });
    this.files.set([]);
  }

  protected isViewLoading(docName: string): boolean {
    return this.viewLoading().has(docName);
  }

  private setViewLoading(docName: string, loading: boolean): void {
    this.viewLoading.update(set => {
      const next = new Set(set);
      loading ? next.add(docName) : next.delete(docName);
      return next;
    });
  }

  protected fileSizeLabel(size: number): string {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  protected fileIcon(file: File): string {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const mime = file.type.toLowerCase();
    if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (mime === 'application/pdf' || ext === 'pdf') return 'picture_as_pdf';
    if (['doc', 'docx'].includes(ext)) return 'article';
    return 'insert_drive_file';
  }

  protected fileTypeClass(file: File): string {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const mime = file.type.toLowerCase();
    if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (mime === 'application/pdf' || ext === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'doc';
    return 'other';
  }

  protected fileExt(file: File): string {
    return file.name.split('.').pop()?.toUpperCase() ?? 'FILE';
  }

  protected serverFileIcon(docName: string): string {
    const ext = docName.split('.').pop()?.toLowerCase() ?? '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (ext === 'pdf') return 'picture_as_pdf';
    if (['doc', 'docx'].includes(ext)) return 'article';
    if (['xls', 'xlsx'].includes(ext)) return 'table_chart';
    return 'insert_drive_file';
  }

  protected serverFileTypeClass(docName: string): string {
    const ext = docName.split('.').pop()?.toLowerCase() ?? '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'doc';
    if (['xls', 'xlsx'].includes(ext)) return 'excel';
    return 'other';
  }
}
