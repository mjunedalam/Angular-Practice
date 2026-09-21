import { WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { buildDepthTicks, pickTickInterval } from '@shared/utils/wellbore-math.util';

/** Least vertical room, in the diagram's own viewBox units, between two printed tick labels — the
 *  labels are 18 units tall, so anything closer would print on top of its neighbour. */
const MIN_LABEL_GAP_UNITS = 26;

/** The depth the ruler and the diagram run to: the same `max(totalDepth, displayDepth)` the shared
 *  diagram draws its own vertical domain with. The wellbore mapper sets `totalDepth` to the target
 *  depth and `displayDepth` to the deeper of the target and the deepest formation top (Presentation's
 *  `selectDisplayDepth` rule, without its padding) — so this is the target depth until a top goes
 *  past it, and the scale is redrawn to that top from then on. */
export function resolveScaleDepthFt(data: Pick<WellboreDiagramData, 'totalDepth' | 'displayDepth'>): number {
  return Math.max(data.totalDepth, data.displayDepth);
}

/** The depths the ruler marks: the regular interval ticks, the target depth (so the scale visibly
 *  ends where the well does — a 3,200 ft well used to stop its labels at 3,000) and, when a formation
 *  top runs past the target, the scale's own end. A regular tick too close to a marked depth to print
 *  beside it is dropped in its favour, one that lands exactly on it is not repeated, and the scale's
 *  end is left unlabelled when it sits too close to the target to print beside it. Shared by the depth
 *  axis and the panel's gridlines so a gridline always continues a tick. */
export function buildScaleTicks(scaleDepth: number, drawingHeight: number, targetDepth: number = scaleDepth): number[] {
  if (scaleDepth <= 0) return [0];
  const minGapFt = (MIN_LABEL_GAP_UNITS / drawingHeight) * scaleDepth;
  const target = targetDepth > 0 && targetDepth <= scaleDepth ? targetDepth : scaleDepth;
  const marked = scaleDepth - target >= minGapFt ? [target, scaleDepth] : [target];
  const regular = buildDepthTicks(scaleDepth, pickTickInterval(scaleDepth)).filter(depth =>
    marked.every(markedDepth => Math.abs(markedDepth - depth) >= minGapFt),
  );
  return [...regular, ...marked].sort((a, b) => a - b);
}
