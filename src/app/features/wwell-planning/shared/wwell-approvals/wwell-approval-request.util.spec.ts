import { generateApprovalReqNo } from './wwell-approval-request.util';

describe('generateApprovalReqNo', () => {
  it('always yields REQ- followed by a 5-digit number in range', () => {
    for (let i = 0; i < 2000; i++) {
      const reqNo = generateApprovalReqNo();
      expect(reqNo).toMatch(/^REQ-\d{5}$/);
      const n = Number(reqNo.slice(4));
      expect(n).toBeGreaterThanOrEqual(10000);
      expect(n).toBeLessThanOrEqual(99999);
    }
  });

  it('does not repeat the same value every call', () => {
    const seen = new Set(Array.from({ length: 50 }, () => generateApprovalReqNo()));
    expect(seen.size).toBeGreaterThan(1);
  });
});
