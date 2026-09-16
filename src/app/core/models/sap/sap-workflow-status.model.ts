/** `header` block of `GET /display` — the workflow's own identity/status, not any one approver's. */
export interface SapWorkflowHeader {
  process_name: string;
  initiator_id: string;
  requester_id: string;
  date_initiated: string;
  time_initiated: string;
  wf_status: string | null;
  wf_status_text: string;
}

/** One entry of `remarks`/`reject_remarks` — both arrays share this shape. */
export interface SapRemark {
  remark_by: string;
  remarks: string;
}

/** One entry of `approval_chain` — a single level of the workflow's reviewer/approver sequence.
 *  `response`/`response_date`/`response_time` stay `null`/`'0000-00-00'`/`'00:00:00'` until that
 *  level actually acts. */
export interface SapApprovalStep {
  level: string;
  received_date: string;
  received_time: string;
  approver_network_id: string | null;
  approver_name: string;
  approver_title: string;
  approver_category: string;
  response_date: string;
  response_time: string;
  response: string | null;
}

/** Body of `GET /display` — the full workflow status snapshot the IR "Approval Workflow" sidebar renders. */
export interface SapWorkflowStatusResponse {
  header: SapWorkflowHeader;
  remarks: SapRemark[];
  reject_remarks: SapRemark[];
  approval_chain: SapApprovalStep[];
}
