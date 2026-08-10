import { easeCubicInOut } from 'd3-ease';
import 'd3-transition';

import { ANIM, DiagramLayout } from '@models/well-design/wellbore-diagram.model';
import { ICasingIR } from '@shared/models/wwell/casing-ir.model';
import { IDrlgCsg } from '@shared/models/wwell/drlg-csg.model';
import { IWellDesign } from '@shared/models/wwell/well-design.model';
import {
    buildArrowHeadLeft,
    buildArrowHeadRight,
    buildCasingPath,
    buildScreenHanger,
    openHoleHalfWidth,
    parseInchSize,
} from '@shared/utils/wellbore-math.util';
import { animateLabel } from './animation.helpers';
import { DefsSel, DepthScale, GSel, ResolvedAnimation } from './wellbore-renderer.types';

export interface LinerEntry {
    readonly odSz: string;
    readonly topDepth: number;
    readonly botDepth: number;
    readonly halfWidth: number;
    readonly isScreen: boolean;
    readonly isPrePerfLiner: boolean;
    readonly hasActual: boolean;
}

export interface RenderLinersOptions {
    readonly rootG: GSel;
    readonly defsEl: DefsSel;
    readonly layout: DiagramLayout;
    readonly liners: LinerEntry[];
    readonly centerX: number;
    readonly scale: DepthScale;
    readonly linersStart: number;
    readonly labelsStart: number;
    readonly animation: ResolvedAnimation;
    readonly lastCasingBotDepth: number;
}

export function resolveLiners(
    casings: ICasingIR[],
    drlgCasings: IDrlgCsg[],
    layout: DiagramLayout,
    wellDesign?: IWellDesign | null,
): LinerEntry[] {
    return attachRenderFlags(resolveLinerDepths(casings, drlgCasings), layout, wellDesign);
}

export function linersFromDrlg(
    drlgCasings: IDrlgCsg[],
    layout: DiagramLayout,
    wellDesign?: IWellDesign | null,
): LinerEntry[] {
    return attachRenderFlags(rawLinersFromDrlg(drlgCasings), layout, wellDesign);
}

export function linersFromIR(
    casings: ICasingIR[],
    drlgCasings: IDrlgCsg[],
    layout: DiagramLayout,
    wellDesign?: IWellDesign | null,
): LinerEntry[] {
    return attachRenderFlags(rawLinersFromIR(casings, drlgCasings), layout, wellDesign);
}

const LINER_HW_DECREMENT = 14;
const LINER_WALL_COLOR = '#000000';
const SCREEN_BLANK_RATIO = 0.27;
const SCREEN_LINER_SIZE_IN = 7;

export interface RawLinerEntry {
    readonly odSz: string;
    readonly topDepth: number;
    readonly botDepth: number;
    readonly hasActual: boolean;
}

/**
 * Depth-only liner list, sorted shallowest-first (ascending botDepth). Source priority:
 * IR data (EXAD_GWD_IR_CASING) drives the list when present; DRLG data (as-drilled) is
 * used on its own otherwise, and always overrides depths when both exist.
 */
export function resolveLinerDepths(casings: ICasingIR[], drlgCasings: IDrlgCsg[]): RawLinerEntry[] {
    return casings.length > 0
        ? rawLinersFromIR(casings, drlgCasings)
        : rawLinersFromDrlg(drlgCasings);
}

/**
 * docs/plan/logic.md `is7InchLiner`: a liner qualifies as the 7" completion target when
 * its own OD (DRLG_CSG.wLnrOdSz, preferred) or planned OD (EXAD_GWD_IR_CASING.csgSize,
 * only for csgType='Liner' rows) is 7". RawLinerEntry.odSz already resolves that same
 * priority (actual wLnrOdSz over planned csgSize) upstream in rawLinersFromIR/
 * rawLinersFromDrlg, and every entry here is already liner-typed, so the spec's OR
 * condition collapses to a single size check on the resolved odSz.
 */
export function is7InchLiner(liner: Pick<RawLinerEntry, 'odSz'>): boolean {
    return parseInchSize(liner.odSz) === SCREEN_LINER_SIZE_IN;
}

/**
 * Index of the liner matching is7InchLiner, searched shallowest-first — the first match
 * wins (docs/plan/logic.md Rule 3: `liners.findIndex(is7InchLiner)`). Null when none
 * qualify.
 */
function resolveTargetLinerIndex(liners: readonly RawLinerEntry[]): number | null {
    const idx = liners.findIndex(is7InchLiner);
    return idx === -1 ? null : idx;
}

