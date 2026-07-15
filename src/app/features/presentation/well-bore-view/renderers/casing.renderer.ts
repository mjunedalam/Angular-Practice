import { pointer } from 'd3-selection';
import { easeCubicInOut } from 'd3-ease';
import 'd3-transition';

import { ANIM, DiagramLayout } from '@models/well-design/wellbore-diagram.model';
import { ICasingIR } from '@shared/models/wwell/casing-ir.model';
import { IDrlgCsg } from '@shared/models/wwell/drlg-csg.model';
import { IWellDesign } from '@shared/models/wwell/well-design.model';
import {
    buildArrowHeadRight,
    buildCasingPath,
    buildGravelPackUPath,
    casingGradientId,
    computeCasingHalfWidth,
    openHoleHalfWidth,
} from '@shared/utils/wellbore-math.util';
import { animateLabel } from './animation.helpers';
import { getCasingTier, resolveCompletionTopDepth } from './wellbore-depth.helpers';
import { resolveLiners, renderLiners, LinerEntry } from './liner.renderer';
import { DefsSel, DepthScale, GSel, ResolvedAnimation } from './wellbore-renderer.types';

const CSG_TOOLTIP_GAP = 18;
const CSG_TOOLTIP_W = 260;
const CSG_TOOLTIP_FONT = 'DM Sans, sans-serif';

export interface RenderCasingElementsOptions {
    readonly rootG: GSel;
    readonly defsEl: DefsSel;
    readonly layout: DiagramLayout;
    readonly casings: ICasingIR[];
    readonly drlgCasings: IDrlgCsg[];
    readonly centerX: number;
    readonly scale: DepthScale;
    readonly casingsStart: number;
    readonly linersStart: number;
    readonly gravelStart: number;
    readonly labelsStart: number;
    readonly openHoleHalfWidthPx: number;
    readonly animation: ResolvedAnimation;
    readonly wellDesign?: IWellDesign | null;
}

export function renderCasingElements(options: RenderCasingElementsOptions): void {
    const { casings, drlgCasings, layout, wellDesign, rootG, defsEl, centerX, scale, linersStart, labelsStart, animation } = options;
    const liners = resolveLiners(casings, drlgCasings, layout, wellDesign);
    const lastCasingBotDepth = resolveLastCasingBotDepth(casings, drlgCasings);

    renderCasings(options);
    renderLiners({ rootG, defsEl, layout, liners, centerX, scale, linersStart, labelsStart, animation, lastCasingBotDepth });
    renderCasingLabels(options);
    addCasingLinerTooltips(options, liners);
}

function resolveLastCasingBotDepth(casings: ICasingIR[], drlgCasings: IDrlgCsg[]): number {
    // Find the deepest non-liner casing shoe — that is the 13 3/8" (or innermost casing) shoe
    if (casings.length === 0) {
        // drlgCasings only: wCsgBotDpth is the parent casing shoe; pick the shallowest
        // non-zero value that represents the innermost casing (smallest wCsgBotDpth among actual casing records)
        const casingOnly = drlgCasings.filter(d => !d.wLnrOdSz && d.wCsgBotDpth > 0);
        if (casingOnly.length > 0) {
            return Math.max(...casingOnly.map(d => d.wCsgBotDpth));
        }
        // fallback: deepest wCsgBotDpth across all records
        return Math.max(...drlgCasings.map(d => d.wCsgBotDpth).filter(v => v > 0), 0);
    }

    const nonLiners = casings.filter(c => c.csgType !== 'Liner');
    if (nonLiners.length === 0) return 0;

    // Pick the non-liner casing with the deepest shoe (largest depth value)
    const deepest = nonLiners.reduce((max, c) => c.csgDepth > max.csgDepth ? c : max, nonLiners[0]);
    const actual = drlgCasings.find(d => d.wCsgOdSz === deepest.csgSize);
    return (actual?.wCsgBotDpth ?? 0) > 0 ? actual!.wCsgBotDpth : deepest.csgDepth;
}

