# Staged Files Snapshot

_Generated from git index (staged content) on branch feature/rbac._

## `src/app/core/models/active-wwell/active-wwell-view.model.ts` (M )

```typescript
export interface MiscWellData {
  readonly wellName: string;
  readonly targetDesc: string;
  readonly targetedAquifer: string;
  readonly currentStatus: string;
  readonly daysSinceSpud: number;
  readonly targetDays: number;
  readonly biNum: string;
  readonly supportings: string;
  readonly feetDrilledToday: number;
  readonly previousWell: string;
  readonly currentDepth: number;
  readonly nextWell: string;
  readonly footage: number;
  readonly operationSummary: string;
  readonly next24HrOperation: string;
  readonly rop: number | null;
  readonly actualRm: number | null;
  readonly kpiRm: number | null;
  readonly rigMoveDays: number | null;
  readonly spudDate: string;
  readonly rigName: string;
  readonly rigHeight: string | null;
  readonly previousDepth: number;
  readonly drlgSmryRmk?: string | null;
  readonly holeSize: string | null;
}

export interface PickedFormationTops {
  readonly formation: string;
  readonly depth: number;
  readonly remarks: string;
}

export interface OffsetWaterWells {
  readonly wellName: string;
  readonly aquifer: string;
  readonly tds: number;
  readonly rpm: number;
  readonly h2s: number;
  readonly distance: number;
  readonly direction: string;
  readonly specificCapacity: number;
  readonly rate: number;
}

export interface WellTestResult {
  readonly wellName: string;
  readonly testType: string;
  readonly aquifer: string;
  readonly rpm: number;
  readonly siwhp: number;
  readonly flowRate: number;
  readonly temperature: number;
  readonly tds: number;
  readonly productivity: number;
  readonly h2s: number;
}

export interface WellHeaderViewModel {
  readonly field: string;
  readonly fieldAr: string | null;
  readonly wellName: string;
  readonly lat: number | string;
  readonly lon: number | string;
  readonly targetedAquifer: string;
  readonly depth: number | string;
  readonly epNum: number | string;
  readonly biNum: string;
  readonly supportingBusiness:string;
}

export interface DatabaseInfoViewModel {
  readonly date: string;
  readonly daysSinceSpud: number | string;
  readonly spudDate: string;
  readonly fiveAmDepth: number | string;
  readonly lastCasingSize: string;
  readonly rig: string;
  readonly rigHeight: string | null;
  readonly targetDate: string;
  readonly releaseDate: string;
  readonly preFiveAmDepth: number | string;
  readonly lastCasingDepth: number | string;
  readonly spudDays: number | string;
  readonly samDepth: number | string;
  readonly rigMoveKpi: number | string;
  readonly wellTdDate: string;
  readonly footage: number | string;
  readonly secondarySamDepth: number | string;
  readonly formationDrilling: number | string;
  readonly circulation: number | string;
  readonly avgRop: number | string;
}

export interface OperationSummaryViewModel {
  readonly operation: string;
  readonly nextOperation: string;
  readonly drillingRemarks: string;
}

export interface FormationInfoViewModel {
  readonly formation: string;
  readonly prognosed: number | string;
  readonly actualDepth: number | string;
  readonly difference: number | string;
  readonly remarks: string | null;
  readonly isDrlgOnly: boolean;
}

export interface CasingInfoViewModel {
  readonly csgType: string;
  readonly csgSize: string | number;
  readonly csgDepth: number | string;
  readonly csgBotDpth: number | string;
}

export interface WwellTestViewModel {
  readonly flowType: string;
  readonly testType?: string | null;
  readonly aquiferActual?: string | null;
  readonly aquiferEstimate: string;
  readonly h2sActual?: number | string | null;
  readonly h2sEstimate: number | string;
  readonly temp?: number | string | null;
  readonly tds?: number | string | null;
  readonly tdsEstimate?: number | string | null;
  readonly rpm?: number | string | null;
  readonly duration?: number | string | null;
  readonly conductedBy?: string | null;
  readonly rate?: number | string | null;
  readonly siwhp?: number | string | null;
  readonly fwhp?: number | string | null;
  readonly siwhpEstimate?: number | string | null;
  readonly depth: number | string;
  readonly productivityActual?: number | string | null;
  readonly testRateEstimate: number | string;
  readonly swl?: number | string | null;
  readonly swlEstimate?: number | string | null;
  readonly dwl?: number | string | null;
  readonly hydPmpDpth?: number | null;
  readonly pumpDepthEstimate?: number | string | null;
  readonly remarks?: string | null;
}



export const MAX_UPLOAD_SIZE_BYTES = 25 * 1024 * 1024;

export const ALLOWED_UPLOAD_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png'] as const;

export interface UploadFileItem {
  readonly file: File;
  readonly id: string;
  readonly uploaded?: boolean;
}
```

## `src/app/core/models/well-design/wellbore-diagram.model.ts` (M )

```typescript
import { ICasingIR } from 'src/app/shared/models/wwell/casing-ir.model';
import { IDrlgCsg } from 'src/app/shared/models/wwell/drlg-csg.model';
import { ITopsIR } from 'src/app/shared/models/wwell/tops-ir.model';
import { IHydrogeologyIR } from 'src/app/shared/models/wwell/hydrogeology-ir.model';
import { IPreWellData } from 'src/app/shared/models/wwell/pre-well-data.model';
import { IRigActivity } from 'src/app/shared/models/wwell/rig-activity.model';
import { IWellDesign } from 'src/app/shared/models/wwell/well-design.model';
export interface MudCircPoint {
  readonly depth: number;  // parsed from wPrsntDpth
  readonly pct: number;    // parsed from wMudCircPc
}

export interface WellboreDiagramData {
  readonly wellName: string;
  readonly totalDepth: number;
  readonly displayDepth: number;
  readonly casings: ICasingIR[];
  readonly drlgCasings: IDrlgCsg[];
  readonly geologicTops: ITopsIR[];
  readonly hydrogeology: IHydrogeologyIR | null;
  readonly prewap: IPreWellData | null;
  readonly rigActivity: IRigActivity | null;
  readonly currentDepth: number;
  readonly targetDepth: number;
  readonly mudCirculation: MudCircPoint[];
  readonly wellDesign: IWellDesign | null;
}

export interface DiagramLayout {
  readonly svgHeight: number;
  readonly marginTop: number;
  readonly drawingHeight: number;
  readonly depthScaleWidth: number;
  readonly depthAxisX: number;
  readonly wellboreViewWidth: number;
  readonly geoLineX: number;
  readonly depthArrowX: number; // Controls the depth arrow's horizontal position
  readonly casingCenterX: number;
  readonly baseHalfWidth: number;
  readonly halfWidthIncrement: number;
  readonly shoeCurveOffset: number;
  // ── Completion element half-widths (x extents from center) ───────────────
  readonly openHoleHwMargin: number;   // open hole = innerHW + this
  readonly linerScreenInset: number;   // liner screen = innerHW - this
  // ── Gravel pack fill control ────────────────────────────────────────────
  readonly gpScreenGap: number;        // px gap between screen outer wall and GP inner fill edge
  readonly gpFillRatio: number;        // 0.0–1.0: fraction of available annulus (after gpScreenGap) that GP fills
}

export const DIAGRAM_LAYOUT: DiagramLayout = {
  svgHeight: 840,
  marginTop: 55,
  drawingHeight: 740,

  // -- RESPONSIVE MIDPOINT MATH --
  depthScaleWidth: 116,
  depthAxisX: 82,

  wellboreViewWidth: 1040,

  // ── Horizontal zone layout (left → right inside wellbore SVG) ──────────
  // [0 - 34]    drill arrow body
  // [56 - 120]  geo depth labels
  // [120]       geo axis line
  // [120 - 210] geo formation codes
  // [210+]      gap before bore structure
  // ─────────────────────────────────────────────────────────────────────
  depthArrowX: 24,
  geoLineX: 120,
  casingCenterX: 610,
  baseHalfWidth: 72,
  halfWidthIncrement: 26,
  shoeCurveOffset: 12,
  openHoleHwMargin: 25,
  linerScreenInset: 20,
  gpScreenGap: 3,       // 4px gap so screen is visually inside GP
  gpFillRatio: 1.0,     // fill full annulus by default; reduce to 0.5 etc. to narrow the GP band
};

// Fullscreen layout: landscape viewBox (1400 × 940) so aspect ratio matches a
// typical ~1.5:1 screen. With preserveAspectRatio:none, scale X ≈ scale Y ≈ 0.92
// so nothing distorts. drawingHeight 860 > normal 740 gives 16 % more vertical
// room per depth unit without requiring scrolling.
export const FULLSCREEN_DIAGRAM_LAYOUT: DiagramLayout = {
  svgHeight: 940,
  marginTop: 80,
  drawingHeight: 860,

  depthScaleWidth: 150,
  depthAxisX: 106,

  wellboreViewWidth: 1400,

  depthArrowX: 32,
  geoLineX: 162,
  casingCenterX: 820,
  baseHalfWidth: 96,
  halfWidthIncrement: 34,
  shoeCurveOffset: 16,
  openHoleHwMargin: 34,
  linerScreenInset: 26,
  gpScreenGap: 4,
  gpFillRatio: 1.0,
};

// ─── Animation mode ────────────────────────────────────────────────────────
// 'realistic' : full cinematic sequence — casings drill down one by one,
//               then open-hole / overlays appear after all casings finish.
// 'fast'      : same sequence but 3× faster (good for development).
// 'instant'   : no animation, everything visible immediately.
export type AnimMode = 'realistic' | 'fast' | 'instant';

export const ANIM_MODE: AnimMode = 'fast';   // ← change this to switch modes

// Base timing profile (realistic).
// 'fast' divides every duration & delay by FAST_FACTOR.
// 'instant' sets everything to 0.
const FAST_FACTOR = 3;

function animValue(base: number): number {
  if (ANIM_MODE === 'instant') return 0;
  if (ANIM_MODE === 'fast') return Math.round(base / FAST_FACTOR);
  return base;
}

// ─── Core durations ────────────────────────────────────────────────────────
const _BASE = {
  SCALE_DURATION: 1000,   // depth scale draws down
  TICK_BASE_DELAY: 120,    // stagger for each depth tick
  GEO_DELAY: 200,    // geologic tops start appearing
  GEO_STAGGER: 55,     // stagger between each geo top
  CASING_DURATION: 800,    // each casing clip reveal duration
  CASING_STAGGER: 420,    // gap between each casing starting
  OH_DURATION: 800,    // open hole + liner screen clip reveal
  GRAVEL_DURATION: 600,    // gravel pack fill reveal
  HANGER_DURATION: 300,    // hanger bracket fade-in
  OVERLAY_FADE: 400,    // generic label / overlay fade-in
  SEQ_GAP: 200,    // breathing gap between sequential phases
};

// Number of structural casings determines when the last casing finishes.
// Components that must wait use computeOverlayDelay(casingCount).
export function computeOverlayDelay(casingCount: number): number {
  // Last casing (index 0 in draw order = innermost = last to animate) starts at:
  //   (casingCount - 1) * CASING_STAGGER, finishes after + CASING_DURATION
  const lastCasingDone = (casingCount - 1) * _BASE.CASING_STAGGER + _BASE.CASING_DURATION;
  return animValue(lastCasingDone + 100); // 100ms breathing room
}

// ─── Wellbore animation config (user-configurable) ────────────────────────

export type AnimSpeed    = 'slow' | 'normal' | 'fast';
export type AnimLineStyle = 'draw' | 'fade';          // draw = dashoffset, fade = opacity
export type AnimPopStyle  = 'elastic' | 'bounce' | 'fade';

export interface WellboreAnimConfig {
  speed:     AnimSpeed;
  lineStyle: AnimLineStyle;
  popStyle:  AnimPopStyle;
}

export const DEFAULT_ANIM_CONFIG: WellboreAnimConfig = {
  speed:     'normal',
  lineStyle: 'draw',
  popStyle:  'elastic',
};

export const ANIM = {
  SCALE_DURATION: animValue(_BASE.SCALE_DURATION),
  TICK_BASE_DELAY: animValue(_BASE.TICK_BASE_DELAY),
  GEO_DELAY: animValue(_BASE.GEO_DELAY),
  GEO_STAGGER: animValue(_BASE.GEO_STAGGER),
  CASING_DURATION: animValue(_BASE.CASING_DURATION),
  CASING_STAGGER: animValue(_BASE.CASING_STAGGER),
  OH_DURATION: animValue(_BASE.OH_DURATION),
  GRAVEL_DURATION: animValue(_BASE.GRAVEL_DURATION),
  HANGER_DURATION: animValue(_BASE.HANGER_DURATION),
  OVERLAY_FADE: animValue(_BASE.OVERLAY_FADE),
  SEQ_GAP: animValue(_BASE.SEQ_GAP),
  // Legacy alias so depth-scale component keeps working unchanged
  OVERLAY_DELAY: animValue((_BASE.CASING_STAGGER * 3) + _BASE.CASING_DURATION + 100),
} as const;

```

## `src/app/core/store/shared/well-data.selectors.ts` (M )

