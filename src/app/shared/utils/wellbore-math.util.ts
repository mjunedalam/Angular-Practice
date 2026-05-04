import { ScaleLinear, scaleLinear } from 'd3-scale';
import { ICasingIR } from '@shared/models/wwell/casing-ir.model';

export function createDepthScale(
  totalDepth: number,
  drawingHeight: number,
): ScaleLinear<number, number> {
  return scaleLinear().domain([0, totalDepth]).range([0, drawingHeight]);
}

export function pickTickInterval(totalDepth: number): number {
  if (totalDepth <= 2000) return 100;
  if (totalDepth <= 3000) return 200;
  return 500;
}

export function buildDepthTicks(totalDepth: number, interval = 500): number[] {
  const ticks: number[] = [];
  for (let depth = 0; depth <= totalDepth; depth += interval) {
    ticks.push(depth);
  }
  return ticks;
}

export function sortCasingsByDepthDesc(casings: ICasingIR[]): ICasingIR[] {
  return [...casings].sort((a, b) => b.csgDepth - a.csgDepth);
}

export function computeCasingHalfWidth(
  depthDescIndex: number,
  baseHalfWidth: number,
  increment: number,
): number {
  return baseHalfWidth + depthDescIndex * increment;
}

export function buildCasingPath(
  centerX: number,
  halfWidth: number,
  topPx: number,
  bottomPx: number,
  shoeOffset: number,
): string {
  const left  = centerX - halfWidth;
  const right = centerX + halfWidth;
  const ctrl  = bottomPx + shoeOffset;
  return `M${left},${topPx} L${left},${bottomPx} S ${centerX} ${ctrl} ${right} ${bottomPx} L${right},${topPx} Z`;
}

export function buildOpenHolePath(
  centerX: number,
  halfWidth: number,
  topPx: number,
  bottomPx: number,
): string {
  const l = centerX - halfWidth;
  const r = centerX + halfWidth;
  return `M${l},${topPx}L${l},${bottomPx}L${r},${bottomPx}L${r},${topPx}`;
}

export function buildArrowHeadRight(
  tipX: number,
  midY: number,
  size = 7,
): string {
  return `M${tipX - size} ${midY - size} L${tipX} ${midY} L${tipX - size} ${midY + size} Z`;
}

export function buildArrowHeadLeft(
  tipX: number,
  midY: number,
  size = 7,
): string {
  return `M${tipX + size} ${midY - size} L${tipX} ${midY} L${tipX + size} ${midY + size} Z`;
}

export function buildDepthArrow(
  startY: number,
  endY: number,
  centerX: number,
  shaftWidth: number,
  headHeight: number,
): string {
  const hw        = shaftWidth / 2;
  const shaftEndY = endY - headHeight;
  return [
    `M${centerX - hw},${startY}`,
    `L${centerX - hw},${shaftEndY}`,
    `L${centerX - hw - 5},${shaftEndY}`,
    `L${centerX},${endY}`,
    `L${centerX + hw + 5},${shaftEndY}`,
    `L${centerX + hw},${shaftEndY}`,
    `L${centerX + hw},${startY}`,
    `Z`,
  ].join(' ');
}

// ============================================================================
// NEW WIDGET UTILITY METHODS
// ============================================================================

/** Builds a closed rectangle path (used for blank pipe, gravel pack, or screen) */
export function buildRectPath(
  centerX: number,
  halfWidth: number,
  topPx: number,
  bottomPx: number
): string {
  const l = centerX - halfWidth;
  const r = centerX + halfWidth;
  return `M${l},${topPx} L${r},${topPx} L${r},${bottomPx} L${l},${bottomPx} Z`;
}

/** Builds the two outward-pointing black triangles representing a packer or hanger */
export function buildPackerTriangles(
  centerX: number,
  halfWidth: number,
  yPx: number,
  packerWidth = 16,
  packerHeight = 10
): string {
  const lInner = centerX - halfWidth;
  const rInner = centerX + halfWidth;
  
  const leftTriangle = `M${lInner},${yPx} L${lInner - packerWidth},${yPx} L${lInner},${yPx + packerHeight} Z`;
  const rightTriangle = `M${rInner},${yPx} L${rInner + packerWidth},${yPx} L${rInner},${yPx + packerHeight} Z`;
  
  return `${leftTriangle} ${rightTriangle}`;
}

/** Builds a small standalone downward-pointing blue triangle/arrow */
export function buildSmallDownArrow(
  centerX: number,
  yPx: number,
  arrowWidth = 12,
  arrowHeight = 10
): string {
  const hw = arrowWidth / 2;
  return `M${centerX - hw},${yPx} L${centerX + hw},${yPx} L${centerX},${yPx + arrowHeight} Z`;
}

