import { ICasingIR } from '@shared/models/wwell/casing-ir.model';
import { ITopsIR } from '@shared/models/wwell/tops-ir.model';
import { formatFeet, formatInches, formatRange, percentOfTotal, sortCasingsByDepth } from './wwell-ir-wellbore-facts.util';

const CASING_TYPE_LINER = 'Liner';
const CASING_TYPE_GRAVEL_PACK = 'Gravel Pack';

export type WellboreSegmentKind = 'casing' | 'liner' | 'open';
export type WellboreMarkerKind = 'water' | 'pump';

/** One stretch of the well, surface to total depth, named for what is in the hole there: the string
 *  that ends at its lower edge, or — below the last shoe — the open hole. */
export interface WellboreProfileSegment {
  readonly kind: WellboreSegmentKind;
  readonly fromFt: number;
  readonly toFt: number;
  readonly leftPct: number;
  readonly widthPct: number;
  /** "18″"; for the open stretch, what it is called. */
  readonly label: string;
  /** "Intermediate", "Liner"; for the open stretch, the completion in it ("Screen · Gravel pack") —
   *  printed beside the label when the segment is wide enough. */
  readonly type: string;
}

export interface WellboreProfileTop {
  readonly code: string;
  readonly depthFt: number;
  readonly leftPct: number;
}

export interface WellboreMarker {
  readonly kind: WellboreMarkerKind;
  /** "Water", "Pump" — the short name printed with the value when there is room. */
  readonly name: string;
  readonly label: string;
  /** "185 ft" */
  readonly value: string;
  /** "185" — for a label with no room for the unit. */
  readonly bare: string;
  readonly depthFt: number;
  /** Position along the surface-to-total-depth strip, 0–100. */
  readonly leftPct: number;
}

/** A figure under the strip: how much of the well is cased, and how much is not. */
export interface WellboreProfileFact {
  readonly kind: 'cased' | 'open';
  readonly label: string;
  /** "0–3,300 ft" */
  readonly range: string;
  /** "87%" */
  readonly percent: string;
}

/** The well as one strip, surface to total depth, with every item on it: each casing string and liner
 *  where it runs, the open hole (with its screen / gravel pack) below the last shoe, the formation tops,
 *  the static water level and the pump. */
export interface WellboreProfile {
  readonly rangeText: string;
  readonly segments: readonly WellboreProfileSegment[];
  readonly tops: readonly WellboreProfileTop[];
  readonly markers: readonly WellboreMarker[];
  readonly facts: readonly WellboreProfileFact[];
  /** The whole strip in one sentence, for assistive tech (the strip itself is drawn, not text). */
  readonly description: string;
}

export interface WellboreProfileInput {
  /** 0 when no target depth has been set — there is then no strip to draw. */
  readonly totalDepth: number;
  readonly staticWaterLevel: number;
  readonly pumpSetting: number;
  readonly casings: readonly ICasingIR[];
  readonly tops: readonly ITopsIR[];
  /** The well-design completion flags: what is drawn below the deepest shoe. */
  readonly openHole: boolean;
  readonly screen: boolean;
  readonly gravelPack: boolean;
}

export function buildWellboreProfile(input: WellboreProfileInput): WellboreProfile | null {
  const total = input.totalDepth;
  if (total <= 0) return null;

  // A gravel-pack row is a completion element, not a string: it has no place in the casing sequence.
  const strings = sortCasingsByDepth(input.casings).filter(casing => casing.csgType !== CASING_TYPE_GRAVEL_PACK);
  const openLabel = input.openHole ? 'Open hole' : strings.length > 0 ? 'Below shoe' : 'Uncased';
  const segments = buildSegments(strings, total, openLabel, input);
  const markers = buildMarkers(input, total);

  return {
    rangeText: `0 – ${formatFeet(total)}`,
    segments,
    tops: buildTops(input.tops, total),
    markers,
    facts: buildFacts(segments, total, openLabel),
    description: describeProfile(segments, markers, total),
  };
}

function buildSegments(
  strings: readonly ICasingIR[],
  total: number,
  openLabel: string,
  completion: Pick<WellboreProfileInput, 'screen' | 'gravelPack'>,
): WellboreProfileSegment[] {
  const segments: WellboreProfileSegment[] = [];
  let fromFt = 0;

  for (const casing of strings) {
    const toFt = Math.min(casing.csgDepth, total);
    const named = {
      kind: casing.csgType === CASING_TYPE_LINER ? ('liner' as const) : ('casing' as const),
      label: formatInches(casing.csgSize),
      type: casing.csgType,
    };
    // Two strings ending at one depth: the narrower one (listed last) is what is in the hole there.
    if (toFt === fromFt && segments.length > 0) {
      segments[segments.length - 1] = { ...segments[segments.length - 1], ...named };
      continue;
    }
    if (toFt <= fromFt) continue;
    segments.push({ ...named, ...span(fromFt, toFt, total) });
    fromFt = toFt;
  }

  if (fromFt < total) {
    const completed = [completion.screen && 'Screen', completion.gravelPack && 'Gravel pack'].filter(Boolean);
    segments.push({ kind: 'open', label: openLabel, type: completed.join(' · '), ...span(fromFt, total, total) });
  }
  return segments;
}

function span(fromFt: number, toFt: number, total: number): Pick<WellboreProfileSegment, 'fromFt' | 'toFt' | 'leftPct' | 'widthPct'> {
  const leftPct = percentOfTotal(fromFt, total);
  return { fromFt, toFt, leftPct, widthPct: percentOfTotal(toFt, total) - leftPct };
}

