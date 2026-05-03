import { ICasingIR } from 'src/app/shared/models/wwell/casing-ir.model';
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
  readonly casings: ICasingIR[];
  readonly geologicTops: ITopsIR[];
  readonly hydrogeology: IHydrogeologyIR | null;
  readonly prewap: IPreWellData | null;
  readonly rigActivity: IRigActivity | null;
  readonly currentDepth: number;
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
  readonly gravelAnnulusWidth: number; // gravel pack annulus stroke width
  readonly prePerfGpBoost: number;     // pre-perf extra width when GP present
}

export const DIAGRAM_LAYOUT: DiagramLayout = {
  svgHeight: 840,
  marginTop: 55,
  drawingHeight: 740,

  // -- RESPONSIVE MIDPOINT MATH --
  depthScaleWidth: 90,
  depthAxisX: 60, // Leaves exactly 30 units from the right edge of the Depth SVG

  wellboreViewWidth: 980,

  // ── Horizontal zone layout (left → right inside wellbore SVG) ──────────
  // [0 - 28]   drill arrow body  (centerX=20, halfWidth=10 → spans 10-30)
  // [28 - 95]  geo depth labels  (right-aligned at geoLineX-17 = 78, ~5 chars)
  // [95]       geo axis line
  // [95 - 170] geo formation codes (left start at geoLineX+18 = 113)
  // [170+]     gap before bore structure
  // ─────────────────────────────────────────────────────────────────────
  depthArrowX: 20,    // arrow centerX — spans x=10 to x=30, clear of geo labels
  geoLineX: 95,       // geo axis — depth labels end ~x=78, codes start ~x=113
  casingCenterX: 560, // bore structure center — plenty of gap after geo codes
  baseHalfWidth: 72,
  halfWidthIncrement: 26,
  shoeCurveOffset: 12,
  openHoleHwMargin: 25,
  linerScreenInset: 20  ,
  gravelAnnulusWidth: 12,
  prePerfGpBoost: 8,
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