function renderCasings({
    rootG,
    defsEl,
    layout,
    casings,
    drlgCasings,
    centerX,
    scale,
    casingsStart,
    gravelStart,
    openHoleHalfWidthPx,
}: RenderCasingElementsOptions): void {
    if (casings.length === 0) {
        renderCasingsFromActual({ rootG, defsEl, layout, drlgCasings, centerX, scale, casingsStart });
        return;
    }

    const { baseHalfWidth, halfWidthIncrement, shoeCurveOffset } = layout;
    const completionTopPx = scale(resolveCompletionTopDepth(casings, drlgCasings));

    casings.forEach((csg, i) => {
        if (csg.csgType === 'Liner') return;
        const tier = getCasingTier(csg, casings);
        const hw = computeCasingHalfWidth(tier, baseHalfWidth, halfWidthIncrement);
        const isConductor = csg.csgType.toLowerCase() === 'conductor';
        const isGP = csg.csgType === 'Gravel Pack';
        const actualCsg = drlgCasings.find(d => d.wCsgOdSz === csg.csgSize) ?? null;
        const hasActual = actualCsg !== null && actualCsg.wCsgBotDpth > 0;
        const displayDepth = hasActual ? actualCsg!.wCsgBotDpth : csg.csgDepth;
        const bottomPx = scale(displayDepth);
        const clipId = `dyn-casing-clip-${i}`;
        const animOrder = casings.length - 1 - i;
        const delay = animOrder * ANIM.CASING_STAGGER;
        const gpInnerHW = computeCasingHalfWidth(0, layout.baseHalfWidth, layout.halfWidthIncrement);
        const gpLsHW = Math.min(gpInnerHW, openHoleHalfWidthPx) - layout.linerScreenInset;
        const gpMaxOuter = openHoleHalfWidthPx - layout.gpScreenGap;
        const gpAnnulusWidth = Math.max(0, (gpMaxOuter - gpLsHW) * layout.gpFillRatio);
        const gpOuterEdge = gpLsHW + gpAnnulusWidth;
        const gpAnnulusCenter = gpLsHW + gpAnnulusWidth / 2;
        const clipRadius = isGP ? gpOuterEdge : openHoleHalfWidth(hw) + 20;

        const clipRect = defsEl
            .append('clipPath')
            .attr('class', 'dyn-clip')
            .attr('id', clipId)
            .append('rect')
            .attr('x', centerX - clipRadius - (isGP ? 0 : 15))
            .attr('y', isGP ? completionTopPx : -5)
            .attr('width', clipRadius * 2 + (isGP ? 0 : 30))
            .attr('height', 0);

        if (isGP) {
            const gravelBottomPx = scale(csg.csgDepth);
            rootG.append('path')
                .attr('class', 'gravelHole')
                .attr('d', buildGravelPackUPath(centerX, gpAnnulusCenter, completionTopPx, gravelBottomPx))
                .attr('stroke', 'url(#gravelpattern)')
                .attr('stroke-width', String(gpAnnulusWidth))
                .style('fill', 'none')
                .attr('clip-path', `url(#${clipId})`);
            clipRect.transition()
                .delay(gravelStart)
                .duration(ANIM.GRAVEL_DURATION)
                .ease(easeCubicInOut)
                .attr('height', gravelBottomPx - completionTopPx);
            return;
        }

        const casingD = buildCasingPath(centerX, hw, 0, bottomPx, shoeCurveOffset);

        if (hasActual) {
            rootG.append('path')
                .attr('class', 'casing')
                .attr('d', casingD)
                .attr('clip-path', `url(#${clipId})`)
                .attr('fill', 'url(#actualCasingGradient)')
                .attr('stroke', '#000000')
                .attr('stroke-width', '5')
                .style('opacity', 0.78);
        } else {
            const plannedFillGrad = isConductor
                ? 'url(#mainGradient)'
                : `url(#${casingGradientId(csg.csgType)})`;
            rootG.append('path')
                .attr('class', 'casing')
                .attr('d', casingD)
                .attr('clip-path', `url(#${clipId})`)
                .attr('fill', plannedFillGrad)
                .attr('stroke', '#000000')
                .attr('stroke-width', '5')
                .style('opacity', isConductor ? 0.75 : 0.40);
        }

        clipRect.transition()
            .delay(casingsStart + delay)
            .duration(ANIM.CASING_DURATION)
            .ease(easeCubicInOut)
            .attr('height', bottomPx + shoeCurveOffset + 20);
    });
}

