import { IWellData } from '@models/well-design/well-data.model';
import { DatabaseInfoViewModel, WellHeaderViewModel } from '@models/active-wwell/active-wwell-view.model';
import { FALLBACK_STR } from 'src/app/core/store/shared/well-data.selectors';

export const ACTIVE_WWELL_FALLBACK = 'N/A';

export function getMissingDetailLabels(
  header: WellHeaderViewModel | null,
  dbInfo: DatabaseInfoViewModel | null,
): string[] {
  const missing: string[] = [];
  const isMissing = (v: unknown) => v == null || String(v).trim() === '' || String(v).trim() === FALLBACK_STR;

  if (!header || isMissing(header.wellName)) missing.push('Well Name');
  if (!header || isMissing(header.field)) missing.push('Field');
  if (!header || isMissing(header.depth)) missing.push('Target Depth');
  if (!header || isMissing(header.biNum)) missing.push('BI Number');

  if (!dbInfo || isMissing(dbInfo.rig)) missing.push('Rig');
  if (!dbInfo || isMissing(dbInfo.spudDate)) missing.push('Spud Date');

  return missing;
}

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
