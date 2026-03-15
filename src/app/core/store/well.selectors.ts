import { IWellData } from '../../../models/well-design/wwell-data.model';
import { IFormationTops } from '../../../shared/models/wwell/formation-tops.model';
import { IHeaderIR } from '../../../shared/models/wwell/header-ir.model';
import { WellLogsIndicators } from '../../../models/well-design/well-logs-indicators.model';
import { WellboreDiagramData } from '../../../models/well-design/wellbore-diagram.model';
import { WellName } from '../../../models/well-design/well-name.model';
import { sortCasingsByDepthDesc } from '../../../utils/wellbore-math.util';

import {
    MiscWellData,
    OffsetWaterWells,
    PickedFormationTops,
} from './well.store';

export const PAGE_SIZE = 5;
export const FALLBACK_STR = 'N/A';

export function uniqueByWellName(names: WellName[]): WellName[] {
    const seen = new Set<string>();
    return names.filter(w => {
        if (seen.has(w.wellName)) return false;
        seen.add(w.wellName);
        return true;
    });
}

export function selectTotalPages(unique: WellName[]): number {
    return Math.ceil(unique.length / PAGE_SIZE);
}

export function selectPagedWellNames(unique: WellName[], page: number): WellName[] {
    return unique.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
}

export function selectHasPrevPage(page: number): boolean {
    return page > 0;
}

export function selectHasNextPage(unique: WellName[], page: number): boolean {
    return (page + 1) * PAGE_SIZE < unique.length;
}

export function selectTotalDepth(d: IWellData | null): number {
    return d?.EXAD_RCD_PREWAP?.[0]?.estTargetDepth ?? 0;
}

export function selectDiagramData(d: IWellData | null): WellboreDiagramData | null {
    if (!d) return null;
    return {
        wellName: d.WELL_MASTER?.[0]?.well ?? '',
        totalDepth: d.EXAD_RCD_PREWAP?.[0]?.estTargetDepth ?? 0,
        casings: sortCasingsByDepthDesc(d.EXAD_GWD_IR_CASING ?? []),
        geologicTops: [...(d.EXAD_GWD_IR_TOPS ?? [])].sort((a, b) => a.planTvdDepth - b.planTvdDepth),
        hydrogeology: d.EXAD_GWD_IR_HYDROGEOLOGY?.[0] ?? null,
        prewap: d.EXAD_RCD_PREWAP?.[0] ?? null,
        rigActivity: d.RIG_ACTIVITY?.[0] ?? null,
        currentDepth: d.DRLG_OP_STATUS?.[0]?.wPrsntDpth ?? 0

    };
}

export function selectMiscWellData(d: IWellData | null): MiscWellData | null {
    if (!d) return null;
    const rig = d.RIG_ACTIVITY?.[0];
    const status = d.DRLG_OP_STATUS?.[0];
    return {
        wellName: rig?.wellName ?? FALLBACK_STR,
        targetDesc: rig?.drlgPlanWellDesc ?? FALLBACK_STR,
        targetedAquifer: d.EXAD_GWD_IR_HYDROGEOLOGY?.[0]?.estTargetAquifier ?? FALLBACK_STR,
        currentStatus: status?.nxt24HrPlanRmk ?? status?.wOpRmk ?? FALLBACK_STR,
        daysSinceSpud: status?.spuddays ?? 0,
        targetDays: d.NEW_TARGET_DAYS?.[0]?.targetDays ?? rig?.wDrlgTrgtDay ?? 0,
        biNum: rig?.biNum ?? FALLBACK_STR,
        supportingWell: rig?.waterWell ?? FALLBACK_STR,
        feetDrilledToday: d.DRLG_FD_TDAY?.[0]?.footage ?? status?.footage ?? 0,
        previousWell: FALLBACK_STR,
        currentDepth: status?.wPrsntDpth ?? 0,
        nextWell: d.NEXT_2_WELL_ACTIVITY?.[0]?.nextWellActivity ?? FALLBACK_STR,
        footage: status?.wDpthChgDis,

    };
}

export function selectPickedFormations(d: IWellData | null): PickedFormationTops[] {
    return (d?.DRLG_FM_TOPS ?? []).map((fm: IFormationTops) => ({
        formation: fm.stLongCd ?? '',
        depth: fm.wStDmrkDpth ?? 0,
        remarks: fm.wStDmrkRmk ?? '',
    }));
}

export function selectOffsetWells(d: IWellData | null): OffsetWaterWells[] {
    if (!d) return [];
    return (d.EXAD_GWD_IR_WATER ?? []).map(ow => {
        const test = (d.WATER_WELL_TEST_OUTCOME ?? []).find(t => t.wellName === ow.offsetWaterWell);
        return {
            wellName: ow.offsetWaterWell,
            aquifer: ow.aquifer || test?.aquifer || 'WASI',
            tds: test?.tds ?? 0,
            rpm: ow.rpm ?? 0,
            h2s: ow.h2s,
            distance: ow.distance ?? 0,
            productivity: ow?.specificCapacity ?? 0,
            rate: test?.flowRate ?? ow.flowRate ?? 0,
        };
    });
}

export function selectWellLogsIndicators(d: IWellData | null): WellLogsIndicators | null {
    if (!d) return null;
    const h: IHeaderIR | undefined = d.EXAD_GWD_IR_HEADER?.[0];
    return {
        rcc: !!(h?.dtRemarks?.trim()),
        mudLog: !!(h?.mudRemarks?.trim()),
        logging: !!(h?.loggingRemarks?.trim()),
    };
}