function uniqueCasingsByOd(drlgCasings: IDrlgCsg[]): IDrlgCsg[] {
    const map = new Map<string, IDrlgCsg>();
    for (const d of drlgCasings) {
        if (d.wCsgBotDpth <= 0) continue;
        const existing = map.get(d.wCsgOdSz);
        if (!existing || d.wCsgBotDpth > existing.wCsgBotDpth) {
            map.set(d.wCsgOdSz, d);
        }
    }
    return [...map.values()].sort((a, b) => b.wCsgBotDpth - a.wCsgBotDpth);
}

function renderCasingsFromActual({
    rootG,
    defsEl,
    layout,
    drlgCasings,
    centerX,
    scale,
    casingsStart,
}: Pick<RenderCasingElementsOptions, 'rootG' | 'defsEl' | 'layout' | 'drlgCasings' | 'centerX' | 'scale' | 'casingsStart'>): void {
    const { baseHalfWidth, halfWidthIncrement, shoeCurveOffset } = layout;
    const unique = uniqueCasingsByOd(drlgCasings);

    unique.forEach((actual, i) => {
        const hw = computeCasingHalfWidth(i, baseHalfWidth, halfWidthIncrement);
        const animOrder = unique.length - 1 - i;
        const delay = animOrder * ANIM.CASING_STAGGER;
        const bottomPx = scale(actual.wCsgBotDpth);
        const clipId = `dyn-casing-clip-actual-${i}`;
        const clipRadius = openHoleHalfWidth(hw) + 20;
        const clipRect = defsEl.append('clipPath')
            .attr('class', 'dyn-clip').attr('id', clipId).append('rect')
            .attr('x', centerX - clipRadius - 15).attr('y', -5)
            .attr('width', clipRadius * 2 + 30).attr('height', 0);

        rootG.append('path')
            .attr('class', 'casing')
            .attr('d', buildCasingPath(centerX, hw, 0, bottomPx, shoeCurveOffset))
            .attr('clip-path', `url(#${clipId})`)
            .attr('fill', 'url(#actualCasingGradient)')
            .attr('stroke', '#000000')
            .attr('stroke-width', '2')
            .style('opacity', 0.78);

        clipRect.transition()
            .delay(casingsStart + delay).duration(ANIM.CASING_DURATION).ease(easeCubicInOut)
            .attr('height', bottomPx + shoeCurveOffset + 20);
    });
}

