/** SAP AAE trigger identifiers for the IR "Submit for Review" workflow — fixed for this process,
 *  not derived from IR data. See SapService.trigger and WwellIrStore.submitIrForReview. */
export const WWELL_IR_SAP_PROCESS_ID = '1406';
export const WWELL_IR_SAP_SCENARIO_ID = 'IRA';

/** SAP takes roughly 5-7s after a recall's DELETE is acknowledged before GET /display reports the
 *  workflow as Recalled. Rather than one fixed delay (too slow when SAP is quick, still stale when
 *  it's slow), the store polls every WWELL_IR_SAP_RECALL_POLL_MS until the status turns Recalled,
 *  giving up after WWELL_IR_SAP_RECALL_POLL_MAX_ATTEMPTS (~18s) and keeping the last status read. */
export const WWELL_IR_SAP_RECALL_POLL_MS = 1500;
export const WWELL_IR_SAP_RECALL_POLL_MAX_ATTEMPTS = 12;

/** Written to exad_gwd_ir_header.sap_wf_status (update_ir_sap_wf_prc, docs/ir/update_ir_sap_wf_prc.sql)
 *  the moment SAP has accepted the workflow — a refused trigger leaves the header untouched, so
 *  there is deliberately no FAILED counterpart to this. A local placeholder, not SAP's own text:
 *  submitting deliberately does not call SAP's GET /display to ask (see WwellIrStore.submitIrForReview),
 *  since a workflow that was just created is, by definition, in progress. Viewing the record
 *  (WwellIrStore.loadIrApprovalTimeline) is what reads SAP's real current status back over this. */
export const WWELL_IR_SAP_WF_STATUS_IN_PROGRESS = 'In Progress';

/** The well's full name for letters, SAP and email (e.g. SHYB_1031(SHAYBAH)), else the short wellName. */
export function irWellFullName(ir: { readonly requestReference: { readonly wellName: string; readonly wellFullName?: string | null } }): string {
  return ir.requestReference.wellFullName?.trim() || ir.requestReference.wellName;
}

/** The SAP workflow title: `[IR-11018] Integrated Requirement for AMYL_801` in production, and
 *  `[TEST-IR-11018] Integrated Requirement for AMYL_801` on every other (dev/test) build. */
export function buildSapWorkflowTitle(irCode: string, wellName: string, isProduction: boolean): string {
  return `[${isProduction ? '' : 'TEST-'}${irCode}] Integrated Requirement for ${wellName}`;
}
