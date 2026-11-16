import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { isUploadFileAllowed, toAcceptAttribute } from '@core/config/file-upload.config';

interface AttachmentItem {
  readonly id: string;
  readonly file: File;
}

@Component({
  selector: 'app-wwell-attachment-dropzone',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './wwell-attachment-dropzone.component.html',
  styleUrl: './wwell-attachment-dropzone.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellAttachmentDropzoneComponent {
  readonly hint = input('Click to attach files');
  /** When true, hides the dropzone control and shows only a read-only file list (e.g. a "view" dialog mode). */
  readonly disabled = input(false);
  /** When set, renders this fixed list of names read-only instead of the live drag-and-drop attachments. */
  readonly displayNames = input<readonly string[] | null>(null);
  readonly filesChange = output<File[]>();

  protected readonly accept = toAcceptAttribute();
  protected readonly isDragOver = signal(false);
  protected readonly attachments = signal<AttachmentItem[]>([]);

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.disabled()) return;
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
    if (this.disabled()) return;
    this.addFiles(Array.from(event.dataTransfer?.files ?? []));
  }

  protected onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.addFiles(Array.from(input?.files ?? []));
    if (input) input.value = '';
  }

  protected removeAttachment(id: string): void {
    this.attachments.update(items => items.filter(item => item.id !== id));
    this.emitFiles();
  }

  protected fileSizeLabel(size: number): string {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  private addFiles(selected: File[]): void {
    if (!selected.length) return;

    const valid = selected.filter(file => isUploadFileAllowed(file));
    if (!valid.length) return;

    this.attachments.update(existing => [
      ...existing,
      ...valid.map((file, index) => ({ file, id: `${file.name}-${file.size}-${existing.length + index}` })),
    ]);
    this.emitFiles();
  }

  private emitFiles(): void {
    this.filesChange.emit(this.attachments().map(item => item.file));
  }
}
