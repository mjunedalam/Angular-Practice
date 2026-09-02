import { ChangeDetectionStrategy, Component, Signal, computed, input } from '@angular/core';
import { WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';
import { WellBoreViewComponent } from '../../../../presentation/well-bore-view/well-bore-view.component';
import { buildHydrogeologyRows } from '../../wwell-ir-editor/wwell-ir-detail-rows.util';
import { WWELL_IR_PREVIEW_DIAGRAM_LAYOUT } from '../../wwell-ir-editor/wwell-ir-preview-diagram-layout';
import {
  buildWellboreDiagramDataFromIntegratedRequirement,
  hasWellboreDiagramDataForIntegratedRequirement,
} from '../../wwell-ir-form/wwell-ir-wellbore-diagram.mapper';
import { WwellIrDepthScaleComponent } from '../../wwell-ir-depth-scale/wwell-ir-depth-scale.component';
import { WwellIrViewKvCardComponent } from '../wwell-ir-view-kv-card/wwell-ir-view-kv-card.component';

/** "Well Design" step of the read-only IR view: the same submitted-record wellbore diagram
 *  WwellIrEditorComponent's own "Wellbore Preview" card renders (via
 *  buildWellboreDiagramDataFromIntegratedRequirement — no live FormArray override here, this
 *  page never edits), plus read-only Formation Tops / Casing tables and an Estimated Hydrology
 *  card (the same KvRow builder the Details step's card also uses — the record only has one set
 *  of hydrogeology values, shown in both places per the "Well Design" step's own spec). */
@Component({
  selector: 'app-wwell-ir-view-well-design',
  standalone: true,
  imports: [WellBoreViewComponent, WwellIrDepthScaleComponent, WwellIrViewKvCardComponent],
  templateUrl: './wwell-ir-view-well-design.component.html',
  styleUrl: './wwell-ir-view-well-design.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellIrViewWellDesignComponent {
  readonly ir = input.required<IntegratedRequirement>();

  protected readonly previewDiagramLayout = WWELL_IR_PREVIEW_DIAGRAM_LAYOUT;

  protected readonly wellboreDiagramData: Signal<WellboreDiagramData> = computed(() =>
    buildWellboreDiagramDataFromIntegratedRequirement(this.ir()),
  );
  protected readonly hasWellboreData: Signal<boolean> = computed(() => hasWellboreDiagramDataForIntegratedRequirement(this.ir()));
  // Hides the D3-rendered "TOTAL DEPTH: 0 FT" label — same gate the editor's own preview uses
  // (wwell-ir-editor.component.ts's `hasTargetDepth`) — for the rare submitted record whose
  // target depth never actually got filled in.
  protected readonly hasTargetDepth: Signal<boolean> = computed(() => (this.ir().requestReference.targetDepthFt ?? 0) > 0);
  protected readonly hydrogeologyRows = computed(() => buildHydrogeologyRows(this.ir()));

  protected subSeaFt(depthFt: number): number | null {
    const elevation = this.ir().requestReference.surfaceElevationFtAsl;
    return elevation === null ? null : elevation - depthFt;
  }
}
