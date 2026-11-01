/**
 * The named documents an IR can carry (Location Map, Initiation Request and the optional WLDA). Unlike the rest of the IR record — which persists
 * through exad_agwa_iud_pkg's bulk-save procs — these are real files that live entirely in the S3
 * object-store proxy (s3-client-service locally), addressed by `ir-attachments/ir-<irSeq>/<slot>/`
 * key prefixes. Angular talks to that proxy directly for upload/list/view/delete — agwa-planning
 * has no storage or REST surface for attachments at all (see S3Service).
 *
 * Both are appended to the letter PDF as trailing pages in slot order, which is why only formats
 * the server can embed are accepted (see WWELL_IR_ATTACHMENT_ACCEPT).
 */
export type IrAttachmentSlot = 'location-map' | 'initiation-request' | 'wlda';

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

/**
 * A file picked for a slot but not yet sent — `id` is minted client-side (see
 * WwellIrStore.addPendingAttachment) purely so the editor can track upload/busy state per staged
 * file independently, since a slot can hold several of these at once and `File` has no identity of
 * its own to key off.
 */
export interface IrPendingAttachment {
  readonly id: string;
  readonly file: File;
}

export interface IrAttachment {
  readonly slot: IrAttachmentSlot;
  /** The S3 object-store proxy's key — this attachment's only real identity (globally unique by
   *  construction: `ir-attachments/ir-<irSeq>/<slot>/<uuid>`). Addresses view/delete directly
   *  against the proxy; a slot/fileName pair is no longer enough since nothing here disambiguates
   *  two uploads sharing the same original file name the way the old backend-side storage did. */
  readonly objectKey: string;
  /** Display label for the slot ("Location Map"), derived client-side from WWELL_IR_ATTACHMENT_SLOTS
   *  — also used as the PDF page caption (by agwa-planning, independently, from the same slot). */
  readonly label: string;
  /** The file's original name as picked, exactly as the S3 proxy's ORIGINAL_FILENAME recorded it —
   *  display only, never addressing (see `objectKey`). */
  readonly fileName: string;
  readonly sizeBytes: number;
  readonly contentType: string;
}
