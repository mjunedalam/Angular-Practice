import { Selection, select } from 'd3-selection';
import { easeCubicOut } from 'd3-ease';
import 'd3-transition';
import {
  IntegratedRequirementCasingRow,
  IntegratedRequirementFormationTop,
} from '@models/wwell-planning/wwell-planning.model';
import {
  buildCasingPath,
  buildDepthTicks,
  buildOpenHolePath,
  buildScreenHanger,
  computeCasingHalfWidth,
  createDepthScale,
  formatDepth,
  openHoleHalfWidth,
  pickTickInterval,
} from '@shared/utils/wellbore-math.util';

export interface WwellIrDesignPreviewRenderData {
  readonly formationTops: readonly IntegratedRequirementFormationTop[];
  readonly casing: readonly IntegratedRequirementCasingRow[];
  readonly surfaceElevationFtAsl: number | null;
  readonly targetDepthFt: number;
}

/** A casing/liner row placed on the depth scale, with the half-width its shape is drawn at. */
interface PlacedRow {
  readonly row: IntegratedRequirementCasingRow;
  readonly halfWidth: number;
  readonly topPx: number;
  readonly bottomPx: number;
}

const DRAWING_HEIGHT = 380;
const TOP_MARGIN = 54;
const BOTTOM_MARGIN = 50;
const RULER_X = 46;
const GEO_LINE_X = 132;
const CENTER_X = 300;
const ROW_SPAN = 520;
const BASE_HALF_WIDTH = 10;
const HALF_WIDTH_INCREMENT = 15;
const LINER_HALF_WIDTH_DECREMENT = 13;
const MIN_LINER_HALF_WIDTH = 6;
const SHOE_CURVE_OFFSET = 9;
const LABEL_LINE_GAP = 22;
const LABEL_TEXT_GAP = 6;
const HANGER_LABEL_GAP = 46;
const OPEN_HOLE_MARGIN = 12;
const MIN_OPEN_HOLE_FT = 1;
// Mirrors `presentation/well-bore-view`'s selectTotalDepth/selectDisplayDepth pattern: the scale
// is anchored to a stable minimum rather than whatever partial data happens to be entered, so a
// single shallow value doesn't stretch across the entire drawing height.
const MIN_SCALE_DEPTH_FT = 500;
// The <g> root is measured with getBBox() after every draw and the SVG's viewBox is refit to it
// (plus this padding) — the diagram can never render outside its own viewBox, regardless of how
// many casing rows, how deep the well is, or how long a formation/callout label happens to be.
const VIEWBOX_PADDING = 14;
const FADE_DURATION_MS = 220;

type GSel = Selection<SVGGElement, unknown, null, undefined>;
type PathSel = Selection<SVGPathElement, unknown, null, undefined>;

function isLinerType(type: string): boolean {
  return type.trim().toLowerCase() === 'liner';
}

function computeFormationPenetration(
  depthFtBgl: number,
  formationTops: readonly IntegratedRequirementFormationTop[],
): { readonly name: string; readonly penetrationFt: number } | null {
  const penetrated = [...formationTops].filter(top => top.depthFt <= depthFtBgl).sort((a, b) => b.depthFt - a.depthFt);
  const nearest = penetrated[0];
  if (!nearest) return null;
  const penetrationFt = depthFtBgl - nearest.depthFt;
  return penetrationFt > 0 ? { name: nearest.name, penetrationFt } : null;
}

function buildCasingPrimaryLabel(row: IntegratedRequirementCasingRow): string {
  const kind = row.type.trim().toLowerCase();
  const suffix = kind === 'conductor' || kind === 'liner' ? '' : ' casing';
  return `${row.sizeIn} ${row.type}${suffix} set at ${formatDepth(row.depthFtBgl)}`;
}

function computeMaxDepthFt(data: WwellIrDesignPreviewRenderData): number {
  const depths = [data.targetDepthFt, ...data.casing.map(row => row.depthFtBgl), ...data.formationTops.map(top => top.depthFt)].filter(
    (value): value is number => typeof value === 'number' && value > 0,
  );
  const deepest = depths.length ? Math.max(...depths) : 0;
  return Math.max(deepest, MIN_SCALE_DEPTH_FT);
}

// Deepest-first among the full casing strings only — tier 0 = deepest = narrowest. Liner rows are
// placed separately since they don't participate in this tiering (they hang inside whichever
// string is deepest here, rather than running to the surface themselves).
function placeCasings(casing: readonly IntegratedRequirementCasingRow[], scale: (depth: number) => number): readonly PlacedRow[] {
  return [...casing]
    .filter(row => !isLinerType(row.type))
    .sort((a, b) => b.depthFtBgl - a.depthFtBgl)
    .map((row, tier) => ({
      row,
      halfWidth: computeCasingHalfWidth(tier, BASE_HALF_WIDTH, HALF_WIDTH_INCREMENT),
      topPx: TOP_MARGIN,
      bottomPx: TOP_MARGIN + scale(row.depthFtBgl),
    }));
}

