import { IWellData } from '@models/well-design/well-data.model';
import { WellLogsIndicators } from '@models/well-design/well-logs-indicators.model';
import { WellName } from '@models/well-design/well-name.model';
import { WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { MorningReport } from '@models/morning-report/morning-report.model';
import {
    CasingInfoViewModel,
    DatabaseInfoViewModel,
    FormationInfoViewModel,
    MiscWellData,
    OffsetWaterWells,
    OperationSummaryViewModel,
    PickedFormationTops,
    WellHeaderViewModel,
    WellTestResult,
    WwellTestViewModel,
} from '@models/active-wwell/active-wwell-view.model';
import { IFormationTops } from 'src/app/shared/models/wwell/formation-tops.model';
import { IHeaderIR } from 'src/app/shared/models/wwell/header-ir.model';
import { ICasingIR } from 'src/app/shared/models/wwell/casing-ir.model';
import { ITopsIR } from 'src/app/shared/models/wwell/tops-ir.model';
import { IWaterIR } from 'src/app/shared/models/wwell/water-ir.model';
import { IWaterWellTestOutcome } from 'src/app/shared/models/wwell/water-well-test-outcome.model';
import { WaterWellTestResult, WellTestType } from 'src/app/shared/models/wwell/wwell-test-result.model';
import { WwellEntry } from '@models/daily-operation/wwell-entry.model';
import { sortCasingsByDepthDesc } from 'src/app/shared/utils/wellbore-math.util';
import { formatDateForInput } from 'src/app/shared/utils/date.util';

export const PAGE_SIZE = 5;
export const FALLBACK_STR = 'N/A';

function coercePositiveEpANum(value: number | string | null | undefined): number | null {
    const numericValue = typeof value === 'string' ? Number.parseInt(value, 10) : value ?? null;
    if (!Number.isFinite(numericValue) || numericValue === null || numericValue <= 0) return null;
    return numericValue;
}

// ─── Well list / pagination ────────────────────────────────────────────────────

export function selectWellNamesFromList(wellList: WwellEntry[]): WellName[] {
    return wellList.flatMap((entry) => {
        const epANum = coercePositiveEpANum(entry.epANum);
        return epANum === null ? [] : [{ wellName: entry.wellName, epANum }];
    });
}

export function selectTotalPages(names: WellName[]): number {
    return Math.ceil(names.length / PAGE_SIZE);
}

export function selectPagedWellNames(names: WellName[], page: number): WellName[] {
    return names.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
}

export function selectPageIndexForEpANum(names: WellName[], epANum: number | null, fallbackPage = 0): number {
    if (epANum === null) return fallbackPage;
    const index = names.findIndex(w => w.epANum === epANum);
    return index === -1 ? fallbackPage : Math.floor(index / PAGE_SIZE);
}

export function selectHasPrevPage(page: number): boolean {
    return page > 0;
}

export function selectHasNextPage(names: WellName[], page: number): boolean {
    return (page + 1) * PAGE_SIZE < names.length;
}

// ─── Well data helpers ─────────────────────────────────────────────────────────

export function selectWellEpANum(d: IWellData | null | undefined): number | null {
    const epANum = d?.DRLG_OP_STATUS?.[0]?.epANum ?? null;
    return Number.isFinite(epANum) && (epANum ?? 0) > 0 ? epANum : null;
}

export function selectTotalDepth(d: IWellData | null): number {
    return d?.EXAD_RCD_PREWAP?.[0]?.estTargetDepth ?? 0;
}

export function selectStatus(d: IWellData | null): string {
    return d?.EXAD_GWD_DAILY_REMARKS?.[0]?.status ?? "";
}
export function selectArea(d: IWellData | null): string {
    return d?.EXAD_GWD_DAILY_REMARKS?.[0]?.area ?? "";
}

export function selectPrimaryCasing(d: IWellData | null): ICasingIR | null {
    const casings = [...(d?.EXAD_GWD_IR_CASING ?? [])].sort(
        (l, r) => Number(r.csgDepth ?? 0) - Number(l.csgDepth ?? 0),
    );
    return casings[0] ?? null;
}

export function selectCasing(d: IWellData | null): ICasingIR[] | null {
    const casings = [...(d?.EXAD_GWD_IR_CASING ?? [])].sort(
        (l, r) => Number(r.csgDepth ?? 0) - Number(l.csgDepth ?? 0),
    );
    return casings ?? null;
}

export function selectLatestFormation(d: IWellData | null): IFormationTops | null {
    const formations = d?.DRLG_FM_TOPS ?? [];
    return formations.length ? formations[formations.length - 1] : null;
}

export function findPlannedFormation(d: IWellData | null, formationCode: string | null | undefined): ITopsIR | null {
    if (!formationCode) return null;
    return d?.EXAD_GWD_IR_TOPS?.find(top => top.stLongCd === formationCode) ?? null;
}

export function selectPrimaryTestOutcome(d: IWellData | null): IWaterWellTestOutcome | null {
    return d?.EXAD_GWD_WELL_TESTS?.[0] ?? null;
}

export function selectPrimaryWaterReference(d: IWellData | null): IWaterIR | null {
    return d?.EXAD_GWD_IR_WATER?.[0] ?? null;
}

export function displayValue(value: unknown, fallback = FALLBACK_STR): string {
    return value === null || value === undefined || value === '' ? fallback : String(value);
}

// ─── Well data selectors ───────────────────────────────────────────────────────

export function selectDiagramData(d: IWellData | null): WellboreDiagramData | null {
    if (!d) return null;
    return {
        wellName: d.WELL_MASTER?.[0]?.well ?? '',
        totalDepth: d.EXAD_RCD_PREWAP?.[0]?.estTargetDepth ?? 0,
        casings: sortCasingsByDepthDesc(d.EXAD_GWD_IR_CASING ?? []),
        drlgCasings: [...(d.DRLG_CSG ?? [])].sort((a, b) => b.wCsgBotDpth - a.wCsgBotDpth),
        geologicTops: [...(d.EXAD_GWD_IR_TOPS ?? [])].sort((a, b) => a.planTvdDepth - b.planTvdDepth),
        hydrogeology: d.EXAD_GWD_IR_HYDROGEOLOGY?.[0] ?? null,
        prewap: d.EXAD_RCD_PREWAP?.[0] ?? null,
        rigActivity: d.RIG_ACTIVITY?.[0] ?? null,
        currentDepth: d.DRLG_OP_STATUS?.[0]?.wPrsntDpth ?? 0,
        mudCirculation: (d.MUD_CIRC ?? []).map(m => ({
            depth: m.wPrsntDpth,
            pct: Number(m.wMudCircPc),
        })),
        wellDesign: d.EXAD_GWD_WELL_DESIGN?.[0] ?? null,
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
        currentStatus: d.EXAD_GWD_DAILY_REMARKS?.[0]?.status ?? FALLBACK_STR,
        daysSinceSpud: status?.spuddays ?? 0,
        targetDays: d.NEW_TARGET_DAYS?.[0]?.targetDays ?? rig?.wDrlgTrgtDay ?? 0,
        biNum: rig?.biNum ?? FALLBACK_STR,
        supportingWell: rig?.waterWell ?? FALLBACK_STR,
        feetDrilledToday: d.DRLG_FD_TDAY?.[0]?.footage ?? status?.footage ?? 0,
        previousWell: FALLBACK_STR,
        currentDepth: status?.wPrsntDpth ?? 0,
        nextWell: d.NEXT_2_WELL_ACTIVITY?.[0]?.nextWellActivity ?? FALLBACK_STR,
        footage: status?.wDpthChgDis ?? 0,
        operationSummary: d?.EXAD_GWD_DAILY_REMARKS?.[0]?.opRmk ?? d?.DRLG_OP_SMRY?.[0]?.wOpRmk,
        next24HrOperation: d?.EXAD_GWD_DAILY_REMARKS?.[0]?.next24HrPlanRrmk ?? status?.nxt24HrPlanRmk,
        drlgSmryRmk: d?.EXAD_GWD_DAILY_REMARKS?.[0]?.drlgSmryRmk ?? status?.wDrlgSmryRmk ?? null,
        rop: d.ROP_DATA?.[0]?.rop ?? null,
        actualRm: d.actualRm ?? null,
        kpiRm: d.kpiRm ?? null,
        rigMoveDays: d?.rigMoveDays ?? null,
        rigName: d.RIG_IDENTIFICATION?.[0]?.rigname ?? FALLBACK_STR,
        spudDate: rig?.spuddate ?? FALLBACK_STR,
        holeSize: (() => {
            const items = d.DRLG_OP_SMRY ?? [];
            if (!items.length) return null;
            const maxItem = items.reduce((best, cur) =>
                cur.wHoleEndDpth > best.wHoleEndDpth ? cur : best
            );
            return maxItem.wHolSz ?? null;
        })(),
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
        const test = (d.EXAD_GWD_WELL_TESTS ?? []).find(t => t.wellName === ow.offsetWaterWell);
        return {
            wellName: ow.offsetWaterWell,
            aquifer: ow.aquifer || test?.rsvrCd || 'WASI',
            tds: test?.wtrSaTdsCnc ?? 0,
            rpm: ow.rpm ?? 0,
            h2s: ow.h2s ?? 0,
            distance: ow.distance ?? 0,
            productivity: ow.specificCapacity ?? 0,
            rate: test?.hydProdRt ?? ow.flowRate ?? 0,
            direction: ow?.direction ?? "NA",
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

export interface WellLogsRemarks {
    readonly dtRemarks: string | null;
    readonly mudRemarks: string | null;
    readonly loggingRemarks: string | null;
}

export function selectWellLogsRemarks(d: IWellData | null): WellLogsRemarks | null {
    if (!d) return null;
    const h: IHeaderIR | undefined = d.EXAD_GWD_IR_HEADER?.[0];
    if (!h) return null;
    return {
        dtRemarks: h.dtRemarks?.trim() || null,
        mudRemarks: h.mudRemarks?.trim() || null,
        loggingRemarks: h.loggingRemarks?.trim() || null,
    };
}

function resolveTestType(t: IWaterWellTestOutcome): WellTestType {
    const code = (t.hydTestTypCd ?? '').toUpperCase().trim();
    return code === 'FLOW' ? 'FLOW' : 'PUMP';
}

export function selectWellTestResults(d: IWellData | null): WellTestResult[] {
    if (!d) return [];
    return (d.EXAD_GWD_WELL_TESTS ?? []).map(t => {
        const testType = resolveTestType(t);
        return {
            wellName: t.wellName ?? '',
            testType,
            aquifer: t.rsvrCd ?? FALLBACK_STR,
            rpm: testType === 'PUMP' ? (t.rpm ?? 0) : 0,
            siwhp: testType === 'FLOW' ? (t.siwhp ?? 0) : 0,
            flowRate: t.hydProdRt ?? 0,
            temperature: t.temp ?? 0,
            tds: t.wtrSaTdsCnc ?? 0,
            productivity: t.hydProduct ?? 0,
            h2s: t.hydH2sCnc ?? 0,
        };
    });
}

// ─── View model selectors ──────────────────────────────────────────────────────

export function selectWellHeaderViewModel(d: IWellData | null, epANum: number | null): WellHeaderViewModel | null {
    if (!d) return null;
    const rig = d.RIG_ACTIVITY?.[0];
    const master = d.WELL_MASTER?.[0];
    const prewap = d.EXAD_RCD_PREWAP?.[0];
    const hydro = d.EXAD_GWD_IR_HYDROGEOLOGY?.[0];
    const status = d.DRLG_OP_STATUS?.[0];
    return {
        field: prewap?.supportedBusiness ?? rig?.wDrlgLocDesc ?? rig?.welltype ?? FALLBACK_STR,
        wellName: rig?.wellName ?? master?.well ?? FALLBACK_STR,
        lat: master?.lat ?? FALLBACK_STR,
        lon: master?.lon ?? FALLBACK_STR,
        targetedAquifer: hydro?.estTargetAquifier ?? prewap?.targetFormation ?? FALLBACK_STR,
        depth: prewap?.estTargetDepth ?? status?.targetDepth ?? FALLBACK_STR,
        epNum: status?.epANum ?? epANum ?? FALLBACK_STR,
        biNum: rig?.biNum ?? FALLBACK_STR,
    };
}

export function selectDatabaseInfoViewModel(d: IWellData | null, date: Date): DatabaseInfoViewModel | null {
    if (!d) return null;
    const rig = d.RIG_ACTIVITY?.[0];
    const status = d.DRLG_OP_STATUS?.[0];
    const prewap = d.EXAD_RCD_PREWAP?.[0];
    const casing = selectPrimaryCasing(d);
    return {
        date: formatDateForInput(date),
        daysSinceSpud: status?.spuddays ?? FALLBACK_STR,
        spudDate: rig?.spuddate ?? FALLBACK_STR,
        fiveAmDepth: status?.wPrsntDpth ?? FALLBACK_STR,
        lastCasingSize: displayValue(casing?.csgSize ?? status?.wCsgOdSz),
        rig: rig?.wRigCd ?? FALLBACK_STR,
        targetDate: rig?.wDrlgEndDt ?? FALLBACK_STR,
        releaseDate: rig?.wDrlgEndDt ?? FALLBACK_STR,
        preFiveAmDepth: status?.wPrevDpth ?? FALLBACK_STR,
        lastCasingDepth: casing?.csgDepth ?? status?.wCsgBotDpth ?? FALLBACK_STR,
        spudDays: status?.spuddays ?? FALLBACK_STR,
        samDepth: status?.targetDepth ?? prewap?.estTargetDepth ?? FALLBACK_STR,
        rigMoveKpi: d.kpiRm ?? FALLBACK_STR,
        wellTdDate: rig?.wDrlgEndDt ?? FALLBACK_STR,
        footage: status?.wDpthChgDis ?? FALLBACK_STR,
        secondarySamDepth: prewap?.estTargetDepth ?? FALLBACK_STR,
    };
}

export function selectOperationSummaryViewModel(d: IWellData | null): OperationSummaryViewModel | null {
    if (!d) return null;
    const remarks = d.EXAD_GWD_DAILY_REMARKS?.[0];
    const status = d.DRLG_OP_STATUS?.[0];
    return {
        operation: remarks?.opRmk ?? status?.wOpRmk ?? FALLBACK_STR,
        nextOperation: remarks?.next24HrPlanRrmk ?? status?.nxt24HrPlanRmk ?? FALLBACK_STR,
        drillingRemarks: remarks?.drlgSmryRmk ?? status?.wDrlgSmryRmk ?? FALLBACK_STR,
    };
}

export function selectFormationInfoViewModel(d: IWellData | null): FormationInfoViewModel | null {
    if (!d) return null;
    const latest = selectLatestFormation(d);
    const planned = findPlannedFormation(d, latest?.stLongCd);
    const actualDepth = latest?.wStDmrkDpth ?? null;
    const plannedDepth = planned?.planTvdDepth ?? null;
    return {
        formation: latest?.stLongCd ?? FALLBACK_STR,
        prognosed: plannedDepth ?? FALLBACK_STR,
        actualDepth: actualDepth ?? FALLBACK_STR,
        difference: actualDepth !== null && plannedDepth !== null ? actualDepth - plannedDepth : FALLBACK_STR,
        remarks: latest?.wStDmrkRmk ?? FALLBACK_STR,
    };
}

export function selectCasingInfoViewModel(d: IWellData | null): CasingInfoViewModel | null {
    if (!d) return null;
    const casing = selectPrimaryCasing(d);
    const status = d.DRLG_OP_STATUS?.[0];
    return {
        csgType: casing?.csgType ?? FALLBACK_STR,
        csgSize: casing?.csgSize ?? status?.wCsgOdSz ?? FALLBACK_STR,
        csgDepth: casing?.csgDepth ?? FALLBACK_STR,
        csgBotDpth: status?.wCsgBotDpth ?? FALLBACK_STR,
    };
}

export function allCasingData(d: IWellData | null): CasingInfoViewModel[] | null {
    if (!d) return null;
    const casing = selectCasing(d);
    const status = d.DRLG_OP_STATUS?.[0];

    return casing!.map(cas => {
        if (cas) { /* empty */ }
        return {
            csgType: cas?.csgType ?? FALLBACK_STR,
            csgSize: cas?.csgSize ?? status?.wCsgOdSz ?? FALLBACK_STR,
            csgDepth: cas?.csgDepth ?? FALLBACK_STR,
            csgBotDpth: status?.wCsgBotDpth ?? FALLBACK_STR,
        }
    })
    // return {
    //     csgType: casing?.csgType ?? FALLBACK_STR,
    //     csgSize: casing?.csgSize ?? status?.wCsgOdSz ?? FALLBACK_STR,
    //     csgDepth: casing?.csgDepth ?? FALLBACK_STR,
    //     csgBotDpth: status?.wCsgBotDpth ?? FALLBACK_STR,
    // };
}

export function selectWwellTestViewModel(d: IWellData | null): WwellTestViewModel | null {
    if (!d) return null;
    const hydro = d.EXAD_GWD_IR_HYDROGEOLOGY?.[0];
    const testOutcome = selectPrimaryTestOutcome(d);
    const water = selectPrimaryWaterReference(d);
    const status = d.DRLG_OP_STATUS?.[0];
    const statusRecord = status as unknown as Record<string, unknown> | undefined;
    const drillingEngineer = typeof statusRecord?.['wDrlgEngName'] === 'string' ? statusRecord['wDrlgEngName'] : null;
    const foreman = typeof statusRecord?.['wFmanName'] === 'string' ? statusRecord['wFmanName'] : null;
    const prewap = d.EXAD_RCD_PREWAP?.[0];
    return {
        // flowType: hydro?.flowType ?? 'N',
        // testType: testOutcome?.hydTestTypCd ?? FALLBACK_STR,
        // aquiferActual: testOutcome?.rsvrCd ?? water?.aquifer ?? FALLBACK_STR,
        // aquiferEstimate: hydro?.estTargetAquifier ?? prewap?.targetFormation ?? FALLBACK_STR,
        // h2sActual: testOutcome?.hydH2sCnc ?? water?.h2s ?? FALLBACK_STR,
        // h2sEstimate: hydro?.estH2s ?? FALLBACK_STR,
        // temp: testOutcome?.temp ?? FALLBACK_STR,
        // tds: testOutcome?.wtrSaTdsCnc ?? water?.fieldTds ?? hydro?.estWaterQuality ?? FALLBACK_STR,
        // rpm: testOutcome?.rpm ?? water?.rpm ?? FALLBACK_STR,
        // duration: testOutcome?.duration ?? water?.testDuration ?? FALLBACK_STR,
        // conductedBy: drillingEngineer ?? foreman ?? FALLBACK_STR,
        // rate: testOutcome?.hydProdRt ?? water?.flowRate ?? FALLBACK_STR,
        // siwhp: testOutcome?.siwhp ?? water?.staticWaterLevel ?? FALLBACK_STR,
        // depth: prewap?.estTargetDepth ?? status?.wPrsntDpth ?? FALLBACK_STR,
        // productivityActual: testOutcome?.hydProduct ?? water?.specificCapacity ?? FALLBACK_STR,
        // productivityEstimate: hydro?.estProductivity ?? FALLBACK_STR,
        // swl: testOutcome?.statWlvl ?? water?.staticWaterLevel ?? hydro?.estStaticWaterLevel ?? FALLBACK_STR,
        // dwl: testOutcome?.dyncWlvl ?? water?.drawDown ?? FALLBACK_STR,
        flowType: hydro?.flowType ?? 'N',
        testType: testOutcome?.hydTestTypCd,
        aquiferActual: testOutcome?.rsvrCd,
        aquiferEstimate: hydro?.estTargetAquifier,
        h2sActual: testOutcome?.hydH2sCnc,
        h2sEstimate: hydro?.estH2s,
        temp: testOutcome?.temp,
        tds: testOutcome?.wtrSaTdsCnc,
        rpm: testOutcome?.rpm,
        duration: testOutcome?.duration,
        conductedBy: testOutcome?.testerNetworkId,
        rate: testOutcome?.hydProdRt,
        siwhp: testOutcome?.siwhp,
        depth: prewap?.estTargetDepth,
        hydPmpDpth: testOutcome?.hydPmpDpth,
        productivityActual: testOutcome?.hydProduct,
        productivityEstimate: hydro?.estProductivity,
        swl: testOutcome?.statWlvl,
        dwl: testOutcome?.dyncWlvl,
    };
}

// ─── Morning report mappers ────────────────────────────────────────────────────

export function mapWellDataToMorningReport(d: IWellData): MorningReport {
    const rig = d.RIG_ACTIVITY?.[0];
    const status = d.DRLG_OP_STATUS?.[0];
    const master = d.WELL_MASTER?.[0];
    const hydro = d.EXAD_GWD_IR_HYDROGEOLOGY?.[0];
    const prewap = d.EXAD_RCD_PREWAP?.[0];
    const opSmry = d.DRLG_OP_SMRY?.[0];
    const tops = d.DRLG_FM_TOPS ?? [];
    const lastTop = tops[tops.length - 1];

    return {
        epANum: String(status?.epANum ?? ''),
        wGnrName: rig?.wellName ?? '',
        wRigCd: rig?.wRigCd ?? '',
        racEstDdLatCord: String(master?.lat ?? ''),
        racEstDdLonCord: String(master?.lon ?? ''),
        biNum: rig?.biNum ?? '',
        trgtRsvrCd: hydro?.estTargetAquifier ?? prewap?.targetFormation ?? '',
        stLongCd: lastTop?.stLongCd ?? '',
        wStDmrkDpth: String(lastTop?.wStDmrkDpth ?? ''),
        wPrsntDpth: status?.wPrsntDpth ?? null,
        wDpthChgDis: status?.wDpthChgDis ?? null,
        wOpRmk: opSmry?.wOpRmk ?? status?.wOpRmk ?? '',
        foremanRmk: status?.nxt24HrPlanRmk ?? '',
        plLtrlEndDpth: prewap?.estTargetDepth ?? null,
        supportings: d.EXAD_RCD_PREWAP?.[0]?.supportedBusiness ?? "Missing",
        wEvntTime: opSmry?.wEvntTime ?? '',
        rigStatus: d.EXAD_GWD_DAILY_REMARKS?.[0]?.status ?? 'NA',
    };
}

export function mapToWaterWellTestResult(o: IWaterWellTestOutcome, drillingWellName: string): WaterWellTestResult {
    const testType = resolveTestType(o);
    return {
        testType,
        wellName: drillingWellName,
        rPM: testType === 'PUMP' ? String(o.rpm ?? '') : '',
        siwhp: testType === 'FLOW' ? String(o.siwhp ?? '') : '',
        h2sPPM: String(o.hydH2sCnc ?? ''),
        temperature: String(o.temp ?? ''),
        trgtRsvrCd: o.rsvrCd ?? '',
        testRate: String(o.hydProdRt ?? ''),
        wellProductivity: String(o.hydProduct ?? ''),
        tds: String(o.wtrSaTdsCnc ?? ''),
    };
}

export function selectMorningReports(
    data: IWellData[],
    rigStatusOverrides: Record<number, string>,
): MorningReport[] {
    return data.map(d => {
        const report = mapWellDataToMorningReport(d);
        const overrideKey = Number.parseInt(report.epANum, 10);
        const override = Number.isFinite(overrideKey) ? rigStatusOverrides[overrideKey] : undefined;
        return override !== undefined ? { ...report, rigStatus: override } : report;
    });
}

export function selectWaterWellTestResultsFromData(data: IWellData[]): WaterWellTestResult[] {
    return data.flatMap(d => {
        const drillingWellName = d.WELL_MASTER?.[0]?.well ?? '';
        return (d.EXAD_GWD_WELL_TESTS ?? []).map(o => mapToWaterWellTestResult(o, drillingWellName));
    });
}