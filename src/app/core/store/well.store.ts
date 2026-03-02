import { computed, inject } from '@angular/core';
import {
    patchState,
    signalStore,
    withComputed,
    withMethods,
    withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { map, pipe, switchMap, tap } from 'rxjs';
import { MorningReport } from '../../../models/morining-report.model';
import { IWellData } from '../../../models/well-design/wwell-data.model';
import { WellboreDiagramData } from '../../../models/well-design/wellbore-diagram.model';
import { WwellDataService } from '../../../services/wwell-data.service';
import { sortCasingsByDepthDesc } from '../../../utils/wellbore-math.util';
import { MoriningReportService } from '../../../services/morining-report.service';
import { WellName } from '../../../models/well-design/well-name.model';
import { IFormationTops } from '../../../shared/models/wwell/formation-tops.model';
import { WellLogsIndicators } from '../../../models/well-design/well-logs-indicators.model';

export interface MiscWellData {
    wellName: string;
    wellType: string;
    targetedAquifer: string;
    currentStatus: string;
    daysSinceSpud: number;
    targetDays: number;
    biNum: string;
    waterWell: string;
    footage: number;
    previousWell: string;
    currentDepth: number;
    nextWell: string;
    feetDrilledToday: number;
    targetDesc: string;
    supportingWell: string;
}

export interface PickedFormationTops {
    formation: string;
    depth: number;
    remarks: string;
}

export interface OffsetWaterWells {
    wellName: string;
    aquifer: string;
    tds: number;
    rpm: number;
    h2s: number;
    distance: number;
    productivity: number;
    rate: number;
}

interface WellState {
    readonly wellNames: WellName[];
    readonly selectedEpANum: number | null;
    readonly wellDetails: IWellData | null;
    readonly loading: boolean;
    readonly error: string | null;
    readonly animationTrigger: number;
}

const initialState: WellState = {
    wellNames: [],
    selectedEpANum: null,
    wellDetails: null,
    loading: false,
    error: null,
    animationTrigger: 0,
};

const FALLBACK_STR = 'N/A';

function mapToMiscWellData(d: IWellData | null): MiscWellData | null {
    if (!d) return null;
    const rigActivity = d.RIG_ACTIVITY?.[0];
    const drlgOpStatus = d.DRLG_OP_STATUS?.[0];

    return {
        wellName: rigActivity?.wellName ?? d.WELL_MASTER?.[0]?.well ?? FALLBACK_STR,
        targetDesc: rigActivity?.welltype ?? rigActivity?.drlgPlanWellDesc ?? FALLBACK_STR,
        targetedAquifer: d.EXAD_GWD_IR_HYDROGEOLOGY?.[0]?.estTargetAquifier ?? FALLBACK_STR,
        currentStatus: drlgOpStatus?.nxt24HrPlanRmk ?? drlgOpStatus?.wOpRmk ?? FALLBACK_STR,
        daysSinceSpud: drlgOpStatus?.spuddays ?? 0,
        targetDays: d.NEW_TARGET_DAYS?.[0]?.targetDays ?? rigActivity?.wDrlgTrgtDay ?? 0,
        biNum: rigActivity?.biNum ?? FALLBACK_STR,
        supportingWell: rigActivity?.waterWell ?? FALLBACK_STR,
        feetDrilledToday: d.DRLG_FD_TDAY?.[0]?.footage ?? drlgOpStatus?.footage ?? 0,
        previousWell: FALLBACK_STR,
        currentDepth: drlgOpStatus?.wPrsntDpth ?? 0,
        nextWell: d.NEXT_2_WELL_ACTIVITY?.[0]?.nextWellActivity ?? FALLBACK_STR,

        wellType: '',

        waterWell: '',
        footage: 0,

    };
}

export const WellStore = signalStore(
    { providedIn: 'root' },
    withState<WellState>(initialState),

    withComputed(({ wellDetails, wellNames }) => ({

        uniqueWellNames: computed(() => {
            const seen = new Set<string>();
            return wellNames().filter((w) => {
                if (seen.has(w.wellName)) return false;
                seen.add(w.wellName);
                return true;
            });
        }),

        isLoaded: computed(() => wellDetails() !== null),

        totalDepth: computed(
            () => wellDetails()?.EXAD_RCD_PREWAP?.[0]?.estTargetDepth ?? 4000,
        ),

        diagramData: computed((): WellboreDiagramData | null => {
            const d = wellDetails();
            if (!d) return null;
            return {
                wellName: d.WELL_MASTER?.[0]?.well ?? '',
                totalDepth: d.EXAD_RCD_PREWAP?.[0]?.estTargetDepth ?? 4000,
                casings: sortCasingsByDepthDesc(d.EXAD_GWD_IR_CASING ?? []),
                geologicTops: [...(d.EXAD_GWD_IR_TOPS ?? [])].sort(
                    (a, b) => a.planTvdDepth - b.planTvdDepth,
                ),
                hydrogeology: d.EXAD_GWD_IR_HYDROGEOLOGY?.[0] ?? null,
                prewap: d.EXAD_RCD_PREWAP?.[0] ?? null,
                rigActivity: d.RIG_ACTIVITY?.[0] ?? null,
                currentDepth:
                    d.DRLG_OP_STATUS?.[0]?.wPrsntDpth ??
                    d.EXAD_RCD_PREWAP?.[0]?.estTargetDepth ??
                    0,
            };
        }),

        miscWellData: computed(() => mapToMiscWellData(wellDetails())),

        pickedFormations: computed((): PickedFormationTops[] => {
            return (wellDetails()?.DRLG_FM_TOPS ?? []).map((fm: IFormationTops) => ({
                formation: fm.stLongCd ?? '',
                depth: fm.wStDmrkDpth ?? 0,
                remarks: fm.wStDmrkRmk ?? ''
            }));
        }),

        offsetWells: computed((): OffsetWaterWells[] => {
            const d = wellDetails();
            if (!d) return [];

            const offsetData = d.EXAD_GWD_IR_WATER ?? [];
            const testOutcomes = d.WATER_WELL_TEST_OUTCOME ?? [];
            return offsetData.map((ow) => {
                const test = testOutcomes.find(t => t.wellName === ow.offsetWaterWell);
                return {
                    wellName: ow.offsetWaterWell,
                    aquifer: ow.aquifer || test?.aquifer || 'WASI',
                    tds: test?.tds ?? 0,
                    rpm: ow?.rpm ?? 0,
                    h2s: ow.h2s,
                    distance: ow.distance ?? 0,
                    productivity: d.EXAD_GWD_IR_HYDROGEOLOGY?.[0]?.estProductivity ?? 2.1,
                    rate: test?.flowRate ?? ow.flowRate ?? 930
                };
            });
        }),

        wellsLogsIndicators: computed<WellLogsIndicators | null>(() => {
            const d = wellDetails();
            if (!d) return null;

            const header = d.EXAD_GWD_IR_HEADER?.[0];
            return {
                rcc: !!header?.dtRemarks,          // corrected property name
                mudLog: !!header?.mudRemarks,      // corrected property name
                logging: !!header?.loggingRemarks // corrected typo
            };
        }),

    })),

    withMethods((store, wellDataService = inject(WwellDataService), morningReportService = inject(MoriningReportService)) => {
        const selectWell = rxMethod<number>(
            pipe(
                tap((epANum) =>
                    patchState(store, {
                        selectedEpANum: epANum,
                        loading: true,
                        error: null,
                    }),
                ),
                switchMap((epANum) =>
                    wellDataService.getWellDetails(epANum).pipe(
                        tapResponse({
                            next: (wellDetails) =>
                                patchState(store, {
                                    wellDetails,
                                    loading: false,
                                    animationTrigger: store.animationTrigger() + 1,
                                }),
                            error: (err: Error) =>
                                patchState(store, {
                                    error: err.message ?? 'Failed to load well details',
                                    loading: false,
                                }),
                        }),
                    ),
                ),
            ),
        );

        const loadWellNames = rxMethod<void>(
            pipe(
                tap(() => patchState(store, { loading: true, error: null })),
                switchMap(() =>
                    morningReportService.getMorningReport().pipe(
                        map((reports: MorningReport[]) =>
                            reports.map((report) => ({
                                wellName: report.wGnrName,
                                epANum: Number(report.epANum)
                            }))
                        ),
                        tapResponse({
                            next: (wellNames) => {
                                patchState(store, { wellNames, loading: false });
                                if (wellNames.length > 0 && !store.selectedEpANum()) {
                                    selectWell(wellNames[0].epANum);
                                }
                            },
                            error: (err: Error) =>
                                patchState(store, {
                                    error: err.message ?? 'Failed to load well names',
                                    loading: false,
                                }),
                        }),
                    ),
                ),
            ),
        );
        return {
            selectWell,
            loadWellNames,

        };
    }),
);
