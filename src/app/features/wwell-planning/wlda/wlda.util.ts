import {
  WldaAttachment,
  WldaCreatePayload,
  WldaDraft,
  WldaLetter,
  WldaLetterView,
  WldaPrewap,
  WldaStatus,
  WldaUpdatePayload,
  WldaWorkflowRow,
} from '@models/wwell-planning/wlda.model';
import { ApprovalChainStep, ApprovalStepStatus } from '@models/wwell-planning/wwell-planning.model';
import { WLDA_SAP_WF_STATUS_DRAFT } from './wlda.config';

/** Column bounds of EXAD_AGWA_WLDA_LTR — checked here so a bad value is explained, not an ORA error. */
export const WLDA_MAX_X_UTM = 999_999.99;
export const WLDA_MAX_Y_UTM = 9_999_999.99;
export const WLDA_MIN_UTM_ZONE = 1;
export const WLDA_MAX_UTM_ZONE = 60;
export const WLDA_MAX_REMARKS_BYTES = 2000;

const DECIMAL_2DP = /^\d+(\.\d{1,2})?$/;
const INTEGER = /^\d+$/;

export const WLDA_EMPTY_DRAFT: WldaDraft = {
  prewapSeq: null,
  waterWellName: '',
  field: '',
  wellNumber: '',
  reservoir: '',
  wellType: '',
  totalDepth: '',
  cathodicProtection: false,
  distribution: '',
  svXutmCord: '',
  svYutmCord: '',
  svUtmZn: '',
  ltrRmks: '',
  files: [],
  removedKeys: [],
};

/** Letter reference shown in the UI — the letter id is the only per-letter identifier the table has. */
export function wldaCode(ltrId: number): string {
  return `WLDA-${ltrId}`;
}

/** Stable list key: LTR_ID alone is only unique per plan in the table's own design. */
export function wldaKey(letter: Pick<WldaLetter, 'prewapSeq' | 'ltrId'>): string {
  return `${letter.prewapSeq}-${letter.ltrId}`;
}

/** The letter's S3 key prefix — the only link between a letter and its files. */
export function wldaS3Prefix(prewapSeq: number, ltrId: number): string {
  return `wlda-letters/prewap-${prewapSeq}/ltr-${ltrId}`;
}

export function wldaWellName(plan: Pick<WldaPrewap, 'wPrimHid' | 'wNum'> | null): string {
  if (!plan) return '';
  return [plan.wPrimHid, plan.wNum].filter(part => !!part?.trim()).join(' ');
}

/** "Link to Water Well" dropdown label: w_prim_hid and w_num joined the way the IR picker names a well. */
export function wldaLinkLabel(plan: Pick<WldaPrewap, 'wPrimHid' | 'wNum'>): string {
  return [plan.wPrimHid, plan.wNum].filter(part => !!part?.trim()).join('_');
}

function utf8Bytes(value: string): number {
  return new Blob([value]).size;
}

const REQUIRED_CREATE_FIELDS: readonly (readonly [keyof WldaDraft, string])[] = [
  ['waterWellName', 'Water Well Name'],
  ['field', 'Field'],
  ['wellNumber', 'Well Number'],
  ['reservoir', 'Reservoir'],
  ['wellType', 'Well Type'],
  ['totalDepth', 'Total Depth'],
  ['svYutmCord', 'North (Y)'],
  ['svXutmCord', 'East (X)'],
];

/** Field a validation message belongs under; the form shows it inline beneath that field. */
export type WldaErrorKey = keyof WldaDraft;
export type WldaFieldErrors = Readonly<Partial<Record<WldaErrorKey, string>>>;

/**
 * Problems with the draft keyed by the field they belong to (first problem per field). The starred
 * fields are only required when creating: in edit mode the well and location are locked.
 */