function buildMarkers(input: WellboreProfileInput, total: number): WellboreMarker[] {
  const markers: WellboreMarker[] = [];
  if (input.staticWaterLevel > 0 && input.staticWaterLevel <= total) {
    markers.push({
      kind: 'water',
      name: 'Water',
      label: 'Static water level',
      value: formatFeet(input.staticWaterLevel),
      bare: input.staticWaterLevel.toLocaleString('en-US'),
      depthFt: input.staticWaterLevel,
      leftPct: percentOfTotal(input.staticWaterLevel, total),
    });
  }
  if (input.pumpSetting > 0 && input.pumpSetting <= total) {
    markers.push({
      kind: 'pump',
      name: 'Pump',
      label: 'Pump setting',
      value: formatFeet(input.pumpSetting),
      bare: input.pumpSetting.toLocaleString('en-US'),
      depthFt: input.pumpSetting,
      leftPct: percentOfTotal(input.pumpSetting, total),
    });
  }
  return markers;
}

/** Tops past total depth are off the strip (the diagram's own scale is what stretches to them). */
function buildTops(tops: readonly ITopsIR[], total: number): WellboreProfileTop[] {
  return tops
    .filter(top => top.stLongCd.trim() !== '' && top.planTvdDepth > 0 && top.planTvdDepth <= total)
    .sort((a, b) => a.planTvdDepth - b.planTvdDepth)
    .map(top => ({ code: top.stLongCd.trim(), depthFt: top.planTvdDepth, leftPct: percentOfTotal(top.planTvdDepth, total) }));
}

function buildFacts(segments: readonly WellboreProfileSegment[], total: number, openLabel: string): WellboreProfileFact[] {
  const open = segments.find(segment => segment.kind === 'open');
  const casedFt = open ? open.fromFt : total;
  const casedRounded = Math.round(percentOfTotal(casedFt, total));
  const facts: WellboreProfileFact[] = [];

  if (casedFt > 0) facts.push({ kind: 'cased', label: 'Cased', range: formatRange(0, casedFt), percent: `${casedRounded}%` });
  // 100 − the rounded cased share, so the two printed percentages always sum to 100.
  if (open) facts.push({ kind: 'open', label: openLabel, range: formatRange(casedFt, total), percent: `${100 - casedRounded}%` });
  return facts;
}

function describeProfile(segments: readonly WellboreProfileSegment[], markers: readonly WellboreMarker[], total: number): string {
  const runs = segments.map(segment =>
    segment.kind === 'open'
      ? `${segment.label.toLowerCase()} from ${formatFeet(segment.fromFt)} to ${formatFeet(segment.toFt)}`
      : `${[segment.label, segment.type].filter(Boolean).join(' ')} to ${formatFeet(segment.toFt)}`,
  );
  const items = markers.map(marker => `${marker.label.toLowerCase()} ${marker.value}`);
  return [`Well profile, surface to ${formatFeet(total)}`, ...runs, ...items].join('; ');
}

/** What is in the hole at one depth, read off the same profile the strip draws. */
export interface WellboreDepthReading {
  /** "1,250 ft" */
  readonly depthText: string;
  /** Index into `profile.segments` of the stretch the depth falls in — the one the strip lights. */
  readonly segmentIndex: number;
  /** The string, or the open hole: "13⅜″ Intermediate", "Open hole". */
  readonly hole: string;
  /** What is set in the open hole ("Screen · Gravel pack"); absent in a cased stretch, or with nothing set. */
  readonly completion: string | null;
  /** The formation whose top is the last one at or above the depth: "In ARUM". Absent above the first top. */
  readonly formation: string | null;
  /** "Above water", "At water level", "1,065 ft below water". Absent when the well has no water level. */
  readonly water: string | null;
  /** The reading as one sentence, for assistive tech. */
  readonly summary: string;
}

/** `depthFt` is clamped to the well: 0 to total depth. */
export function readWellboreAt(profile: WellboreProfile, depthFt: number): WellboreDepthReading {
  const total = profile.segments.at(-1)?.toFt ?? 0;
  const depth = Math.min(Math.max(Math.round(depthFt), 0), total);

  // Each stretch owns its upper edge; total depth belongs to the last one.
  const found = profile.segments.findIndex(segment => depth < segment.toFt);
  const segmentIndex = found === -1 ? profile.segments.length - 1 : found;
  const segment = profile.segments[segmentIndex];
  const isOpen = segment.kind === 'open';
  const hole = isOpen ? segment.label : `${segment.label} ${segment.type}`.trim();

  const top = profile.tops.filter(candidate => candidate.depthFt <= depth).at(-1);
  const waterLevel = profile.markers.find(marker => marker.kind === 'water')?.depthFt;

  const reading = {
    depthText: formatFeet(depth),
    segmentIndex,
    hole,
    completion: isOpen && segment.type ? segment.type : null,
    formation: top ? `In ${top.code}` : null,
    water: waterLevel === undefined ? null : describeWater(depth, waterLevel),
  };
  return { ...reading, summary: [reading.depthText, reading.hole, reading.completion, reading.formation, reading.water].filter(Boolean).join('; ') };
}

function describeWater(depth: number, waterLevel: number): string {
  if (depth < waterLevel) return 'Above water';
  return depth === waterLevel ? 'At water level' : `${formatFeet(depth - waterLevel)} below water`;
}