```typescript
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
import { IDrlgCsg } from 'src/app/shared/models/wwell/drlg-csg.model';
import { ITopsIR } from 'src/app/shared/models/wwell/tops-ir.model';
import { IWaterIR } from 'src/app/shared/models/wwell/water-ir.model';
import { IWaterWellTestOutcome } from 'src/app/shared/models/wwell/water-well-test-outcome.model';
import { WaterWellTestResult, WellTestType } from 'src/app/shared/models/wwell/wwell-test-result.model';
import { WwellEntry } from '@models/daily-operation/wwell-entry.model';
import { sortCasingsByDepthDesc } from 'src/app/shared/utils/wellbore-math.util';
import { formatDateForInput } from 'src/app/shared/utils/date.util';

export const PAGE_SIZE = 5;
export const FALLBACK_STR = 'N/A';
const DISPLAY_DEPTH_PADDING_FT = 500;

function coercePositiveEpANum(value: number | string | null | undefined): number | null {
    const numericValue = typeof value === 'string' ? Number.parseInt(value, 10) : value ?? null;
    if (!Number.isFinite(numericValue) || numericValue === null || numericValue <= 0) return null;
    return numericValue;
}


export function selectWellNamesFromList(wellList: WwellEntry[]): WellName[] {
    return wellList.flatMap((entry) => {
        const epANum = coercePositiveEpANum(entry.epANum);
        return epANum === null ? [] : [{ wellName: entry.wGnrName, epANum }];
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



export function selectWellEpANum(d: IWellData | null | undefined): number | null {
    const epANum = d?.DRLG_OP_STATUS?.[0]?.epANum ?? null;
    return Number.isFinite(epANum) && (epANum ?? 0) > 0 ? epANum : null;
}

export function selectTotalDepth(d: IWellData | null): number {
    const targetDepth = safeNum(d?.DRLG_OP_STATUS?.[0]?.targetDepth) ?? 0;
    const currentDepth = safeNum(d?.DRLG_OP_STATUS?.[0]?.wPrsntDpth) ?? 0;
    return Math.max(targetDepth, currentDepth);
}

export function selectDisplayDepth(d: IWellData | null): number {
    const totalDepth = selectTotalDepth(d);
    const plannedDepths = (d?.EXAD_GWD_IR_TOPS ?? [])
        .map(top => safeNum(top.planTvdDepth))
        .filter((depth): depth is number => depth !== null && depth > 0);
    const actualDepths = (d?.DRLG_FM_TOPS ?? [])
        .map(top => safeNum(top.wStDmrkDpth))
        .filter((depth): depth is number => depth !== null && depth > 0);

    return Math.max(totalDepth, ...plannedDepths, ...actualDepths) + DISPLAY_DEPTH_PADDING_FT;
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



export function selectDiagramData(d: IWellData | null): WellboreDiagramData | null {
    if (!d) return null;
    return {
        wellName: d.WELL_MASTER?.[0]?.well ?? '',
        totalDepth: selectTotalDepth(d),
        displayDepth: selectDisplayDepth(d),
        casings: sortCasingsByDepthDesc(d.EXAD_GWD_IR_CASING ?? []),
        drlgCasings: [...(d.DRLG_CSG ?? [])].sort((a, b) => b.wCsgBotDpth - a.wCsgBotDpth),
        geologicTops: [...(d.EXAD_GWD_IR_TOPS ?? [])].sort((a, b) => a.planTvdDepth - b.planTvdDepth),
        hydrogeology: d.EXAD_GWD_IR_HYDROGEOLOGY?.[0] ?? null,
        prewap: d.EXAD_RCD_PREWAP?.[0] ?? null,
        rigActivity: d.RIG_ACTIVITY?.[0] ?? null,
        currentDepth: d.DRLG_OP_STATUS?.[0]?.wPrsntDpth ?? 0,
        targetDepth: safeNum(d.DRLG_OP_STATUS?.[0]?.targetDepth) ?? 0,
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
        supportings: d.EXAD_RCD_PREWAP?.[0]?.supportedBusiness ?? FALLBACK_STR,
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
        rigHeight: d.RIG_IDENTIFICATION?.[0]?.rigHeight != null ? String(d.RIG_IDENTIFICATION[0].rigHeight) : null,
        previousDepth: status?.wPrevDpth ?? 0,
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
            tds: ow.fieldTds ?? 0,
            rpm: ow.rpm ?? 0,
            h2s: ow.h2s ?? 0,
            distance: ow.distance ?? 0,
            specificCapacity: ow.specificCapacity ?? 0,
            rate: test?.hydProdRt ?? ow.flowRate ?? 0,
            direction: ow?.direction ?? "NA",
        };
    });
}

const NOT_REQUIRED_RE = /^not require[d]?\.?$/i;

function toActiveRemark(val: string | undefined): string | null {
    const trimmed = val?.trim();
    return trimmed && !NOT_REQUIRED_RE.test(trimmed) ? trimmed : null;
}

function isLogActive(val: string | undefined): boolean {
    return toActiveRemark(val) !== null;
}

export function selectWellLogsIndicators(d: IWellData | null): WellLogsIndicators | null {
    if (!d) return null;
    const h: IHeaderIR | undefined = d.EXAD_GWD_IR_HEADER?.[0];
    return {
        rcc: isLogActive(h?.dtRemarks),
        mudLog: isLogActive(h?.mudRemarks),
        logging: isLogActive(h?.loggingRemarks),
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
        dtRemarks: toActiveRemark(h.dtRemarks),
        mudRemarks: toActiveRemark(h.mudRemarks),
        loggingRemarks: toActiveRemark(h.loggingRemarks),
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

export function selectWellHeaderViewModel(d: IWellData | null, epANum: number | null): WellHeaderViewModel | null {
    if (!d) return null;
    const rig = d.RIG_ACTIVITY?.[0];
    const master = d.WELL_MASTER?.[0];
    const prewap = d.EXAD_RCD_PREWAP?.[0];
    const hydro = d.EXAD_GWD_IR_HYDROGEOLOGY?.[0];
    const status = d.DRLG_OP_STATUS?.[0];
    const primaryHole = d.PRIMARY_HOLEID?.[0] ?? null;
    return {
        field: primaryHole?.wPrimHidName ?? FALLBACK_STR,
        fieldAr: primaryHole?.w_prim_hid_ar_name_html ?? null,
        wellName: rig?.wellName ?? master?.well ?? FALLBACK_STR,
        lat: master?.lat ?? FALLBACK_STR,
        lon: master?.lon ?? FALLBACK_STR,
        targetedAquifer: hydro?.estTargetAquifier ?? prewap?.targetFormation ?? FALLBACK_STR,
        depth: prewap?.estTargetDepth ?? status?.targetDepth ?? FALLBACK_STR,
        epNum: status?.epANum ?? epANum ?? FALLBACK_STR,
        supportingBusiness: prewap?.supportedBusiness ?? FALLBACK_STR,
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
        rigHeight: d.RIG_IDENTIFICATION?.[0]?.rigHeight != null ? String(d.RIG_IDENTIFICATION[0].rigHeight) : null,
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
        formationDrilling: selectLatestFormation(d)?.stLongCd ?? prewap?.targetFormation ?? FALLBACK_STR,
        circulation: status?.wMudCircPc ?? FALLBACK_STR,
        avgRop: d.ROP_DATA?.[0]?.rop ?? FALLBACK_STR,
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
        remarks: latest?.wStDmrkRmk ?? '',
        isDrlgOnly: false,
    };
}

function safeNum(v: unknown): number | null {
    if (v === null || v === undefined) return null;
    const n = Number(v);
    return isFinite(n) ? n : null;
}

export function selectAllFormationTops(d: IWellData | null): FormationInfoViewModel[] {
    if (!d) return [];
    const plannedTops = d.EXAD_GWD_IR_TOPS ?? [];
    const actualTopsMap = new Map<string, IFormationTops>(
        (d.DRLG_FM_TOPS ?? []).map(fm => [fm.stLongCd, fm])
    );
    const plannedCodes = new Set(plannedTops.map(t => t.stLongCd));

    const fromPlanned: FormationInfoViewModel[] = plannedTops.map(top => {
        const actual = actualTopsMap.get(top.stLongCd) ?? null;
        const actualDepth = safeNum(actual?.wStDmrkDpth);
        const plannedDepth = safeNum(top.planTvdDepth);
        const validPlanned = plannedDepth !== null && plannedDepth > 0 ? plannedDepth : null;
        return {
            formation: top.stLongCd ?? FALLBACK_STR,
            prognosed: validPlanned ?? '',
            actualDepth: actualDepth ?? '',
            difference: actualDepth !== null && validPlanned !== null ? actualDepth - validPlanned : '',
            remarks: actual?.wStDmrkRmk ?? '',
            isDrlgOnly: false,
        };
    });

    const fromDrlgOnly: FormationInfoViewModel[] = (d.DRLG_FM_TOPS ?? [])
        .filter(fm => !plannedCodes.has(fm.stLongCd))
        .map(fm => {
            const actualDepth = safeNum(fm.wStDmrkDpth);
            return {
                formation: fm.stLongCd ?? FALLBACK_STR,
                prognosed: '',
                actualDepth: actualDepth ?? '',
                difference: '',
                remarks: fm.wStDmrkRmk ?? '',
                isDrlgOnly: true,
            };
        });

    const effectiveDepth = (item: FormationInfoViewModel): number => {
        const actual = safeNum(item.actualDepth);
        if (actual !== null && actual > 0) return actual;
        return safeNum(item.prognosed) ?? Number.POSITIVE_INFINITY;
    };

    return [...fromPlanned, ...fromDrlgOnly].sort((a, b) => effectiveDepth(a) - effectiveDepth(b));
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

function resolveActualCasingDepth(cas: ICasingIR, drlgCasings: IDrlgCsg[]): number | null {
    const isLiner = cas.csgType === 'Liner';
    const actualCsg = isLiner ? null : (drlgCasings.find(dc => dc.wCsgOdSz === cas.csgSize) ?? null);
    const actualLnr = isLiner ? (drlgCasings.find(dc => dc.wLnrOdSz === cas.csgSize) ?? null) : null;
    const hasActual = !isLiner && actualCsg !== null && actualCsg.wCsgBotDpth > 0;
    const hasActualLiner = isLiner && actualLnr !== null && (actualLnr.wLnrBotDepth ?? 0) > 0;

    if (hasActual) return actualCsg!.wCsgBotDpth;
    if (hasActualLiner) return actualLnr!.wLnrBotDepth!;
    return null;
}

export function allCasingData(d: IWellData | null): CasingInfoViewModel[] | null {
    if (!d) return null;
    const casing = selectCasing(d);
    const status = d.DRLG_OP_STATUS?.[0];
    const drlgCasings = d.DRLG_CSG ?? [];

    return casing!.map(cas => {
        return {
            csgType: cas?.csgType ?? FALLBACK_STR,
            csgSize: cas?.csgSize ?? status?.wCsgOdSz ?? FALLBACK_STR,
            csgDepth: cas?.csgDepth ?? FALLBACK_STR,
            csgBotDpth: (cas ? resolveActualCasingDepth(cas, drlgCasings) : null) ?? '',
        }
    })
}

export function selectWwellTestViewModel(d: IWellData | null): WwellTestViewModel | null {
    if (!d) return null;
    const testOutcome = selectPrimaryTestOutcome(d);
    const hydro = d.EXAD_GWD_IR_HYDROGEOLOGY?.[0];
    if (!testOutcome && !hydro) return null;
    const prewap = d.EXAD_RCD_PREWAP?.[0];
    const wellDesign = d.EXAD_GWD_WELL_DESIGN?.[0];
    return {

        flowType: (() => {
            // Primary: WELL_TESTS.hydTestTypCd ('FLOW' | 'PUMP')
            const testType = testOutcome?.hydTestTypCd?.trim().toUpperCase();
            if (testType === 'FLOW' || testType === 'PUMP') return testType;
            // WELL_TESTS empty → fallback to IR.flowType (Y = FLOW, N = PUMP)
            const irType = hydro?.flowType?.trim().toUpperCase();
            if (irType === 'Y') return 'FLOW';
            if (irType === 'N') return 'PUMP';
            return 'PUMP';
        })(),
        testType: testOutcome?.hydTestTypCd,
        aquiferActual: testOutcome?.rsvrCd,
        aquiferEstimate: hydro?.estTargetAquifier,
        h2sActual: testOutcome?.hydH2sCnc,
        h2sEstimate: hydro?.estH2s,
        temp: testOutcome?.temp,
        tds: testOutcome?.wtrSaTdsCnc,
        tdsEstimate: hydro?.estWaterQuality,
        rpm: testOutcome?.rpm,
        duration: testOutcome?.duration,
        conductedBy: testOutcome?.testerNetworkId,
        rate: testOutcome?.hydProdRt,
        siwhp: testOutcome?.siwhp,
        fwhp: testOutcome?.fwhp,
        siwhpEstimate: hydro?.estStaticWaterLevel,
        depth: prewap?.estTargetDepth,
        hydPmpDpth: testOutcome?.hydPmpDpth,
        productivityActual: testOutcome?.hydProduct,
        testRateEstimate: hydro?.estProductivity,
        swl: testOutcome?.statWlvl,
        swlEstimate: hydro?.estStaticWaterLevel,
        dwl: testOutcome?.dyncWlvl,
        pumpDepthEstimate: wellDesign?.pumpLvl,
        remarks: testOutcome?.remarks,
    };
}

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
        wOpRmk: d?.EXAD_GWD_DAILY_REMARKS?.[0]?.opRmk ?? d?.DRLG_OP_SMRY?.[0]?.wOpRmk,
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
        fwhp: testType === 'FLOW' ? String(o.fwhp ?? '') : '',
        pumpDepth: testType === 'PUMP' ? String(o.hydPmpDpth ?? '') : '',
        swl: testType === 'PUMP' ? String(o.statWlvl ?? '') : '',
        dwl: testType === 'PUMP' ? String(o.dyncWlvl ?? '') : '',
        h2sPPM: String(o.hydH2sCnc ?? ''),
        temperature: String(o.temp ?? ''),
        trgtRsvrCd: o.rsvrCd ?? '',
        duration: String(o.duration ?? ''),
        testRate: String(o.hydProdRt ?? ''),
        wellProductivity: String(o.hydProduct ?? ''),
        tds: String(o.wtrSaTdsCnc ?? ''),
        conductedBy: o.testerNetworkId ?? '',
    };
}

export function selectMorningReports(data: IWellData[]): MorningReport[] {
    return data.map(d => mapWellDataToMorningReport(d));
}

export function selectWaterWellTestResultsFromData(data: IWellData[]): WaterWellTestResult[] {
    return data.flatMap(d => {
        const drillingWellName = d.RIG_ACTIVITY?.[0]?.wellName ?? d.WELL_MASTER?.[0]?.well ?? '';
        return (d.EXAD_GWD_WELL_TESTS ?? []).map(o => mapToWaterWellTestResult(o, drillingWellName));
    });
}

export function selectWwellTestViewModels(
    data: IWellData[],
): readonly (WwellTestViewModel & { readonly wellName: string })[] {
    return data.flatMap(d => {
        if (!selectPrimaryTestOutcome(d)) return [];
        const vm = selectWwellTestViewModel(d);
        if (!vm) return [];
        const wellName = d.RIG_ACTIVITY?.[0]?.wellName ?? d.WELL_MASTER?.[0]?.well ?? '';
        return [{ wellName, ...vm }];
    });
}
```

## `src/app/features/presentation/offset-wwells/offset-wwells.component.html` (M )

