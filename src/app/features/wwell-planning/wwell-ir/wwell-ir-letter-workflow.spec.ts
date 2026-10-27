import { IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';
import { resolveLetterWorkflow } from './wwell-ir.config';

function ir(overrides: Partial<IntegratedRequirement>): IntegratedRequirement {
  return { sapWfId: null, sapWfStatusText: null, chain: [], ...overrides } as IntegratedRequirement;
}

describe('resolveLetterWorkflow', () => {
  it('returns null when the IR was never submitted to SAP', () => {
    expect(resolveLetterWorkflow(ir({ sapWfId: null }))).toBeNull();
  });

  it('carries the workflow id, live status text and approval chain', () => {
    const result = resolveLetterWorkflow(
      ir({
        sapWfId: 77,
        sapWfStatusText: 'In Process',
        chain: [{ role: 'Manager', name: 'A. Reviewer', status: 'in-progress', date: null }],
      }),
    );

    expect(result).toEqual({
      workflowId: '77',
      workflowStatusText: 'In Process',
      workflowSteps: [{ role: 'Manager', name: 'A. Reviewer', status: 'in-progress', date: null }],
    });
  });
});
