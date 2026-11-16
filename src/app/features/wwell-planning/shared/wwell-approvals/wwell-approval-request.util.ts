import { ApprovalChainStep } from '@models/wwell-planning/wwell-planning.model';

const REQ_NO_MIN = 10000;
const REQ_NO_MAX = 99999;

const UINT32_RANGE = 0x100000000;

// Uniform integer in [min, max] from the CSPRNG (not Math.random — Fortify "Insecure Randomness").
// Rejection sampling discards the biased tail so every value stays equally likely.
function secureRandomInt(min: number, max: number): number {
  const span = max - min + 1;
  const limit = UINT32_RANGE - (UINT32_RANGE % span);
  const buffer = new Uint32Array(1);
  do {
    crypto.getRandomValues(buffer);
  } while (buffer[0] >= limit);
  return min + (buffer[0] % span);
}

export function generateApprovalReqNo(): string {
  return `REQ-${secureRandomInt(REQ_NO_MIN, REQ_NO_MAX)}`;
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