```html
<div class="ow-container">
  <div class="ow-header">
    <div class="ow-header__title"><span>Offset Wells</span></div>
    <div class="ow-header__badge">{{ store.offsetWells().length }}</div>
  </div>

  <div class="ow-list">
    @for (well of store.offsetWells(); track well.wellName) {
      <div class="ow-item" #panelContainer>
        <button
          @owTabAnim
          type="button"
          class="ow-tab"
          [class.ow-tab--expanded]="expandedWell() === well.wellName"
          (click)="toggleWell(well.wellName, panelContainer)"
        >
          <div class="ow-tab__left">
            <div class="ow-tab__icon">
              <svg viewBox="0 0 24 24" fill="url(#well-drop-grad)">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
              </svg>
            </div>
            <div class="ow-tab-metrics">
              <div class="ow-tab-metric ow-tab-metric--well">
                <span class="ow-tab-metric__label">Well</span>
                <span class="ow-tab-metric__value">{{ well.wellName }}</span>
              </div>
              <span class="ow-tab-metric__sep"></span>
              <div class="ow-tab-metric">
                <span class="ow-tab-metric__label">Aquifer</span>
                <span class="ow-tab-metric__value ow-tab-metric__value--aquifer">{{ well.aquifer }}</span>
              </div>
              @if (well.h2s > 0) {
                <span class="ow-tab-metric__sep"></span>
                <div class="ow-tab-metric">
                  <span class="ow-tab-metric__label">H&#8322;S</span>
                  <span class="ow-tab-metric__value ow-tab-metric__value--warn">{{ well.h2s | number }}</span>
                </div>
              }
            </div>
          </div>
          <div class="ow-tab__right">
            <div class="ow-chevron">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="9 6 15 12 9 18" />
              </svg>
            </div>
          </div>
        </button>

        @if (expandedWell() === well.wellName) {
          <div class="ow-content">
            <div class="ow-grid">
              <!-- TDS -->
              <div class="ow-card">
                <div class="ow-card__hd">
                  <div class="ow-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                    </svg>
                  </div>
                  <div class="ow-label">TDS</div>
                </div>
                <div class="ow-val">
                  <span class="ow-num">{{ well.tds | number }}</span>
                  <span class="ow-unit">PPM</span>
                </div>
              </div>

              <!-- RPM -->
              <div class="ow-card">
                <div class="ow-card__hd">
                  <div class="ow-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="23 4 23 10 17 10" />
                      <path d="M20.49 15a9 9 0 1 1-.06-4" />
                    </svg>
                  </div>
                  <div class="ow-label">RPM</div>
                </div>
                <div class="ow-val">
                  <span class="ow-num">{{ well.rpm | number }}</span>
                </div>
              </div>

              <!-- H2S -->
              <div class="ow-card" [class.ow-card--warn]="well.h2s > 0">
                <div class="ow-card__hd">
                  <div class="ow-icon" [class.ow-icon--warn]="well.h2s > 0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                  <div class="ow-label">H&#8322;S</div>
                </div>
                <div class="ow-val">
                  <span class="ow-num">{{ well.h2s | number }}</span>
                  <span class="ow-unit">PPM</span>
                </div>
              </div>

              <!-- Distance -->
              <div class="ow-card">
                <div class="ow-card__hd">
                  <div class="ow-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="10" r="3" />
                      <path d="M12 21c-4-4-7-7.58-7-11a7 7 0 0 1 14 0c0 3.42-3 7-7 11z" />
                    </svg>
                  </div>
                  <div class="ow-label">Distance</div>
                </div>
                <div class="ow-val">
                  <span class="ow-num">{{ well.distance | number:'1.0-1' }}</span>
                  <span class="ow-unit">km</span>
                </div>
              </div>

              <!-- Direction -->
              <div class="ow-card">
                <div class="ow-card__hd">
                  <div class="ow-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                    </svg>
                  </div>
                  <div class="ow-label">Direction</div>
                </div>
                <div class="ow-val">
                  <span class="ow-text">{{ well.direction }}</span>
                </div>
              </div>

              <!-- Specific Capacity -->
              <div class="ow-card">
                <div class="ow-card__hd">
                  <div class="ow-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="12 2 2 7 12 12 22 7 12 2" />
                      <polyline points="2 17 12 22 22 17" />
                      <polyline points="2 12 12 17 22 12" />
                    </svg>
                  </div>
                  <div class="ow-label">Specific Capacity</div>
                </div>
                <div class="ow-val">
                  <span class="ow-num ow-num--md">{{ well.specificCapacity | number:'1.0-2' }}</span>
                  <span class="ow-unit">GPM/ft</span>
                </div>
              </div>

              <!-- Flow Rate -->
              <div class="ow-card ow-card--span2">
                <div class="ow-card__hd">
                  <div class="ow-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M2 12c1.333-1.333 2.667-2 4-2s2.667.667 4 2 2.667 2 4 2 2.667-.667 4-2" />
                      <path d="M2 7c1.333-1.333 2.667-2 4-2s2.667.667 4 2 2.667 2 4 2 2.667-.667 4-2" />
                      <path d="M2 17c1.333-1.333 2.667-2 4-2s2.667.667 4 2 2.667 2 4 2 2.667-.667 4-2" />
                    </svg>
                  </div>
                  <div class="ow-label">Flow Rate</div>
                </div>
                <div class="ow-val">
                  <span class="ow-num">{{ well.rate | number }}</span>
                  <span class="ow-unit">GPM</span>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    }
  </div>

  @if (store.offsetWells().length === 0) {
    <div class="ow-empty">No offset wells found for selection.</div>
  }

  <svg style="width:0;height:0;position:absolute;" aria-hidden="true">
    <defs>
      <linearGradient id="well-drop-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stop-color="#3b82f6"/>
        <stop offset="100%" stop-color="#1d4ed8"/>
      </linearGradient>
    </defs>
  </svg>
</div>

```

## `src/app/features/presentation/offset-wwells/offset-wwells.component.scss` (M )

```scss
// ── Tab card widget — same visual language as Well Test Results, but rows
//    expand in place (collapsible) instead of opening a dialog. ─────────────────

.ow-container {
  background: var(--surface-card, #fff);
  border: 1px solid var(--border-sub, #e2e8f0);
  border-radius: 10px;
  overflow: hidden;
}

.ow-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px 7px;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;

  &__title {
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #1e3a8a;
  }

  &__badge {
    font-size: 10px;
    font-weight: 700;
    background: #16a34a;
    color: #fff;
    border-radius: 10px;
    padding: 1px 7px;
  }
}

.ow-list {
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ow-item {
  border-radius: 9px;
}

.ow-tab {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 16px;
  border-radius: 9px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  cursor: pointer;
  transition: background 0.12s, box-shadow 0.12s, border-radius 0.12s;
  text-align: left;

  &:hover {
    background: #eff6ff;
    box-shadow: 0 1px 4px rgba(37, 99, 235, 0.12);
    border-color: #bfdbfe;
  }

  &--expanded {
    background: #eff6ff;
    border-color: #bfdbfe;
    border-radius: 9px 9px 0 0;
    border-bottom-color: transparent;
  }

  &__left {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    flex: 1;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__icon {
    flex-shrink: 0;

    svg {
      width: 26px;
      height: 26px;
      display: block;
      filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.35));
    }
  }
}

.ow-chevron {
  display: flex;
  svg {
    width: 16px;
    height: 16px;
    color: #94a3b8;
    display: block;
    transition: transform 0.2s ease, color 0.2s ease;
  }

  .ow-tab--expanded & svg {
    transform: rotate(90deg);
    color: #2563eb;
  }
}

.ow-tab-metrics {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
  flex: 1;
}

.ow-tab-metric {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 0 0 auto;

  &--well {
    flex: 1 1 auto;
  }

  &__label {
    font-size: 9px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #94a3b8;
  }

  &__value {
    font-size: 15px;
    font-weight: 900;
    color: #0f172a;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 170px;

    .ow-tab-metric--well & {
      max-width: none;
      white-space: normal;
      overflow: visible;
      text-overflow: clip;
      word-break: break-word;
    }

    &--aquifer { color: #2563eb; }
    &--warn { color: #d97706; }
  }

  &__sep {
    flex-shrink: 0;
    width: 2px;
    height: 26px;
    background: #e2e8f0;
  }
}

.ow-empty {
  text-align: center;
  padding: 32px 16px;
  color: #94a3b8;
  font-size: 13px;
  font-weight: 700;
}

// ── Collapsible content ──────────────────────────────────────────────────────

.ow-content {
  border: 1px solid #bfdbfe;
  border-top: none;
  border-radius: 0 0 9px 9px;
  background: #e8eef5;
  animation: ow-slide-down 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: top;
  overflow: hidden;
}

@keyframes ow-slide-down {
  from { opacity: 0; transform: translateY(-6px) scaleY(0.97); }
  to   { opacity: 1; transform: translateY(0) scaleY(1); }
}

// ── Bento card grid ───────────────────────────────────────────────────────────

.ow-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
  padding: 10px;
}

.ow-card {
  background: #fff;
  border-radius: 9px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 8px 10px 7px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  min-height: 78px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #3b82f6, #93c5fd);
  }

  &--warn::before {
    background: linear-gradient(90deg, #d97706, #fbbf24);
  }

  &--span2 { grid-column: span 2; }
}

// ── Card internals ────────────────────────────────────────────────────────────

.ow-card__hd {
  display: flex;
  align-items: center;
  gap: 6px;
}

.ow-icon {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 11px;
    height: 11px;
    color: #64748b;
    display: block;
  }

  &--warn {
    background: rgba(217, 119, 6, 0.1);
    border-color: rgba(217, 119, 6, 0.25);

    svg { color: #d97706; }
  }
}

.ow-label {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94a3b8;
}

.ow-val {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex: 1;
  padding-top: 1px;
}

.ow-num {
  font-size: 22px;
  font-weight: 900;
  color: #0f172a;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  letter-spacing: -0.02em;

  .ow-card--warn & { color: #b45309; }

  &--md { font-size: 19px; }
}

.ow-unit {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
}

.ow-text {
  font-size: 15px;
  font-weight: 800;
  color: #334155;
  flex: 1;
  line-height: 1.3;
}

@media (max-width: 520px) {
  .ow-tab-metrics {
    gap: 10px;
  }

  .ow-tab-metric__value {
    max-width: 110px;
  }
}

```

## `src/app/features/presentation/offset-wwells/offset-wwells.component.ts` (M )

```typescript
/**
 * OffsetWwellsComponent — SMART
 * Reads store.offsetWells() directly.
 * No @Input needed.
 */
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { trigger, transition, animate, style } from '@angular/animations';
import { PresentationStore } from '../store/presentation.store';

@Component({
  selector: 'app-offset-wwells',
  standalone: true,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './offset-wwells.component.html',
  styleUrl: './offset-wwells.component.scss',
  animations: [
    trigger('owTabAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-8px)' }),
        animate('300ms ease', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ]),
  ],
})
export class OffsetWwellsComponent {
  protected readonly store = inject(PresentationStore);
  protected readonly expandedWell = signal<string | null>(null);

  protected toggleWell(wellName: string, container: HTMLElement): void {
    const next = this.expandedWell() === wellName ? null : wellName;
    this.expandedWell.set(next);
    if (next) setTimeout(() => this.scrollToPanel(container), 260);
  }

  private scrollToPanel(el: HTMLElement): void {
    const scrollParent = this.findScrollParent(el);
    if (!scrollParent) return;
    const offset = el.getBoundingClientRect().top - scrollParent.getBoundingClientRect().top;
    scrollParent.scrollTo({ top: scrollParent.scrollTop + offset, behavior: 'smooth' });
  }

  private findScrollParent(el: HTMLElement): HTMLElement | null {
    let parent = el.parentElement;
    while (parent && parent !== document.body) {
      const { overflowY } = window.getComputedStyle(parent);
      if (overflowY === 'auto' || overflowY === 'scroll') return parent;
      parent = parent.parentElement;
    }
    return null;
  }
}

```

## `src/app/features/presentation/presentation.component.scss` (M )

