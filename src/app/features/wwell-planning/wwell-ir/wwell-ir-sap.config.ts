/** SAP AAE trigger identifiers for the IR "Submit for Review" workflow — fixed for this process,
 *  not derived from IR data. See SapService.trigger and WwellIrStore.submitIrForReview. */
export const WWELL_IR_SAP_PROCESS_ID = '1406';
export const WWELL_IR_SAP_SCENARIO_ID = 'IRA';

/** Written to exad_gwd_ir_header.sap_wf_status (update_ir_sap_wf_prc, docs/ir/update_ir_sap_wf_prc.sql)
 *  the moment SAP has accepted the workflow — a refused trigger leaves the header untouched, so
 *  there is deliberately no FAILED counterpart to this. A local placeholder, not SAP's own text:
 *  submitting deliberately does not call SAP's GET /display to ask (see WwellIrStore.submitIrForReview),
 *  since a workflow that was just created is, by definition, in progress. Viewing the record
 *  (WwellIrStore.loadIrApprovalTimeline) is what reads SAP's real current status back over this. */
export const WWELL_IR_SAP_WF_STATUS_IN_PROGRESS = 'In Progress';
