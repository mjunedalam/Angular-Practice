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
  /**
   * Opt-in: carry Open Hole past a 7" liner's shoe down to the well's target depth, instead of ending
   * it with the rest of the completion elements at that shoe.
   *
   * A rendering policy rather than a geometry constant, but it lives here because `diagramLayout` is
   * the per-call-site seam the shared diagram already exposes — see the wwell-ir layouts, which are
   * tuned entirely through it without touching shared rendering code. Optional and falsy by default, so
   * Presentation's own layouts are unaffected and the shared renderer behaves exactly as it always has
   * for every caller that does not ask for this.
   */
  readonly openHoleRunsToTargetDepth?: boolean;
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