```scss
:host {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: linear-gradient(180deg, #eef2f5 0%, #e7edf2 100%);
  font-family: var(--font-sans);
  font-size: 15px;
  line-height: 1.5;
}

.presentation {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  gap: 2px;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.72) 0%, rgba(230, 236, 241, 0.86) 100%);

  // In-app focus mode — covers the entire viewport, hiding the app's
  // sidebar/header. Combined with the native Fullscreen API on :host.
  &--fullscreen {
    position: fixed;
    inset: 0;
    z-index: 1000;
    height: 100vh;
    padding: 10px;
    background: linear-gradient(180deg, #eef2f5 0%, #e7edf2 100%);
  }
}

// ── Toolbar row ────────────────────────────────────────────────────────────────
.presentation__toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;

  .toolbar__chips {
    flex: 1;
    min-width: 0;
  }
}

::ng-deep .pres-modal-dialog .mat-mdc-dialog-surface {
  background: var(--bg-app);
  border: 1px solid var(--border);
  border-radius: 18px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.4);
}

::ng-deep .pres-modal-dialog .mat-mdc-dialog-content {
  max-height: none;
}

// ── Modal title ───────────────────────────────────────────────────────────────
.pres-modal__title {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: 0.02em;
}

.pres-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
  padding: 12px 20px;
}

.pres-modal__close {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-primary);

  svg {
    width: 16px;
    height: 16px;
  }
}

// ── Modal body — vertical stack: diagram on top, logs below ──────────────────
.pres-modal__body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: calc(90vh - 60px);
  gap: 0;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
}

// Diagram layout inside modal — depth scale + wellbore view side by side
.modal-diagram {
  flex-shrink: 0;
  height: calc(90vh - 160px);
  display: flex;
  align-items: stretch;
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.08), transparent);
    transform: translateX(-100%);
    opacity: 0;
    pointer-events: none;
  }

  &--loading::after {
    opacity: 1;
    animation: card-sheen 1.15s linear infinite;
  }
}

.pres-error-banner {
  flex-shrink: 0;
  margin: 0 12px 4px;
  border-radius: 8px;
  padding: 0.8rem 1rem;
  border: 1px solid rgba(220, 38, 38, 0.22);
  background: rgba(220, 38, 38, 0.08);
  color: var(--danger);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
}

// ── Layout toggle — absolute corner button inside diagram area ────────────────
.diagram-layout-toggle {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1.5px solid var(--border);
  background: var(--bg-surface);
  color: var(--text-primary);
  cursor: pointer;
  transition: border-color 0.18s, background 0.18s, color 0.18s, box-shadow 0.18s, transform 0.18s;

  svg {
    width: 15px;
    height: 15px;
    flex-shrink: 0;
  }

  &:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-muted);
    transform: scale(1.05);
  }

  // Active / Free-mode state
  &--on {
    border-color: var(--accent);
    background: var(--accent-muted);
    color: var(--accent);
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
  }
}

// ── Error banner ───────────────────────────────────────────────────────────────
.error-banner {
  flex-shrink: 0;
  margin: 0 12px 4px;
  padding: 7px 14px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: var(--danger);
  font-size: 14px;
  font-weight: 700;
}

// ══════════════════════════════════════════════════════════════════════════════
// MODE A — FIXED three-column layout (default)
// ══════════════════════════════════════════════════════════════════════════════
.pres-fixed {
  flex: 1;
  display: flex;
  align-items: stretch;
  overflow: hidden;
  min-height: 0;
  gap: 0;

  &--loading {
    .pres-fixed__left > *,
    .pres-fixed__right > * {
      opacity: 0.9;
      filter: saturate(0.95);
    }

    .diagram-card {
      border-color: rgba(14, 165, 233, 0.34);
      box-shadow: 0 10px 30px rgba(14, 165, 233, 0.12);
    }
  }

  // Left panel — width driven by signal
  &__left {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 10px 0 10px 10px;
    min-width: 0;
    position: relative;

    > * {
      transition: opacity 0.22s ease, filter 0.22s ease;
    }

    // Make draggable-card children fill available height
    app-draggable-card {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }

    &::-webkit-scrollbar {
      width: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--border);
      border-radius: 3px;
    }
  }

  // Center panel — fills remaining space
  &__center {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
    padding: 10px 0;
    gap: 10px;
    position: relative; // needed for canvas-controls absolute positioning
    transition: opacity 0.22s ease, filter 0.22s ease;
  }

  // Right panel — width driven by signal
  &__right {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 10px 10px 10px 0;
    min-width: 0;
    position: relative;

    > * {
      transition: opacity 0.22s ease, filter 0.22s ease;
    }

    app-draggable-card {
      flex-shrink: 0;
    }

    &::-webkit-scrollbar {
      width: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--border);
      border-radius: 3px;
    }
  }
}

// Wellbore diagram + indicators unified card

.diagram-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #fcfdff 0%, #f4f8ff 100%);
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
  overflow: hidden;
  min-height: 0;
  position: relative;
  transition: border-color 0.22s ease, box-shadow 0.22s ease;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.09), transparent);
    transform: translateX(-100%);
    opacity: 0;
    pointer-events: none;
  }

  &--loading::after {
    opacity: 1;
    animation: card-sheen 1.15s linear infinite;
  }
}

.diagram-scroll-area {
  flex: 1;
  display: flex;
  align-items: stretch;
  overflow: hidden;
}

// ── Diagram fullscreen overlay ────────────────────────────────────────────────
.diagram-card--diagram-fs {
  position: fixed;
  inset: 0;
  z-index: 900;
  border-radius: 0;
  border: none;

  .diagram-scroll-area {
    overflow: hidden;
  }
}

// ── Diagram fullscreen toggle button ─────────────────────────────────────────
.diagram-fs-toggle {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1.5px solid var(--border);
  background: var(--bg-surface);
  color: var(--text-secondary);
  cursor: pointer;
  transition: border-color 0.18s, background 0.18s, color 0.18s, box-shadow 0.18s, transform 0.18s;

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  &:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-muted);
    transform: scale(1.06);
  }

  &--active {
    border-color: var(--accent);
    background: var(--accent-muted);
    color: var(--accent);
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
  }
}

.pres-section-card {
  display: block;
  border-radius: 16px;
  overflow: visible;

  > * {
    display: block;
    width: 100%;
  }

  &--left,
  &--right {
    flex-shrink: 0;
  }
}

:host ::ng-deep .pres-section-card .misc-card,
:host ::ng-deep .pres-section-card .formation-card,
:host ::ng-deep .pres-section-card .map-card,
:host ::ng-deep .pres-section-card .ow-container,
:host ::ng-deep .pres-section-card .test-results-container,
:host ::ng-deep .pres-section-card .docs-container {
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.09);
  overflow: hidden;
}

:host ::ng-deep .pres-section-card .misc-card {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  padding: 12px;
}

// ══════════════════════════════════════════════════════════════════════════════
// MODE B — FREE canvas layout (Restructured to Vertical)
// ══════════════════════════════════════════════════════════════════════════════
.pres-canvas {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px 12px 24px;
  gap: 12px;
  min-height: 0;

  // Subtle dot grid backdrop
  background-image: radial-gradient(circle, var(--border) 1px, transparent 1px);
  background-size: 28px 28px;
  background-position: 14px 14px;
  background-color: var(--bg-content);

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 4px;
  }
}

.canvas__section {
  width: 100%;
  position: relative;

  &--diagram {
    flex-shrink: 0;
    height: calc(100vh - 68px);
    background: var(--bg-card);
    border-radius: 18px;
    padding: 50px 16px 16px;
    border: 1px solid var(--border);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow: hidden;

    // Logs indicator must not be squeezed by diagram-inner (flex:1)
    app-wwells-logs-indicators {
      flex-shrink: 0;
    }
  }
}

.canvas__row {
  display: flex;
  gap: 20px;
  width: 100%;

  @media (max-width: 1200px) {
    flex-direction: column;
  }

  .flex-1 {
    flex: 1;
    min-width: 0;
  }
}

// Diagram in free mode
.diagram-inner {
  flex: 1;
  display: flex;
  min-height: 0;
  background: var(--bg-surface);
  border-radius: 12px;
  overflow: hidden;
}

// ── Shared empty state ─────────────────────────────────────────────────────────
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 14px;
  color: var(--text-primary);
  padding: 24px;

  &__icon {
    font-size: 40px;
    opacity: 0.4;
  }

  &__text {
    font-size: 15px;
    font-weight: 700;
    line-height: 1.45;
    max-width: 28rem;
    text-align: center;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// UNIFIED INFO PANEL — tabbed card in Free Mode
// ══════════════════════════════════════════════════════════════════════════════
.info-panel {
  width: 100%;
  flex-shrink: 0;
  min-height: 480px;
  background: var(--bg-card);
  border-radius: 18px;
  border: 1px solid var(--border);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  // ── Tab navigation bar ───────────────────────────────────────────────────
  &__tabs {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 10px 10px 0;
    background: var(--bg-surface);
    border-bottom: 1px solid var(--border);
    overflow-x: auto;
    flex-shrink: 0;

    &::-webkit-scrollbar { height: 0; }
  }

  // ── Tab content area ─────────────────────────────────────────────────────
  &__content {
    flex: 1;
    overflow-y: auto;
    min-height: 400px;

    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

    // Stretch child components to fill
    > * {
      display: block;
      width: 100%;
    }
  }
}

// ── Individual tab button ────────────────────────────────────────────────────
.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 10px 10px 0 0;
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.02em;
  cursor: pointer;
  white-space: nowrap;
  position: relative;
  transition: color 0.18s, background 0.18s;
  flex-shrink: 0;

  svg {
    width: 13px;
    height: 13px;
    flex-shrink: 0;
    opacity: 0.7;
    transition: opacity 0.18s;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 2px;
    background: var(--accent);
    border-radius: 2px 2px 0 0;
    transform: translateX(-50%);
    transition: width 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover {
    color: var(--text-primary);
    background: rgba(14, 165, 233, 0.06);

    svg { opacity: 1; }
  }

  &--active {
    color: var(--accent);
    background: rgba(14, 165, 233, 0.08);

    svg { opacity: 1; color: var(--accent); }

    &::after {
      width: calc(100% - 16px);
    }
  }
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-5px);
  }
}

@keyframes card-sheen {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

```

## `src/app/features/presentation/well-bore-view/real-3d/builders/completion-3d.builder.ts` (M )

```typescript
import * as THREE from 'three';

import { ANIM, DiagramLayout, WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { computeCasingHalfWidth } from '@shared/utils/wellbore-math.util';
import {
  resolveCompletionBottomDepth,
  resolveCompletionTopDepth,
  resolveOhHalfWidth,
  shouldRenderGravelPack,
  shouldRenderOpenHole,
} from '../../renderers/wellbore-depth.helpers';
import { buildPipeMesh } from './casing-3d.builder';
import { createGravelMaterial, createRockMaterial, createWaterMaterial } from '../utils/materials.factory';
import { createLabelSprite } from '../utils/label-sprite.util';
import { Depth3DScale, Reveal3DTarget } from '../wellbore-3d.types';

export interface CompletionBuildResult {
  readonly group: THREE.Group;
  readonly reveals: Reveal3DTarget[];
  readonly waterRipple: THREE.Mesh | null;
  readonly drillBit: THREE.Mesh;
  readonly drillString: THREE.Mesh;
  readonly drillBitTargetY: number;
  readonly totalDepthLabel: THREE.Sprite;
  readonly totalDepthY: number;
}

/** Red→amber→green, matching the 2D mud-circulation gradient used on the drill-string arrow. */
function circulationColor(pct: number): string {
  const clamped = Math.max(0, Math.min(100, pct));
  if (clamped === 0) return '#e53e3e';
  if (clamped === 100) return '#16a34a';
  const hue = 30 + ((clamped - 1) / 98) * 25;
  return `hsl(${hue.toFixed(1)}, 90%, 50%)`;
}

function resolveWaterLevelDepth(data: WellboreDiagramData): number | null {
  const wd = data.wellDesign;
  if (!wd) return null;
  const rawTxt = wd.swLvlTxt ?? '';
  const isFlowing = /flow/i.test(rawTxt);
  if (isFlowing) {
    const match = /SIWHP[:\s]*(-?\d+(?:\.\d+)?)/i.exec(rawTxt) ?? /(-?\d+(?:\.\d+)?)\s*psi/i.exec(rawTxt);
    const psi = match ? Number(match[1]) : null;
    return psi !== null ? -(psi * 2.37) : 0;
  }
  return wd.staWaterLvl || null;
}

function buildOpenHoleAndScreen(
  data: WellboreDiagramData,
  layout: DiagramLayout,
  depthScale: Depth3DScale,
  ohStart: number,
  group: THREE.Group,
  reveals: Reveal3DTarget[],
): void {
  if (!data.casings.length || !shouldRenderOpenHole(data.wellDesign)) return;

  const ohHW = resolveOhHalfWidth(data, layout);
  const topDepth = resolveCompletionTopDepth(data.casings, data.drlgCasings);
  const bottomDepth = resolveCompletionBottomDepth(data);
  const topY = depthScale.toY(topDepth);
  const bottomY = depthScale.toY(bottomDepth);

  const material = createRockMaterial();
  const mesh = buildPipeMesh(depthScale.toRadius(ohHW), topY, bottomY, material);
  mesh.name = 'open-hole';
  group.add(mesh);

  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -topY);
  material.clippingPlanes = [plane];
  reveals.push({ mesh, clipPlane: plane, topY, bottomY, delay: ohStart, duration: ANIM.OH_DURATION / 1000 });

  const label = createLabelSprite({
    text: data.wellDesign?.ohRemarks ?? `${ohHW.toFixed(0)}px Open Hole`,
    color: '#334155',
    fontSize: 26,
  });
  label.position.set(depthScale.toRadius(ohHW) + 1.4, topY + (bottomY - topY) * 0.2, 0);
  group.add(label);
}

function buildGravelPack(
  data: WellboreDiagramData,
  layout: DiagramLayout,
  depthScale: Depth3DScale,
  gravelStart: number,
  group: THREE.Group,
  reveals: Reveal3DTarget[],
): void {
  const wellDesign = data.wellDesign;
  if (!wellDesign || !shouldRenderGravelPack(wellDesign) || !data.casings.length) return;

  const { baseHalfWidth, halfWidthIncrement, linerScreenInset, gpScreenGap, gpFillRatio } = layout;
  const innerHW = computeCasingHalfWidth(0, baseHalfWidth, halfWidthIncrement);
  const ohHW = resolveOhHalfWidth(data, layout);
  const lsHW = Math.min(innerHW, ohHW) - linerScreenInset;
  const gpMaxOuter = ohHW - gpScreenGap;
  const annulusWidth = Math.max(0, (gpMaxOuter - lsHW) * gpFillRatio);
  const innerR = depthScale.toRadius(lsHW);
  const outerR = depthScale.toRadius(lsHW + annulusWidth);
  if (outerR <= innerR) return;

  const topDepth = resolveCompletionTopDepth(data.casings, data.drlgCasings);
  const bottomDepth = resolveCompletionBottomDepth(data);
  const topY = depthScale.toY(topDepth);
  const bottomY = depthScale.toY(bottomDepth);
  const height = Math.max(0.05, topY - bottomY);

  const shape = new THREE.Shape();
  shape.absarc(0, 0, outerR, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, innerR, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  const geometry = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false, curveSegments: 48 });
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, 0, 0);

  const material = createGravelMaterial();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = bottomY;
  mesh.name = 'gravel-pack';
  group.add(mesh);

  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -topY);
  material.clippingPlanes = [plane];
  reveals.push({ mesh, clipPlane: plane, topY, bottomY, delay: gravelStart, duration: ANIM.GRAVEL_DURATION / 1000 });
}

function buildWaterLevel(
  data: WellboreDiagramData,
  layout: DiagramLayout,
  depthScale: Depth3DScale,
  group: THREE.Group,
): THREE.Mesh | null {
  const waterDepth = resolveWaterLevelDepth(data);
  if (waterDepth === null) return null;

  const widestTier = data.casings.length > 0 ? data.casings.length - 1 : 0;
  const innerHW = computeCasingHalfWidth(widestTier, layout.baseHalfWidth, layout.halfWidthIncrement);
  const radius = depthScale.toRadius(innerHW) + 0.6;
  const y = depthScale.toY(waterDepth);

  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 48),
    createWaterMaterial(),
  );
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = y;
  disc.name = 'water-level';
  group.add(disc);

  const ripple = new THREE.Mesh(
    new THREE.RingGeometry(radius * 0.2, radius * 0.28, 48),
    new THREE.MeshBasicMaterial({ color: '#0ea5e9', transparent: true, opacity: 0.85, side: THREE.DoubleSide }),
  );
  ripple.rotation.x = -Math.PI / 2;
  ripple.position.y = y + 0.02;
  ripple.name = 'water-ripple';
  group.add(ripple);

  const label = createLabelSprite({ text: `Water Level: ${waterDepth.toLocaleString()} ft`, color: '#0ea5e9', fontSize: 26 });
  label.position.set(-(radius + 1.6), y + 0.3, 0);
  group.add(label);

  return ripple;
}

function buildDrillString(
  data: WellboreDiagramData,
  depthScale: Depth3DScale,
  group: THREE.Group,
): { bit: THREE.Mesh; string: THREE.Mesh; targetY: number } {
  const currentDepth = Math.max(0, Math.min(data.currentDepth, data.totalDepth));
  const targetY = depthScale.toY(currentDepth);
  const stringHeight = Math.max(0.001, -targetY);
  const lastPct = data.mudCirculation.length > 0 ? data.mudCirculation[data.mudCirculation.length - 1].pct : 100;

  // Geometry is pre-translated so the mesh's local origin sits at its TOP edge (surface) —
  // animating `scale.y` from 0 → 1 then grows the string straight down from the rig floor,
  // instead of scaling outward from a centered pivot.
  const stringGeom = new THREE.CylinderGeometry(0.18, 0.18, stringHeight, 16);
  stringGeom.translate(0, -stringHeight / 2, 0);
  const stringMat = new THREE.MeshStandardMaterial({ color: circulationColor(lastPct), metalness: 0.6, roughness: 0.4 });
  const stringMesh = new THREE.Mesh(stringGeom, stringMat);
  stringMesh.position.y = 0;
  stringMesh.scale.y = 0;
  stringMesh.name = 'drill-string';
  group.add(stringMesh);

  const bitMat = new THREE.MeshStandardMaterial({ color: '#facc15', metalness: 0.8, roughness: 0.3 });
  const bit = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.1, 24), bitMat);
  bit.name = 'drill-bit';
  bit.position.y = 0; // rig-floor rest position; the reveal timeline drives it down to targetY
  group.add(bit);

  return { bit, string: stringMesh, targetY };
}

function buildPumpMarker(data: WellboreDiagramData, depthScale: Depth3DScale, group: THREE.Group): void {
  const pumpLvl = data.wellDesign?.pumpLvl;
  if (pumpLvl == null) return;
  const label = createLabelSprite({ text: `Pump Set @ ${pumpLvl.toLocaleString()} ft`, color: '#1e293b', fontSize: 26 });
  label.position.set(0, depthScale.toY(pumpLvl), 0.01);
  group.add(label);
}

export function buildCompletion3D(
  data: WellboreDiagramData,
  layout: DiagramLayout,
  depthScale: Depth3DScale,
  timing: { ohStart: number; gravelStart: number },
): CompletionBuildResult {
  const group = new THREE.Group();
  group.name = 'completion';
  const reveals: Reveal3DTarget[] = [];

  buildOpenHoleAndScreen(data, layout, depthScale, timing.ohStart, group, reveals);
  buildGravelPack(data, layout, depthScale, timing.gravelStart, group, reveals);
  const waterRipple = buildWaterLevel(data, layout, depthScale, group);
  const { bit, string: drillString, targetY } = buildDrillString(data, depthScale, group);
  buildPumpMarker(data, depthScale, group);

  const isBeyondTarget = data.targetDepth > 0 && data.currentDepth > data.targetDepth;
  const labelDepth = isBeyondTarget ? data.currentDepth : data.totalDepth;
  const totalDepthY = depthScale.toY(resolveCompletionBottomDepth(data));
  const totalDepthLabel = createLabelSprite({
    text: `${isBeyondTarget ? 'CURRENT DEPTH' : 'TOTAL DEPTH'}: ${labelDepth.toLocaleString()} FT`,
    color: isBeyondTarget ? '#16a34a' : '#2563eb',
    fontSize: 30,
    fontWeight: '900',
  });
  totalDepthLabel.position.set(0, totalDepthY - 2, 0);
  group.add(totalDepthLabel);

  return {
    group,
    reveals,
    waterRipple,
    drillBit: bit,
    drillString,
    drillBitTargetY: targetY,
    totalDepthLabel,
    totalDepthY,
  };
}

```

