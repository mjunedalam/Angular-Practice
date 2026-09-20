import { buildDepthTicks, pickTickInterval } from '@shared/utils/wellbore-math.util';

/** Least vertical room, in the diagram's own viewBox units, between two printed tick labels — the
 *  labels are 18 units tall, so anything closer would print on top of its neighbour. */
const MIN_LABEL_GAP_UNITS = 26;

/** The depths the ruler marks: the regular interval ticks, then `totalDepth` itself as the final
 *  tick so the scale visibly ends where the well does (a 3,200 ft well used to stop its labels at
 *  3,000). A regular tick too close to the end to print cleanly beside it is dropped in its favour,
 *  and one that lands exactly on it is not repeated. Shared by the depth axis and the panel's
 *  gridlines so a gridline always continues a tick. */
export function buildScaleTicks(totalDepth: number, drawingHeight: number): number[] {
  if (totalDepth <= 0) return [0];
  const minGapFt = (MIN_LABEL_GAP_UNITS / drawingHeight) * totalDepth;
  const regular = buildDepthTicks(totalDepth, pickTickInterval(totalDepth)).filter(depth => totalDepth - depth >= minGapFt);
  return [...regular, totalDepth];
}
