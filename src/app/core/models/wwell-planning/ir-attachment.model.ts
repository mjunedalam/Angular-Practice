/**
 * The two named documents an IR can carry. Unlike the rest of the IR record — which persists
 * through exad_agwa_iud_pkg's bulk-save procs — these are real files stored on the backend's
 * filesystem (agwa-planning's IrAttachmentStorageService) and fetched per ir_seq, so they arrive
 * via their own endpoint rather than in the detail blocks.
 *
 * Both are appended to the letter PDF as trailing pages in slot order, which is why only formats
 * the server can embed are accepted (see WWELL_IR_ATTACHMENT_ACCEPT).
 */
export type IrAttachmentSlot = 'location-map' | 'initiation-request';

/**
 * One step of an in-flight upload. `attachment` stays null while bytes are still going out and is
 * populated only on the final event, so "has the server accepted this?" is a single null check
 * rather than a percent comparison.
 */
export interface IrAttachmentUploadEvent {
  /** 0-100. Stays 0 when the browser can't determine the total size. */
  readonly percent: number;
  readonly attachment: IrAttachment | null;
}

export interface IrAttachment {
  readonly slot: IrAttachmentSlot;
  /** Server-supplied display name for the slot ("Location Map"), also used as the PDF page caption. */
  readonly label: string;
  /** Stored file name — sanitized server-side, so not necessarily what the user picked. */
  readonly fileName: string;
  readonly sizeBytes: number;
  readonly contentType: string;
}