export type LinerRuleKind = 'none' | 'single' | 'single-fallback' | 'multi-target' | 'multi-fallback';

export interface LinerRule {
    readonly kind: LinerRuleKind;
    readonly startDepth: number;
    /** Fixed structural bottom for 'single' and 'multi-target' (the target liner's own
     *  shoe). Null for 'none', 'single-fallback', and 'multi-fallback' — those are bounded
     *  by total/current/target depth, data this liner-only function doesn't have, so the
     *  caller resolves them. */
    readonly structuralEndDepth: number | null;
    /** The is7InchLiner match completion elements are drawn around — gets the screen
     *  texture when lsFlg='Y'. Null when no liner qualifies (kind is 'none',
     *  'single-fallback', or 'multi-fallback' — those get the generic Liner Screen shape
     *  instead, see completion.renderer's renderOpenHoleAndScreen). */
    readonly targetLiner: RawLinerEntry | null;
    /** The liner immediately above the interval start, used only to blend Open Hole's
     *  on-screen width between it and the outer casing (see resolveOhHalfWidth). */
    readonly boundaryLiner: RawLinerEntry | null;
}

/**
 * Implements docs/plan/logic.md Rules 1-3 over a depth-only liner list: which liner (if
 * any) is the 7" completion target, and the depth interval Open Hole / Gravel Pack /
 * Perforated Interval share as a result.
 */
export function resolveLinerRule(liners: readonly RawLinerEntry[], lastCasingShoe: number): LinerRule {
    // Rule 1: No Liner
    if (liners.length === 0) {
        return { kind: 'none', startDepth: lastCasingShoe, structuralEndDepth: null, targetLiner: null, boundaryLiner: null };
    }

    // Rule 2: Single Liner
    if (liners.length === 1) {
        const only = liners[0];
        if (!is7InchLiner(only)) {
            // Not the 7" screen liner: still an ordinary liner with open hole/completion
            // below it — draw from its own shoe down to total/current/target depth, same
            // as a no-match multi-liner well (docs/plan/logic.md leaves this case
            // unaddressed; this mirrors Rule 3's fallback rather than drawing nothing).
            return { kind: 'single-fallback', startDepth: only.botDepth, structuralEndDepth: null, targetLiner: null, boundaryLiner: only };
        }
        return { kind: 'single', startDepth: lastCasingShoe, structuralEndDepth: only.botDepth, targetLiner: only, boundaryLiner: only };
    }

    // Rule 3: Multiple Liners
    const targetIndex = resolveTargetLinerIndex(liners);
    if (targetIndex !== null) {
        const target = liners[targetIndex];
        const startDepth = targetIndex === 0 ? lastCasingShoe : liners[targetIndex - 1].botDepth;
        return {
            kind: 'multi-target',
            startDepth,
            structuralEndDepth: target.botDepth,
            targetLiner: target,
            boundaryLiner: targetIndex === 0 ? null : liners[targetIndex - 1],
        };
    }

    // Fallback: multiple liners, none match 7"
    const deepest = liners[liners.length - 1];
    return { kind: 'multi-fallback', startDepth: deepest.botDepth, structuralEndDepth: null, targetLiner: null, boundaryLiner: deepest };
}

function assignHalfWidths(baseHalfWidth: number, count: number): number[] {
    return Array.from({ length: count }, (_, i) =>
        Math.max(22, baseHalfWidth - (i + 1) * LINER_HW_DECREMENT)
    );
}

/**
 * Determines whether a liner qualifies as a 7" pre-perforated liner.
 *
 * Both conditions must pass:
 *   1. The liner's own OD size (DRLG_CSG.wLnrOdSz, preferred over the planned size) is 7".
 *   2. EXAD_GWD_WELL_DESIGN.perforatedFlg is 'Y' (case-insensitive).
 *
 * perforatedRemarks is free text and only ever used for label copy — it must never gate
 * visibility, otherwise perforatedFlg='Y' with a blank/missing remarks field would silently
 * hide a feature the well design explicitly opted into.
 */
function isPrePerforatedLiner(
    odSz: string | null | undefined,
    wellDesign: IWellDesign | null | undefined,
): boolean {
    if (parseInchSize(odSz) !== SCREEN_LINER_SIZE_IN) return false;
    return (wellDesign?.perforatedFlg ?? '').trim().toUpperCase() === 'Y';
}

