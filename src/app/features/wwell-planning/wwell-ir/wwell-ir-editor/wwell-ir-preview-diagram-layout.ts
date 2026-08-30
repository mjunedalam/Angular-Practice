import { DiagramLayout } from '@models/well-design/wellbore-diagram.model';

/**
 * Compact `DiagramLayout` for the wwell-ir Wellbore Preview card — used both inline in Sections
 * view and in the Timeline view's sidebar (a narrower, fixed-width panel — see
 * `.ire__tl-preview-sidebar` in wwell-ir-editor.component.scss). `WellBoreViewComponent` and
 * `WwellIrDepthScaleComponent` draw every label (and every hover tooltip — casing/liner, geo-top
 * remark, water level, mud-circulation — see the renderers under
 * `features/presentation/well-bore-view/renderers/`) at a fixed font-size in *viewBox* units (see
 * well-bore-view.component.scss / wwell-ir-depth-scale.component.scss) — those font-sizes are the
 * same regardless of `DiagramLayout`, so the on-screen text size is really driven by how many
 * viewBox units the container's CSS width has to divide across (`containerPx / wellboreViewWidth`).
 * Even the inline card in Sections view — capped by `.ire__wellbore-diagram-row`'s
 * `max-height: 340px` against a 1040×840 aspect ratio — only renders at ~420px wide, well short of
 * the ~600px this layout's own comments once assumed, which made every label and tooltip look
 * undersized there too. Rather than widening the box (which would disturb the surrounding page) or
 * shrinking the SVG's *container* further (which is what made the old sidebar text unreadable),
 * this shrinks the *coordinate space* itself by 25% (every geometric constant scaled together, so
 * the diagram's shape is untouched) — enough to noticeably grow the same fixed-size fonts relative
 * to the diagram, without touching any shared rendering code (just a different config value through
 * the `diagramLayout` input both components already accept — same extension point
 * `FULLSCREEN_DIAGRAM_LAYOUT` uses for the opposite case).
 *
 * Not scaled further than this: several labels are centered/right-anchored fixed-width (or
 * fixed-offset) text that doesn't shrink with the layout — e.g. `static-chrome.renderer.ts`'s
 * "Geologic / Horizons (ft bgl)" column title, centered on `geoLineX`; the "500"-style depth-scale
 * tick labels right-anchored near `depthAxisX`; and the depth-scale's own "DEPTH" title, drawn at a
 * fixed `y="-42"` above the axis origin regardless of `marginTop`. Every `<svg>` here clips at its
 * own viewBox edge by default, so shrinking `geoLineX`/`depthAxisX` past ~75%, or `marginTop` below
 * that fixed -42, starts clipping the very text this layout exists to keep legible — `marginTop`
 * is intentionally left at its full original value for exactly that reason. All confirmed by
 * rendering: every label has room on both the depth-scale and the main diagram, nothing clips.
 */
export const WWELL_IR_PREVIEW_DIAGRAM_LAYOUT: DiagramLayout = {
  svgHeight: 650,
  marginTop: 55,
  drawingHeight: 555,

  // Kept wider than a strict 75% scale of the original (116/82) — the depth-scale's own uppercase
  // "DEPTH" title (centered on depthScaleWidth/2) needs a bit more absolute room than that to clear
  // the SVG's viewBox edge; verified by rendering it at this value with no clipping.
  depthScaleWidth: 105,
  depthAxisX: 72,

  wellboreViewWidth: 780,

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
};
