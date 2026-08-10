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
    remarksReferenceSize,
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
 * The liner that Open Hole / Gravel Pack / Pre-Perf completion elements are drawn
 * relative to:
 *   - One liner: that liner IS the anchor — completion starts below it.
 *   - Two or more liners: the deepest liner is the screen/intake assembly that sits
 *     *inside* the completion zone (see isLastLinerScreen), not the pipe above it —
 *     so the second-deepest liner is the anchor instead.
 */
export function resolveAnchorLiner(casings: ICasingIR[], drlgCasings: IDrlgCsg[]): RawLinerEntry | null {
    return pickAnchor(resolveLinerDepths(casings, drlgCasings));
}

function pickAnchor<T>(sorted: readonly T[]): T | null {
    if (sorted.length === 0) return null;
    return sorted.length === 1 ? sorted[0] : sorted[sorted.length - 2];
}

function assignHalfWidths(baseHalfWidth: number, count: number): number[] {
    return Array.from({ length: count }, (_, i) =>
        Math.max(22, baseHalfWidth - (i + 1) * LINER_HW_DECREMENT)
    );
}

/**
 * The deepest liner represents the screen/intake assembly run into the open hole /
 * gravel pack zone, so it (and only it) gets the screen visual treatment — gated on
 * EXAD_GWD_WELL_DESIGN.lsFlg = 'Y' and the liner's own OD being 7". Exported so
 * wellbore-depth.helpers can identify the same lone-screen case when it needs to anchor
 * Open Hole / Gravel Pack at the casing shoe instead of below the liner (see
 * resolveCompletionTopDepth there).
 */
export function isLastLinerScreen(
    odSz: string | null | undefined,
    wellDesign: IWellDesign | null | undefined,
): boolean {
    if (parseInchSize(odSz) !== SCREEN_LINER_SIZE_IN) return false;
    return (wellDesign?.lsFlg ?? '').trim().toUpperCase() === 'Y';
}

/**
 * Determines whether a liner qualifies as a 7" pre-perforated liner.
 *
 * All three conditions must pass:
 *   1. The liner's own OD size (DRLG_CSG.wLnrOdSz, preferred over the planned size) is 7".
 *   2. EXAD_GWD_WELL_DESIGN.perforatedFlg is 'Y' (case-insensitive).
 *   3. EXAD_GWD_WELL_DESIGN.perforatedRemarks references a 7" size somewhere in its free text.
 *
 * Mirrors the gating in wellbore-depth.helpers' resolvePrePerforatedLinerDepth (which drives
 * the dashed overlay itself); this is re-implemented locally rather than imported to avoid a
 * circular dependency, since that module already imports resolveLiners from this file.
 */
function isPrePerforatedLiner(
    odSz: string | null | undefined,
    wellDesign: IWellDesign | null | undefined,
): boolean {
    if (parseInchSize(odSz) !== SCREEN_LINER_SIZE_IN) return false;
    if ((wellDesign?.perforatedFlg ?? '').trim().toUpperCase() !== 'Y') return false;
    return remarksReferenceSize(wellDesign?.perforatedRemarks, SCREEN_LINER_SIZE_IN);
}

/** Attaches halfWidth + isScreen/isPrePerfLiner render flags to a depth-only liner list. */
function attachRenderFlags(
    raw: RawLinerEntry[],
    layout: DiagramLayout,
    wellDesign?: IWellDesign | null,
): LinerEntry[] {
    const widths = assignHalfWidths(layout.baseHalfWidth, raw.length);
    const lastIndex = raw.length - 1;

    return raw.map((liner, i) => ({
        ...liner,
        halfWidth: widths[i],
        isScreen: i === lastIndex && isLastLinerScreen(liner.odSz, wellDesign),
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

        const lg = rootG.append('g').attr('class', 'casing-label');
        lg.append('line').attr('class', 'casing-label__line')
            .attr('x1', rEdge).attr('x2', lEnd).attr('y1', midY).attr('y2', midY);
        lg.append('path').attr('class', 'casing-label__arrow')
            .attr('d', buildArrowHeadRight(lEnd, midY, 6));
        lg.append('text').attr('class', 'casing-label__primary')
            .attr('fill', liner.hasActual ? '#22c55e' : '')
            .attr('x', labelX).attr('y', midY + 4)
            .text(`${liner.odSz}" Liner @ ${liner.botDepth.toLocaleString()}${screenTag}${prePerfTag}${actualStar}`);

        animateLabel(lg, labelsStart, animation);

        rootG.append('text').attr('class', 'casing-size-inner')
            .attr('x', centerX).attr('y', midY)
            .attr('text-anchor', 'middle')
            .style('opacity', 0)
            .attr('fill', liner.hasActual ? '#0f2d1a' : '')
            .style('font-weight', liner.hasActual ? '800' : 'normal')
            .text(`${liner.odSz}"`)
            .transition().delay(innerDelay).duration(animation.fadeDur).ease(easeCubicInOut)
            .style('opacity', 1);

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