import { filter, merge } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { IrAttachmentSlot } from '@models/wwell-planning/ir-attachment.model';
import { WwellIrStore } from '../store/wwell-ir.store';

export interface WwellIrAttachmentUploadDialogData {
  /** Passed in rather than injected: the editor's store is provided on a parent component, which a
   *  dialog opened from the root injector can't see. */
  readonly store: InstanceType<typeof WwellIrStore>;
  readonly slot: IrAttachmentSlot;
  readonly slotLabel: string;
  readonly slotIcon: string;
  /** The staged file's id (see WwellIrStore.addPendingAttachment). */
  readonly pendingId: string;
  /** Null for a New IR that hasn't been saved yet — there's no ir_seq to upload under. */
  readonly irSeq: number | null;
}

/** How long the success state stays up before the dialog closes itself. */
const SUCCESS_LINGER_MS = 900;

/**
 * Opens right after a file is attached: previews the file, offers Upload and, once clicked, shows
 * the real byte-progress, then a brief success state before closing itself.
 *
 * Cancel (button, Esc or backdrop) discards the staged file entirely — nothing half-attached is left
 * in the list. The one exception is an IR that hasn't been saved yet: it has no ir_seq to upload
 * under, so the primary action is "Attach", which keeps the file staged to upload with the first save.
 */
@Component({
  selector: 'app-wwell-ir-attachment-upload-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatIconModule, MatProgressBarModule],
  templateUrl: './wwell-ir-attachment-upload-dialog.component.html',
  styleUrl: './wwell-ir-attachment-upload-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellIrAttachmentUploadDialogComponent {
  protected readonly data = inject<WwellIrAttachmentUploadDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<WwellIrAttachmentUploadDialogComponent>);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly store = this.data.store;

  /** Captured once: the store drops the staged item the moment the upload succeeds, but the success
   *  state still needs the file's name. */
  protected readonly file = (this.store.pendingAttachments()[this.data.slot] ?? []).find(entry => entry.id === this.data.pendingId)?.file;
  protected readonly isImage = this.file?.type.startsWith('image/') ?? false;
  protected readonly isPdf = this.file?.type === 'application/pdf';
  protected readonly sizeLabel = formatBytes(this.file?.size ?? 0);
  protected readonly typeLabel = this.file?.name.split('.').pop()?.toUpperCase() ?? 'FILE';

  private readonly objectUrl = this.isImage && this.file ? URL.createObjectURL(this.file) : null;
  protected readonly previewUrl: SafeUrl | null = this.objectUrl ? this.sanitizer.bypassSecurityTrustUrl(this.objectUrl) : null;

  protected readonly busy = computed(() => this.store.uploadingPendingIds().has(this.data.pendingId));
  protected readonly percent = computed(() => this.store.uploadProgressByPendingId()[this.data.pendingId] ?? null);
  protected readonly error = this.store.attachmentError;
  protected readonly canUpload = this.data.irSeq !== null;
  protected readonly done = signal(false);
  private cancelled = false;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
    });

    // Esc / backdrop behave like Cancel, except mid-upload when dismissal is ignored.
    this.dialogRef.disableClose = true;
    merge(
      this.dialogRef.backdropClick(),
      this.dialogRef.keydownEvents().pipe(filter(event => event.key === 'Escape')),
    )
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.cancel());

    // The store drops the staged item only after the proxy confirms the upload.
    effect(() => {
      if (this.cancelled) return;
      const staged = (this.store.pendingAttachments()[this.data.slot] ?? []).some(entry => entry.id === this.data.pendingId);
      if (staged || this.done()) return;
      this.done.set(true);
      setTimeout(() => this.dialogRef.close(true), SUCCESS_LINGER_MS);
    });
  }

  protected cancel(): void {
    if (this.busy() || this.done()) return;
    this.cancelled = true;
    this.store.removePendingAttachment(this.data.slot, this.data.pendingId);
    this.dialogRef.close(false);
  }

  /** Unsaved IR only: keep the file staged and let the first save upload it. */
  protected attachForLater(): void {
    this.dialogRef.close(true);
  }

  protected upload(): void {
    if (this.busy() || this.done() || this.data.irSeq === null) return;
    this.store.uploadPendingAttachment(this.data.irSeq, this.data.slot, this.data.pendingId);
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
