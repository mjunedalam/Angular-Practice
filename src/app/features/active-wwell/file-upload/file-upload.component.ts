import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '@shared/components/notification/notification.service';
import { UploadFileItem } from '@models/active-wwell/active-wwell-view.model';

@Component({
  selector: 'app-active-wwell-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadComponent {
  private readonly notify = inject(NotificationService);

  protected readonly files = signal<UploadFileItem[]>([]);

  protected onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const selected = Array.from(input?.files ?? []);

    if (!selected.length) {
      return;
    }

    this.files.update((existing) => [
      ...existing,
      ...selected.map((file, index) => ({
        file,
        id: `${file.name}-${file.size}-${existing.length + index}`,
      })),
    ]);

    if (input) {
      input.value = '';
    }
  }

  protected previewFile(file: File): void {
    this.notify.info(`Selected file: ${file.name}`);
  }

  protected removeFile(id: string): void {
    this.files.update((items) => items.filter((item) => item.id !== id));
  }

  protected fileSizeLabel(size: number): string {
    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }
}
