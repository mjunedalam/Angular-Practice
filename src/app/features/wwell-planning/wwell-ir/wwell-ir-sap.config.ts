/** SAP AAE trigger identifiers for the IR "Submit for Review" workflow — fixed for this process,
 *  not derived from IR data. See SapService.trigger and WwellIrStore.submitIrForReview. */
export const WWELL_IR_SAP_PROCESS_ID = '1406';
export const WWELL_IR_SAP_SCENARIO_ID = 'IRA';

/** Written to exad_gwd_ir_header.sap_wf_status (update_ir_sap_wf_prc, docs/ir/update_ir_sap_wf_prc.sql)
 *  only once SAP has accepted the workflow — a refused trigger leaves the header untouched, so
 *  there is deliberately no FAILED counterpart to this. */
export const WWELL_IR_SAP_WF_STATUS_SUBMITTED = 'SUBMITTED';

const WWELL_IR_SAP_WF_SEQ_PAD_LENGTH = 4;

/** Composes the SAP `workflow_id` string from the raw sequence value returned by
 *  get_wf_next_id_fnc — e.g. seq 6 → "ALMAAH1G_IRA_0006". The same raw `seq` (not this composite
 *  string) is what gets persisted as exad_gwd_ir_header.sap_wf_id, since that column is a NUMBER. */
export function buildSapWorkflowId(networkId: string, seq: number): string {
  const paddedSeq = String(seq).padStart(WWELL_IR_SAP_WF_SEQ_PAD_LENGTH, '0');
  return `${networkId.toUpperCase()}_${WWELL_IR_SAP_SCENARIO_ID}_${paddedSeq}`;
}
