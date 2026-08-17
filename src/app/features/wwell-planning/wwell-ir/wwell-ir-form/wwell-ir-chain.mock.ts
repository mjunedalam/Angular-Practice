import { ApprovalChainStep } from '@models/wwell-planning/wwell-planning.model';

/**
 * The approval-process API doesn't exist yet — WwellPlanningService.getIntegratedRequirementApprovalTimeline
 * mocks it with this pool until a real endpoint lands. Picked deterministically by `irSeq` (not
 * Math.random) so a given record's timeline stays the same across re-selections and matches what
 * the list row already previewed via mapIrHeaderSummaryToIntegratedRequirement, instead of
 * reshuffling — or flickering to a different stage — on every fetch.
 */
const WWELL_IR_CHAIN_MOCK_VARIANTS: readonly (readonly ApprovalChainStep[])[] = [
  [
    { role: 'Hydrogeologist', name: 'Eng. A. Al-Mutairi', status: 'in-progress', date: null },
    { role: 'Lead Hydrogeologist', name: 'Pending Assignment', status: 'pending', date: null },
    { role: 'Manager', name: 'Pending Assignment', status: 'pending', date: null },
  ],
  [
    { role: 'Hydrogeologist', name: 'Eng. S. Al-Dossari', status: 'approved', date: '2026-06-15' },
    { role: 'Lead Hydrogeologist', name: 'Eng. M. Al-Qahtani', status: 'in-progress', date: null },
    { role: 'Manager', name: 'Pending Assignment', status: 'pending', date: null },
  ],
  [
    { role: 'Hydrogeologist', name: 'Eng. F. Al-Harbi', status: 'approved', date: '2026-05-28' },
    { role: 'Lead Hydrogeologist', name: 'Eng. A. Al-Mutairi', status: 'approved', date: '2026-05-30' },
    { role: 'Manager', name: 'Eng. M. Al-Qahtani', status: 'in-progress', date: null },
  ],
  [
    { role: 'Hydrogeologist', name: 'Eng. M. Al-Qahtani', status: 'approved', date: '2026-05-15' },
    { role: 'Lead Hydrogeologist', name: 'Eng. S. Al-Dossari', status: 'approved', date: '2026-05-18' },
    { role: 'Manager', name: 'Eng. F. Al-Harbi', status: 'approved', date: '2026-05-22' },
  ],
  [
    { role: 'Hydrogeologist', name: 'Eng. A. Al-Mutairi', status: 'approved', date: '2026-06-20' },
    { role: 'Lead Hydrogeologist', name: 'Eng. M. Al-Qahtani', status: 'rejected', date: '2026-06-25' },
    { role: 'Manager', name: 'Pending Assignment', status: 'pending', date: null },
  ],
];

export function mockApprovalChainForIrSeq(irSeq: number): readonly ApprovalChainStep[] {
  const index = Math.abs(irSeq) % WWELL_IR_CHAIN_MOCK_VARIANTS.length;
  return WWELL_IR_CHAIN_MOCK_VARIANTS[index];
}
