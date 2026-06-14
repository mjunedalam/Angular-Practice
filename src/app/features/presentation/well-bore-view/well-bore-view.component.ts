import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  input,
  viewChild,
} from '@angular/core';
import { select } from 'd3-selection';
import 'd3-transition';

import { ANIM, computeOverlayDelay, DEFAULT_ANIM_CONFIG, DIAGRAM_LAYOUT, WellboreAnimConfig, WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { FormationInfoViewModel } from '@models/active-wwell/active-wwell-view.model';
import { resolveAnimation } from './renderers/animation.helpers';
import { renderCasingElements } from './renderers/casing.renderer';
import { renderCompletionElements, renderScreenHanger } from './renderers/completion.renderer';
import { renderStaticDefs } from './renderers/defs.renderer';
import { renderDrillArrow } from './renderers/drill-arrow.renderer';
import { renderGeoTops } from './renderers/geo-tops.renderer';
import { renderNotDrilledZone } from './renderers/not-drilled-zone.renderer';
import { renderPump, renderTotalDepthLabel } from './renderers/pump-and-depth.renderer';
import { renderStaticChrome } from './renderers/static-chrome.renderer';
import { renderWaterLevel } from './renderers/water-level.renderer';
import { resolveCompletionBottomDepth, resolveOhHalfWidth } from './renderers/wellbore-depth.helpers';
import { DefsSel, GSel, SvgSel } from './renderers/wellbore-renderer.types';
import { createDepthScale } from '@shared/utils/wellbore-math.util';

@Component({
  selector: 'app-well-bore-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './wellbore-view.component.html',
  styleUrl: './wellbore-view.component.scss',
})

export class WellBoreViewComponent {
  readonly diagramData = input.required<WellboreDiagramData | null>();
  readonly animTrigger = input.required<number>();
  readonly animConfig = input<WellboreAnimConfig>(DEFAULT_ANIM_CONFIG);
  readonly formationTops = input<FormationInfoViewModel[]>([]);

  private readonly svgRef = viewChild<ElementRef<SVGSVGElement>>('wellboreSvg');

  private readonly layout = DIAGRAM_LAYOUT;
  private rootG!: GSel;
  private defsEl!: DefsSel;


  constructor() {
    effect(() => {
      const svgEl = this.svgRef();
      const data = this.diagramData();

      if (!svgEl?.nativeElement || !data) return;

      // Bootstrap once; redraw on every data/trigger change.
      if (!this.rootG) {
        this.bootstrapSvg(svgEl.nativeElement);
      }

      if (this.rootG) {
        this.redraw(data);
      }
    });
  }

  private bootstrapSvg(element: SVGSVGElement): void {
    const { wellboreViewWidth, svgHeight, marginTop } = this.layout;
    const svg = select(element) as SvgSel;

    svg.attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${wellboreViewWidth} ${svgHeight}`)
      .attr('preserveAspectRatio', 'none');

    this.defsEl = svg.append('defs') as DefsSel;
    renderStaticDefs(this.defsEl);

    this.rootG = svg.append('g')
      .attr('class', 'wellbore-root')
      .attr('transform', `translate(0,${marginTop})`) as GSel;
  }

  private redraw(data: WellboreDiagramData): void {
    if (!this.rootG) return;

    this.rootG.interrupt();

    if (!this.rootG.selectAll('*').empty()) {
      this.rootG.transition().duration(120).style('opacity', 0)
        .end()
        .then(() => this.buildDiagram(data))
        .catch(() => { /* superseded by a subsequent redraw */ });
      return;
    }

    this.buildDiagram(data);
  }

  private buildDiagram(data: WellboreDiagramData): void {
    this.rootG.selectAll('*').remove();
    this.defsEl.selectAll('.dyn-clip').remove();
    this.rootG.style('opacity', 1);

    const { drawingHeight, geoLineX, casingCenterX } = this.layout;
    const displayDepth = Math.max(data.totalDepth, data.displayDepth);
    const scale = createDepthScale(displayDepth, drawingHeight);
    const targetAquifer = data.hydrogeology?.estTargetAquifier ?? null;

    // ── Build a strict sequential timeline ─────────────────────────────────
    const structuralCasings = data.casings.filter(
      c => c.csgType !== 'Liner' && c.csgType !== 'Gravel Pack'
    );

    const t_casingsStart = 0;
    const t_casingsDone = computeOverlayDelay(structuralCasings.length);
    const t_ohStart = t_casingsDone + ANIM.SEQ_GAP;
    const t_ohDone = t_ohStart + ANIM.OH_DURATION;
    const t_gravelStart = t_ohDone + ANIM.SEQ_GAP;
    const t_gravelDone = t_gravelStart + ANIM.GRAVEL_DURATION;
    const t_hangerStart = t_gravelDone + ANIM.SEQ_GAP;
    const t_drillStart = 0;
    const t_labelsStart = t_casingsDone + ANIM.SEQ_GAP;
    const t_ohLabelStart = t_ohDone + ANIM.SEQ_GAP;
    const t_waterStart = t_ohLabelStart + ANIM.OVERLAY_FADE + ANIM.SEQ_GAP;
    const t_notDrilledStart = t_casingsDone + ANIM.SEQ_GAP;
    const t_tdLabelStart = t_notDrilledStart + ANIM.OVERLAY_FADE + ANIM.SEQ_GAP;

    // ── Draw ───────────────────────────────────────────────────────────────
    const ohHW = resolveOhHalfWidth(data, this.layout);

    renderStaticChrome({
      rootG: this.rootG,
      layout: this.layout,
      geoLineX,
      centerX: casingCenterX,
    });
    renderGeoTops({
      rootG: this.rootG,
      layout: this.layout,
      tops: data.geologicTops,
      geoLineX,
      scale,
      targetAquifer,
      formationTops: this.formationTops(),
    });
    renderCompletionElements({
      rootG: this.rootG,
      defsEl: this.defsEl,
      layout: this.layout,
      data,
      centerX: casingCenterX,
      scale,
      ohStart: t_ohStart,
      ohLabelStart: t_ohLabelStart,
      hangerStart: t_hangerStart,
      animation: resolveAnimation(this.animConfig()),
    });
    renderCasingElements({
      rootG: this.rootG,
      defsEl: this.defsEl,
      layout: this.layout,
      casings: data.casings,
      drlgCasings: data.drlgCasings,
      centerX: casingCenterX,
      scale,
      casingsStart: t_casingsStart,
      gravelStart: t_gravelStart,
      labelsStart: t_labelsStart,
      openHoleHalfWidthPx: ohHW,
      animation: resolveAnimation(this.animConfig()),
    });
    renderScreenHanger({
      rootG: this.rootG,
      defsEl: this.defsEl,
      layout: this.layout,
      data,
      centerX: casingCenterX,
      scale,
      ohStart: t_ohStart,
      ohLabelStart: t_ohLabelStart,
      hangerStart: t_hangerStart,
      animation: resolveAnimation(this.animConfig()),
    });
    renderWaterLevel({
      rootG: this.rootG,
      defsEl: this.defsEl,
      layout: this.layout,
      data,
      centerX: casingCenterX,
      scale,
      waterStart: t_waterStart,
      animation: resolveAnimation(this.animConfig()),
    });
    renderDrillArrow({
      rootG: this.rootG,
      defsEl: this.defsEl,
      layout: this.layout,
      data,
      scale,
      drillStart: t_drillStart,
      casingsDoneAt: t_casingsDone,
    });

    renderNotDrilledZone({
      rootG: this.rootG,
      data,
      centerX: casingCenterX,
      scale,
      start: t_notDrilledStart,
      openHoleHalfWidth: ohHW,
    });
    renderTotalDepthLabel({
      rootG: this.rootG,
      data,
      centerX: casingCenterX,
      yPx: scale(this.resolveDepthLabelAnchor(data)),
      start: t_tdLabelStart,
      animation: resolveAnimation(this.animConfig()),
    });
    renderPump({
      rootG: this.rootG,
      data,
      centerX: casingCenterX,
      scale,
      start: t_labelsStart,
      animation: resolveAnimation(this.animConfig()),
    });
  }

  private resolveDepthLabelAnchor(data: WellboreDiagramData): number {
    const plannedTargetDepth = data.prewap?.estTargetDepth ?? 0;
    if (plannedTargetDepth > 0 && data.currentDepth > plannedTargetDepth) {
      return resolveCompletionBottomDepth(data);
    }

    return data.totalDepth;
  }
}
