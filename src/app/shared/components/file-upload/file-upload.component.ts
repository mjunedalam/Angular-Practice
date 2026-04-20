import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UploadFileItem } from '@models/active-wwell/active-wwell-view.model';
import { FilePreviewDialogComponent } from './file-preview-dialog/file-preview-dialog.component';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadComponent {
  private readonly dialog = inject(MatDialog);

  protected readonly files = signal<UploadFileItem[]>([]);

  protected onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const selected = Array.from(input?.files ?? []);

    if (!selected.length) return;

    this.files.update((existing) => [
      ...existing,
      ...selected.map((file, index) => ({
        file,
        id: `${file.name}-${file.size}-${existing.length + index}`,
      })),
    ]);

    if (input) input.value = '';
  }

  protected previewFile(file: File): void {
    this.dialog.open(FilePreviewDialogComponent, {
      data: file,
      width: '760px',
      height: '560px',
      panelClass: 'file-preview-panel',
      autoFocus: false,
    });
  }

  protected removeFile(id: string): void {
    this.files.update((items) => items.filter((item) => item.id !== id));
  }

  protected fileSizeLabel(size: number): string {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  protected fileIcon(file: File): string {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const mime = file.type.toLowerCase();

    if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      return 'image';
    }
    if (mime === 'application/pdf' || ext === 'pdf') return 'picture_as_pdf';
    if (['doc', 'docx'].includes(ext)) return 'article';
    return 'insert_drive_file';
  }
}