/** Attaches halfWidth + isScreen/isPrePerfLiner render flags to a depth-only liner list. */
function attachRenderFlags(
    raw: RawLinerEntry[],
    layout: DiagramLayout,
    wellDesign?: IWellDesign | null,
): LinerEntry[] {
    const widths = assignHalfWidths(layout.baseHalfWidth, raw.length);
    const targetIndex = resolveTargetLinerIndex(raw);
    const lsFlgYes = (wellDesign?.lsFlg ?? '').trim().toUpperCase() === 'Y';

    return raw.map((liner, i) => ({
        ...liner,
        halfWidth: widths[i],
        isScreen: i === targetIndex && lsFlgYes,
        isPrePerfLiner: isPrePerforatedLiner(liner.odSz, wellDesign),
    }));
}

/**
 * Extracts liner entries from drlgCasings when no ICasingIR data is available.
 * Deduplicates by wLnrOdSz, sorts shallowest-first.
 */
function rawLinersFromDrlg(drlgCasings: IDrlgCsg[]): RawLinerEntry[] {
    const dedupMap = new Map<string, RawLinerEntry>();
    for (const d of drlgCasings) {
        if (!d.wLnrOdSz || (d.wLnrBotDepth ?? 0) <= 0) continue;
        const existing = dedupMap.get(d.wLnrOdSz);
        if (!existing || d.wLnrBotDepth! > existing.botDepth) {
            dedupMap.set(d.wLnrOdSz, {
                odSz: d.wLnrOdSz,
                topDepth: d.wLnrTopDepth ?? d.wCsgBotDpth,
                botDepth: d.wLnrBotDepth!,
                hasActual: true,
            });
        }
    }

    return [...dedupMap.values()].sort((a, b) => a.botDepth - b.botDepth);
}

/**
 * Extracts liner entries from ICasingIR + drlgCasings for actual depth override.
 *
 * Source priority per liner:
 *   - DRLG_CSG (actual/as-drilled) overrides depth when a matching wLnrOdSz exists.
 *   - EXAD_GWD_IR_CASING (planned) is the fallback for depth and the primary OD source.
 *
 * Extra DRLG_CSG liners with no corresponding IR entry are appended at the end.
 */
function rawLinersFromIR(casings: ICasingIR[], drlgCasings: IDrlgCsg[]): RawLinerEntry[] {
    const irLiners = casings.filter(c => c.csgType === 'Liner');

    // Fallback top depth when no drlgCasing match exists: shoe of the deepest non-liner casing
    const lastCasingShoe = casings
        .filter(c => c.csgType !== 'Liner')
        .reduce((max, c) => Math.max(max, c.csgDepth), 0);

    const matchedOdSizes = new Set<string>();

    const irEntries: RawLinerEntry[] = irLiners.map(csg => {
        // Source priority: use DRLG_CSG depth when available; fall back to IR depth.
        const actual = drlgCasings.find(d => d.wLnrOdSz === csg.csgSize) ?? null;
        const hasActualBot = (actual?.wLnrBotDepth ?? 0) > 0;
        const hasActualTop = (actual?.wLnrTopDepth ?? 0) > 0;
        if (actual?.wLnrOdSz) matchedOdSizes.add(actual.wLnrOdSz);
        const fallbackTopDepth = actual != null ? actual.wCsgBotDpth : lastCasingShoe;
        return {
            odSz: actual?.wLnrOdSz ?? csg.csgSize,
            topDepth: hasActualTop ? actual!.wLnrTopDepth! : fallbackTopDepth,
            botDepth: hasActualBot ? actual!.wLnrBotDepth! : csg.csgDepth,
            hasActual: hasActualBot,
        };
    });

    const extraEntries: RawLinerEntry[] = drlgCasings
        .filter(d => d.wLnrOdSz != null && (d.wLnrBotDepth ?? 0) > 0 && !matchedOdSizes.has(d.wLnrOdSz!))
        .map(d => ({
            odSz: d.wLnrOdSz!,
            topDepth: d.wLnrTopDepth ?? d.wCsgBotDpth,
            botDepth: d.wLnrBotDepth!,
            hasActual: true,
        }));

    return [...irEntries, ...extraEntries].sort((a, b) => a.botDepth - b.botDepth);
}

export function renderLiners(options: RenderLinersOptions): void {
    if (options.liners.length === 0) return;
    renderLinerShapes(options);
    renderLinerLabels(options);
}

