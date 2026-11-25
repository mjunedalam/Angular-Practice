/**
 * WLDA letters — mirrors EXAD.EXAD_AGWA_WLDA_LTR (docs/wlda/exad_agwa_wlda_ltr_schema.md) and the
 * pre-well plan row (EXAD_RCD_PREWAP) every letter belongs to. A letter has no well fields of its
 * own: the well name, number, depth and so on are read from its plan.
 */

/** `draft` = saved, not yet sent to SAP; `submitted` = SAP workflow in progress; `approved` = SAP APPROVED; `rejected` = SAP Rejected/Cancelled/Recalled. */
export type WldaStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

/** One row of `GET /planning/api/v1/wlda-letters` — the letter columns plus its joined plan columns. */
export interface WldaLetter {
  readonly prewapSeq: number;
  readonly ltrId: number;
  readonly svXutmCord: number | null;
  readonly svYutmCord: number | null;
  readonly svUtmZn: number | null;
  readonly ltrRmks: string | null;
  readonly sapWfId: number | null;
  readonly sapWfStatus: string | null;
  readonly sapWfAprvDt: string | null;
  readonly epCrDataDt: string | null;
  readonly epCrDataCd: string | null;
  readonly wPrimHid: string | null;
  readonly wNum: string | null;
  readonly wellType: string | null;
  readonly tdMd: number | null;
  readonly targetForm: string | null;
  readonly gospAreaPlant: string | null;
  readonly currentFlg: string | null;
}

/** The plan columns the create form shows, from `GET /planning/api/v1/prewaps` (EXAD_RCD_PREWAP). */
export interface WldaPrewap {
  readonly prewapSeq: number;
  readonly wPrimHid: string | null;
  readonly wNum: string | null;
  readonly wellType: string | null;
  readonly tdMd: number | null;
  readonly targetForm: string | null;
  readonly gospAreaPlant: string | null;
  readonly svUtmZn: number | null;
  /** UTM northing / easting of the surface location, when the source list carries them. */
  readonly surfaceNorth?: number | null;
  readonly surfaceEast?: number | null;
}

/** Body of `POST /planning/api/v1/prewaps/{prewapSeq}/wlda-letters`; prewapSeq travels in the path. */
export interface WldaCreatePayload {
  readonly svXutmCord: number | null;
  readonly svYutmCord: number | null;
  readonly svUtmZn: number | null;
  readonly ltrRmks: string | null;
  readonly sapWfId: number | null;
  readonly sapWfStatus: string | null;
  readonly sapWfAprvDt: string | null;
}

/** Body of `PUT .../wlda-letters/{ltrId}` — the update proc writes all four, so unchanged SAP columns are echoed back. */
export interface WldaUpdatePayload {
  readonly ltrRmks: string | null;
  readonly sapWfId: number | null;
  readonly sapWfStatus: string | null;
  readonly sapWfAprvDt: string | null;
}

export interface WldaCreateResult {
  readonly prewapSeq: number;
  readonly ltrId: number;
}

/** What the author types into: the letter's editable columns, the well details, and the files for S3. */
export interface WldaDraft {
  readonly prewapSeq: number | null;
  /** Well details: pre-filled from the chosen plan and editable while creating. They belong to the plan, not the letter. */
  readonly waterWellName: string;
  readonly field: string;
  readonly wellNumber: string;
  readonly reservoir: string;
  readonly wellType: string;
  readonly totalDepth: string;
  /** Cathodic protection required — shown on the letter only; EXAD_AGWA_WLDA_LTR has no column for it. */
  readonly cathodicProtection: boolean;
  /** Distribution list, one entry per line — shown on the letter only; no column for it either. */
  readonly distribution: string;
  /** SV_XUTM_CORD — East (X), NUMBER(8,2). */
  readonly svXutmCord: string;
  /** SV_YUTM_CORD — North (Y), NUMBER(9,2). */
  readonly svYutmCord: string;
  /** SV_UTM_ZN — NUMBER(2). */
  readonly svUtmZn: string;
  /** LTR_RMKS — VARCHAR2(2000). */
  readonly ltrRmks: string;
  /** New files to upload on save. */
  readonly files: readonly File[];
  /** S3 keys of stored files the author removed; deleted from S3 on save (edit only). */
  readonly removedKeys: readonly string[];
}

/** A file on the sheet: stored in S3 (`key` set) or picked and waiting to upload (`pendingIndex` set). */
export interface WldaAttachment {
  readonly key: string | null;
  readonly name: string;
  readonly pendingIndex: number | null;
}

/** One row of the SAP approval workflow table printed on the letter. */
export interface WldaWorkflowRow {
  readonly name: string;
  readonly title: string;
  readonly status: string;
  readonly approvedDate: string;
}

/** Everything the sheet renders, from an unsaved draft, a saved letter, or a letter being edited. */
export interface WldaLetterView {
  readonly code: string;
  /** The typed water well name; empty for a saved letter, whose well is named from its plan. */
  readonly wellName: string;
  /** null = not recorded (saved letters), true/false = ticked Yes/No on the form. */
  readonly cathodic: boolean | null;
  readonly status: WldaStatus;
  readonly date: string | null;
  readonly field: string;
  readonly wellNumber: string;
  readonly wellType: string;
  readonly reservoir: string;
  readonly totalDepth: string;
  readonly gosp: string;
  readonly north: string;
  readonly east: string;
  readonly zone: string;
  readonly remarks: string;
  readonly attachments: readonly WldaAttachment[];
  /** Empty until the SAP workflow is wired in; the sheet and the PDF show a placeholder meanwhile. */
  readonly workflow: readonly WldaWorkflowRow[];
  /** Empty until the distribution list is provided; shown as a placeholder meanwhile. */
  readonly distribution: readonly string[];
}
