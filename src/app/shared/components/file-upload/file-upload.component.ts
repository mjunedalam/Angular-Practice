import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UploadFileItem } from '@models/active-wwell/active-wwell-view.model';
import { WellDocsStore } from '@store/well-docs/well-docs.store';
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
  protected readonly docsStore = inject(WellDocsStore);

  protected readonly files = signal<UploadFileItem[]>([]);
  protected readonly uploadedFiles = signal<UploadFileItem[]>([]);

  protected onFileChange(event: Event): void {
    // Cast event.target to HTMLInputElement to access the `.files` FileList.
    // Typed as `| null` because event.target is `EventTarget | null` by default.
    const input = event.target as HTMLInputElement | null;

    // Convert the FileList (not an Array) into a real Array so we can use .map().
    // `input?.files` — optional chain guards against a null input element.
    // `?? []` — fallback to empty array if files is null (e.g. no file selected).
    const selected = Array.from(input?.files ?? []);

    // Guard: if the user opened the picker but cancelled without choosing a file,
    // selected will be empty — bail early to avoid a no-op signal update.
    if (!selected.length) return;

    // update() reads the current signal value and returns the next value immutably.
    // `existing` = current UploadFileItem[] in the `files` signal.
    this.files.update((existing) => [
      // Spread existing items first so previously selected files are preserved.
      ...existing,
      // Map each raw File into an UploadFileItem { file, id }.
      ...selected.map((file, index) => ({
        // file: the raw browser File object (has .name, .size, .type, .arrayBuffer etc.)
        file,
        // id: a stable unique key composed of name + size + position.
        // Using existing.length + index ensures ids are unique even if the user
        // picks the same file name twice in separate picker sessions.
        id: `${file.name}-${file.size}-${existing.length + index}`,
      })),
    ]);

    // Reset the native input value so the browser allows picking the same file
    // again in a future session (without this, onChange won't fire for duplicates).
    if (input) input.value = '';
  }

  protected previewFile(file: File): void {
    // dialog.open() renders FilePreviewDialogComponent in an overlay panel.
    this.dialog.open(FilePreviewDialogComponent, {
      // data: the raw File object injected into the dialog via MAT_DIALOG_DATA.
      // The dialog uses this to render an <img>, <iframe> or raw filename.
      data: file,

      // width / height: initial dialog size as viewport-relative units.
      // 60vw × 70vh is large enough to preview a document without fullscreen.
      width: '60vw',
      height: '70vh',

      // maxWidth / maxHeight: caps size on very large monitors / small screens.
      maxWidth: '98vw',
      maxHeight: '98vh',

      // panelClass: custom CSS class on the dialog's host element.
      // Allows global SCSS to override Material's default dialog padding/border.
      panelClass: 'file-preview-panel',

      // autoFocus: false — prevents Material from focusing the first focusable
      // element inside the dialog on open (which would shift scroll position).
      autoFocus: false,

      // enterAnimationDuration: how long the open animation takes.
      // 220ms is subtle enough to feel snappy without being jarring.
      enterAnimationDuration: '220ms',
    });
  }

  protected removeFile(id: string): void {
    // update() replaces the signal value immutably.
    // filter() returns a new array excluding the item whose id matches.
    this.files.update((items) => items.filter((item) => item.id !== id));
  }

  protected submitUpload(): void {
    // Read the current value of the epANum input signal.
    // Stored in a local const so we call the signal getter only once.
    const epANum = this.epANum();

    // Read the current value of the date input signal.
    const date = this.date();

    // Snapshot the current pending files list from the signal.
    const pending = this.files();

    // Guard: if any required field is missing, abort without calling the store.
    // epANum == null: covers both null and undefined (loose equality intentional).
    // !date: empty string means no date selected.
    // !pending.length: nothing to upload.
    if (epANum == null || !date || !pending.length) return;

    // Delegate to the store's uploadDocs rxMethod.
    // Extracts the raw File objects from UploadFileItems because the API only
    // needs the File, not our internal id wrapper.
    this.docsStore.uploadDocs({ files: pending.map(i => i.file), epANum, date });

    // Optimistically move pending items into the uploadedFiles list so the UI
    // immediately shows them as "uploaded" without waiting for the API response.
    this.uploadedFiles.update(existing => [...existing, ...pending]);

    // Clear the pending queue now that files have been handed to the store.
    // set() replaces the signal value directly (no need to read the old value).
    this.files.set([]);
  }

  protected removeUploaded(id: string): void {
    this.uploadedFiles.update(items => items.filter(item => item.id !== id));
  }

  protected fileSizeLabel(size: number): string {
    // Under 1 KB — show raw bytes (e.g. "512 B")
    if (size < 1024) return `${size} B`;
    // Under 1 MB — show kilobytes with 1 decimal (e.g. "45.2 KB")
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    // 1 MB and above — show megabytes with 1 decimal (e.g. "3.7 MB")
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  protected fileIcon(file: File): string {
    // Extract the extension from the filename: "report.PDF" → "pdf"
    // split('.'): ["report", "PDF"]
    // .pop(): "PDF" — the last segment after the final dot
    // ?.toLowerCase(): guards against filenames with no extension (pop returns undefined)
    // ?? '': fallback to empty string if no extension found
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';

    // file.type is the browser-detected MIME type string (e.g. "image/png", "application/pdf").
    // Normalize to lowercase for consistent comparison.
    const mime = file.type.toLowerCase();

    // Image files: check MIME prefix OR common image extensions
    if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';

    // PDF files: check exact MIME string OR .pdf extension
    if (mime === 'application/pdf' || ext === 'pdf') return 'picture_as_pdf';

    // Word documents: check .doc and .docx extensions
    // (MIME for docx is application/vnd.openxmlformats-officedocument.wordprocessingml.document)
    if (['doc', 'docx'].includes(ext)) return 'article';

    // Fallback for any other type: generic file icon
    return 'insert_drive_file';
  }

  protected fileTypeClass(file: File): string {
    // Same extension extraction as fileIcon — see comments above.
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';

    // Same MIME normalization as fileIcon.
    const mime = file.type.toLowerCase();

    // 'image' → template applies a blue/teal tinted thumbnail background
    if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';

    // 'pdf' → template applies a red tinted thumbnail background
    if (mime === 'application/pdf' || ext === 'pdf') return 'pdf';

    // 'doc' → template applies a blue tinted thumbnail background
    if (['doc', 'docx'].includes(ext)) return 'doc';

    // 'other' → template applies a neutral grey thumbnail background
    return 'other';
  }

  protected fileExt(file: File): string {
    // Split on '.' and take the last segment (the extension).
    // toUpperCase(): display convention — "PDF" looks better than "pdf" as a badge.
    // ?? 'FILE': fallback if the filename has no extension at all.
    return file.name.split('.').pop()?.toUpperCase() ?? 'FILE';
  }
}
