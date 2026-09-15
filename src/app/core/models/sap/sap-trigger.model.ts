export interface SapAttachmentFile {
  file_name: string;
  b64: string;
}

export interface SapInfoCard {
  card_type: 'info';
  message: string;
  details_link?: string;
}

export interface SapWarningCard {
  card_type: 'warning';
  message: string;
}

export interface SapJustificationCard {
  card_type: 'justification';
  message: string;
}

export interface SapImageCard {
  card_type: 'image';
  image_label: string;
  image_url: string;
}

export interface SapItemsCard {
  card_type: 'items';
  card_label: string;
  columns: string;
  items: Record<string, string>[];
}

export interface SapAttachmentsLinkCard {
  card_type: 'attachments_link';
  card_label: string;
  items: Record<string, string>[];
}

export type SapCard =
  | SapInfoCard
  | SapWarningCard
  | SapJustificationCard
  | SapImageCard
  | SapItemsCard
  | SapAttachmentsLinkCard;

export interface SapTriggerRequest {
  workflow_title: string;
  initiator_network_id: string;
  requester_network_id: string;
  process_id: string;
  scenario_id: string;
  workflow_id: string;
  /** Optional per the SAP AAE trigger schema — omit entirely when the IR has nothing attached
   *  rather than sending an empty array. */
  attachment_files?: SapAttachmentFile[];
  body: SapCard[];
}

/** SAP's 200 body — a bare `{ message }` object (e.g. "Agents were successfully resolved"), not
 *  this app's own ApiResponse envelope. */
export interface SapTriggerResponse {
  message: string;
}

export interface SapValidationErrorDetail {
  type: string;
  loc: (string | number)[];
  msg: string;
  /** Echo of the rejected value — `null` for a missing required field. */
  input: string | null;
  ctx: Record<string, unknown>;
}

export interface SapValidationError {
  detail: SapValidationErrorDetail[];
}
