import { ApprovalChainStep } from '@models/wwell-planning/wwell-planning.model';

const REQ_NO_MIN = 10000;
const REQ_NO_MAX = 99999;

export function generateApprovalReqNo(): string {
  const digits = Math.floor(Math.random() * (REQ_NO_MAX - REQ_NO_MIN + 1)) + REQ_NO_MIN;
  return `REQ-${digits}`;
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

// Freshly submitted requests start with their first reviewer in progress and the rest unassigned.
export function buildInitialApprovalChain(roles: readonly string[], submittedBy: string): ApprovalChainStep[] {
  return roles.map((role, i) => ({
    role,
    name: i === 0 ? submittedBy : 'Pending Assignment',
    status: i === 0 ? 'in-progress' : 'pending',
    date: null,
  }));
}
