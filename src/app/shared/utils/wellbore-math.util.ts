import { ScaleLinear, scaleLinear } from 'd3-scale';
import { CasingInfo } from '../../core/models/well-details.model';

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

export function sortCasingsByDepthDesc(casings: CasingInfo[]): CasingInfo[] {
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
