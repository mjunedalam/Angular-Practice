import { ChangeDetectionStrategy, Component, Signal, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { ApprovalChainStep } from '@models/wwell-planning/wwell-planning.model';
import { IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';
import { WellBoreViewComponent } from '../../../../presentation/well-bore-view/well-bore-view.component';
import { WwellIrDepthScaleComponent } from '../../wwell-ir-depth-scale/wwell-ir-depth-scale.component';
import { WWELL_IR_PREVIEW_DIAGRAM_LAYOUT } from '../../wwell-ir-editor/wwell-ir-preview-diagram-layout';
import {
  buildWellboreDiagramDataFromIntegratedRequirement,
  hasWellboreDiagramDataForIntegratedRequirement,
} from '../../wwell-ir-form/wwell-ir-wellbore-diagram.mapper';

const OPEN_HOLE_COMPLETION = 'Open Hole';

/** "Letter" step of the read-only IR view — a printable-looking rendition of the GWD Integrated
 *  Requirements Letter, populated straight from the submitted record (never a separate document
 *  fetched from the backend — there is no such endpoint yet). Section numbering/labels follow
 *  the reference GWD letter template; every value comes directly off `IntegratedRequirement`
 *  fields rather than the editor's `KvRow` builders, since the letter's own labels ("Completion
 *  Design", "Logging Program"…) intentionally read as prose, not as the wizard's field names.
 *  The attachment list is appended at the end, per the same record's `attachmentNames`.
 *
 *  The Well Bore Diagram section reuses the exact same diagram build (
 *  buildWellboreDiagramDataFromIntegratedRequirement) as the "Well Design" step's own preview, so
 *  the letter's picture of the well always agrees with what that tab shows for the same record. */
@Component({
  selector: 'app-wwell-ir-view-letter',
  standalone: true,
  imports: [MatIconModule, WellBoreViewComponent, WwellIrDepthScaleComponent],
  templateUrl: './wwell-ir-view-letter.component.html',
  styleUrl: './wwell-ir-view-letter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellIrViewLetterComponent {
  readonly ir = input.required<IntegratedRequirement>();

  protected readonly isOpenHole = computed(() => this.ir().programDetails.completion === OPEN_HOLE_COMPLETION);
  protected readonly isFlowTest = computed(() => this.ir().testProgram.testType === 'flow-test');

  protected readonly previewDiagramLayout = WWELL_IR_PREVIEW_DIAGRAM_LAYOUT;
  protected readonly wellboreDiagramData: Signal<WellboreDiagramData> = computed(() =>
    buildWellboreDiagramDataFromIntegratedRequirement(this.ir()),
  );
  protected readonly hasWellboreData: Signal<boolean> = computed(() => hasWellboreDiagramDataForIntegratedRequirement(this.ir()));
  // Same gate as the Well Design step's own preview (wwell-ir-editor.component.ts's
  // `hasTargetDepth`) — hides the D3-rendered "TOTAL DEPTH: 0 FT" label when it never got filled in.
  protected readonly hasTargetDepth: Signal<boolean> = computed(() => (this.ir().requestReference.targetDepthFt ?? 0) > 0);

  /** The chain's last (most senior) step stands in for the letter's sign-off line — see
   *  WWELL_IR_CHAIN_ROLES (Hydrogeologist → Lead Hydrogeologist → Manager). Mocked for now, same
   *  as the approval-workflow panel next to this stepper (loadIrApprovalTimeline). */
  protected readonly finalApprover = computed<ApprovalChainStep | null>(() => {
    const chain = this.ir().chain;
    return chain.length ? chain[chain.length - 1] : null;
  });

  protected subSeaFt(depthFt: number): number | null {
    const elevation = this.ir().requestReference.surfaceElevationFtAsl;
    return elevation === null ? null : elevation - depthFt;
  }
}
