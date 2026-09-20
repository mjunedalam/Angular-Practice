import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DiagramLayout, WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { createDepthScale } from '@shared/utils/wellbore-math.util';
import { WellBoreViewComponent } from '../../../presentation/well-bore-view/well-bore-view.component';
import { WwellIrDepthScaleComponent } from '../wwell-ir-depth-scale/wwell-ir-depth-scale.component';
import { buildScaleTicks } from '../wwell-ir-depth-scale/wwell-ir-depth-ticks.util';
import { WWELL_IR_EXPANDED_DIAGRAM_LAYOUT, WWELL_IR_PREVIEW_DIAGRAM_LAYOUT } from '../wwell-ir-editor/wwell-ir-preview-diagram-layout';

const CASING_TYPE_LINER = 'Liner';
const CASING_TYPE_GRAVEL_PACK = 'Gravel Pack';
const DEFAULT_MAX_WIDTH_PX = 600;
const DEFAULT_MAX_HEIGHT_PX = 700;

interface WellborePanelStat {
  readonly label: string;
  readonly value: string;
}

interface WellborePanelLegendKey {
  readonly key: 'ground' | 'water' | 'casing' | 'liner' | 'open-hole' | 'gravel' | 'screen' | 'perforated' | 'tops';
  readonly label: string;
}

interface WellboreGridLine {
  readonly depth: number;
  readonly y: number;
}

const isFlagYes = (flag: string | null | undefined): boolean => (flag ?? '').trim().toUpperCase() === 'Y';
const formatFeet = (value: number): string => `${value.toLocaleString('en-US')} ft`;

/** The wellbore diagram as a finished panel: header, readouts, the depth-gridded diagram, a legend
 *  of only the elements actually drawn, and an Expand action that opens the same diagram in
 *  Presentation's fullscreen layout (see WWELL_IR_EXPANDED_DIAGRAM_LAYOUT) — the inline preview is deliberately compact, so its labels
 *  are small by design and Expand is where they are comfortable to read. Shared by the editor's
 *  preview (Sections and the Timeline sidebar) and the view page's Well Design step; the printed
 *  letter keeps its own paper-white markup because the PDF snapshot reads it.
 *
 *  `ViewEncapsulation.None`: the Expand dialog is portalled to <body>, so its surface can only be
 *  styled by global rules (`.wp-wellbore-dialog`). Everything else is namespaced `.wbp`. */
