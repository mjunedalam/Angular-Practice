import { IWellData } from '@models/well-design/well-data.model';

export const ACTIVE_WWELL_FALLBACK = 'N/A';

export function normalizeStatusName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function deriveStatusLabel(details: IWellData | null): string {
  const rigIdentification = details?.RIG_IDENTIFICATION?.[0] as Record<string, unknown> | undefined;
  const rigStateCode = typeof rigIdentification?.['wRigActStsCd'] === 'string'
    ? rigIdentification['wRigActStsCd']
    : null;

  if (rigStateCode === 'A') {
    return 'Active';
  }

  if (rigStateCode === 'I') {
    return 'Inactive';
  }

  if ((details?.DRLG_OP_STATUS?.[0]?.wPrsntDpth ?? 0) > 0) {
    return 'Active';
  }

  return ACTIVE_WWELL_FALLBACK;
}
