import { IWellData } from '@models/well-design/well-data.model';
import { DEFAULT_NOTIFICATION_DURATION_MS } from '@shared/components/notification/notification.service';
import { getTodayAtMidnight } from 'src/app/shared/utils/date.util';

import {
    selectPageIndexForEpANum,
    selectPagedWellNames,
    selectWellEpANum,
    selectWellNamesFromData,
    uniqueByEpANum,
} from '@store/drilling-data/drilling-data.selectors';

export type RigStatusOverrides = Record<number, string>;

export interface DrillingDataState {
    readonly allWellsData: IWellData[];
    readonly selectedEpANum: number | null;
    readonly selectedDate: Date;
    readonly loading: boolean;
    readonly error: string | null;
    readonly animationTrigger: number;
    readonly hasLoadedOnce: boolean;
    readonly wellNamesPage: number;
    readonly rigStatusOverrides: RigStatusOverrides;
    readonly notificationDurationMs: number;
}

export const initialDrillingDataState: DrillingDataState = {
    allWellsData: [],
    selectedEpANum: null,
    selectedDate: getTodayAtMidnight(),
    loading: false,
    error: null,
    animationTrigger: 0,
    hasLoadedOnce: false,
    wellNamesPage: 0,
    rigStatusOverrides: {},
    notificationDurationMs: DEFAULT_NOTIFICATION_DURATION_MS,
};

export function normalizeEpANum(value: number | string | null | undefined): number | null {
    const numericValue = typeof value === 'string' ? Number.parseInt(value, 10) : value ?? null;

    if (!Number.isFinite(numericValue) || numericValue === null || numericValue <= 0) {
        return null;
    }

    return numericValue;
}

export function hasWellForEpANum(data: IWellData[], epANum: number | null): boolean {
    return epANum !== null && data.some(well => selectWellEpANum(well) === epANum);
}

export function firstWellEpANum(data: IWellData[], page = 0): number | null {
    const unique = uniqueByEpANum(selectWellNamesFromData(data));
    return selectPagedWellNames(unique, page)[0]?.epANum ?? null;
}

export function resolvePageForSelection(
    data: IWellData[],
    epANum: number | null,
    fallbackPage = 0,
): number {
    const unique = uniqueByEpANum(selectWellNamesFromData(data));
    return selectPageIndexForEpANum(unique, epANum, fallbackPage);
}

export function resolveSelectionAfterDataLoad(
    data: IWellData[],
    currentSelectedEpANum: number | null,
    options: { autoSelectFirst: boolean },
): { selectedEpANum: number | null; wellNamesPage: number } {
    const unique = uniqueByEpANum(selectWellNamesFromData(data));

    if (!unique.length) {
        return {
            selectedEpANum: null,
            wellNamesPage: 0,
        };
    }

    const nextSelectedEpANum = hasWellForEpANum(data, currentSelectedEpANum)
        ? currentSelectedEpANum
        : options.autoSelectFirst
            ? unique[0].epANum
            : null;

    return {
        selectedEpANum: nextSelectedEpANum,
        wellNamesPage: selectPageIndexForEpANum(unique, nextSelectedEpANum, 0),
    };
}

export function updateRigStatusOverrides(
    overrides: RigStatusOverrides,
    epANumInput: number | string,
    rigStatus: string,
): RigStatusOverrides {
    const epANum = normalizeEpANum(epANumInput);

    if (epANum === null) {
        return overrides;
    }

    if (!rigStatus.trim()) {
        if (!(epANum in overrides)) {
            return overrides;
        }

        const { [epANum]: _removed, ...rest } = overrides;
        return rest;
    }

    if (overrides[epANum] === rigStatus) {
        return overrides;
    }

    return {
        ...overrides,
        [epANum]: rigStatus,
    };
}

export function removeRigStatusOverride(
    overrides: RigStatusOverrides,
    epANumInput: number | string | null | undefined,
): RigStatusOverrides {
    const epANum = normalizeEpANum(epANumInput);

    if (epANum === null || !(epANum in overrides)) {
        return overrides;
    }

    const { [epANum]: _removed, ...rest } = overrides;
    return rest;
}

export function upsertWellData(data: IWellData[], wellData: IWellData): IWellData[] {
    const epANum = selectWellEpANum(wellData);

    if (epANum === null) {
        return [...data, wellData];
    }

    const existingIndex = data.findIndex(well => selectWellEpANum(well) === epANum);

    if (existingIndex === -1) {
        return [...data, wellData];
    }

    return data.map((well, index) => (index === existingIndex ? wellData : well));
}

export function removeWellData(
    data: IWellData[],
    epANumInput: number | string | null | undefined,
): IWellData[] {
    const epANum = normalizeEpANum(epANumInput);

    if (epANum === null) {
        return data;
    }

    return data.filter(well => selectWellEpANum(well) !== epANum);
}
