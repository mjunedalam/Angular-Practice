import { ICasingIR } from '@shared/models/wwell/casing-ir.model';
import { ITopsIR } from '@shared/models/wwell/tops-ir.model';
import { parseInchSize } from '@shared/utils/wellbore-math.util';

/** Everything the wellbore panel prints around the diagram, derived from the same data the diagram
 *  draws — nothing is estimated or filled in, so a figure appears only when its inputs exist. */
export interface WellboreFacts {
  readonly stats: readonly WellboreStat[];
  readonly casingRows: readonly WellboreCasingRow[];
  readonly topRows: readonly WellboreTopRow[];
}

export interface WellboreStat {
  readonly label: string;
  readonly value: string;
  /** A qualifier under the value, e.g. which string a shoe belongs to. */
  readonly hint?: string;
  readonly warn?: boolean;
  /** The pictogram the profile uses for the same thing, so it looks alike in both places. */
  readonly glyph: WellboreGlyphKind;
  /** How far down the well it is, surface to total depth. Absent until a total depth exists. */
  readonly gauge?: WellboreGauge;
}

export type WellboreGlyphKind = 'water' | 'pump' | 'shoe' | 'depth';

/** A stretch of the well drawn as a filled line: a depth is "how much below ground" (0 → the depth), the water
 *  column is where the water starts → total depth. The glyph sits on the line at `markPct`. */
export interface WellboreGauge {
  readonly fromPct: number;
  readonly toPct: number;
  readonly markPct: number;
}

export interface WellboreCasingRow {
  readonly size: string;
  readonly type: string;
  readonly depth: string;
  /** Set below the target depth: the diagram runs off its scale, and the row says why. */
  readonly belowTarget: boolean;
}

export interface WellboreTopRow {
  readonly code: string;
  readonly depth: string;
}

export interface WellboreFactsInput {
  /** 0 when no target depth has been set — the depth-dependent figures are then left out. */
  readonly totalDepth: number;
  readonly staticWaterLevel: number;
  readonly pumpSetting: number;
  readonly casings: readonly ICasingIR[];
  readonly tops: readonly ITopsIR[];
}

const INCH_MARK = '″';
const UNIT_MARKED = /["″”]|\bin\b/i;

export const formatFeet = (value: number): string => `${value.toLocaleString('en-US')} ft`;

/** "500–3,200 ft": the unit once, at the end. */
export const formatRange = (from: number, to: number): string => `${from.toLocaleString('en-US')}–${formatFeet(to)}`;

/** "18" → 18″, "9 5/8" → 9 5/8″; a size that already carries a unit mark is left alone. */
export function formatInches(size: string): string {
  const trimmed = size.trim();
  if (!trimmed) return '';
  return UNIT_MARKED.test(trimmed) ? trimmed : `${trimmed}${INCH_MARK}`;
}

export function buildWellboreFacts(input: WellboreFactsInput): WellboreFacts {
  const total = Math.max(input.totalDepth, 0);
  const casings = sortCasingsByDepth(input.casings);
  const deepest = casings.at(-1) ?? null;

  return {
    stats: buildStats(input, total, deepest),
    casingRows: casings.map(casing => ({
      size: formatInches(casing.csgSize),
      type: casing.csgType,
      depth: formatFeet(casing.csgDepth),
      belowTarget: total > 0 && casing.csgDepth > total,
    })),
    topRows: buildTopRows(input.tops),
  };
}

/** Shallow to deep — the order a casing program is read in. A string with no real depth is not a
 *  program entry, so it is left out; equal depths list the wider string first. */
export function sortCasingsByDepth(casings: readonly ICasingIR[]): ICasingIR[] {
  return casings
    .filter(casing => casing.csgDepth > 0)
    .sort((a, b) => a.csgDepth - b.csgDepth || (parseInchSize(b.csgSize) ?? 0) - (parseInchSize(a.csgSize) ?? 0));
}

/** A depth as a share of total depth, 0–100 (clamped: a shoe below TD sits at the end). */
export const percentOfTotal = (ft: number, total: number): number => Math.min(100, Math.max(0, (ft / total) * 100));

function buildStats(input: WellboreFactsInput, total: number, deepest: ICasingIR | null): WellboreStat[] {
  const { staticWaterLevel: water, pumpSetting: pump } = input;
  // "How much below ground": filled from the surface down to the depth, the glyph at its lower end.
  const below = (ft: number): WellboreGauge | undefined => {
    if (total <= 0) return undefined;
    const pct = percentOfTotal(ft, total);
    return { fromPct: 0, toPct: pct, markPct: pct };
  };

  const stats: WellboreStat[] = [];
  if (total > 0) stats.push({ label: 'Total depth', value: formatFeet(total), glyph: 'depth', gauge: below(total) });
  if (water > 0) stats.push({ label: 'Static water level', value: formatFeet(water), glyph: 'water', gauge: below(water) });
  // The column runs from the water level down to total depth, its glyph where the water starts.
  if (total > 0 && water > 0 && water < total) {
    const start = percentOfTotal(water, total);
    stats.push({
      label: 'Water column',
      value: formatFeet(total - water),
      glyph: 'water',
      gauge: { fromPct: start, toPct: 100, markPct: start },
    });
  }
  if (deepest) {
    const belowTarget = total > 0 && deepest.csgDepth > total;
    const string = [formatInches(deepest.csgSize), deepest.csgType].filter(Boolean).join(' ');
    stats.push({
      label: 'Deepest shoe',
      value: formatFeet(deepest.csgDepth),
      hint: [string, belowTarget ? 'below TD' : ''].filter(Boolean).join(' · '),
      warn: belowTarget,
      glyph: 'shoe',
      gauge: below(deepest.csgDepth),
    });
  }
  if (pump > 0) stats.push({ label: 'Pump setting', value: formatFeet(pump), glyph: 'pump', gauge: below(pump) });
  return stats;
}

function buildTopRows(tops: readonly ITopsIR[]): WellboreTopRow[] {
  return tops
    .filter(top => top.stLongCd.trim() !== '')
    .sort((a, b) => a.planTvdDepth - b.planTvdDepth)
    .map(top => ({ code: top.stLongCd.trim(), depth: top.planTvdDepth > 0 ? formatFeet(top.planTvdDepth) : '—' }));
}