function renderCasingLabels({
    rootG,
    layout,
    casings,
    drlgCasings,
    centerX,
    scale,
    labelsStart,
    openHoleHalfWidthPx,
    animation,
}: RenderCasingElementsOptions): void {
    if (casings.length === 0) {
        renderCasingLabelsFromActual({ rootG, layout, drlgCasings, centerX, scale, labelsStart, animation });
        return;
    }

    const { baseHalfWidth, halfWidthIncrement, linerScreenInset, gpScreenGap, gpFillRatio } = layout;
    const gpLabelInnerHW = computeCasingHalfWidth(0, baseHalfWidth, halfWidthIncrement);
    const gpLabelLsHW = Math.min(gpLabelInnerHW, openHoleHalfWidthPx) - linerScreenInset;
    const gpLabelMaxOuter = openHoleHalfWidthPx - gpScreenGap;
    const gpLabelAnnulus = Math.max(0, (gpLabelMaxOuter - gpLabelLsHW) * gpFillRatio);
    const gpLabelOuterEdge = gpLabelLsHW + gpLabelAnnulus;

    const sortedShoeDepths = casings
        .filter(c => c.csgType !== 'Liner' && c.csgType !== 'Gravel Pack')
        .map(c => {
            const act = drlgCasings.find(d => d.wCsgOdSz === c.csgSize) ?? null;
            return (act !== null && act.wCsgBotDpth > 0) ? act.wCsgBotDpth : c.csgDepth;
        })
        .sort((a, b) => a - b);

    casings.forEach((csg) => {
        if (csg.csgType === 'Liner') return;
        const tier = getCasingTier(csg, casings);
        const hw = computeCasingHalfWidth(tier, baseHalfWidth, halfWidthIncrement);
        const actualCsg = drlgCasings.find(d => d.wCsgOdSz === csg.csgSize) ?? null;
        const hasActual = actualCsg !== null && actualCsg.wCsgBotDpth > 0;
        const displayDepth = hasActual ? actualCsg!.wCsgBotDpth : csg.csgDepth;
        const displaySize = hasActual ? actualCsg!.wCsgOdSz : csg.csgSize;
        const shoePx = scale(displayDepth);
        const labelYPx = csg.csgType === 'Gravel Pack' ? scale(csg.csgDepth) : shoePx;
        const rEdge = csg.csgType === 'Gravel Pack'
            ? centerX + gpLabelOuterEdge
            : centerX + hw;
        const lEnd = rEdge + 26;
        const labelX = lEnd + 8;
        const lg = rootG.append('g').attr('class', 'casing-label');

        lg.append('line')
            .attr('class', 'casing-label__line')
            .attr('x1', rEdge).attr('x2', lEnd)
            .attr('y1', labelYPx).attr('y2', labelYPx);
        lg.append('path')
            .attr('class', 'casing-label__arrow')
            .attr('d', buildArrowHeadRight(lEnd, labelYPx, 6));

        if (csg.csgType === 'Gravel Pack') {
            lg.append('text')
                .attr('class', 'casing-label__primary')
                .attr('x', labelX).attr('y', labelYPx + 4)
                .text(csg.csgRemarks || 'Gravel Pack');
        } else {
            const primaryEl = lg.append('text')
                .attr('class', 'casing-label__primary')
                .attr('x', labelX).attr('y', shoePx + 4);
            if (hasActual) {
                primaryEl
                    .attr('fill', '#22c55e')
                    .text(`${displaySize}" ${csg.csgType} @ ${displayDepth.toLocaleString()} *`);
            } else {
                primaryEl.text(`${csg.csgSize}" ${csg.csgType} @ ${csg.csgDepth.toLocaleString()}`);
                if (csg.csgRemarks) {
                    lg.append('text')
                        .attr('class', 'casing-label__secondary')
                        .attr('x', labelX).attr('y', shoePx + 24)
                        .text(`(${csg.csgRemarks})`);
                }
            }

            const innerDelay = labelsStart + (animation.lineStyle === 'draw' ? animation.lineDur : 0);
            const rank = sortedShoeDepths.indexOf(displayDepth);
            const topDepth = rank > 0 ? sortedShoeDepths[rank - 1] : 0;
            const innerMidY = scale((topDepth + displayDepth) / 2);
            rootG.append('text')
                .attr('class', 'casing-size-inner')
                .attr('x', centerX).attr('y', innerMidY)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'central')
                .style('opacity', 0)
                .attr('fill', hasActual ? '#0f2d1a' : '')
                .style('font-weight', hasActual ? '800' : 'normal')
                .text(`${displaySize}"`)
                .transition().delay(innerDelay).duration(animation.fadeDur).ease(easeCubicInOut)
                .style('opacity', 1);
        }

        animateLabel(lg, labelsStart, animation);
    });
}

function renderCasingLabelsFromActual({
    rootG,
    layout,
    drlgCasings,
    centerX,
    scale,
    labelsStart,
    animation,
}: Pick<RenderCasingElementsOptions, 'rootG' | 'layout' | 'drlgCasings' | 'centerX' | 'scale' | 'labelsStart' | 'animation'>): void {
    const { baseHalfWidth, halfWidthIncrement } = layout;
    const unique = uniqueCasingsByOd(drlgCasings);

    unique.forEach((actual, i) => {
        const hw = computeCasingHalfWidth(i, baseHalfWidth, halfWidthIncrement);
        const shoePx = scale(actual.wCsgBotDpth);
        const prevActual = unique[i + 1];
        const topDepth = prevActual ? prevActual.wCsgBotDpth : 0;
        const innerMidY = scale((topDepth + actual.wCsgBotDpth) / 2);
        const rEdge = centerX + hw;
        const lEnd = rEdge + 26;
        const labelX = lEnd + 8;
        const lg = rootG.append('g').attr('class', 'casing-label');

        lg.append('line').attr('class', 'casing-label__line')
            .attr('x1', rEdge).attr('x2', lEnd).attr('y1', shoePx).attr('y2', shoePx);
        lg.append('path').attr('class', 'casing-label__arrow')
            .attr('d', buildArrowHeadRight(lEnd, shoePx, 6));
        lg.append('text').attr('class', 'casing-label__primary')
            .attr('x', labelX).attr('y', shoePx + 4)
            .text(`${actual.wCsgOdSz}" Casing @ ${actual.wCsgBotDpth.toLocaleString()}`);

        rootG.append('text').attr('class', 'casing-size-inner')
            .attr('x', centerX).attr('y', innerMidY).attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .style('opacity', 0).text(`${actual.wCsgOdSz}"`)
            .transition().delay(labelsStart + (animation.lineStyle === 'draw' ? animation.lineDur : 0))
            .duration(animation.fadeDur).ease(easeCubicInOut).style('opacity', 1);

        animateLabel(lg, labelsStart, animation);
    });
}

