/** SAP AAE trigger identifiers for the IR "Submit for Review" workflow — fixed for this process,
 *  not derived from IR data. See SapService.trigger and WwellIrStore.submitIrForReview. */
export const WWELL_IR_SAP_PROCESS_ID = '1406';
export const WWELL_IR_SAP_SCENARIO_ID = 'IRA';

/** Written to exad_gwd_ir_header.sap_wf_status (update_ir_sap_wf_prc, docs/ir/update_ir_sap_wf_prc.sql)
 *  only once SAP has accepted the workflow — a refused trigger leaves the header untouched, so
 *  there is deliberately no FAILED counterpart to this. */
export const WWELL_IR_SAP_WF_STATUS_SUBMITTED = 'SUBMITTED';