## `src/app/features/presentation/well-bore-view/renderers/not-drilled-zone.renderer.ts` (M )

```typescript
import { pointer } from 'd3-selection';
import 'd3-transition';

import { ANIM, DiagramLayout, WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { DepthScale, GSel } from './wellbore-renderer.types';

const ND_TOOLTIP_W = 240;
const ND_TOOLTIP_GAP = 18;
const ND_TOOLTIP_FONT = 'DM Sans, sans-serif';
const ND_ACCENT = '#ef4444';
const ND_ACCENT_MUTED = 'rgba(239,68,68,0.14)';
const ROW_H = 28;

export interface RenderNotDrilledZoneOptions {
  readonly rootG: GSel;
  readonly data: WellboreDiagramData;
  readonly centerX: number;
  readonly scale: DepthScale;
  readonly start: number;
  readonly openHoleHalfWidth: number;
  readonly layout: DiagramLayout;
}

export function renderNotDrilledZone({
  rootG,
  data,
  centerX,
  scale,
  start,
  openHoleHalfWidth,
  layout,
}: RenderNotDrilledZoneOptions): void {
  const estTargetDepth = data.totalDepth;
  const currentDepth = data.currentDepth;
  const undrilledFt = estTargetDepth - currentDepth;

  if (currentDepth <= 0 || undrilledFt <= 1) return;

  const topPx = scale(currentDepth);
  const bottomPx = scale(estTargetDepth);
  const height = bottomPx - topPx;
  const width = openHoleHalfWidth * 2 + 160;
  const lx = centerX - openHoleHalfWidth - 80;
  const rx = lx + width;

  const ndg = rootG.append('g')
    .attr('class', 'not-drilled-zone')
    .style('opacity', 0);

  const zoneRect = ndg.append('rect')
    .attr('x', lx)
    .attr('y', topPx)
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'rgba(239, 68, 68, 0.12)')
    .attr('stroke', 'rgba(239, 68, 68, 0.3)')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '8,4')
    .style('cursor', 'help')
    .style('pointer-events', 'all');

  ndg.transition()
    .delay(start)
    .duration(ANIM.OVERLAY_FADE)
    .style('opacity', 1);

  // ── Hover tooltip — follows the cursor and flips left/right off the zone
  // edge nearest the pointer, matching the casing/liner and mud-circulation
  // tooltip cards elsewhere in this diagram. ──────────────────────────────
  const badge = `${undrilledFt.toLocaleString()} FT`;
  const badgeW = badge.length * 8.5 + 16;
  const rows: { label: string; value: string; hilite?: boolean }[] = [
    { label: 'Current Depth', value: `${currentDepth.toLocaleString()} ft` },
    { label: 'Target Depth', value: `${estTargetDepth.toLocaleString()} ft`, hilite: true },
  ];
  const ttipH = 60 + rows.length * ROW_H + 16;

  const ttipG = rootG.append('g')
    .attr('class', 'not-drilled-tooltip')
    .style('opacity', 0)
    .style('pointer-events', 'none');

  let isVisible = false;
  let lastSide: 'left' | 'right' | null = null;
  const node = rootG.node() as Element;

  const showTooltip = (mouseX: number, mouseY: number): void => {
    const onRight = mouseX > centerX;
    const side: 'left' | 'right' = onRight ? 'right' : 'left';
    const edgeX = onRight ? rx : lx;

    const rawTtipX = onRight ? edgeX + ND_TOOLTIP_GAP : edgeX - ND_TOOLTIP_GAP - ND_TOOLTIP_W;
    const ttipX = Math.max(8, Math.min(rawTtipX, layout.wellboreViewWidth - ND_TOOLTIP_W - 8));
    const ttipY = Math.max(4, Math.min(mouseY - ttipH / 2, layout.drawingHeight - ttipH - 4));
    const connY = Math.min(Math.max(mouseY, ttipY + 18), ttipY + ttipH - 18);
    const connTipX = onRight ? ttipX : ttipX + ND_TOOLTIP_W;
    const connMidX = onRight ? ttipX - 8 : ttipX + ND_TOOLTIP_W + 8;

    ttipG.selectAll('*').remove();
    ttipG.raise();

    // Connector elbow + anchor dot
    ttipG.append('path')
      .attr('d', `M${edgeX},${mouseY} H${connMidX} Q${connTipX},${mouseY} ${connTipX},${connY} H${connTipX}`)
      .attr('fill', 'none').attr('stroke', ND_ACCENT)
      .attr('stroke-width', 1.4).attr('stroke-dasharray', '4,3')
      .attr('stroke-linecap', 'round').attr('opacity', 0.65);
    ttipG.append('circle')
      .attr('cx', edgeX).attr('cy', mouseY)
      .attr('r', 3.2).attr('fill', '#fff')
      .attr('stroke', ND_ACCENT).attr('stroke-width', 1.6);

    // Card
    ttipG.append('rect')
      .attr('x', ttipX).attr('y', ttipY)
      .attr('width', ND_TOOLTIP_W).attr('height', ttipH)
      .attr('rx', 8).attr('fill', '#ffffff')
      .attr('stroke', '#e2e8f0').attr('stroke-width', 1.2)
      .attr('filter', 'drop-shadow(0 8px 16px rgba(15,23,42,0.18))');

    // Accent rail on the connector side
    const railX = onRight ? ttipX : ttipX + ND_TOOLTIP_W - 5;
    ttipG.append('rect')
      .attr('x', railX).attr('y', ttipY)
      .attr('width', 5).attr('height', ttipH)
      .attr('rx', 2).attr('fill', ND_ACCENT);

    // Badge
    ttipG.append('rect')
      .attr('x', ttipX + 12).attr('y', ttipY + 11)
      .attr('width', badgeW).attr('height', 22)
      .attr('rx', 11).attr('fill', ND_ACCENT_MUTED);
    ttipG.append('text')
      .attr('x', ttipX + 12 + badgeW / 2).attr('y', ttipY + 27)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14').attr('font-family', ND_TOOLTIP_FONT)
      .attr('font-weight', '900').attr('letter-spacing', '0.5')
      .attr('fill', ND_ACCENT).text(badge);

    // Title
    ttipG.append('text')
      .attr('x', ttipX + ND_TOOLTIP_W - 12).attr('y', ttipY + 27)
      .attr('text-anchor', 'end')
      .attr('font-size', '17').attr('font-family', ND_TOOLTIP_FONT)
      .attr('font-weight', '800').attr('fill', '#0f172a').text('Not Drilled');

    // Divider
    ttipG.append('line')
      .attr('x1', ttipX + 12).attr('x2', ttipX + ND_TOOLTIP_W - 12)
      .attr('y1', ttipY + 44).attr('y2', ttipY + 44)
      .attr('stroke', '#e2e8f0').attr('stroke-width', 1);

    // Rows
    rows.forEach((row, i) => {
      const rowY = ttipY + 64 + i * ROW_H;
      ttipG.append('text')
        .attr('x', ttipX + 14).attr('y', rowY)
        .attr('font-size', '15').attr('font-family', ND_TOOLTIP_FONT)
        .attr('font-weight', '700').attr('fill', '#64748b').text(row.label);
      ttipG.append('text')
        .attr('x', ttipX + ND_TOOLTIP_W - 14).attr('y', rowY)
        .attr('text-anchor', 'end')
        .attr('font-size', '17').attr('font-family', ND_TOOLTIP_FONT)
        .attr('font-weight', '800')
        .attr('fill', row.hilite ? ND_ACCENT : '#0f172a').text(row.value);
    });

    // Fade in only on first show or when the side flips; instant reposition otherwise
    const sideChanged = side !== lastSide;
    lastSide = side;
    if (!isVisible || sideChanged) {
      ttipG.interrupt().style('opacity', 0).transition().duration(150).style('opacity', 1);
      isVisible = true;
    } else {
      ttipG.style('opacity', 1);
    }
  };

  const hideTooltip = (): void => {
    isVisible = false;
    lastSide = null;
    ttipG.interrupt().transition().duration(120).style('opacity', 0);
  };

  zoneRect
    .on('mousemove', (event: MouseEvent) => {
      const [mx, my] = pointer(event, node);
      showTooltip(mx, my);
    })
    .on('mouseleave', hideTooltip);
}

```

## `src/app/features/presentation/well-bore-view/renderers/pump-and-depth.renderer.ts` (M )

```typescript
import { WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { buildArrowHeadRight } from '@shared/utils/wellbore-math.util';
import { animateLabel, applyPop } from './animation.helpers';
import { DepthScale, GSel, ResolvedAnimation } from './wellbore-renderer.types';

export interface RenderTotalDepthLabelOptions {
  readonly rootG: GSel;
  readonly data: WellboreDiagramData;
  readonly centerX: number;
  readonly yPx: number;
  readonly start: number;
  readonly animation: ResolvedAnimation;
}

export interface RenderPumpOptions {
  readonly rootG: GSel;
  readonly data: WellboreDiagramData;
  readonly centerX: number;
  readonly scale: DepthScale;
  readonly start: number;
  readonly animation: ResolvedAnimation;
}

export function renderTotalDepthLabel({
  rootG,
  data,
  centerX,
  yPx,
  start,
  animation,
}: RenderTotalDepthLabelOptions): void {
  const ty = yPx + 35;
  const isCurrentDepthBeyondTarget = data.targetDepth > 0 && data.currentDepth > data.targetDepth;
  const labelDepth = isCurrentDepthBeyondTarget ? data.currentDepth : data.totalDepth;
  const g = rootG.append('g').attr('class', 'td-label');
  g.append('text')
    .attr('class', isCurrentDepthBeyondTarget ? 'total-depth-main total-depth-main--current' : 'total-depth-main')
    .attr('x', 0).attr('y', 0)
    .attr('text-anchor', 'middle')
    .text(`${isCurrentDepthBeyondTarget ? 'CURRENT DEPTH' : 'TOTAL DEPTH'}: ${labelDepth.toLocaleString()} FT`);
  applyPop(g, centerX, ty, start, animation);
}

export function renderPump({
  rootG,
  data,
  centerX,
  scale,
  start,
  animation,
}: RenderPumpOptions): void {
  const pumpLvl = data.wellDesign?.pumpLvl;
  if (pumpLvl == null) return;

  const cy = scale(pumpLvl);
  const cx = centerX;
  const iconW = 100;
  const iconH = 100;
  const iconX = cx - iconW / 2;
  // Pump leader/label on the RIGHT side of the icon.
  const rTip = iconX + iconW * 0.70;
  const rEnd = rTip + 130;
  const labelX = rEnd + 6;
  const pumpG = rootG.append('g').attr('class', 'pump-group');
  const iconWrap = pumpG.append('g') as GSel;
  const icon = iconWrap.append('svg')
    .attr('x', -iconW / 2)
    .attr('y', -iconH * 0.52)
    .attr('width', iconW)
    .attr('height', iconH)
    .attr('viewBox', '0 0 100 100')
    .attr('overflow', 'visible');

  const iconG = icon.append('g')
    .attr('stroke', '#1e293b')
    .attr('stroke-width', '3')
    .attr('stroke-linecap', 'round')
    .attr('stroke-linejoin', 'round');

  iconG.append('line').attr('x1', 35).attr('y1', 52).attr('x2', 65).attr('y2', 52);
  iconG.append('polygon').attr('points', '30,52 36,48 36,56').attr('fill', '#1e293b').attr('stroke', 'none');
  iconG.append('polygon').attr('points', '70,52 64,48 64,56').attr('fill', '#1e293b').attr('stroke', 'none');
  iconG.append('line').attr('x1', 50).attr('y1', 40).attr('x2', 50).attr('y2', 52);
  iconG.append('polygon').attr('points', '50,34 45,40 55,40').attr('fill', '#1e293b').attr('stroke', 'none');

  applyPop(iconWrap, cx, cy, start, animation);

  const leaderG = pumpG.append('g').attr('class', 'pump-leader-group') as GSel;
  leaderG.append('line')
    .attr('class', 'pump-leader')
    .attr('x1', rTip).attr('x2', rEnd)
    .attr('y1', cy).attr('y2', cy);
  leaderG.append('path')
    .attr('class', 'pump-leader-arrow')
    .attr('d', buildArrowHeadRight(rEnd, cy, 6));
  leaderG.append('text')
    .attr('class', 'pump-label')
    .attr('x', labelX).attr('y', cy + 4)
    .attr('text-anchor', 'start')
    .text(`PS @ ${pumpLvl}`);

  animateLabel(leaderG, start + animation.popDur, animation);
}

```

