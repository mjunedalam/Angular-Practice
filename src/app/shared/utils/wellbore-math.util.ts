import { ScaleLinear, scaleLinear } from 'd3-scale';
import { ICasingIR } from '../models/wwell/casing-ir.model';

export function createDepthScale(
  totalDepth: number,
  drawingHeight: number,
): ScaleLinear<number, number> {
  return scaleLinear().domain([0, totalDepth]).range([0, drawingHeight]);
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

export function casingGradientId(csgType: string): string {
  if (csgType === 'Conductor') return 'conductorGradient';
  if (csgType === 'Liner')     return 'linerGradient';
  return 'mainGradient';
}