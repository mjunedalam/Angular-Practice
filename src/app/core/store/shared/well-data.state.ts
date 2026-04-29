import { WwellEntry } from '@models/daily-operation/wwell-entry.model';
import { selectPageIndexForEpANum, selectWellNamesFromList } from './well-data.selectors';

export type RigStatusOverrides = Record<number, string>;

export function normalizeEpANum(value: number | string | null | undefined): number | null {
    const numericValue = typeof value === 'string' ? Number.parseInt(value, 10) : value ?? null;
    if (!Number.isFinite(numericValue) || numericValue === null || numericValue <= 0) return null;
    return numericValue;
}

export function updateRigStatusOverrides(
    overrides: RigStatusOverrides,
    epANumInput: number | string,
    rigStatus: string,
): RigStatusOverrides {
    const epANum = normalizeEpANum(epANumInput);
    if (epANum === null) return overrides;

    if (!rigStatus.trim()) {
        if (!(epANum in overrides)) return overrides;
        const { [epANum]: _removed, ...rest } = overrides;
        return rest;
    }

    if (overrides[epANum] === rigStatus) return overrides;
    return { ...overrides, [epANum]: rigStatus };
}

export function resolvePageForWellList(wellList: WwellEntry[], epANum: number | null, fallbackPage = 0): number {
    const names = selectWellNamesFromList(wellList);
    return selectPageIndexForEpANum(names, epANum, fallbackPage);
}
