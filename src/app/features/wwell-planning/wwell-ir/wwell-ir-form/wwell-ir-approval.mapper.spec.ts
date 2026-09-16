import { SapApprovalStep, SapWorkflowStatusResponse } from '@models/sap/sap-workflow-status.model';
import { mapSapWorkflowStatusToApprovalChain } from './wwell-ir-approval.mapper';

function buildStep(overrides: Partial<SapApprovalStep> = {}): SapApprovalStep {
  return {
    level: '01',
    received_date: '0000-00-00',
    received_time: '00:00:00',
    approver_network_id: null,
    approver_name: 'Eng. A. Al-Mutairi',
    approver_title: 'Hydrogeologist',
    approver_category: 'Reviewer',
    response_date: '0000-00-00',
    response_time: '00:00:00',
    response: null,
    ...overrides,
  };
}

function buildStatus(approvalChain: SapApprovalStep[]): SapWorkflowStatusResponse {
  return {
    header: {
      process_name: 'Geological Operations',
      initiator_id: 'ALANMX10',
      requester_id: 'ALANMX10',
      date_initiated: '2026-09-15',
      time_initiated: '11:30:35',
      wf_status: null,
      wf_status_text: 'In Process',
    },
    remarks: [],
    reject_remarks: [],
    approval_chain: approvalChain,
  };
}

describe('mapSapWorkflowStatusToApprovalChain', () => {
  it('maps role/name straight off approver_title/approver_name', () => {
    const chain = mapSapWorkflowStatusToApprovalChain(
      buildStatus([buildStep({ approver_title: 'Initiator', approver_name: 'Mohammad Juned Alam' })]),
    );

    expect(chain).toEqual([expect.objectContaining({ role: 'Initiator', name: 'Mohammad Juned Alam' })]);
  });

  /** The exact shape SAP returns for a just-initiated workflow — level 01 reached (its own
   *  receipt), levels 02/03 not yet reached. */
  it('marks a just-initiated workflow\'s only reached level in-progress and the rest pending', () => {
    const chain = mapSapWorkflowStatusToApprovalChain(
      buildStatus([
        buildStep({ level: '01', received_date: '2026-09-15', received_time: '11:30:39' }),
        buildStep({ level: '02', approver_title: 'Lead Geologist' }),
        buildStep({ level: '03', approver_title: 'Manager Ground Water' }),
      ]),
    );

    expect(chain.map(step => step.status)).toEqual(['in-progress', 'pending', 'pending']);
  });

  it('marks a level with a real response approved, and the next reached-but-undecided level in-progress', () => {
    const chain = mapSapWorkflowStatusToApprovalChain(
      buildStatus([
        buildStep({ level: '01', received_date: '2026-09-15', response_date: '2026-09-15', response: 'APPROVED' }),
        buildStep({ level: '02', received_date: '2026-09-16' }),
        buildStep({ level: '03' }),
      ]),
    );

    expect(chain.map(step => step.status)).toEqual(['approved', 'in-progress', 'pending']);
  });

  it('marks every level approved once the whole chain has responded', () => {
    const chain = mapSapWorkflowStatusToApprovalChain(
      buildStatus([
        buildStep({ level: '01', received_date: '2026-09-15', response_date: '2026-09-15', response: 'APPROVED' }),
        buildStep({ level: '02', received_date: '2026-09-16', response_date: '2026-09-16', response: 'APPROVED' }),
        buildStep({ level: '03', received_date: '2026-09-17', response_date: '2026-09-17', response: 'APPROVED' }),
      ]),
    );

    expect(chain.map(step => step.status)).toEqual(['approved', 'approved', 'approved']);
  });

  it('is case-insensitive when detecting a rejection in the response text', () => {
    const chain = mapSapWorkflowStatusToApprovalChain(
      buildStatus([buildStep({ received_date: '2026-09-15', response_date: '2026-09-15', response: 'Rejected' })]),
    );

    expect(chain[0].status).toBe('rejected');
  });

  it('prefers response_date over received_date, and falls back to null when neither is real', () => {
    const chain = mapSapWorkflowStatusToApprovalChain(
      buildStatus([
        buildStep({ received_date: '2026-09-15', response_date: '2026-09-16', response: 'APPROVED' }),
        buildStep({ received_date: '2026-09-17' }),
        buildStep(),
      ]),
    );

    expect(chain.map(step => step.date)).toEqual(['2026-09-16', '2026-09-17', null]);
  });

  it('returns an empty chain for an empty approval_chain', () => {
    expect(mapSapWorkflowStatusToApprovalChain(buildStatus([]))).toEqual([]);
  });
});
