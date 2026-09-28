import { parseInchSize } from '@shared/utils/wellbore-math.util';
import { ProfileFormation, ProfileString, REFERENCE_DEPTH } from './well-profile.data';

export const depthY = (depth: number, totalDepth = REFERENCE_DEPTH): number => 60 + depth / Math.max(1, totalDepth) * 554;
export const intervalX = (depth: number, totalDepth = REFERENCE_DEPTH): number => 140 + depth / Math.max(1, totalDepth) * 580;
export function stringsAtDepth(strings: readonly ProfileString[], depth: number): ProfileString[] {
  return strings.filter(s => depth >= s.top && depth < s.csgDepth);
}
export function formationAtDepth(formations: readonly ProfileFormation[], depth: number): ProfileFormation | undefined {
  return formations.find(f => depth >= f.planTvdDepth && depth < f.bottom) ?? formations.at(-1);
}
/** Same scale for every OD; explosion changes only x, never the depth coordinates. */
export function projectStrings(strings: readonly ProfileString[], spread: number, totalDepth = REFERENCE_DEPTH) {
  const maxOd = Math.max(1, ...strings.map(s => parseInchSize(s.csgSize) ?? 0));
  const sum = strings.reduce((n,s) => n + (parseInchSize(s.csgSize) ?? 0) / maxOd, 0);
  const explodedRadius = Math.min(57, (440 - Math.max(0, strings.length-1)*12) / Math.max(1, 2*sum));
  let cursor = 186;
  return strings.map(s => {
    const radius = (parseInchSize(s.csgSize) ?? 0) / maxOd * (57 + (Math.max(3, explodedRadius)-57)*spread);
    const x = 380 + (cursor + radius - 380) * spread;
    cursor += radius * 2 + 12;
    const topY = depthY(s.top, totalDepth), bottomY = depthY(s.csgDepth, totalDepth), ry = Math.min(12, radius * 0.23);
    return { ...s, x, radius, ry, topY, bottomY,
      path: `M${x-radius},${topY} A${radius},${ry} 0 0 0 ${x+radius},${topY} L${x+radius},${bottomY} A${radius},${ry} 0 0 1 ${x-radius},${bottomY} Z`,
    };
  });
}