## `src/app/features/presentation/well-bore-view/renderers/wellbore-depth.helpers.ts` (M )

```typescript
import { DiagramLayout, WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { ICasingIR } from '@shared/models/wwell/casing-ir.model';
import { IDrlgCsg } from '@shared/models/wwell/drlg-csg.model';
import { IWellDesign } from '@shared/models/wwell/well-design.model';
import { computeCasingHalfWidth, parseInchSize, remarksReferenceSize } from '@shared/utils/wellbore-math.util';
import { resolveLiners } from './liner.renderer';
import { DepthScale } from './wellbore-renderer.types';

const OVERRUN_COMPLETION_LENGTH_FT = 1200;

export function resolveShoeDepth(casings: ICasingIR[], drlgCasings: IDrlgCsg[]): number {
  const irNonLiner = casings.filter(c => c.csgType !== 'Liner' && c.csgType !== 'Gravel Pack');
  const deepest = irNonLiner[0];
  if (!deepest) return drlgCasings[0]?.wCsgBotDpth ?? 0;

  const actual = drlgCasings.find(d => d.wCsgOdSz === deepest.csgSize) ?? null;
  return (actual !== null && actual.wCsgBotDpth > 0 ? actual.wCsgBotDpth : null) ?? deepest.csgDepth;
}

export function resolveLinerTopDepth(casings: ICasingIR[], drlgCasings: IDrlgCsg[]): number {
  const liner = casings.find(c => c.csgType === 'Liner');
  if (liner) {
    const actualLnr = drlgCasings.find(d => d.wLnrOdSz === liner.csgSize) ?? null;
    const topDepth = (actualLnr?.wLnrTopDepth ?? 0) > 0 ? (actualLnr?.wLnrTopDepth ?? null) : null;
    if (topDepth !== null) return topDepth;
  }
  return resolveShoeDepth(casings, drlgCasings);
}

export function resolveCompletionTopDepth(casings: ICasingIR[], drlgCasings: IDrlgCsg[]): number {
  const liner = casings.find(c => c.csgType === 'Liner');
  if (liner) {
    const actualLnr = drlgCasings.find(d => d.wLnrOdSz === liner.csgSize) ?? null;
    const actualDepth = (actualLnr?.wLnrBotDepth ?? 0) > 0 ? actualLnr?.wLnrBotDepth ?? null : null;
    return actualDepth ?? liner.csgDepth;
  }

  return resolveShoeDepth(casings, drlgCasings);
}

export function resolveCompletionTopPx(
  casings: ICasingIR[],
  drlgCasings: IDrlgCsg[],
  scale: DepthScale,
): number {
  return scale(resolveCompletionTopDepth(casings, drlgCasings));
}

export function resolveCompletionBottomDepth(data: WellboreDiagramData): number {
  const completionTopDepth = resolveCompletionTopDepth(data.casings, data.drlgCasings);
  const isCurrentDepthBeyondTarget = data.targetDepth > 0 && data.currentDepth > data.targetDepth;

  const naturalBottom = isCurrentDepthBeyondTarget
    ? Math.max(completionTopDepth, Math.min(data.totalDepth, completionTopDepth + OVERRUN_COMPLETION_LENGTH_FT))
    : data.totalDepth;

  return Math.min(naturalBottom, data.displayDepth);
}

export function resolveCompletionBottomPx(data: WellboreDiagramData, scale: DepthScale): number {
  return scale(resolveCompletionBottomDepth(data));
}

function isFlagYes(flg: string | null | undefined): boolean {
  return (flg ?? '').trim().toUpperCase() === 'Y';
}

function hasText(value: string | null | undefined): boolean {
  return !!value?.trim();
}

export function shouldRenderOpenHole(wellDesign: IWellDesign | null | undefined): boolean {
  if (!isFlagYes(wellDesign?.ohFlg)) return false;
  return parseInchSize(wellDesign?.ohRemarks) !== null;
}

export function shouldRenderGravelPack(wellDesign: IWellDesign | null | undefined): boolean {
  if (!isFlagYes(wellDesign?.gpFlg)) return false;
  return hasText(wellDesign?.gpRemarks);
}

export function shouldRenderLinerScreen(wellDesign: IWellDesign | null | undefined): boolean {
  if (!isFlagYes(wellDesign?.lsFlg)) return false;
  return hasText(wellDesign?.lsRemarks);
}

const PRE_PERF_LINER_SIZE_IN = 7;

export interface PrePerforatedLinerDepth {
  readonly odSz: string;
  readonly topDepth: number;
  readonly botDepth: number;
}

/**
 * Resolves the pre-perforated liner overlay depth range.
 *
 * All three conditions must pass:
 *   1. EXAD_GWD_WELL_DESIGN.perforatedFlg is 'Y' (case-insensitive).
 *   2. EXAD_GWD_WELL_DESIGN.perforatedRemarks references a 7" size somewhere in its free text.
 *   3. DRLG_CSG reports a matching 7" liner (wLnrOdSz) with a valid bottom depth.
 *
 * The returned depths come from that matched DRLG_CSG entry so the overlay is drawn
 * only across the actual liner interval and never exceeds its bottom depth.
 */
export function resolvePrePerforatedLinerDepth(
  wellDesign: IWellDesign | null | undefined,
  drlgCasings: IDrlgCsg[],
): PrePerforatedLinerDepth | null {
  if (!isFlagYes(wellDesign?.perforatedFlg)) return null;
  if (!remarksReferenceSize(wellDesign?.perforatedRemarks, PRE_PERF_LINER_SIZE_IN)) return null;

  const matchedLiner = drlgCasings.find(
    d => parseInchSize(d.wLnrOdSz) === PRE_PERF_LINER_SIZE_IN && (d.wLnrBotDepth ?? 0) > 0,
  );
  if (!matchedLiner) return null;

  return {
    odSz: matchedLiner.wLnrOdSz!,
    topDepth: matchedLiner.wLnrTopDepth ?? matchedLiner.wCsgBotDpth,
    botDepth: matchedLiner.wLnrBotDepth!,
  };
}

export function shouldRenderPrePerforatedLiner(
  wellDesign: IWellDesign | null | undefined,
  drlgCasings: IDrlgCsg[] = [],
): boolean {
  return resolvePrePerforatedLinerDepth(wellDesign, drlgCasings) !== null;
}

export function resolveOhHalfWidth(data: WellboreDiagramData, layout: DiagramLayout): number {
  const { baseHalfWidth, halfWidthIncrement, openHoleHwMargin } = layout;
  const innerHW = computeCasingHalfWidth(0, baseHalfWidth, halfWidthIncrement);

  if (!isFlagYes(data.wellDesign?.ohFlg)) return innerHW + openHoleHwMargin;

  const ohDiameter = parseInchSize(data.wellDesign?.ohRemarks);

  // When liners exist, scale OH relative to the last liner so the
  // physical size difference (e.g. 8.5" OH vs 7" liner) is preserved visually.
  const liners = resolveLiners(data.casings, data.drlgCasings, layout, data.wellDesign);
  const lastLiner = liners.length > 0 ? liners[liners.length - 1] : null;

  if (lastLiner !== null && ohDiameter !== null) {
    const linerOD = parseInchSize(lastLiner.odSz);
    if (linerOD !== null && linerOD > 0) {
      return lastLiner.halfWidth * (ohDiameter / linerOD);
    }
  }

  // No liners: scale relative to innermost structural casing
  const structuralCasings = data.casings.filter(
    c => c.csgType !== 'Liner' && c.csgType !== 'Gravel Pack',
  );
  const innermostOD = parseInchSize(structuralCasings[0]?.csgSize ?? null);

  if (ohDiameter !== null && innermostOD !== null && innermostOD > 0 && ohDiameter < innermostOD) {
    return innerHW * (ohDiameter / innermostOD);
  }

  return innerHW + openHoleHwMargin;
}

export function getCasingTier(csg: ICasingIR, casings: ICasingIR[]): number {
  const structuralCasings = casings.filter(item => item.csgType !== 'Gravel Pack');
  const idx = structuralCasings.indexOf(csg);
  return idx === -1 ? 0 : idx;
}

```

## `src/app/features/presentation/well-bore-view/well-bore-view.component.ts` (M )

```typescript
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  input,
  viewChild,
} from '@angular/core';
import { select } from 'd3-selection';
import 'd3-transition';

import { ANIM, computeOverlayDelay, DEFAULT_ANIM_CONFIG, DIAGRAM_LAYOUT, DiagramLayout, WellboreAnimConfig, WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { resolveLiners } from './renderers/liner.renderer';
import { FormationInfoViewModel } from '@models/active-wwell/active-wwell-view.model';
import { resolveAnimation } from './renderers/animation.helpers';
import { renderCasingElements } from './renderers/casing.renderer';
import { renderCompletionElements, renderScreenHanger } from './renderers/completion.renderer';
import { renderStaticDefs } from './renderers/defs.renderer';
import { renderDrillArrow } from './renderers/drill-arrow.renderer';
import { renderGeoTops } from './renderers/geo-tops.renderer';
import { renderNotDrilledZone } from './renderers/not-drilled-zone.renderer';
import { renderPump, renderTotalDepthLabel } from './renderers/pump-and-depth.renderer';
import { renderStaticChrome } from './renderers/static-chrome.renderer';
import { renderWaterLevel } from './renderers/water-level.renderer';
import { resolveCompletionBottomDepth, resolveOhHalfWidth } from './renderers/wellbore-depth.helpers';
import { DefsSel, GSel, SvgSel } from './renderers/wellbore-renderer.types';
import { createDepthScale } from '@shared/utils/wellbore-math.util';

@Component({
  selector: 'app-well-bore-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './wellbore-view.component.html',
  styleUrl: './wellbore-view.component.scss',
})

export class WellBoreViewComponent {
  readonly diagramData = input.required<WellboreDiagramData | null>();
  readonly animTrigger = input.required<number>();
  readonly animConfig = input<WellboreAnimConfig>(DEFAULT_ANIM_CONFIG);
  readonly formationTops = input<FormationInfoViewModel[]>([]);
  readonly diagramLayout = input<DiagramLayout>(DIAGRAM_LAYOUT);
  readonly isFullscreen = input<boolean>(false);

  private readonly svgRef = viewChild<ElementRef<SVGSVGElement>>('wellboreSvg');

  private get layout(): DiagramLayout { return this.diagramLayout(); }
  private _activeLayout: DiagramLayout | null = null;
  private rootG!: GSel;
  private defsEl!: DefsSel;

  constructor() {
    effect(() => {
      const svgEl = this.svgRef();
      const data = this.diagramData();
      const layout = this.diagramLayout();
      this.isFullscreen(); // track for SVG height update

      if (!svgEl?.nativeElement || !data) return;

      // Re-bootstrap when layout identity changes (normal ↔ fullscreen toggle).
      if (this._activeLayout !== layout) {
        this._activeLayout = layout;
        select(svgEl.nativeElement).selectAll('*').remove();
        this.rootG = null!;
        this.defsEl = null!;
      }

      if (!this.rootG) {
        this.bootstrapSvg(svgEl.nativeElement);
      }

      if (this.rootG) {
        this.redraw(data);
      }
    });
  }

  private bootstrapSvg(element: SVGSVGElement): void {
    const { wellboreViewWidth, svgHeight, marginTop } = this.layout;
    const svg = select(element) as SvgSel;
    svg.attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${wellboreViewWidth} ${svgHeight}`)
      .attr('preserveAspectRatio', 'none');

    this.defsEl = svg.append('defs') as DefsSel;
    renderStaticDefs(this.defsEl);

    this.rootG = svg.append('g')
      .attr('class', 'wellbore-root')
      .attr('transform', `translate(0,${marginTop})`) as GSel;
  }

  private redraw(data: WellboreDiagramData): void {
    if (!this.rootG) return;

    this.rootG.interrupt();

    if (!this.rootG.selectAll('*').empty()) {
      this.rootG.transition().duration(120).style('opacity', 0)
        .end()
        .then(() => this.buildDiagram(data))
        .catch(() => { /* superseded by a subsequent redraw */ });
      return;
    }

    this.buildDiagram(data);
  }

  private buildDiagram(data: WellboreDiagramData): void {
    this.rootG.selectAll('*').remove();
    this.defsEl.selectAll('.dyn-clip').remove();
    this.rootG.style('opacity', 1);

    const { drawingHeight, geoLineX, casingCenterX } = this.layout;
    const displayDepth = Math.max(data.totalDepth, data.displayDepth);
    const scale = createDepthScale(displayDepth, drawingHeight);
    const targetAquifer = data.hydrogeology?.estTargetAquifier ?? null;

    // ── Build a strict sequential timeline ─────────────────────────────────
    const structuralCasings = data.casings.filter(
      c => c.csgType !== 'Liner' && c.csgType !== 'Gravel Pack'
    );
    const liners = resolveLiners(data.casings, data.drlgCasings, this.layout, data.wellDesign);

    const t_casingsStart = 0;
    const t_casingsDone = computeOverlayDelay(structuralCasings.length);
    const t_linersStart = t_casingsDone + ANIM.SEQ_GAP;
    const t_linersDone = t_linersStart + (liners.length > 0 ? computeOverlayDelay(liners.length) : 0);
    const t_ohStart = t_linersDone + ANIM.SEQ_GAP;
    const t_ohDone = t_ohStart + ANIM.OH_DURATION;
    const t_gravelStart = t_ohDone + ANIM.SEQ_GAP;
    const t_gravelDone = t_gravelStart + ANIM.GRAVEL_DURATION;
    const t_hangerStart = t_gravelDone + ANIM.SEQ_GAP;
    const t_drillStart = 0;
    const t_labelsStart = t_linersDone + ANIM.SEQ_GAP;
    const t_ohLabelStart = t_ohDone + ANIM.SEQ_GAP;
    const t_waterStart = t_ohLabelStart + ANIM.OVERLAY_FADE + ANIM.SEQ_GAP;
    const t_notDrilledStart = t_linersDone + ANIM.SEQ_GAP;
    const t_tdLabelStart = t_notDrilledStart + ANIM.OVERLAY_FADE + ANIM.SEQ_GAP;

    // ── Draw ───────────────────────────────────────────────────────────────
    const ohHW = resolveOhHalfWidth(data, this.layout);

    renderStaticChrome({
      rootG: this.rootG,
      layout: this.layout,
      geoLineX,
      centerX: casingCenterX,
    });
    renderGeoTops({
      rootG: this.rootG,
      layout: this.layout,
      tops: data.geologicTops,
      geoLineX,
      scale,
      targetAquifer,
      formationTops: this.formationTops(),
    });
    renderCompletionElements({
      rootG: this.rootG,
      defsEl: this.defsEl,
      layout: this.layout,
      data,
      centerX: casingCenterX,
      scale,
      ohStart: t_ohStart,
      ohLabelStart: t_ohLabelStart,
      hangerStart: t_hangerStart,
      animation: resolveAnimation(this.animConfig()),
    });
    renderCasingElements({
      rootG: this.rootG,
      defsEl: this.defsEl,
      layout: this.layout,
      casings: data.casings,
      drlgCasings: data.drlgCasings,
      wellDesign: data.wellDesign,
      centerX: casingCenterX,
      scale,
      casingsStart: t_casingsStart,
      linersStart: t_linersStart,
      gravelStart: t_gravelStart,
      labelsStart: t_labelsStart,
      openHoleHalfWidthPx: ohHW,
      animation: resolveAnimation(this.animConfig()),
    });
    renderScreenHanger({
      rootG: this.rootG,
      defsEl: this.defsEl,
      layout: this.layout,
      data,
      centerX: casingCenterX,
      scale,
      ohStart: t_ohStart,
      ohLabelStart: t_ohLabelStart,
      hangerStart: t_hangerStart,
      animation: resolveAnimation(this.animConfig()),
    });
    renderWaterLevel({
      rootG: this.rootG,
      defsEl: this.defsEl,
      layout: this.layout,
      data,
      centerX: casingCenterX,
      scale,
      waterStart: t_waterStart,
      animation: resolveAnimation(this.animConfig()),
    });
    renderDrillArrow({
      rootG: this.rootG,
      defsEl: this.defsEl,
      layout: this.layout,
      data,
      scale,
      drillStart: t_drillStart,
      casingsDoneAt: t_casingsDone,
    });

    renderNotDrilledZone({
      rootG: this.rootG,
      data,
      centerX: casingCenterX,
      scale,
      start: t_notDrilledStart,
      openHoleHalfWidth: ohHW,
      layout: this.layout,
    });
    renderTotalDepthLabel({
      rootG: this.rootG,
      data,
      centerX: casingCenterX,
      yPx: scale(this.resolveDepthLabelAnchor(data)),
      start: t_tdLabelStart,
      animation: resolveAnimation(this.animConfig()),
    });
    renderPump({
      rootG: this.rootG,
      data,
      centerX: casingCenterX,
      scale,
      start: t_labelsStart,
      animation: resolveAnimation(this.animConfig()),
    });

    // Raise all interactive hover/tooltip layers above every visual overlay
    // (e.g. not-drilled-zone rect is appended last and would otherwise intercept
    // mouse events before casing/liner/geo-tops hover targets can fire).
    ['csg-hover-targets', 'csg-detail-tooltip', 'geo-hover-targets', 'geo-remark-tooltip']
      .forEach(cls => this.rootG.select(`.${cls}`).raise());
  }

  private resolveDepthLabelAnchor(data: WellboreDiagramData): number {
    if (data.targetDepth > 0 && data.currentDepth > data.targetDepth) {
      return resolveCompletionBottomDepth(data);
    }

    // When current depth ≈ target depth (or the casing shoe sits close to total depth),
    // resolveCompletionBottomDepth() extends the completion section past totalDepth to
    // keep it visible — anchor below that extended section so the label doesn't overlap it.
    return Math.max(data.totalDepth, resolveCompletionBottomDepth(data));
  }
}