export function wldaFieldErrors(draft: WldaDraft, mode: 'create' | 'edit' = 'create', plan: WldaPrewap | null = null): WldaFieldErrors {
  const errors: Partial<Record<WldaErrorKey, string>> = {};
  const add = (key: WldaErrorKey, message: string): void => {
    errors[key] ??= message;
  };
  if (mode === 'create') {
    for (const [key, label] of REQUIRED_CREATE_FIELDS) {
      if (String(draft[key]).trim() === '') add(key, `${label} is required.`);
    }
    if (plan === null && draft.field.trim() !== '' && draft.wellNumber.trim() !== '') {
      add('wellNumber', `No pre-well plan exists for ${draft.field.trim()} ${draft.wellNumber.trim()} — link a water well above.`);
    }
  } else if (draft.prewapSeq == null) {
    add('prewapSeq', 'This letter has no pre-well plan.');
  }

  const x = draft.svXutmCord.trim();
  if (x && (!DECIMAL_2DP.test(x) || Number(x) > WLDA_MAX_X_UTM)) {
    add('svXutmCord', `East (X) must be a number up to ${WLDA_MAX_X_UTM} with at most 2 decimals.`);
  }
  const y = draft.svYutmCord.trim();
  if (y && (!DECIMAL_2DP.test(y) || Number(y) > WLDA_MAX_Y_UTM)) {
    add('svYutmCord', `North (Y) must be a number up to ${WLDA_MAX_Y_UTM} with at most 2 decimals.`);
  }
  const zone = draft.svUtmZn.trim();
  if (zone && (!INTEGER.test(zone) || Number(zone) < WLDA_MIN_UTM_ZONE || Number(zone) > WLDA_MAX_UTM_ZONE)) {
    add('svUtmZn', `Zone must be a whole number from ${WLDA_MIN_UTM_ZONE} to ${WLDA_MAX_UTM_ZONE}.`);
  }
  if (utf8Bytes(draft.ltrRmks) > WLDA_MAX_REMARKS_BYTES) {
    add('ltrRmks', `Remarks must be at most ${WLDA_MAX_REMARKS_BYTES} bytes.`);
  }
  return errors;
}

/** Every problem as a flat list (empty = valid); the Create/Save buttons use it as their gate. */
export function validateWldaDraft(draft: WldaDraft, mode: 'create' | 'edit' = 'create', plan: WldaPrewap | null = null): readonly string[] {
  return Object.values(wldaFieldErrors(draft, mode, plan)).filter((message): message is string => !!message);
}

function numberOrNull(value: string): number | null {
  const trimmed = value.trim();
  return trimmed ? Number(trimmed) : null;
}

/** SAP workflow columns stay null: SAP fills them after submission, never the create form. */
export function toWldaCreatePayload(draft: WldaDraft): WldaCreatePayload {
  return {
    svXutmCord: numberOrNull(draft.svXutmCord),
    svYutmCord: numberOrNull(draft.svYutmCord),
    svUtmZn: numberOrNull(draft.svUtmZn),
    ltrRmks: draft.ltrRmks.trim() || null,
    sapWfId: null,
    sapWfStatus: WLDA_SAP_WF_STATUS_DRAFT,
    sapWfAprvDt: null,
  };
}

function textOf(value: string | number | null | undefined): string {
  return value == null ? '' : String(value);
}

export function statusOfLetter(letter: Pick<WldaLetter, 'sapWfStatus'>): WldaStatus {
  const text = letter.sapWfStatus?.trim().toUpperCase() ?? '';
  if (text === 'APPROVED') return 'approved';
  if (text === '' || text === 'DRAFT') return 'draft';
  if (/REJECT|CANCEL|RECALL/.test(text)) return 'rejected';
  return 'submitted';
}

/** A submitted or approved letter is read-only: editing it first resets it to Draft, with the user's consent, and it
 *  must then be routed for approval again (same rule as the IR, see isIrLockedForEdit). */
export function isWldaLocked(letter: Pick<WldaLetter, 'sapWfId' | 'sapWfStatus'>): boolean {
  return letter.sapWfId != null || statusOfLetter(letter) === 'approved';
}

/** The edit draft starts from the saved letter's own values; coordinates are shown but not editable. */
export function draftOfLetter(letter: WldaLetter): WldaDraft {
  return {
    ...WLDA_EMPTY_DRAFT,
    prewapSeq: letter.prewapSeq,
    waterWellName: wldaWellName(letter).replace(' ', '-'),
    field: textOf(letter.wPrimHid),
    wellNumber: textOf(letter.wNum),
    reservoir: textOf(letter.targetForm),
    wellType: textOf(letter.wellType),
    totalDepth: textOf(letter.tdMd),
    svXutmCord: textOf(letter.svXutmCord),
    svYutmCord: textOf(letter.svYutmCord),
    svUtmZn: textOf(letter.svUtmZn),
    ltrRmks: textOf(letter.ltrRmks),
    files: [],
    removedKeys: [],
  };
}

/** The update proc rewrites the SAP columns too, so they are echoed back unchanged. */
export function toWldaUpdatePayload(draft: WldaDraft, letter: WldaLetter): WldaUpdatePayload {
  return {
    ltrRmks: draft.ltrRmks.trim() || null,
    sapWfId: letter.sapWfId,
    sapWfStatus: letter.sapWfStatus,
    sapWfAprvDt: letter.sapWfAprvDt,
  };
}

