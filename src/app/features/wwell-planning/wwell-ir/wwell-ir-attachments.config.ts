import { IrAttachment, IrAttachmentSlot } from '@models/wwell-planning/ir-attachment.model';

export interface WwellIrAttachmentSlotConfig {
  readonly slot: IrAttachmentSlot;
  /** Matches the IR SECTIONS rail numbering (see wwell-ir-section-rail.config.ts). */
  readonly number: string;
  readonly label: string;
  /** Material icon ligature — topic-specific, the same way the rail's group icons are chosen. */
  readonly icon: string;
  /** Mirrors the schema's own validator on the Initiation Request file field (wwell-ir-form.schema.ts). */
  readonly required: boolean;
  readonly hint: string;
}

/**
 * The IR's two attachment slots, in the order they're appended to the letter PDF as trailing pages.
 * Single source of truth for both the editor cards and the letter view, so the two can't drift.
 */
export const WWELL_IR_ATTACHMENT_SLOTS: readonly WwellIrAttachmentSlotConfig[] = [
  {
    slot: 'location-map',
    number: '7.1',
    label: 'Location Map',
    icon: 'map',
    required: false,
    hint: 'Site location map — appended to the letter as its own page.',
  },
  {
    slot: 'initiation-request',
    number: '7.2',
    label: 'Initiation Request',
    icon: 'assignment',
    required: true,
    hint: 'Signed initiation request — appended to the letter after the location map.',
  },
];

/**
 * Restricted to what the backend can actually embed as PDF pages (see agwa-planning's
 * IrAttachmentPdfAppender). Office formats would need a headless converter, so they're refused at
 * upload rather than stored as something that silently never appears in the letter.
 */
export const WWELL_IR_ATTACHMENT_ACCEPT = '.pdf,.jpg,.jpeg,.png';

/** Purely a client-side guard now — the S3 object-store proxy enforces no size cap of its own, so
 *  this exists only to fail fast before spending time on an upload that's almost certainly wrong. */
export const WWELL_IR_ATTACHMENT_MAX_BYTES = 25 * 1024 * 1024;

/** Every file occupying a slot, oldest-uploaded first — shared by the editor, letter and details
 *  views. A slot can hold any number of attachments, not just one, so callers render this as a list
 *  rather than picking a single result. */
export function irAttachmentsFor(attachments: readonly IrAttachment[], slot: IrAttachmentSlot): readonly IrAttachment[] {
  return attachments.filter(attachment => attachment.slot === slot);
}

/**
 * Recovers the slot from one of this app's own object keys
 * (`ir-attachments/ir-<irSeq>/<slot>/<uuid>`). Anchored on the literal `ir-attachments` segment
 * rather than the key's start, because the real S3 proxy prefixes every key with its own
 * environment segment (e.g. `dev/`) that this app never generates and must simply tolerate.
 * Returns null for a key that doesn't look like one of this app's own.
 */
export function slotFromObjectKey(objectKey: string): IrAttachmentSlot | null {
  const segments = objectKey.split('/');
  const anchor = segments.indexOf('ir-attachments');
  const candidate = anchor >= 0 ? segments[anchor + 2] : undefined;
  const config = WWELL_IR_ATTACHMENT_SLOTS.find(entry => entry.slot === candidate);
  return config ? config.slot : null;
}

/** Display label for a slot ("Location Map") — used to build an `IrAttachment` straight from a
 *  search result, since the proxy itself has no notion of this app's slot labels. */
export function labelForSlot(slot: IrAttachmentSlot): string {
  return WWELL_IR_ATTACHMENT_SLOTS.find(entry => entry.slot === slot)?.label ?? slot;
}