```

## `src/app/features/presentation/wwell-test-result/wwell-test-result.component.ts` (M )

```typescript
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  LOCALE_ID,
  signal,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { formatNumber } from '@angular/common';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { trigger, transition, animate, style } from '@angular/animations';
import { PresentationStore } from '../store/presentation.store';
import { WwellTestViewModel } from '@models/active-wwell/active-wwell-view.model';
import { createMobileQuerySignal, startDialogResize } from '@shared/utils/dialog-interaction.util';

@Component({
  selector: 'app-wwell-test-result',
  standalone: true,
  imports: [MatDialogModule, CdkDrag, CdkDragHandle],
  templateUrl: './wwell-test-result.component.html',
  styleUrl: './wwell-test-result.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('resultTabAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-8px)' }),
        animate('300ms ease', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ]),
  ],
})
export class WwellTestResultComponent {
  @ViewChild('resultDialog') private resultDialog?: TemplateRef<unknown>;

  private static readonly MIN_DIALOG_WIDTH = 480;
  private static readonly MIN_DIALOG_HEIGHT = 320;
  private static readonly VIEWPORT_MARGIN = 24;
  private static readonly MOBILE_QUERY = '(max-width: 640px)';

  protected readonly store = inject(PresentationStore);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly locale = inject(LOCALE_ID);
  private dialogRef?: MatDialogRef<unknown>;

  protected readonly isMobile = createMobileQuerySignal(WwellTestResultComponent.MOBILE_QUERY, this.destroyRef);

  protected readonly selectedResult = signal<WwellTestViewModel | null>(null);
  protected readonly dialogVisible = signal(false);

  protected readonly isFlowTest = computed(() => {
    const data = this.store.wwellTest();
    if (!data) return false;
    return data.flowType === 'FLOW';
  });

  protected fmtNum(value: number | string | null | undefined, digitsInfo?: string): string {
    if (value === null || value === undefined || value === '') return '';
    const num = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(num)) return '';
    return formatNumber(num, this.locale, digitsInfo);
  }

  protected openDialog(result: WwellTestViewModel): void {
    this.selectedResult.set(result);
    this.dialogVisible.set(true);
    if (!this.resultDialog) return;

    this.dialogRef = this.dialog.open(this.resultDialog, {
      autoFocus: false,
      panelClass: 'well-result-dialog',
      backdropClass: 'well-result-backdrop',
      maxWidth: this.isMobile() ? '100vw' : '96vw',
      maxHeight: this.isMobile() ? '100dvh' : '96vh',
      enterAnimationDuration: '260ms',
      exitAnimationDuration: '200ms',
    });
    this.dialogRef.afterClosed().subscribe(() => this.onDialogHide());
  }

  protected onDialogHide(): void {
    this.selectedResult.set(null);
    this.dialogVisible.set(false);
    this.dialogRef = undefined;
  }

  protected closeDialog(): void {
    this.dialogRef?.close();
  }

  protected onResizeStart(event: MouseEvent, axis: 'width' | 'height' | 'both'): void {
    if (this.isMobile()) return;
    startDialogResize(event, axis, {
      minWidth: WwellTestResultComponent.MIN_DIALOG_WIDTH,
      minHeight: WwellTestResultComponent.MIN_DIALOG_HEIGHT,
      viewportMargin: WwellTestResultComponent.VIEWPORT_MARGIN,
    });
  }
}

```

## `src/app/features/presentation/wwells-logs-indicators/wwells-logs-indicators.component.html` (M )

```html
<div class="log-panel">
  <div class="log-strip">
    @let data = store.wellsLogsIndicators();
    @let remarks = store.wellsLogsRemarks();

    <div
      class="indicator-tag"
      [class.indicator-tag--active]="data?.rcc"
      [class.indicator-tag--has-tooltip]="!!remarks?.dtRemarks"
      role="status"
      [attr.aria-label]="'RCC status: ' + (data?.rcc ? 'Yes' : 'No')"
    >
      <span class="indicator-tag__dot"></span>
      <span class="indicator-tag__label">RCC</span>
      <span class="indicator-tag__value">{{ data?.rcc ? 'YES' : 'NO' }}</span>
      @if (remarks?.dtRemarks) {
        <span class="indicator-tag__tooltip">{{ remarks!.dtRemarks }}</span>
      }
    </div>

    <div
      class="indicator-tag"
      [class.indicator-tag--active]="data?.mudLog"
      [class.indicator-tag--has-tooltip]="!!remarks?.mudRemarks"
      role="status"
      [attr.aria-label]="'Mud Log status: ' + (data?.mudLog ? 'Yes' : 'No')"
    >
      <span class="indicator-tag__dot"></span>
      <span class="indicator-tag__label">Mud Log</span>
      <span class="indicator-tag__value">{{ data?.mudLog ? 'YES' : 'NO' }}</span>
      @if (remarks?.mudRemarks) {
        <span class="indicator-tag__tooltip">{{ remarks!.mudRemarks }}</span>
      }
    </div>

    <div
      class="indicator-tag"
      [class.indicator-tag--active]="data?.logging"
      [class.indicator-tag--has-tooltip]="!!remarks?.loggingRemarks"
      role="status"
      [attr.aria-label]="'Logging status: ' + (data?.logging ? 'Yes' : 'No')"
    >
      <span class="indicator-tag__dot"></span>
      <span class="indicator-tag__label">Logging</span>
      <span class="indicator-tag__value">{{ data?.logging ? 'YES' : 'NO' }}</span>
      @if (remarks?.loggingRemarks) {
        <span class="indicator-tag__tooltip">{{ remarks!.loggingRemarks }}</span>
      }
    </div>
  </div>
</div>

```

## `src/app/features/presentation/wwells-logs-indicators/wwells-logs-indicators.component.scss` (M )

```scss
.log-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 3px 0 8px;
  background: transparent;
  border-top: 1px solid var(--border-sub);
}

.log-panel__title {
  font-size: 13px;
  font-weight: 800;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0 20px;
}

.log-strip {
  display: flex;
  gap: 8px;
  width: 100%;
  padding: 0 18px 0 calc(10% + 10px);
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

// Status tags — deliberately NOT pill/button-shaped (no full-fill gradient,
// no border-radius:20px "toggle switch" look) so they read as data, not controls.
.indicator-tag {
  flex: 1;
  min-width: 0;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 8px;
  background: rgba(100, 116, 139, 0.06);
  border: 1px solid rgba(100, 116, 139, 0.16);
  cursor: default;
  position: relative;
  transition: background 0.2s ease, border-color 0.2s ease;
  user-select: none;

  // Accent rail as its own layer (not a border-left) — mixing border-radius with an
  // uneven border thickness makes the browser pinch the rounded corner into a beak shape.
  &::before {
    content: '';
    position: absolute;
    left: 3px;
    top: 3px;
    bottom: 3px;
    width: 3px;
    border-radius: 2px;
    background: rgba(100, 116, 139, 0.4);
    transition: background 0.2s ease;
  }

  &--has-tooltip {
    cursor: help;
  }

  &--active {
    background: rgba(37, 99, 235, 0.07);
    border-color: rgba(37, 99, 235, 0.22);

    &::before {
      background: #2563eb;
    }

    .indicator-tag__dot {
      background: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.18);
    }

    .indicator-tag__value {
      color: #2563eb;
      opacity: 1;
    }

    .indicator-tag__tooltip::before {
      background: #2563eb;
    }
  }

  &__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(100, 116, 139, 0.4);
    flex-shrink: 0;
    transition: background 0.2s ease, box-shadow 0.2s ease;
  }

  &__label {
    font-size: 11px;
    font-weight: 700;
    color: var(--text-secondary);
    white-space: nowrap;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    line-height: 1;

    &::after {
      content: ':';
      margin: 0 3px;
      opacity: 0.4;
      font-weight: 600;
    }
  }

  &__value {
    font-size: 11px;
    font-weight: 800;
    color: var(--text-secondary);
    opacity: 0.55;
    white-space: nowrap;
    letter-spacing: 0.03em;
    line-height: 1;
    transition: color 0.2s ease, opacity 0.2s ease;
  }

  // Same card theme as the wellbore casing hover tooltip (casing.renderer.ts):
  // white card, subtle border, soft drop-shadow, DM Sans, colored accent rail.
  &__tooltip {
    position: absolute;
    bottom: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%);
    width: 260px;
    padding: 12px 14px 12px 17px;
    background: #ffffff;
    color: #0f172a;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.55;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 8px 16px rgba(15, 23, 42, 0.18);
    white-space: normal;
    word-break: break-word;
    pointer-events: none;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.16s ease, visibility 0.16s ease;
    z-index: 200;

    // Accent rail as its own layer, same reasoning as .indicator-tag::before above.
    &::before {
      content: '';
      position: absolute;
      left: 4px;
      top: 4px;
      bottom: 4px;
      width: 4px;
      border-radius: 2px;
      background: rgba(100, 116, 139, 0.4);
    }

    &::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 6px solid transparent;
      border-top-color: #ffffff;
    }
  }

  &:hover &__tooltip {
    opacity: 1;
    visibility: visible;
  }
}

// The diagram card that hosts this strip clips overflow (rounded corners), so a
// tooltip centered under the first/last tag would get its edge cut off instead of
// floating free. Anchor those two to the tag's own edge instead of centering them.
.log-strip {
  .indicator-tag:first-child .indicator-tag__tooltip {
    left: 0;
    transform: none;

    &::after {
      left: 24px;
      transform: none;
    }
  }

  .indicator-tag:last-child .indicator-tag__tooltip {
    left: auto;
    right: 0;
    transform: none;

    &::after {
      left: auto;
      right: 24px;
      transform: none;
    }
  }
}

@media (max-width: 1200px) {
  .log-strip {
    padding: 0 16px;
  }
}

@media (max-width: 720px) {
  .log-strip {
    gap: 6px;
    padding: 0 12px;
  }

  .indicator-tag {
    padding: 4px 10px 4px 8px;
  }

  .indicator-tag__label,
  .indicator-tag__value {
    font-size: 10px;
  }
}

```

## `src/app/shared/utils/dialog-interaction.util.spec.ts` (A )

```typescript
import { DestroyRef } from '@angular/core';
import { createMobileQuerySignal, startDialogResize } from './dialog-interaction.util';

function createResizeEvent(currentTarget: HTMLElement, clientX = 0, clientY = 0): MouseEvent {
  return {
    currentTarget,
    clientX,
    clientY,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
  } as unknown as MouseEvent;
}

function buildDialogDom(): { pane: HTMLElement; wrapper: HTMLElement; handle: HTMLElement } {
  const pane = document.createElement('div');
  pane.className = 'cdk-overlay-pane';
  const wrapper = document.createElement('div');
  wrapper.className = 'dialog__wrapper';
  Object.defineProperty(wrapper, 'offsetWidth', { value: 600, configurable: true });
  Object.defineProperty(wrapper, 'offsetHeight', { value: 400, configurable: true });
  const handle = document.createElement('div');
  wrapper.appendChild(handle);
  pane.appendChild(wrapper);
  document.body.appendChild(pane);
  return { pane, wrapper, handle };
}

