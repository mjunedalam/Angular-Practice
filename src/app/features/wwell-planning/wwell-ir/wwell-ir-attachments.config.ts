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

/** Matches the server-side cap in IrAttachmentStorageService — checked here only to fail fast. */
export const WWELL_IR_ATTACHMENT_MAX_BYTES = 25 * 1024 * 1024;

/** The file occupying a slot, or null when it's empty — shared by the editor, letter and details views. */
export function irAttachmentFor(attachments: readonly IrAttachment[], slot: IrAttachmentSlot): IrAttachment | null {
  return attachments.find(attachment => attachment.slot === slot) ?? null;
}
