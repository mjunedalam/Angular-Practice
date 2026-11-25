import { WldaStatus } from '@models/wwell-planning/wlda.model';
import { WWELL_IR_SAP_PROCESS_ID, WWELL_IR_SAP_SCENARIO_ID } from '../wwell-ir/wwell-ir-sap.config';
import { WWELL_STATUS_COLORS, WwellStatusMeta, wwellStatusMeta } from '../shared/wwell-status.config';

export const WLDA_WELL_TYPES: readonly string[] = [
  'Drilling Water Supply',
  'Facility Water Supply',
  'Production',
  'Observation',
  'Monitoring',
  'Injection',
];

export const WLDA_DIVISION = 'Groundwater Division';
export const WLDA_LETTER_TITLE = 'Well Location & Drilling Approval';

export const WLDA_STATUS_META: Record<WldaStatus, WwellStatusMeta> = {
  draft: wwellStatusMeta('Draft', WWELL_STATUS_COLORS.amber),
  submitted: wwellStatusMeta('In Progress', WWELL_STATUS_COLORS.blue),
  approved: wwellStatusMeta('Approved', WWELL_STATUS_COLORS.green),
  rejected: wwellStatusMeta('Rejected', WWELL_STATUS_COLORS.red),
};

export const WLDA_FORM_TITLE = 'WELL LOCATION & DRILLING APPROVAL';
export const WLDA_FORM_NUMBER = 'Aramco Form 6208(9/93)';
export const WLDA_TO_LINE =
  'Director, Exploration & Oil Drilling Engineering Department R-R-32-1, Floor 1, D Wing, Dhahran Heights Portable (Bldg. 9171) Dhahran';

/** Placeholders until the SAP workflow chain and the distribution list are wired in. */
export const WLDA_WORKFLOW_PLACEHOLDER = 'SAP approval workflow steps will appear here.';
export const WLDA_DISTRIBUTION_PLACEHOLDER = 'Distribution list to be provided.';
export const WLDA_WORKFLOW_COLUMNS: readonly string[] = ['Name', 'Title', 'Status', 'Approved Date'];

/** SAP AAE trigger identifiers for the WLDA "Submit for Approval" workflow — the same process and scenario as the IR. */
export const WLDA_SAP_PROCESS_ID = WWELL_IR_SAP_PROCESS_ID;
export const WLDA_SAP_SCENARIO_ID = WWELL_IR_SAP_SCENARIO_ID;

/** Written to exad_agwa_wlda_ltr.sap_wf_status: Draft when the letter is first inserted, In Progress once SAP accepted the workflow. */
export const WLDA_SAP_WF_STATUS_DRAFT = 'Draft';
export const WLDA_SAP_WF_STATUS_IN_PROGRESS = 'In Progress';

/** The SAP workflow title: `[WLDA-11] WLDA for SHYB-1031`, prefixed `TEST-` on every non-production build. */
export function buildWldaSapWorkflowTitle(code: string, wellName: string, isProduction: boolean): string {
  return `[${isProduction ? '' : 'TEST-'}${code}] WLDA for ${wellName}`;
}

/** SAP applies a recall asynchronously, so the store polls GET /display until it reports Recalled (same numbers as the IR). */
export const WLDA_SAP_RECALL_POLL_MS = 1500;
export const WLDA_SAP_RECALL_POLL_MAX_ATTEMPTS = 12;
