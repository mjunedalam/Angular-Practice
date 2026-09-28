import { DIAGRAM_LAYOUT, DiagramLayout, FULLSCREEN_DIAGRAM_LAYOUT } from '@models/well-design/wellbore-diagram.model';

/**
 * Compact `DiagramLayout` for the wwell-ir Wellbore Preview panel — the inline card in Sections
 * view and the Timeline view's sidebar. `WellBoreViewComponent` and `WwellIrDepthScaleComponent`
 * draw every label at a fixed font size in *viewBox* units, so the on-screen text size is
 * `containerPx / (depthScaleWidth + wellboreViewWidth)`, and the room between two labels is
 * `drawingHeight / totalDepth` units per foot. Both are tuned here, through the `diagramLayout`
 * input the shared components already accept, without touching any shared rendering code:
 *
 * - **Width** is a 75% shrink of the default coordinate space (every horizontal constant scaled
 *   together, so the shape is untouched), which grows the fixed-size text relative to the drawing.
 *   Not shrunk further: several labels are fixed-width or fixed-offset text ("Geologic / Horizons
 *   (ft bgl)" centred on `geoLineX`, the "DEPTH" title, the right-anchored tick labels) that would
 *   clip at the viewBox edge.
 * - **`wellboreViewWidth`** leaves ~410 units to the right of the bore centre: the casing/liner
 *   leader labels run out that way ('18" Intermediate @ 320 ft' is ~250 units) and clipped at the
 *   viewBox edge with the old 780 — and the longest remark line, "(Cemented; seals Umm Er Radhuma)",
 *   still ran ~5px past it at 870. `casingCenterX` stays put — a label anchored on the *left* of
 *   the bore ("Flowing — SIWHP: 123 psi") needs that room to clear the "Geologic Horizons" heading.
 * - **Height** is taller than the width alone suggests. Wells are deep and casing shoes are often
 *   only a few hundred feet apart, so on a linear scale their multi-line labels collide unless
 *   each foot gets enough vertical room. `marginTop` stays at its original 55 for the fixed
 *   `y="-42"` "DEPTH" title above the axis.
 *
 * The panel sizes its figure from these numbers (aspect ratio, depth-scale share), so changing
 * them here is all a re-tune needs.
 */
export const WWELL_IR_PREVIEW_DIAGRAM_LAYOUT: DiagramLayout = {
  svgHeight: 1000,
  marginTop: 55,
  drawingHeight: 905,

  depthScaleWidth: 105,
  depthAxisX: 72,

  wellboreViewWidth: 890,

  depthArrowX: 18,
  geoLineX: 90,
  casingCenterX: 457.5,
  baseHalfWidth: 54,
  halfWidthIncrement: 19.5,
  shoeCurveOffset: 9,
  openHoleHwMargin: 18.75,
  linerScreenInset: 15,
  gpScreenGap: 2.25,
  gpFillRatio: 1.0,
  // An IR is planned against its target depth, and the hole is what the 7" liner is run into — so it is
  // drawn to that depth with the liner inside it, rather than stopping at the liner's shoe. Declared here
  // rather than in the shared renderer so Presentation, which draws as-drilled wells from the same code,
  // keeps its own behaviour. WWELL_IR_SIDEBAR_DIAGRAM_LAYOUT inherits this by spreading.
  openHoleRunsToTargetDepth: true,
};

/**
 * The Timeline sidebar's narrower (~290px) figure. At that width the default layout's fixed-size
 * leader labels render at ~6px and collide, so the panel hides them there (`wbp--compact`; they
 * are all in the Expand view) — which frees the right-hand label room this layout gives up, so the
 * drawing and the depth axis get roughly 50% more pixels than they would from the default.
 *
 * Showing them instead costs about 145px of drawing per label whatever the coordinate space (a label's
 * screen width follows its share of the viewBox), which means a ~500px sidebar — tried, and too much
 * of the page to give a preview.
 *
 * The depth axis is 29 units wider than the preview's: the panel prints the ruler's numerals at 27 units (about
 * 12px once the card is sized to the page, where the drawing is height-limited) and "3,800" in that mono face is
 * 81 units, which the preview's 105-unit strip has no room for left of its axis.
 */
export const WWELL_IR_SIDEBAR_DIAGRAM_LAYOUT: DiagramLayout = {
  ...WWELL_IR_PREVIEW_DIAGRAM_LAYOUT,
  // 80 units under the drawing, for the "TOTAL DEPTH" label at the size the sidebar prints it (28 units).
  svgHeight: 840,
  drawingHeight: 705,
  depthScaleWidth: 134,
  depthAxisX: 100,
  wellboreViewWidth: 520,
  // The geologic column moves right with its type: "1,450" at 27 units is 81 wide and is set to the left of this line.
  geoLineX: 105,
  casingCenterX: 350,
};

/** Bottom room, in viewBox units, for the last tick label and the "TOTAL DEPTH" label. */
const EXPANDED_BOTTOM_MARGIN = 60;

/**
 * The Expand dialog's layout: Presentation's fullscreen one plus room under the drawing. That layout
 * ends the drawing exactly at the SVG's bottom edge (`marginTop + drawingHeight === svgHeight`), so
 * anything printed at the deepest point — the ruler's target-depth tick and the diagram's "TOTAL
 * DEPTH" label — was cut in half by the viewBox. The drawing itself is unchanged.
 */
export const WWELL_IR_EXPANDED_DIAGRAM_LAYOUT: DiagramLayout = {
  ...FULLSCREEN_DIAGRAM_LAYOUT,
  svgHeight: FULLSCREEN_DIAGRAM_LAYOUT.marginTop + FULLSCREEN_DIAGRAM_LAYOUT.drawingHeight + EXPANDED_BOTTOM_MARGIN,
  openHoleRunsToTargetDepth: true,
};

/**
 * The IR letter's diagram — Presentation's default coordinate space (the letter is exported as a PNG for
 * the PDF at that size), but it is a wwell-ir surface showing the same IR as the panel, so it opts into
 * the same open-hole rule. Without this the panel and the PDF would disagree about where the hole ends.
 */
export const WWELL_IR_LETTER_DIAGRAM_LAYOUT: DiagramLayout = {
  ...DIAGRAM_LAYOUT,
  openHoleRunsToTargetDepth: true,
};