// Each liner hangs from the bottom of the previous string (the deepest casing, or the liner above
// it) — shallowest liner first so the chain can walk outward-in.
function placeLiners(
  casing: readonly IntegratedRequirementCasingRow[],
  placedCasings: readonly PlacedRow[],
  scale: (depth: number) => number,
): readonly PlacedRow[] {
  let hangFromDepth = placedCasings[0]?.row.depthFtBgl ?? 0;
  let hangFromHalfWidth = placedCasings[0]?.halfWidth ?? BASE_HALF_WIDTH + HALF_WIDTH_INCREMENT;

  return [...casing]
    .filter(row => isLinerType(row.type))
    .sort((a, b) => a.depthFtBgl - b.depthFtBgl)
    .map(row => {
      const halfWidth = Math.max(hangFromHalfWidth - LINER_HALF_WIDTH_DECREMENT, MIN_LINER_HALF_WIDTH);
      const placed: PlacedRow = {
        row,
        halfWidth,
        topPx: TOP_MARGIN + scale(hangFromDepth),
        bottomPx: TOP_MARGIN + scale(row.depthFtBgl),
      };
      hangFromDepth = row.depthFtBgl;
      hangFromHalfWidth = halfWidth;
      return placed;
    });
}

function fadeIn(selection: PathSel): void {
  selection.style('opacity', '0').transition().duration(FADE_DURATION_MS).ease(easeCubicOut).style('opacity', '1');
}

/**
 * Imperatively builds the well-bore schematic inside `svgEl` using D3 selections — mirrors
 * `presentation/well-bore-view`'s renderer pattern (full DOM rebuild per draw, driven by an
 * Angular `effect()` in the host component) rather than Angular template bindings. Because
 * Angular's emulated view-encapsulation attribute is never applied to elements D3 appends here,
 * every class this function sets must be styled via `:host ::ng-deep` in the component SCSS
 * (same reason `wellbore-view.component.scss` does it).
 *
 * After every element is appended, the root `<g>` is measured with `getBBox()` and the SVG's
 * `viewBox` is refit to exactly that measured extent (plus a small padding) — this is what
 * guarantees the diagram can never render outside its own viewBox no matter how much casing/
 * formation data is entered or how long a label's text turns out to be.
 */
