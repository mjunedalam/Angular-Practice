import { Selection } from 'd3-selection';
import { ScaleLinear } from 'd3-scale';

export type SvgSel = Selection<SVGSVGElement, unknown, null, undefined>;
export type GSel = Selection<SVGGElement, unknown, null, undefined>;
export type DefsSel = Selection<SVGDefsElement, unknown, null, undefined>;
export type DepthScale = ScaleLinear<number, number>;

export interface ResolvedAnimation {
  readonly lineDur: number;
  readonly fadeDur: number;
  readonly popDur: number;
  readonly lineStyle: 'draw' | 'fade';
  readonly popStyle: 'elastic' | 'bounce' | 'fade';
  readonly popEase: (t: number) => number;
}