function renderLinerShapes({
    rootG,
    defsEl,
    layout,
    liners,
    centerX,
    scale,
    linersStart,
    lastCasingBotDepth,
}: RenderLinersOptions): void {
    const { shoeCurveOffset } = layout;

    liners.forEach((liner, i) => {
        const topPx = scale(liner.topDepth);
        const botPx = scale(liner.botDepth);
        const clipId = `dyn-liner-clip-${i}`;
        const clipRadius = openHoleHalfWidth(liner.halfWidth) + 20;
        const delay = (liners.length - 1 - i) * ANIM.CASING_STAGGER;
        const thisLinerStart = linersStart + delay;
        const casingPath = buildCasingPath(centerX, liner.halfWidth, topPx, botPx, shoeCurveOffset);

        // Planned/estimated liners share the casing look (mainGradient @ 0.40) so they
        // read as the same "planned" style as conductor/casing; actual liners keep the actual fill.
        const fill = liner.hasActual ? 'url(#actualLinerGradient)' : 'url(#linerGradient)';
        const capFill = liner.hasActual ? 'url(#linerCapDepthGradient)' : 'url(#plannedLinerCapDepthGradient)';
        const stroke = LINER_WALL_COLOR;
        const opacity = liner.hasActual ? 0.78 : 0.40;

        const hangerHW = liner.halfWidth;
        const hangerY = (i === 0 ? scale(lastCasingBotDepth) : scale(liners[i - 1].botDepth)) + 4;
        const { left: lh, right: rh } = buildScreenHanger(centerX, hangerY, hangerHW, 14, 26);
        rootG.append('path')
            .attr('class', 'liner-hanger')
            .attr('d', `${lh} ${rh}`)
            .attr('fill', '#000000')
            .attr('stroke', '#000000')
            .attr('stroke-width', '1')
            .attr('stroke-linejoin', 'round')
            .style('opacity', 0)
            .transition()
            .delay(thisLinerStart)
            .duration(Math.round(ANIM.CASING_DURATION / 3))
            .ease(easeCubicInOut)
            .style('opacity', 1);

        const clipRect = defsEl.append('clipPath')
            .attr('class', 'dyn-clip')
            .attr('id', clipId)
            .append('rect')
            .attr('x', centerX - clipRadius - 15)
            .attr('y', topPx - 5)
            .attr('width', clipRadius * 2 + 30)
            .attr('height', 0);

        clipRect.transition()
            .delay(thisLinerStart)
            .duration(ANIM.CASING_DURATION)
            .ease(easeCubicInOut)
            .attr('height', botPx - topPx + shoeCurveOffset + 20);

        rootG.append('path')
            .attr('class', liner.isScreen ? 'liner liner--screen' : 'liner')
            .attr('d', casingPath)
            .attr('clip-path', `url(#${clipId})`)
            .attr('fill', fill)
            .attr('stroke', stroke)
            .attr('stroke-width', '2')
            .style('opacity', opacity);

        rootG.append('ellipse')
            .attr('class', 'liner-top-ellipse')
            .attr('cx', centerX)
            .attr('cy', topPx)
            .attr('rx', liner.halfWidth)
            .attr('ry', 4)
            .attr('clip-path', `url(#${clipId})`)
            .attr('fill', capFill)
            .attr('stroke', stroke)
            .attr('stroke-width', '2')
            .style('opacity', opacity);

        // Darken the part of the liner that is inside the casing to simulate interior shadowing
        const exitPx = i === 0 ? scale(lastCasingBotDepth) : scale(liners[i - 1].botDepth);
        if (exitPx > topPx) {
            // Very light inner dimming, mostly relying on the glass overlay for shadows now
            rootG.append('rect')
                .attr('class', 'liner-interior-shadow')
                .attr('x', centerX - liner.halfWidth)
                .attr('y', topPx)
                .attr('width', liner.halfWidth * 2)
                .attr('height', exitPx - topPx)
                .attr('fill', '#0f172a')
                .style('opacity', 0.15)
                .attr('clip-path', `url(#${clipId})`);

            // Render the actual casing 3D gradient over the liner at semi-transparency.
            // This perfectly simulates the front wall of the casing acting as a glass layer.
            rootG.append('rect')
                .attr('class', 'liner-glass-reflection')
                .attr('x', centerX - liner.halfWidth)
                .attr('y', topPx)
                .attr('width', liner.halfWidth * 2)
                .attr('height', exitPx - topPx)
                .attr('fill', 'url(#mainGradient)')
                .style('opacity', 0.45)
                .attr('clip-path', `url(#${clipId})`);

            // Shadow cast by the casing shoe onto the liner as it exits the hole
            rootG.append('ellipse')
                .attr('cx', centerX)
                .attr('cy', exitPx)
                .attr('rx', liner.halfWidth + 8)
                .attr('ry', 4)
                .attr('fill', 'none')
                .attr('stroke', '#020617')
                .attr('stroke-width', '5')
                .style('opacity', 0.6)
                .attr('clip-path', `url(#${clipId})`);
        }

        if (liner.isScreen) {
            const screenStartPx = topPx + (botPx - topPx) * SCREEN_BLANK_RATIO;
            rootG.append('rect')
                .attr('class', 'liner liner--screen-grid')
                .attr('x', centerX - liner.halfWidth + 3)
                .attr('y', screenStartPx)
                .attr('width', liner.halfWidth * 2 - 6)
                .attr('height', botPx - screenStartPx)
                .attr('clip-path', `url(#${clipId})`)
                .attr('fill', 'url(#gridPattern)')
                .attr('fill-opacity', 0.92)
                .attr('stroke', 'none');
        }
    });
}