describe('dialog-interaction.util', () => {
  describe('createMobileQuerySignal', () => {
    let matchMediaMock: jest.Mock;

    beforeEach(() => {
      matchMediaMock = jest.fn();
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: matchMediaMock,
      });
    });

    it('initializes from the current match state and registers a change listener', () => {
      const addEventListener = jest.fn();
      matchMediaMock.mockReturnValue({
        matches: true,
        addEventListener,
        removeEventListener: jest.fn(),
      });

      const destroyRef = { onDestroy: jest.fn() } as unknown as DestroyRef;
      const isMobile = createMobileQuerySignal('(max-width: 640px)', destroyRef);

      expect(isMobile()).toBe(true);
      expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('updates the signal when the media query change event fires', () => {
      let changeHandler: (e: MediaQueryListEvent) => void = () => undefined;
      matchMediaMock.mockReturnValue({
        matches: false,
        addEventListener: (_: string, handler: (e: MediaQueryListEvent) => void) => {
          changeHandler = handler;
        },
        removeEventListener: jest.fn(),
      });

      const destroyRef = { onDestroy: jest.fn() } as unknown as DestroyRef;
      const isMobile = createMobileQuerySignal('(max-width: 640px)', destroyRef);

      expect(isMobile()).toBe(false);
      changeHandler({ matches: true } as MediaQueryListEvent);
      expect(isMobile()).toBe(true);
    });

    it('removes the change listener when destroyRef fires', () => {
      const removeEventListener = jest.fn();
      matchMediaMock.mockReturnValue({
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener,
      });

      let cleanup: () => void = () => undefined;
      const destroyRef = { onDestroy: (fn: () => void) => { cleanup = fn; } } as unknown as DestroyRef;
      createMobileQuerySignal('(max-width: 640px)', destroyRef);

      cleanup();
      expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });
  });

  describe('startDialogResize', () => {
    const config = { minWidth: 480, minHeight: 320, viewportMargin: 24 };
    let originalRaf: typeof window.requestAnimationFrame;

    beforeEach(() => {
      originalRaf = window.requestAnimationFrame;
      window.requestAnimationFrame = (cb: FrameRequestCallback): number => {
        cb(0);
        return 0;
      };
    });

    afterEach(() => {
      window.requestAnimationFrame = originalRaf;
      document.body.innerHTML = '';
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    });

    it('prevents default but does nothing else when no .dialog__wrapper ancestor exists', () => {
      const handle = document.createElement('div');
      document.body.appendChild(handle);
      const event = createResizeEvent(handle);

      expect(() => startDialogResize(event, 'both', config)).not.toThrow();
      expect(event.preventDefault).toHaveBeenCalled();
      expect(document.body.style.cursor).toBe('');
    });

    it('picks the resize cursor per axis and marks the wrapper as resizing', () => {
      const { wrapper, handle } = buildDialogDom();
      startDialogResize(createResizeEvent(handle), 'width', config);
      expect(document.body.style.cursor).toBe('ew-resize');
      expect(wrapper.classList.contains('dialog__wrapper--resizing')).toBe(true);
      document.dispatchEvent(new MouseEvent('mouseup'));
    });

    it('resizes both dimensions on drag and syncs the CDK overlay pane', () => {
      const { pane, wrapper, handle } = buildDialogDom();

      startDialogResize(createResizeEvent(handle, 100, 100), 'both', config);
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 130 }));

      expect(wrapper.style.width).toBe('650px');
      expect(wrapper.style.height).toBe('430px');
      expect(pane.style.width).toBe('650px');
      expect(pane.style.height).toBe('430px');
    });

    it('pins the unconstrained dimension to its start value for a single-axis drag', () => {
      const { wrapper, handle } = buildDialogDom();

      startDialogResize(createResizeEvent(handle, 100, 100), 'width', config);
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 300 }));

      expect(wrapper.style.width).toBe('650px');
      expect(wrapper.style.height).toBe('400px');
    });

    it('clamps below the configured minimum size', () => {
      const { wrapper, handle } = buildDialogDom();

      startDialogResize(createResizeEvent(handle, 100, 100), 'both', config);
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: -1000, clientY: -1000 }));

      expect(wrapper.style.width).toBe(`${config.minWidth}px`);
      expect(wrapper.style.height).toBe(`${config.minHeight}px`);
    });

    it('resets cursor, selection and the resizing class on mouseup', () => {
      const { wrapper, handle } = buildDialogDom();

      startDialogResize(createResizeEvent(handle, 100, 100), 'both', config);
      document.dispatchEvent(new MouseEvent('mouseup'));

      expect(document.body.style.cursor).toBe('');
      expect(document.body.style.userSelect).toBe('');
      expect(wrapper.classList.contains('dialog__wrapper--resizing')).toBe(false);
    });
  });
});

```

## `src/app/shared/utils/dialog-interaction.util.ts` (A )

```typescript
import { DestroyRef, WritableSignal, signal } from '@angular/core';

export type DialogResizeAxis = 'width' | 'height' | 'both';

export interface DialogResizeConfig {
  readonly minWidth: number;
  readonly minHeight: number;
  readonly viewportMargin: number;
}

/**
 * Drag-resizes the closest `.dialog__wrapper` (and its CDK overlay pane) from a
 * mousedown on a resize handle. Extracted so dialog-based detail views can share
 * the resize math and cursor/selection handling instead of copy-pasting it.
 */
export function startDialogResize(event: MouseEvent, axis: DialogResizeAxis, config: DialogResizeConfig): void {
  event.preventDefault();
  event.stopPropagation();

  const el = (event.currentTarget as HTMLElement)?.closest('.dialog__wrapper') as HTMLElement | null;
  if (!el) return;

  const pane = el.closest('.cdk-overlay-pane') as HTMLElement | null;

  const startX = event.clientX;
  const startY = event.clientY;
  const startW = el.offsetWidth;
  const startH = el.offsetHeight;

  let pendingEvent: MouseEvent | null = null;
  let frameId = 0;

  const applyResize = () => {
    frameId = 0;
    if (!pendingEvent) return;
    const w = axis === 'height'
      ? startW
      : Math.min(
          Math.max(config.minWidth, startW + (pendingEvent.clientX - startX)),
          window.innerWidth - config.viewportMargin,
        );
    const h = axis === 'width'
      ? startH
      : Math.min(
          Math.max(config.minHeight, startH + (pendingEvent.clientY - startY)),
          window.innerHeight - config.viewportMargin,
        );
    el.style.width = `${w}px`;
    el.style.height = `${h}px`;
    if (pane) {
      pane.style.width = `${w}px`;
      pane.style.height = `${h}px`;
    }
  };

  const onMove = (e: MouseEvent) => {
    pendingEvent = e;
    if (!frameId) frameId = requestAnimationFrame(applyResize);
  };

  const onUp = () => {
    if (frameId) cancelAnimationFrame(frameId);
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    el.classList.remove('dialog__wrapper--resizing');
  };

  const cursor = axis === 'width' ? 'ew-resize' : axis === 'height' ? 'ns-resize' : 'se-resize';
  document.body.style.cursor = cursor;
  document.body.style.userSelect = 'none';
  el.classList.add('dialog__wrapper--resizing');
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

/** Tracks a media query as a signal, cleaning up the listener on component destroy. */
export function createMobileQuerySignal(query: string, destroyRef: DestroyRef): WritableSignal<boolean> {
  const mediaQuery = window.matchMedia(query);
  const isMobile = signal(mediaQuery.matches);
  const onChange = (e: MediaQueryListEvent) => isMobile.set(e.matches);
  mediaQuery.addEventListener('change', onChange);
  destroyRef.onDestroy(() => mediaQuery.removeEventListener('change', onChange));
  return isMobile;
}

```

## `src/app/shared/utils/testing/wellbore-test-data.util.ts` (M )

```typescript
import { IWellData } from '@models/well-design/well-data.model';
import {
  DIAGRAM_LAYOUT,
  DiagramLayout,
  WellboreDiagramData,
} from '@models/well-design/wellbore-diagram.model';
import { ICasingIR } from '@shared/models/wwell/casing-ir.model';
import { IDrlgCsg } from '@shared/models/wwell/drlg-csg.model';
import { IDrillingOperationStatus } from '@shared/models/wwell/drilling-operation-status.model';
import { IFormationTops } from '@shared/models/wwell/formation-tops.model';
import { IPreWellData } from '@shared/models/wwell/pre-well-data.model';
import { ITopsIR } from '@shared/models/wwell/tops-ir.model';
import { IWellDesign } from '@shared/models/wwell/well-design.model';

export class WellboreTestDataUtil {
  static readonly plannedTargetDepthFt = 5000;
  static readonly currentDepthBeyondTargetFt = 6500;
  static readonly displayDepthPaddingFt = 500;
  static readonly linerDepthFt = 3430;
  static readonly overrunCompletionLengthFt = 1200;
  static readonly minVisibleCompletionLengthFt = 1000;
  static readonly conductorSize = '30';
  static readonly casingSize = '9 5/8';
  static readonly linerSize = '7';
  static readonly openHoleSize = '8 1/2';
  static readonly wellName = 'JLMN-843';

  static casing(overrides: Partial<ICasingIR> = {}): ICasingIR {
    return {
      csgSize: this.casingSize,
      csgType: 'Casing',
      csgDepth: this.linerDepthFt,
      csgRemarks: null,
      ...overrides,
    };
  }

  static liner(overrides: Partial<ICasingIR> = {}): ICasingIR {
    return this.casing({
      csgSize: this.linerSize,
      csgType: 'Liner',
      csgDepth: this.linerDepthFt,
      ...overrides,
    });
  }

  static gravelPack(overrides: Partial<ICasingIR> = {}): ICasingIR {
    return this.casing({
      csgSize: '6',
      csgType: 'Gravel Pack',
      csgDepth: 4800,
      ...overrides,
    });
  }

  static drlgCasing(overrides: Partial<IDrlgCsg> = {}): IDrlgCsg {
    return {
      wCsgOdSz: this.casingSize,
      wCsgBotDpth: this.linerDepthFt,
      wLnrOdSz: null,
      wLnrBotDepth: null,
      ...overrides,
    };
  }

  static drillingStatus(overrides: Partial<IDrillingOperationStatus> = {}): IDrillingOperationStatus {
    return {
      epANum: 1001,
      wPrsntDpth: this.plannedTargetDepthFt,
      wCsgBotDpth: this.linerDepthFt,
      wCsgOdSz: this.casingSize,
      wDpthChgDis: 26,
      wMudCircPc: '100',
      wPrevDpth: 4974,
      wSpudOprDay: 25,
      wOpRmk: 'Operation summary',
      nxt24HrPlanRmk: 'Next operation',
      spuddays: 25,
      footage: 26,
      targetDepth: this.plannedTargetDepthFt,
      ...overrides,
    };
  }

  static plannedTop(overrides: Partial<ITopsIR> = {}): ITopsIR {
    return {
      stLongCd: 'TWLF',
      planTvdDepth: this.currentDepthBeyondTargetFt,
      planSsDepth: this.currentDepthBeyondTargetFt,
      ...overrides,
    };
  }

  static actualTop(overrides: Partial<IFormationTops> = {}): IFormationTops {
    return {
      epANum: 1001,
      stLongCd: 'QASR',
      wStDmrkDpth: 3140,
      wStDmrkRmk: null,
      ...overrides,
    };
  }

  static preWellData(overrides: Partial<IPreWellData> = {}): IPreWellData {
    return {
      surfaceElevation: 0,
      estTargetDepth: this.plannedTargetDepthFt,
      targetFormation: 'TWLF',
      supportedBusiness: 'BI-34',
      ...overrides,
    };
  }

  static wellDesign(overrides: Partial<IWellDesign> = {}): IWellDesign {
    return {
      name: this.wellName,
      prewapSeq: 1001,
      staWaterLvl: null,
      swLvlTxt: null,
      pumpLvl: null,
      ohFlg: 'Y',
      ohRemarks: this.openHoleSize,
      gpFlg: null,
      gpRemarks: null,
      perforatedFlg: null,
      perforatedRemarks: null,
      lsFlg: null,
      lsRemarks: null,
      ...overrides,
    };
  }

  static layout(overrides: Partial<DiagramLayout> = {}): DiagramLayout {
    return {
      ...DIAGRAM_LAYOUT,
      ...overrides,
    };
  }

  static diagramData(overrides: Partial<WellboreDiagramData> = {}): WellboreDiagramData {
    return {
      wellName: this.wellName,
      totalDepth: this.plannedTargetDepthFt,
      displayDepth: this.plannedTargetDepthFt + this.displayDepthPaddingFt,
      casings: [this.liner()],
      drlgCasings: [this.drlgCasing({
        wCsgOdSz: '13 3/8',
        wCsgBotDpth: 2020,
        wLnrOdSz: this.linerSize,
        wLnrBotDepth: this.linerDepthFt,
      })],
      geologicTops: [],
      hydrogeology: null,
      prewap: this.preWellData(),
      rigActivity: null,
      currentDepth: this.plannedTargetDepthFt,
      targetDepth: this.plannedTargetDepthFt,
      mudCirculation: [],
      wellDesign: this.wellDesign(),
      ...overrides,
    };
  }

  static wellData(overrides: Partial<IWellData> = {}): IWellData {
    return {
      RIG_ACTIVITY: [],
      WELL_MASTER: [],
      RIG_IDENTIFICATION: [],
      CONTACT: [],
      DRLG_OP_STATUS: [this.drillingStatus()],
      DRLG_FM_TOPS: [],
      DRLG_FD_TDAY: [],
      ROP_DATA: [],
      NEXT_2_WELL_ACTIVITY: [],
      NEW_TARGET_DAYS: [],
      DRLG_OP_SMRY: [],
      BITINFO: [],
      EXAD_GWD_IR_HEADER: [],
      EXAD_GWD_IR_TOPS: [],
      EXAD_GWD_IR_CASING: [],
      EXAD_GWD_IR_HYDROGEOLOGY: [],
      EXAD_GWD_IR_WATER: [],
      EXAD_RCD_PREWAP: [this.preWellData()],
      WATER_WELL_TEST_OUTCOME: [],
      EXAD_GWD_WELL_TESTS: [],
      EXAD_GWD_WELL_DESIGN: [],
      EXAD_GWD_DAILY_REMARKS: [],
      MUD_CIRC: [],
      DRLG_CSG: [],
      PRIMARY_HOLEID: [],
      ...overrides,
    };
  }
}

```