// ── Casing / Liner hover tooltips ──────────────────────────────────────────

function buildCasingTooltipController(
    tooltipLayer: GSel,
    layout: DiagramLayout,
    centerX: number,
) {
    type Row = { label: string; value: string; hilite?: boolean };

    let isVisible = false;
    let lastSide: 'left' | 'right' | null = null;

    const hide = (): void => {
        isVisible = false;
        lastSide = null;
        tooltipLayer.interrupt().transition().duration(120).style('opacity', 0);
    };

    const renderCard = (
        title: string,
        badge: string,
        accent: string,
        rows: ReadonlyArray<Row>,
        hw: number,
        mouseX: number,
        mouseY: number,
    ): void => {
        const ROW_H = 28;
        const tooltipH = 60 + rows.length * ROW_H + 16;
        const tooltipW = CSG_TOOLTIP_W;
        const onRight = mouseX > centerX;
        const side: 'left' | 'right' = onRight ? 'right' : 'left';
        const casingEdgeX = onRight ? centerX + hw : centerX - hw;
        const mutedAccent = accent === '#16a34a' ? 'rgba(22,163,74,0.14)' : 'rgba(37,99,235,0.14)';

        const rawTooltipX = onRight
            ? casingEdgeX + CSG_TOOLTIP_GAP
            : casingEdgeX - CSG_TOOLTIP_GAP - tooltipW;
        const tooltipX = Math.max(8, Math.min(rawTooltipX, layout.wellboreViewWidth - tooltipW - 8));
        const tooltipY = Math.max(4, Math.min(mouseY - tooltipH / 2, layout.drawingHeight - tooltipH - 4));
        const connY = Math.min(Math.max(mouseY, tooltipY + 18), tooltipY + tooltipH - 18);

        tooltipLayer.selectAll('*').remove();
        tooltipLayer.raise();

        // Connector: elbow from casing edge to tooltip connector-side edge
        const connTipX = onRight ? tooltipX : tooltipX + tooltipW;
        const connMidX = onRight ? tooltipX - 8 : tooltipX + tooltipW + 8;
        tooltipLayer.append('path')
            .attr('d', `M${casingEdgeX},${mouseY} H${connMidX} Q${connTipX},${mouseY} ${connTipX},${connY} H${connTipX}`)
            .attr('fill', 'none').attr('stroke', accent)
            .attr('stroke-width', 1.4).attr('stroke-dasharray', '4,3')
            .attr('stroke-linecap', 'round').attr('opacity', 0.65);

        // Anchor dot on casing edge
        tooltipLayer.append('circle')
            .attr('cx', casingEdgeX).attr('cy', mouseY)
            .attr('r', 3.2).attr('fill', '#fff')
            .attr('stroke', accent).attr('stroke-width', 1.6);

        // Card background
        tooltipLayer.append('rect')
            .attr('x', tooltipX).attr('y', tooltipY)
            .attr('width', tooltipW).attr('height', tooltipH)
            .attr('rx', 8).attr('fill', '#ffffff')
            .attr('stroke', '#e2e8f0').attr('stroke-width', 1.2)
            .attr('filter', 'drop-shadow(0 8px 16px rgba(15,23,42,0.18))');

        // Accent rail on the connector side of the card
        const railX = onRight ? tooltipX : tooltipX + tooltipW - 5;
        tooltipLayer.append('rect')
            .attr('x', railX).attr('y', tooltipY)
            .attr('width', 5).attr('height', tooltipH)
            .attr('rx', 2).attr('fill', accent);

        // Badge
        const badgeW = badge.length * 8.5 + 16;
        const badgeX = tooltipX + 12;
        tooltipLayer.append('rect')
            .attr('x', badgeX).attr('y', tooltipY + 11)
            .attr('width', badgeW).attr('height', 22)
            .attr('rx', 11).attr('fill', mutedAccent);
        tooltipLayer.append('text')
            .attr('x', badgeX + badgeW / 2).attr('y', tooltipY + 27)
            .attr('text-anchor', 'middle')
            .attr('font-size', '14').attr('font-family', CSG_TOOLTIP_FONT)
            .attr('font-weight', '900').attr('letter-spacing', '0.5')
            .attr('fill', accent).text(badge);

        // Title
        tooltipLayer.append('text')
            .attr('x', tooltipX + tooltipW - 12).attr('y', tooltipY + 27)
            .attr('text-anchor', 'end')
            .attr('font-size', '17').attr('font-family', CSG_TOOLTIP_FONT)
            .attr('font-weight', '800').attr('fill', '#0f172a').text(title);

        // Divider
        tooltipLayer.append('line')
            .attr('x1', tooltipX + 12).attr('x2', tooltipX + tooltipW - 12)
            .attr('y1', tooltipY + 44).attr('y2', tooltipY + 44)
            .attr('stroke', '#e2e8f0').attr('stroke-width', 1);

        // Rows
        rows.forEach((row, i) => {
            const rowY = tooltipY + 64 + i * ROW_H;
            tooltipLayer.append('text')
                .attr('x', tooltipX + 14).attr('y', rowY)
                .attr('font-size', '15').attr('font-family', CSG_TOOLTIP_FONT)
                .attr('font-weight', '700').attr('fill', '#64748b').text(row.label);
            tooltipLayer.append('text')
                .attr('x', tooltipX + tooltipW - 14).attr('y', rowY)
                .attr('text-anchor', 'end')
                .attr('font-size', '17').attr('font-family', CSG_TOOLTIP_FONT)
                .attr('font-weight', '800')
                .attr('fill', row.hilite ? accent : '#0f172a').text(row.value);
        });

        // Fade in only on first show or when side changes; instant reposition otherwise
        const sideChanged = side !== lastSide;
        lastSide = side;
        if (!isVisible || sideChanged) {
            tooltipLayer.interrupt().style('opacity', 0).transition().duration(150).style('opacity', 1);
            isVisible = true;
        } else {
            tooltipLayer.style('opacity', 1);
        }
    };

    const showForCasing = (
        csg: ICasingIR | null,
        actual: IDrlgCsg | null,
        hw: number,
        mouseX: number,
        mouseY: number,
        accent: string,
    ): void => {
        const hasActual = actual !== null && (actual.wCsgBotDpth ?? 0) > 0;
        const size = csg?.csgSize ?? actual?.wCsgOdSz ?? '?';
        const typeName = csg?.csgType ?? 'Casing';
        const typeLabel = typeName.toLowerCase() === 'conductor' ? 'CONDUCTOR' : typeName.toUpperCase();
        const badge = hasActual ? `${typeLabel} ✓` : typeLabel;

        const rows: Row[] = [];
        if (hasActual) {
            rows.push({ label: 'actual bottom depth', value: `${actual!.wCsgBotDpth.toLocaleString()} ft`, hilite: true });
            if (csg) rows.push({ label: 'est bottom depth', value: `${csg.csgDepth.toLocaleString()} ft` });
            if (csg?.csgRemarks) rows.push({ label: 'Remark', value: csg.csgRemarks });
        } else if (csg) {
            rows.push({ label: 'est bottom depth', value: `${csg.csgDepth.toLocaleString()} ft` });
            if (csg.csgRemarks) rows.push({ label: 'Remark', value: csg.csgRemarks });
        } else if (actual) {
            rows.push({ label: 'actual bottom depth', value: `${actual.wCsgBotDpth.toLocaleString()} ft`, hilite: true });
        }

        renderCard(`${size}" ${typeName}`, badge, accent, rows, hw, mouseX, mouseY);
    };

    const showForLiner = (liner: LinerEntry, mouseX: number, mouseY: number): void => {
        const length = liner.botDepth - liner.topDepth;
        const typeLabel = liner.isScreen ? 'SCREEN' : 'LINER';
        const accent = liner.hasActual ? '#16a34a' : '#2563eb';
        const badge = liner.hasActual ? `${typeLabel} ✓` : typeLabel;
        const typeName = liner.isPrePerfLiner ? 'Pre Perf Liner' : liner.isScreen ? 'Screen Liner' : 'Liner';
        const rows: Row[] = [
            { label: 'Top (TOL)', value: `${liner.topDepth.toLocaleString()} ft` },
            { label: 'Bottom Depth', value: `${liner.botDepth.toLocaleString()} ft`, hilite: liner.hasActual },
            { label: 'Length', value: `${length.toLocaleString()} ft` },
        ];
        renderCard(`${liner.odSz}" ${typeName}`, badge, accent, rows, liner.halfWidth, mouseX, mouseY);
    };

    return { showForCasing, showForLiner, hide };
}

