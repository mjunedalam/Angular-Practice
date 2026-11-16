/**
 * Single source of truth for which files the app lets a user attach. Every file input / dropzone
 * reads its `accept` hint, its type check and its size cap from here.
 *
 * Edit `ALLOWED_UPLOAD_EXTENSIONS` to change what the whole app accepts — the `accept` hint, the
 * hint text and every handler's check follow from that one edit. Set it to `null` to allow any
 * file type. The size cap applies either way.
 *
 * `accept` on an <input type="file"> is only a picker hint, so handlers call `isUploadFileAllowed`
 * on every file regardless; the server remains the real authority.
 */

/** Bare, lower-case extensions (no dot), or `null` to allow any file type. */
export const ALLOWED_UPLOAD_EXTENSIONS: readonly string[] | null = [
  // images
  'jpg', 'jpeg', 'png',
  // documents
  'pdf', 'doc', 'docx', 'txt',
  // spreadsheets
  'xls', 'xlsx', 'xlsm', 'xlsb', 'csv',
];

export const MAX_UPLOAD_SIZE_BYTES = 25 * 1024 * 1024;
export const MAX_UPLOAD_SIZE_LABEL = '25 MB';

/** Value for an <input accept> — `null` (attribute omitted) when any type is allowed. */
export function toAcceptAttribute(extensions: readonly string[] | null = ALLOWED_UPLOAD_EXTENSIONS): string | null {
  return extensions ? extensions.map(ext => `.${ext}`).join(',') : null;
}

/**
 * Extensions that are accepted (picker, validation, server) but deliberately not named in on-screen
 * text — display only; removing one here changes nothing about what can be uploaded.
 */
export const EXTENSIONS_HIDDEN_FROM_LABELS: readonly string[] = ['xls', 'xlsx', 'xlsm', 'xlsb', 'csv'];

/** Dropzone hint text: `PDF · DOC · …`, or `Any file type`. Omits `EXTENSIONS_HIDDEN_FROM_LABELS`. */
export function toExtensionLabel(extensions: readonly string[] | null = ALLOWED_UPLOAD_EXTENSIONS): string {
  if (!extensions) return 'Any file type';
  return extensions
    .filter(ext => !EXTENSIONS_HIDDEN_FROM_LABELS.includes(ext))
    .map(ext => ext.toUpperCase())
    .join(' · ');
}

export function hasAllowedExtension(fileName: string, extensions: readonly string[] | null = ALLOWED_UPLOAD_EXTENSIONS): boolean {
  if (extensions === null) return true;
  const dot = fileName.lastIndexOf('.');
  if (dot < 0) return false;
  return extensions.includes(fileName.slice(dot + 1).toLowerCase());
}

export interface UploadRules {
  readonly extensions?: readonly string[] | null;
  readonly maxBytes?: number;
}

export function isUploadFileAllowed(file: File, rules: UploadRules = {}): boolean {
  const { extensions = ALLOWED_UPLOAD_EXTENSIONS, maxBytes = MAX_UPLOAD_SIZE_BYTES } = rules;
  return hasAllowedExtension(file.name, extensions) && file.size <= maxBytes;
}