/**
 * Builds a "U-shaped" path representing the gravel pack outline.
 * The path traces down the left side, across the bottom, and up the right side.
 */
export function buildGravelPackUPath(
  centerX: number,
  halfWidth: number,
  topPx: number,
  bottomPx: number
): string {
  const left = centerX - halfWidth;
  const right = centerX + halfWidth;
  
  // Draws a path down the left side, across the bottom shoe, and back up the right side
  return `M${left},${topPx} L${left},${bottomPx} L${right},${bottomPx} L${right},${topPx}`;
}

// ============================================================================
// FORMATTERS & HELPERS
// ============================================================================

export function formatDepth(depth: number): string {
  return `${depth.toLocaleString()} ft`;
}

export function openHoleHalfWidth(
  innermostHalfWidth: number,
  margin = 12,
): number {
  return innermostHalfWidth + margin;
}

/**
 * Builds paired horizontal tick marks on both sides of the wellbore at regular
 * intervals — the standard engineering symbol for casing perforations.
 */
export function buildPerforationsPath(
  centerX: number,
  halfWidth: number,
  topPx: number,
  bottomPx: number,
  spacing = 10,
  tickLength = 8,
): string {
  const paths: string[] = [];
  for (let y = topPx + spacing; y <= bottomPx; y += spacing) {
    paths.push(`M${centerX - halfWidth - tickLength},${y}L${centerX - halfWidth},${y}`);
    paths.push(`M${centerX + halfWidth},${y}L${centerX + halfWidth + tickLength},${y}`);
  }
  return paths.join(' ');
}

export interface PrePerfLinerPaths {
  /** Two dashed vertical lines — the liner body walls */
  walls: string;
  /** Horizontal tick lines extending outward — the perforations */
  ticks: string;
  /** Dashed horizontal line at the bottom — the liner shoe */
  shoe: string;
}

/**
 * Builds the three SVG path components for a pre-perforated liner symbol:
 * dashed vertical walls, outward tick perforations, and a dashed bottom shoe.
 */
export function buildPrePerfLiner(
  centerX: number,
  halfWidth: number,
  topPx: number,
  bottomPx: number,
  spacing = 14,
  tickLength = 10,
): PrePerfLinerPaths {
  const lx = centerX - halfWidth;
  const rx = centerX + halfWidth;

  const walls = `M${lx},${topPx} L${lx},${bottomPx} M${rx},${topPx} L${rx},${bottomPx}`;

  const tickPaths: string[] = [];
  for (let y = topPx + spacing; y <= bottomPx - spacing / 2; y += spacing) {
    tickPaths.push(`M${lx - tickLength},${y} L${lx},${y}`);
    tickPaths.push(`M${rx},${y} L${rx + tickLength},${y}`);
  }

  return {
    walls,
    ticks: tickPaths.join(' '),
    shoe: `M${lx},${bottomPx} L${rx},${bottomPx}`,
  };
}

export function casingGradientId(csgType: string): string {
  if (csgType === 'Conductor') return 'conductorGradient';
  if (csgType === 'Liner')     return 'linerGradient';
  return 'mainGradient';
}

/**
 * Builds the two hanger bracket paths for a liner screen top.
 *
 * Shape matches the standard wellbore convention:
 *   Left  side: drops `dropPx` down then angles back up-right  (filled triangle)
 *   Right side: drops `dropPx` down then angles back up-left   (filled triangle)
 *
 * Example (dropPx=8, size=20):
 *   Left:  M sl,y  L sl,y+8  L sl+20,y  Z
 *   Right: M sr,y  L sr,y+8  L sr-20,y  Z
 *
 * @param centerX   SVG centre-x of the wellbore
 * @param y         Y pixel position of the hanger (casing shoe px)
 * @param halfWidth Half-width of the liner screen (screenHW)
 * @param dropPx    Vertical drop of the bracket leg  (default 8)
 * @param size      Horizontal span of the bracket    (default 20)
 */
export function buildScreenHanger(
  centerX: number,
  y: number,
  halfWidth: number,
  dropPx = 8,
  size = 20,
): { left: string; right: string } {
  const sl = centerX - halfWidth; // left  edge of screen
  const sr = centerX + halfWidth; // right edge of screen

  const left  = `M${sl},${y} L${sl},${y + dropPx} L${sl + size},${y} Z`;
  const right = `M${sr},${y} L${sr},${y + dropPx} L${sr - size},${y} Z`;

  return { left, right };
}