function addCasingLinerTooltips(
    options: RenderCasingElementsOptions,
    liners: LinerEntry[],
): void {
    const { rootG, layout, casings, drlgCasings, centerX, scale } = options;
    const { baseHalfWidth, halfWidthIncrement } = layout;

    const hoverLayer = rootG.append('g').attr('class', 'csg-hover-targets');
    const tooltipLayer = rootG.append('g')
        .attr('class', 'csg-detail-tooltip')
        .style('opacity', 0)
        .style('pointer-events', 'none');

    const ctrl = buildCasingTooltipController(tooltipLayer, layout, centerX);
    const node = rootG.node() as Element;

    if (casings.length === 0) {
        const unique = uniqueCasingsByOd(drlgCasings);
        const withHw = unique.map((actual, i) => ({
            actual,
            hw: computeCasingHalfWidth(i, baseHalfWidth, halfWidthIncrement),
        }));
        withHw
            .sort((a, b) => b.hw - a.hw)
            .forEach(({ actual, hw }) => {
                const bottomPx = scale(actual.wCsgBotDpth);
                hoverLayer.append('rect')
                    .attr('x', centerX - hw).attr('y', 0)
                    .attr('width', hw * 2).attr('height', bottomPx)
                    .attr('fill', 'transparent')
                    .style('pointer-events', 'all').style('cursor', 'crosshair')
                    .on('mousemove', (event: MouseEvent) => {
                        const [mx, my] = pointer(event, node);
                        ctrl.showForCasing(null, actual, hw, mx, my, '#16a34a');
                    })
                    .on('mouseleave', ctrl.hide);
            });
    } else {
        const nonLiners = casings.filter(c => c.csgType !== 'Liner' && c.csgType !== 'Gravel Pack');
        const withHw = nonLiners.map(csg => {
            const tier = getCasingTier(csg, casings);
            const hw = computeCasingHalfWidth(tier, baseHalfWidth, halfWidthIncrement);
            const actualCsg = drlgCasings.find(d => d.wCsgOdSz === csg.csgSize) ?? null;
            const hasActual = actualCsg !== null && actualCsg.wCsgBotDpth > 0;
            const displayDepth = hasActual ? actualCsg!.wCsgBotDpth : csg.csgDepth;
            const accent = hasActual ? '#16a34a' : '#2563eb';
            return { csg, hw, actualCsg, hasActual, displayDepth, accent };
        });
        withHw
            .sort((a, b) => b.hw - a.hw)
            .forEach(({ csg, hw, actualCsg, displayDepth, accent }) => {
                const bottomPx = scale(displayDepth);
                hoverLayer.append('rect')
                    .attr('x', centerX - hw).attr('y', 0)
                    .attr('width', hw * 2).attr('height', bottomPx)
                    .attr('fill', 'transparent')
                    .style('pointer-events', 'all').style('cursor', 'crosshair')
                    .on('mousemove', (event: MouseEvent) => {
                        const [mx, my] = pointer(event, node);
                        ctrl.showForCasing(csg, actualCsg, hw, mx, my, accent);
                    })
                    .on('mouseleave', ctrl.hide);
            });
    }

    liners.forEach((liner) => {
        const topPx = scale(liner.topDepth);
        const botPx = scale(liner.botDepth);
        hoverLayer.append('rect')
            .attr('x', centerX - liner.halfWidth).attr('y', topPx)
            .attr('width', liner.halfWidth * 2).attr('height', botPx - topPx)
            .attr('fill', 'transparent')
            .style('pointer-events', 'all').style('cursor', 'crosshair')
            .on('mousemove', (event: MouseEvent) => {
                const [mx, my] = pointer(event, node);
                ctrl.showForLiner(liner, mx, my);
            })
            .on('mouseleave', ctrl.hide);
    });

    hoverLayer.raise();
    tooltipLayer.raise();
}