function renderLinerLabels({
    rootG,
    liners,
    centerX,
    scale,
    labelsStart,
    animation,
}: RenderLinersOptions): void {
    const innerDelay = labelsStart + (animation.lineStyle === 'draw' ? animation.lineDur : 0);

    liners.forEach((liner) => {
        const topPx = scale(liner.topDepth);
        const botPx = scale(liner.botDepth);
        const midY = topPx + (botPx - topPx) * 0.5;
        const rEdge = centerX + liner.halfWidth;
        const lEnd = rEdge + 26;
        const labelX = lEnd + 8;
        const screenTag = liner.isScreen ? ' (Screen)' : '';
        const prePerfTag = liner.isPrePerfLiner ? ' (Pre Perf Liner)' : '';
        const actualStar = liner.hasActual ? ' *' : '';

        // The screen liner (isScreen, always the last/deepest one) gets a heavier, darker
        // label than a plain actual liner so it reads as the standout element on the diagram.
        const primaryFill = liner.isScreen ? '#14532d' : (liner.hasActual ? '#22c55e' : '');

        const lg = rootG.append('g').attr('class', 'casing-label');
        lg.append('line').attr('class', 'casing-label__line')
            .attr('x1', rEdge).attr('x2', lEnd).attr('y1', midY).attr('y2', midY);
        lg.append('path').attr('class', 'casing-label__arrow')
            .attr('d', buildArrowHeadRight(lEnd, midY, 6));
        const primaryLabel = lg.append('text').attr('class', 'casing-label__primary')
            .attr('fill', primaryFill)
            .attr('x', labelX).attr('y', midY + 4)
            .text(`${liner.odSz}" Liner @ ${liner.botDepth.toLocaleString()}${screenTag}${prePerfTag}${actualStar}`);
        if (liner.isScreen) primaryLabel.style('font-weight', '900');

        animateLabel(lg, labelsStart, animation);

        // The screen liner's own grid-pattern fill plus the side callout above already
        // identify it as "7" ... (Screen)" — the inner size text on top of that grid
        // pattern is redundant clutter, so skip it when lsFlg='Y' flagged this as the screen.
        if (!liner.isScreen) {
            const innerFill = liner.hasActual ? '#0f2d1a' : '';
            const innerWeight = liner.hasActual ? '800' : 'normal';
            rootG.append('text').attr('class', 'casing-size-inner')
                .attr('x', centerX).attr('y', midY)
                .attr('text-anchor', 'middle')
                .style('opacity', 0)
                .attr('fill', innerFill)
                .style('font-weight', innerWeight)
                .text(`${liner.odSz}"`)
                .transition().delay(innerDelay).duration(animation.fadeDur).ease(easeCubicInOut)
                .style('opacity', 1);
        }

        if (liner.topDepth > 0) {
            // TOL (top-of-liner) label on the LEFT side to avoid colliding with the
            // right-side OD/liner labels.
            const lEdge = centerX - liner.halfWidth;
            const tolEnd = lEdge - 56;
            const tolLg = rootG.append('g').attr('class', 'casing-label');
            tolLg.append('line').attr('class', 'casing-label__line')
                .attr('x1', lEdge).attr('x2', tolEnd).attr('y1', topPx).attr('y2', topPx);
            tolLg.append('path').attr('class', 'casing-label__arrow')
                .attr('d', buildArrowHeadLeft(tolEnd, topPx, 6));
            tolLg.append('text').attr('class', 'casing-label__primary')
                .attr('text-anchor', 'end')
                .attr('x', tolEnd - 8).attr('y', topPx + 4)
                .text(`TOL @ ${liner.topDepth.toLocaleString()}`);
            animateLabel(tolLg, labelsStart, animation);
        }
    });
}