export function renderWwellIrDesignPreview(svgEl: SVGSVGElement, data: WwellIrDesignPreviewRenderData): void {
  const svg = select(svgEl);
  svg.selectAll('*').remove();
  svg.attr('width', '100%').attr('height', '100%').attr('preserveAspectRatio', 'xMidYMid meet');

  const root: GSel = svg.append('g').attr('class', 'preview__root');

  const maxDepthFt = computeMaxDepthFt(data);
  const scale = createDepthScale(maxDepthFt, DRAWING_HEIGHT);
  const surfaceY = TOP_MARGIN;

  const placedCasings = placeCasings(data.casing, scale);
  const placedLiners = placeLiners(data.casing, placedCasings, scale);
  const innermostRow = placedLiners.length ? placedLiners[placedLiners.length - 1] : (placedCasings[0] ?? null);

  // ── Column headers ─────────────────────────────────────────────────────
  root
    .append('text')
    .attr('class', 'preview__col-header')
    .attr('x', RULER_X)
    .attr('y', 20)
    .text('Depth Below');
  root
    .append('text')
    .attr('class', 'preview__col-header')
    .attr('x', RULER_X)
    .attr('y', 32)
    .text('Ground (Ft)');
  root
    .append('text')
    .attr('class', 'preview__col-header')
    .attr('x', GEO_LINE_X)
    .attr('y', 20)
    .text('Geologic');
  root
    .append('text')
    .attr('class', 'preview__col-header')
    .attr('x', GEO_LINE_X)
    .attr('y', 32)
    .text('Horizon Tops');

  // ── Depth ruler ─────────────────────────────────────────────────────────
  root
    .append('line')
    .attr('class', 'preview__ruler-line')
    .attr('x1', RULER_X)
    .attr('y1', surfaceY)
    .attr('x2', RULER_X)
    .attr('y2', surfaceY + DRAWING_HEIGHT);

  const depthTicks = buildDepthTicks(maxDepthFt, pickTickInterval(maxDepthFt)).map(depth => ({ depth, y: TOP_MARGIN + scale(depth) }));
  depthTicks.forEach(tick => {
    root
      .append('line')
      .attr('class', 'preview__ruler-tick')
      .attr('x1', RULER_X - 5)
      .attr('y1', tick.y)
      .attr('x2', RULER_X)
      .attr('y2', tick.y);
    root
      .append('text')
      .attr('class', 'preview__ruler-label')
      .attr('x', RULER_X - 9)
      .attr('y', tick.y + 3)
      .text(tick.depth.toLocaleString());
  });

  // ── Surface line ────────────────────────────────────────────────────────
  root.append('line').attr('class', 'preview__surface-line').attr('x1', 0).attr('y1', surfaceY).attr('x2', ROW_SPAN).attr('y2', surfaceY);
  if (data.surfaceElevationFtAsl !== null) {
    root
      .append('text')
      .attr('class', 'preview__surface-label')
      .attr('x', CENTER_X - 90)
      .attr('y', surfaceY - 8)
      .text(`Surface — ${data.surfaceElevationFtAsl} ft ASL`);
  }

  // ── Geologic horizon tops ───────────────────────────────────────────────
  const formationLines = [...data.formationTops]
    .sort((a, b) => a.depthFt - b.depthFt)
    .map(top => ({ name: top.name, depthFt: top.depthFt, y: TOP_MARGIN + scale(top.depthFt) }));
  formationLines.forEach(band => {
    root.append('line').attr('class', 'preview__geo-line').attr('x1', 0).attr('y1', band.y).attr('x2', ROW_SPAN).attr('y2', band.y);
    root
      .append('line')
      .attr('class', 'preview__geo-tick')
      .attr('x1', GEO_LINE_X - 14)
      .attr('y1', band.y)
      .attr('x2', GEO_LINE_X + 14)
      .attr('y2', band.y);
    root
      .append('text')
      .attr('class', 'preview__geo-depth')
      .attr('x', GEO_LINE_X - 20)
      .attr('y', band.y + 3)
      .text(band.depthFt.toLocaleString());
    root
      .append('text')
      .attr('class', 'preview__geo-name')
      .attr('x', GEO_LINE_X + 18)
      .attr('y', band.y + 3)
      .text(band.name);
  });

  // ── Casing / liner strings ─────────────────────────────────────────────
  // Paint shallow/wide casings first, then deep/narrow on top, so telescoping strings read
  // correctly; liners are floating segments so they simply paint after (no z-fight to resolve).
  const casingShapes = [...placedCasings]
    .reverse()
    .map(placed => buildCasingPath(CENTER_X, placed.halfWidth, placed.topPx, placed.bottomPx, SHOE_CURVE_OFFSET))
    .concat(placedLiners.map(placed => buildCasingPath(CENTER_X, placed.halfWidth, placed.topPx, placed.bottomPx, SHOE_CURVE_OFFSET)));
  casingShapes.forEach(path => {
    fadeIn(root.append('path').attr('class', 'preview__casing').attr('d', path));
  });

  // Size text centered inside each string's own visible telescoping band — a casing's visible
  // band runs from the shoe of the string above it (or the surface, for the outermost string)
  // down to its own shoe; a liner's band is simply its own top-to-bottom segment.
  const shallowToDeep = [...placedCasings].reverse();
  shallowToDeep.forEach((placed, i) => {
    const bandTop = i === 0 ? TOP_MARGIN : shallowToDeep[i - 1].bottomPx;
    const y = (bandTop + placed.bottomPx) / 2;
    root.append('text').attr('class', 'preview__casing-size').attr('x', CENTER_X).attr('y', y + 3).text(placed.row.sizeIn);
  });
  placedLiners.forEach(placed => {
    const y = (placed.topPx + placed.bottomPx) / 2;
    root.append('text').attr('class', 'preview__casing-size').attr('x', CENTER_X).attr('y', y + 3).text(placed.row.sizeIn);
  });

  // ── Liner hanger ─────────────────────────────────────────────────────────
  const firstLiner = placedLiners[0];
  if (firstLiner) {
    const { left, right } = buildScreenHanger(CENTER_X, firstLiner.topPx, firstLiner.halfWidth, 8, 18);
    root.append('path').attr('class', 'preview__hanger').attr('d', `${left} ${right}`);
    const labelEndX = CENTER_X - firstLiner.halfWidth - HANGER_LABEL_GAP;
    root
      .append('line')
      .attr('class', 'preview__hanger-line')
      .attr('x1', CENTER_X - firstLiner.halfWidth)
      .attr('y1', firstLiner.topPx)
      .attr('x2', labelEndX)
      .attr('y2', firstLiner.topPx);
    root
      .append('text')
      .attr('class', 'preview__hanger-label')
      .attr('x', labelEndX - LABEL_TEXT_GAP)
      .attr('y', firstLiner.topPx + 3)
      .attr('text-anchor', 'end')
      .text('Liner Hanger');
  }

  // ── Open hole ────────────────────────────────────────────────────────────
  if (innermostRow && data.targetDepthFt > innermostRow.row.depthFtBgl + MIN_OPEN_HOLE_FT) {
    const halfWidth = openHoleHalfWidth(innermostRow.halfWidth, OPEN_HOLE_MARGIN);
    const bottomY = TOP_MARGIN + scale(data.targetDepthFt);
    const lineEndX = CENTER_X + halfWidth + LABEL_LINE_GAP;
    const labelX = lineEndX + LABEL_TEXT_GAP;
    const showBullPlug = placedLiners.length > 0;

    root
      .append('path')
      .attr('class', 'preview__openhole')
      .attr('d', buildOpenHolePath(CENTER_X, halfWidth, innermostRow.bottomPx, bottomY));
    root.append('text').attr('class', 'preview__openhole-label').attr('x', labelX).attr('y', bottomY - 6).text('Open Hole');

    if (showBullPlug) {
      root
        .append('line')
        .attr('class', 'preview__bullplug')
        .attr('x1', CENTER_X - halfWidth)
        .attr('y1', bottomY)
        .attr('x2', CENTER_X + halfWidth)
        .attr('y2', bottomY);
      root.append('text').attr('class', 'preview__bullplug-label').attr('x', labelX).attr('y', bottomY + 12).text('Bull Plug');
    }
  }

  // ── Right-side casing callouts ─────────────────────────────────────────
  const casingCallouts = [...placedCasings, ...placedLiners]
    .sort((a, b) => a.row.depthFtBgl - b.row.depthFtBgl)
    .map(placed => {
      const rEdgeX = CENTER_X + placed.halfWidth;
      const lineEndX = rEdgeX + LABEL_LINE_GAP;
      const penetration = computeFormationPenetration(placed.row.depthFtBgl, data.formationTops);
      const secondary = penetration ? `${formatDepth(penetration.penetrationFt)} into ${penetration.name}` : placed.row.remarks || undefined;
      return {
        y: placed.bottomPx,
        rEdgeX,
        lineEndX,
        labelX: lineEndX + LABEL_TEXT_GAP,
        primary: buildCasingPrimaryLabel(placed.row),
        secondary,
      };
    });
  casingCallouts.forEach(callout => {
    root
      .append('line')
      .attr('class', 'preview__callout-line')
      .attr('x1', callout.rEdgeX)
      .attr('y1', callout.y)
      .attr('x2', callout.lineEndX)
      .attr('y2', callout.y);
    root.append('text').attr('class', 'preview__callout-primary').attr('x', callout.labelX).attr('y', callout.y - 2).text(callout.primary);
    if (callout.secondary) {
      root.append('text').attr('class', 'preview__callout-secondary').attr('x', callout.labelX).attr('y', callout.y + 11).text(callout.secondary);
    }
  });

  // ── Total depth ──────────────────────────────────────────────────────────
  if (data.targetDepthFt > 0) {
    const totalDepthY = TOP_MARGIN + scale(data.targetDepthFt);
    root
      .append('line')
      .attr('class', 'preview__td-line')
      .attr('x1', CENTER_X - 60)
      .attr('y1', totalDepthY)
      .attr('x2', CENTER_X + 60)
      .attr('y2', totalDepthY);
    root
      .append('text')
      .attr('class', 'preview__td-label')
      .attr('x', CENTER_X)
      .attr('y', totalDepthY + 30)
      .attr('text-anchor', 'middle')
      .text(`TOTAL DEPTH = ${data.targetDepthFt.toLocaleString()} ft`);
  }

  // ── Auto-fit viewBox: measure the real rendered extent (real glyph metrics included) and
  // refit the viewBox to it, so nothing — long labels, many casing tiers, deep scales — can
  // ever fall outside the visible box. getBBox() is unimplemented in JSDOM (Jest), so this falls
  // back to the fixed provisional box there instead of throwing. ──────────────────────────────
  const rootNode = root.node();
  const bbox = rootNode && typeof rootNode.getBBox === 'function' ? rootNode.getBBox() : null;
  if (bbox && bbox.width > 0 && bbox.height > 0) {
    const x = bbox.x - VIEWBOX_PADDING;
    const y = bbox.y - VIEWBOX_PADDING;
    const width = bbox.width + VIEWBOX_PADDING * 2;
    const height = bbox.height + VIEWBOX_PADDING * 2;
    svg.attr('viewBox', `${x} ${y} ${width} ${height}`);
  } else {
    svg.attr('viewBox', `0 0 ${ROW_SPAN} ${DRAWING_HEIGHT + TOP_MARGIN + BOTTOM_MARGIN}`);
  }
}
