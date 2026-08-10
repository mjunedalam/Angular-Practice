import { DiagramLayout, WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { ICasingIR } from '@shared/models/wwell/casing-ir.model';
import { IDrlgCsg } from '@shared/models/wwell/drlg-csg.model';
import { IWellDesign } from '@shared/models/wwell/well-design.model';
import { computeCasingHalfWidth, parseInchSize } from '@shared/utils/wellbore-math.util';
import { LinerRule, resolveLinerDepths, resolveLinerRule, resolveLiners } from './liner.renderer';
import { DepthScale } from './wellbore-renderer.types';

const OVERRUN_COMPLETION_LENGTH_FT = 1200;

export function resolveShoeDepth(casings: ICasingIR[], drlgCasings: IDrlgCsg[]): number {
  const irNonLiner = casings.filter(c => c.csgType !== 'Liner' && c.csgType !== 'Gravel Pack');
  const deepest = irNonLiner[0];
  if (!deepest) return drlgCasings[0]?.wCsgBotDpth ?? 0;

  const actual = drlgCasings.find(d => d.wCsgOdSz === deepest.csgSize) ?? null;
  return (actual !== null && actual.wCsgBotDpth > 0 ? actual.wCsgBotDpth : null) ?? deepest.csgDepth;
}

/** Central entry point for docs/plan/logic.md Rules 1-3 (see liner.renderer's resolveLinerRule). */
export function resolveCompletionRule(casings: ICasingIR[], drlgCasings: IDrlgCsg[]): LinerRule {
  const liners = resolveLinerDepths(casings, drlgCasings);
  const lastCasingShoe = resolveShoeDepth(casings, drlgCasings);
  return resolveLinerRule(liners, lastCasingShoe);
}

/** Start depth Open Hole / Gravel Pack / Perforated Interval share, per Rules 1-3. */
export function resolveCompletionTopDepth(casings: ICasingIR[], drlgCasings: IDrlgCsg[]): number {
  return resolveCompletionRule(casings, drlgCasings).startDepth;
}

export function resolveCompletionTopPx(
  casings: ICasingIR[],
  drlgCasings: IDrlgCsg[],
  scale: DepthScale,
): number {
  return scale(resolveCompletionTopDepth(casings, drlgCasings));
}

export function resolveCompletionBottomDepth(data: WellboreDiagramData): number {
  const rule = resolveCompletionRule(data.casings, data.drlgCasings);

  let naturalBottom: number;
  switch (rule.kind) {
    case 'none':
    case 'single-fallback': {
      // Rule 1, and Rule 2's non-7" liner: end = total depth, extended past it while
      // actively drilling beyond target.
      const isCurrentDepthBeyondTarget = data.targetDepth > 0 && data.currentDepth > data.targetDepth;
      naturalBottom = isCurrentDepthBeyondTarget
        ? Math.max(rule.startDepth, Math.min(data.totalDepth, rule.startDepth + OVERRUN_COMPLETION_LENGTH_FT))
        : data.totalDepth;
      break;
    }
    case 'single':
    case 'multi-target':
      // Rule 2 / Rule 3 standard evaluation: end = the 7" target liner's own shoe depth.
      naturalBottom = rule.structuralEndDepth ?? rule.startDepth;
      break;
    case 'multi-fallback': {
      // Rule 3 fallback: end = max(current depth, target depth), clamped to [start, TD].
      const fallbackEnd = Math.max(data.currentDepth || 0, data.targetDepth || 0);
      naturalBottom = Math.max(rule.startDepth, Math.min(data.totalDepth, fallbackEnd));
      break;
    }
  }

  return Math.min(naturalBottom, data.displayDepth);
}

export function resolveCompletionBottomPx(data: WellboreDiagramData, scale: DepthScale): number {
  return scale(resolveCompletionBottomDepth(data));
}

/**
 * Extra pixels Open Hole / Gravel Pack / Perforated Interval should extend past their
 * resolved bottom depth so their border reaches the liner's own rendered shoe curve.
 * buildCasingPath draws the liner's shoe as a bulge that dips shoeCurveOffset px below
 * its flat bottom depth (see liner.renderer's renderLinerShapes) — without this, those
 * flat-bottomed completion paths visually stop short, leaving a bare gap at the tip.
 *
 * Only applies when the interval's END is bounded by a liner's own shoe (Rule 2 / Rule 3
 * standard evaluation, resolveLinerRule kind 'single' | 'multi-target'). The other kinds
 * all terminate in open rock (total depth, or current/target depth) with no liner shoe
 * to match at the bottom, so no curve applies there.
 */
export function resolveCompletionShoeCurvePx(
  casings: ICasingIR[],
  drlgCasings: IDrlgCsg[],
  layout: DiagramLayout,
): number {
  const kind = resolveCompletionRule(casings, drlgCasings).kind;
  return kind === 'single' || kind === 'multi-target' ? layout.shoeCurveOffset : 0;
}

function isFlagYes(flg: string | null | undefined): boolean {
  return (flg ?? '').trim().toUpperCase() === 'Y';
}

// NOTE: none of the shouldRender* gates below check *Remarks text. Remarks are free-form
// and frequently blank/null even when the well design has explicitly opted in via the
// flag — gating visibility on them would silently hide a feature the flag turned on.
// Remarks are only ever used for label copy downstream, with sensible fallback text when
// missing (see renderOpenHoleAndScreen / renderGravelPackDesign in completion.renderer).

export function shouldRenderOpenHole(wellDesign: IWellDesign | null | undefined): boolean {
  return isFlagYes(wellDesign?.ohFlg);
}

export function shouldRenderGravelPack(wellDesign: IWellDesign | null | undefined): boolean {
  return isFlagYes(wellDesign?.gpFlg);
}

export function shouldRenderLinerScreen(wellDesign: IWellDesign | null | undefined): boolean {
  return isFlagYes(wellDesign?.lsFlg);
}

export interface PerforatedIntervalInfo {
  /** OD of the is7InchLiner target the interval is drawn around (Rule 2 / Rule 3
   *  standard evaluation). Null in Rule 1 (no liner) and Rule 3's fallback, where the
   *  interval isn't anchored to any single liner. */
  readonly linerOdSz: string | null;
}

/**
 * Resolves whether the Perforated Interval element (EXAD_GWD_WELL_DESIGN.perforatedFlg)
 * should render, and which liner (if any) to reference in its label.
 *
 * perforatedRemarks is free text and only affects label copy elsewhere — it must never
 * gate visibility (see isPrePerforatedLiner in liner.renderer for the matching rationale).
 *
 * Per docs/plan/logic.md, perforatedFlg is drawn across the same shared interval as
 * ohFlg/gpFlg (resolveCompletionTopDepth/resolveCompletionBottomDepth) — every liner shape
 * (Rules 1-3) resolves to some interval, so this only gates on the flag itself.
 */
export function resolvePerforatedIntervalInfo(
  wellDesign: IWellDesign | null | undefined,
  casings: ICasingIR[],
  drlgCasings: IDrlgCsg[],
): PerforatedIntervalInfo | null {
  if (!isFlagYes(wellDesign?.perforatedFlg)) return null;

  const rule = resolveCompletionRule(casings, drlgCasings);
  return { linerOdSz: rule.targetLiner?.odSz ?? null };
}

export function shouldRenderPerforatedInterval(
  wellDesign: IWellDesign | null | undefined,
  casings: ICasingIR[] = [],
  drlgCasings: IDrlgCsg[] = [],
): boolean {
  return resolvePerforatedIntervalInfo(wellDesign, casings, drlgCasings) !== null;
}

export function resolveOhHalfWidth(data: WellboreDiagramData, layout: DiagramLayout): number {
  const { baseHalfWidth, halfWidthIncrement, openHoleHwMargin } = layout;
  const innerHW = computeCasingHalfWidth(0, baseHalfWidth, halfWidthIncrement);

  if (!isFlagYes(data.wellDesign?.ohFlg)) return innerHW + openHoleHwMargin;

  const ohDiameter = parseInchSize(data.wellDesign?.ohRemarks);
  if (ohDiameter === null) return innerHW + openHoleHwMargin;

  // innerHW is the on-screen half-width of the deepest structural casing (tier 0) — the
  // casing the anchor liner hangs from — so its real OD is the outer bound OH must stay inside.
  const structuralCasings = data.casings.filter(
    c => c.csgType !== 'Liner' && c.csgType !== 'Gravel Pack',
  );
  const outerOD = parseInchSize(structuralCasings[0]?.csgSize ?? null);

  // When liners exist, OH must render strictly outside the boundary liner it surrounds and
  // inside the casing it hangs from (e.g. a 12 1/4" OH must sit outside a 7" liner and
  // inside a 13 3/8" casing). Per-liner on-screen widths (anchorLiner.halfWidth, innerHW)
  // are a cosmetic decrement scheme with no fixed relationship to real inches, so scaling
  // one of them by a raw diameter ratio can overshoot the casing or undershoot the liner.
  // Instead, interpolate between the two known on-screen widths using the real diameter
  // ratio as the blend factor — this guarantees OH always lands between them.
  // boundaryLiner (see resolveLinerRule) is the liner immediately above the completion
  // interval's start — for Rule 3's fallback that's the deepest liner itself.
  const liners = resolveLiners(data.casings, data.drlgCasings, layout, data.wellDesign);
  const boundary = resolveCompletionRule(data.casings, data.drlgCasings).boundaryLiner;
  const anchorLiner = boundary !== null
    ? liners.find(l => l.odSz === boundary.odSz && l.botDepth === boundary.botDepth) ?? null
    : null;

  if (anchorLiner !== null) {
    const linerOD = parseInchSize(anchorLiner.odSz);
    if (linerOD !== null && linerOD > 0) {
      if (outerOD !== null && outerOD > linerOD) {
        const blend = Math.min(1, Math.max(0, (ohDiameter - linerOD) / (outerOD - linerOD)));
        return anchorLiner.halfWidth + blend * (innerHW - anchorLiner.halfWidth);
      }
      // No known casing OD to blend against: fall back to a direct ratio, clamped so OH
      // never renders outside the innermost casing's on-screen width.
      return Math.min(anchorLiner.halfWidth * (ohDiameter / linerOD), innerHW);
    }
  }

  // No liners: scale relative to innermost structural casing
  if (outerOD !== null && outerOD > 0 && ohDiameter < outerOD) {
    return innerHW * (ohDiameter / outerOD);
  }

  return innerHW + openHoleHwMargin;
}

export function getCasingTier(csg: ICasingIR, casings: ICasingIR[]): number {
  const structuralCasings = casings.filter(item => item.csgType !== 'Gravel Pack');
  const idx = structuralCasings.indexOf(csg);
  return idx === -1 ? 0 : idx;
}
