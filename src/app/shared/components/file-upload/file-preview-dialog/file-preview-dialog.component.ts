import { ChangeDetectionStrategy, Component, Inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

type PreviewType = 'image' | 'pdf' | 'unsupported';

@Component({
  selector: 'app-file-preview-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './file-preview-dialog.component.html',
  styleUrl: './file-preview-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilePreviewDialogComponent implements OnDestroy {
  protected readonly fileName: string;
  protected readonly previewType: PreviewType;
  protected readonly safeUrl: SafeResourceUrl | null;

  private readonly objectUrl: string | null;

  constructor(
    @Inject(MAT_DIALOG_DATA) readonly file: File,
    private readonly dialogRef: MatDialogRef<FilePreviewDialogComponent>,
    private readonly sanitizer: DomSanitizer,
  ) {
    this.fileName = file.name;
    this.previewType = this.resolveType(file);

    if (this.previewType !== 'unsupported') {
      this.objectUrl = URL.createObjectURL(file);
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.objectUrl);
    } else {
      this.objectUrl = null;
      this.safeUrl = null;
    }
  }

  ngOnDestroy(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
    }
  }

  protected close(): void {
    this.dialogRef.close();
  }

  protected download(): void {
    const url = URL.createObjectURL(this.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  private resolveType(file: File): PreviewType {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const mime = file.type.toLowerCase();

    if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      return 'image';
    }
    if (mime === 'application/pdf' || ext === 'pdf') {
      return 'pdf';
    }
    return 'unsupported';
  }
}