@Component({
  selector: 'app-wwell-ir-wellbore-panel',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, WellBoreViewComponent, WwellIrDepthScaleComponent],
  templateUrl: './wwell-ir-wellbore-panel.component.html',
  styleUrl: './wwell-ir-wellbore-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class WwellIrWellborePanelComponent {
  readonly diagramData = input.required<WellboreDiagramData>();
  readonly hasData = input.required<boolean>();
  /** Hides the D3 "TOTAL DEPTH: 0 FT" label (and the readout) until a target depth exists. */
  readonly hasTargetDepth = input(true);
  readonly layout = input<DiagramLayout>(WWELL_IR_PREVIEW_DIAGRAM_LAYOUT);
  readonly title = input('Wellbore Preview');
  readonly emptyHint = input('Add a casing or formation top row — with type, size, and depth filled in — to preview the wellbore diagram.');
  /** Caps for the inline figure; whichever binds first sets its width (height follows the ratio). */
  readonly maxWidthPx = input(DEFAULT_MAX_WIDTH_PX);
  readonly maxHeightPx = input(DEFAULT_MAX_HEIGHT_PX);
  /** The narrow sidebar form: the diagram's leader labels are hidden (too small to read, and they
   *  collide) and left to the Expand view. */
  readonly compact = input(false);
  /** Set by the Expand dialog's own instance: fills the dialog, shows Close instead of Expand. */
  readonly expanded = input(false);
  readonly closed = output<void>();

  protected readonly expandedLayout = WWELL_IR_EXPANDED_DIAGRAM_LAYOUT;

  private readonly dialog = inject(MatDialog);
  private readonly expandedTemplate = viewChild.required<TemplateRef<unknown>>('expandedTpl');
  private expandedDialog: MatDialogRef<unknown> | null = null;

  /** While the Expand dialog is open the inline diagram is unmounted (its box is kept). The shared
   *  renderer gives its clip-paths and gradients fixed SVG ids, and `url(#id)` resolves to the
   *  *first* match in the document — so two diagrams mounted at once make the second one draw
   *  against the first one's coordinate space and its casing vanishes. */
  protected readonly isExpandedOpen = signal(false);

  /** Width : height of the whole figure (depth scale + diagram). Matching the SVG viewBoxes'
   *  combined aspect is what keeps `preserveAspectRatio="none"` from distorting the drawing. */
  protected readonly ratio = computed(() => {
    const { depthScaleWidth, wellboreViewWidth, svgHeight } = this.layout();
    return (depthScaleWidth + wellboreViewWidth) / svgHeight;
  });

  protected readonly scalePercent = computed(() => {
    const { depthScaleWidth, wellboreViewWidth } = this.layout();
    return (depthScaleWidth / (depthScaleWidth + wellboreViewWidth)) * 100;
  });

  protected readonly gridViewBox = computed(() => {
    const { wellboreViewWidth, svgHeight } = this.layout();
    return `0 0 ${wellboreViewWidth} ${svgHeight}`;
  });

  /** One hairline per depth tick, in the diagram SVG's own coordinates — the same scale and ticks
   *  the depth axis uses (down to the target depth), so each line continues its tick across the
   *  diagram. */
  protected readonly gridLines = computed<readonly WellboreGridLine[]>(() => {
    const totalDepth = this.diagramData().targetDepth;
    if (totalDepth <= 0) return [];
    const { marginTop, drawingHeight } = this.layout();
    const scale = createDepthScale(totalDepth, drawingHeight);
    return buildScaleTicks(totalDepth, drawingHeight)
      .filter(depth => depth > 0)
      .map(depth => ({ depth, y: marginTop + scale(depth) }));
  });

  private readonly staticWaterLevelFt = computed(() => {
    const data = this.diagramData();
    return data.wellDesign?.staWaterLvl ?? data.hydrogeology?.estStaticWaterLevel ?? 0;
  });

  protected readonly stats = computed<readonly WellborePanelStat[]>(() => {
    const data = this.diagramData();
    const stats: WellborePanelStat[] = [];
    if (this.hasTargetDepth() && data.totalDepth > 0) stats.push({ label: 'Total depth', value: formatFeet(data.totalDepth) });
    if (this.staticWaterLevelFt() > 0) stats.push({ label: 'Static water level', value: formatFeet(this.staticWaterLevelFt()) });
    if (data.casings.length > 0) stats.push({ label: 'Casing strings', value: String(data.casings.length) });
    if (data.geologicTops.length > 0) stats.push({ label: 'Formation tops', value: String(data.geologicTops.length) });
    return stats;
  });

  /** Only what the diagram actually draws, from the same data/flags the renderers read. */
  protected readonly legend = computed<readonly WellborePanelLegendKey[]>(() => {
    const data = this.diagramData();
    const design = data.wellDesign;
    const keys: WellborePanelLegendKey[] = [{ key: 'ground', label: 'Ground level' }];
    if (this.staticWaterLevelFt() > 0) keys.push({ key: 'water', label: 'Static water level' });
    if (data.casings.some(c => c.csgType !== CASING_TYPE_LINER && c.csgType !== CASING_TYPE_GRAVEL_PACK)) {
      keys.push({ key: 'casing', label: 'Casing' });
    }
    if (data.casings.some(c => c.csgType === CASING_TYPE_LINER)) keys.push({ key: 'liner', label: 'Liner' });
    if (isFlagYes(design?.ohFlg)) keys.push({ key: 'open-hole', label: 'Open hole' });
    if (isFlagYes(design?.gpFlg)) keys.push({ key: 'gravel', label: 'Gravel pack' });
    if (isFlagYes(design?.lsFlg)) keys.push({ key: 'screen', label: 'Liner screen' });
    if (isFlagYes(design?.perforatedFlg)) keys.push({ key: 'perforated', label: 'Perforated interval' });
    if (data.geologicTops.length > 0) keys.push({ key: 'tops', label: 'Formation top' });
    return keys;
  });

  protected expand(): void {
    this.isExpandedOpen.set(true);
    this.expandedDialog = this.dialog.open(this.expandedTemplate(), {
      panelClass: 'wp-wellbore-dialog',
      width: 'min(1280px, 96vw)',
      maxWidth: '96vw',
      height: 'min(92vh, 880px)',
      ariaLabel: this.title(),
      autoFocus: 'dialog',
    });
    this.expandedDialog.afterClosed().subscribe(() => {
      this.expandedDialog = null;
      this.isExpandedOpen.set(false);
    });
  }

  protected collapse(): void {
    this.expandedDialog?.close();
  }
}