/** True once the author has changed anything worth confirming before it is thrown away. */
export function isWldaDraftDirty(draft: WldaDraft, letter: WldaLetter | null): boolean {
  if (draft.files.length > 0 || draft.removedKeys.length > 0) return true;
  const baseline = letter ? draftOfLetter(letter) : WLDA_EMPTY_DRAFT;
  const keys = Object.keys(baseline).filter(key => key !== 'files' && key !== 'removedKeys') as (keyof WldaDraft)[];
  return keys.some(key => draft[key] !== baseline[key]);
}

/** The pre-well plan a new letter is filed under: the one whose field code and well number match what was typed. */
export function findPlanForWell(prewaps: readonly WldaPrewap[], field: string, wellNumber: string): WldaPrewap | null {
  const wantedField = field.trim().toLowerCase();
  const wantedNumber = wellNumber.trim().toLowerCase();
  if (!wantedField || !wantedNumber) return null;
  return prewaps.find(plan => textOf(plan.wPrimHid).trim().toLowerCase() === wantedField && textOf(plan.wNum).trim().toLowerCase() === wantedNumber) ?? null;
}

function baseView(
  source: Pick<WldaPrewap, 'wPrimHid' | 'wNum' | 'wellType' | 'targetForm' | 'tdMd' | 'gospAreaPlant'> | null,
): Pick<WldaLetterView, 'field' | 'wellNumber' | 'wellType' | 'reservoir' | 'totalDepth' | 'gosp'> {
  return {
    field: textOf(source?.wPrimHid),
    wellNumber: textOf(source?.wNum),
    wellType: textOf(source?.wellType),
    reservoir: textOf(source?.targetForm),
    totalDepth: textOf(source?.tdMd),
    gosp: textOf(source?.gospAreaPlant),
  };
}

function pendingAttachments(files: readonly File[]): WldaAttachment[] {
  return files.map((file, index) => ({ key: null, name: file.name, pendingIndex: index }));
}

export function viewOfDraft(draft: WldaDraft, plan: WldaPrewap | null): WldaLetterView {
  return {
    code: 'New WLDA',
    status: 'draft',
    date: null,
    wellName: draft.waterWellName,
    cathodic: draft.cathodicProtection,
    field: draft.field,
    wellNumber: draft.wellNumber,
    wellType: draft.wellType,
    reservoir: draft.reservoir,
    totalDepth: draft.totalDepth,
    gosp: textOf(plan?.gospAreaPlant),
    north: draft.svYutmCord,
    east: draft.svXutmCord,
    zone: draft.svUtmZn,
    remarks: draft.ltrRmks,
    attachments: pendingAttachments(draft.files),
    workflow: [],
    distribution: draft.distribution.split('\n').map(line => line.trim()).filter(line => line !== ''),
  };
}

/** A saved letter. While editing (`draft` set) remarks and files come from the draft instead. */
const STEP_STATUS_LABEL: Record<ApprovalStepStatus, string> = { approved: 'Approved', rejected: 'Rejected', 'in-progress': 'In Progress', pending: 'Pending' };

/** The approval chain as the letter's SAP workflow table rows. */
export function workflowRowsOf(chain: readonly ApprovalChainStep[]): readonly WldaWorkflowRow[] {
  return chain.map(step => ({ name: step.name, title: step.role, status: STEP_STATUS_LABEL[step.status], approvedDate: step.status === 'approved' ? (step.date ?? '') : '' }));
}

export function viewOfLetter(
  letter: WldaLetter,
  stored: readonly WldaAttachment[],
  draft: WldaDraft | null = null,
  chain: readonly ApprovalChainStep[] = [],
): WldaLetterView {
  const visibleStored = draft ? stored.filter(file => !draft.removedKeys.includes(file.key ?? '')) : stored;
  return {
    ...baseView(letter),
    code: wldaCode(letter.ltrId),
    wellName: '',
    cathodic: null,
    status: statusOfLetter(letter),
    date: letter.sapWfAprvDt ?? letter.epCrDataDt,
    north: textOf(letter.svYutmCord),
    east: textOf(letter.svXutmCord),
    zone: textOf(letter.svUtmZn),
    remarks: draft ? draft.ltrRmks : textOf(letter.ltrRmks),
    attachments: [...visibleStored, ...pendingAttachments(draft?.files ?? [])],
    workflow: workflowRowsOf(chain),
    distribution: [],
  };
}
