import { filter, merge } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { WldaStore } from '../store/wlda.store';

export interface WldaUploadDialogData {
  /** Passed in rather than injected, like the IR dialog: the store may be provided below the root injector. */
  readonly store: InstanceType<typeof WldaStore>;
  readonly file: File;
  /** True for a saved letter (uploads now); false while creating, where the file waits for Create. */
  readonly canUpload: boolean;
}

/** How long the success state stays up before the dialog closes itself. */
const SUCCESS_LINGER_MS = 900;

/**
 * Opens right after a file is picked: previews it, then either uploads it with live progress (saved letter)
 * or stages it for the Create click (new letter). Cancel, Esc and backdrop discard the pick. Same look and
 * behaviour as the IR attachment dialog, whose stylesheet it shares.
 */
@Component({
  selector: 'app-wlda-upload-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatIconModule, MatProgressBarModule],
  templateUrl: './wlda-upload-dialog.component.html',
  styleUrl: '../../wwell-ir/wwell-ir-attachment-upload-dialog/wwell-ir-attachment-upload-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WldaUploadDialogComponent {
  protected readonly data = inject<WldaUploadDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<WldaUploadDialogComponent, boolean>);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly store = this.data.store;

  protected readonly file = this.data.file;
  protected readonly isImage = this.file.type.startsWith('image/');
  protected readonly isPdf = this.file.type === 'application/pdf';
  protected readonly sizeLabel = formatBytes(this.file.size);
  protected readonly typeLabel = this.file.name.split('.').pop()?.toUpperCase() ?? 'FILE';

  private readonly objectUrl = this.isImage ? URL.createObjectURL(this.file) : null;
  protected readonly previewUrl: SafeUrl | null = this.objectUrl ? this.sanitizer.bypassSecurityTrustUrl(this.objectUrl) : null;

  protected readonly canUpload = this.data.canUpload;
  protected readonly busy = this.store.uploadingFile;
  protected readonly percent = this.store.uploadPercent;
  protected readonly error = this.store.uploadError;
  protected readonly done = signal(false);
  private readonly started = signal(false);

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
    });

    this.dialogRef.disableClose = true;
    merge(this.dialogRef.backdropClick(), this.dialogRef.keydownEvents().pipe(filter(event => event.key === 'Escape')))
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.cancel());

    // The store clears `uploadingFile` once the proxy answers; no error by then means the file is stored.
    effect(() => {
      if (!this.started() || this.busy() || this.error() || this.done()) return;
      this.done.set(true);
      setTimeout(() => this.dialogRef.close(true), SUCCESS_LINGER_MS);
    });
  }

  protected cancel(): void {
    if (this.busy() || this.done()) return;
    this.dialogRef.close(false);
  }

  /** New letter: keep the file for the Create click (the parent adds it to the draft on `true`). */
  protected attachForLater(): void {
    this.dialogRef.close(true);
  }

  protected upload(): void {
    if (this.busy() || this.done()) return;
    this.started.set(true);
    this.store.uploadLetterFile(this.file);
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
