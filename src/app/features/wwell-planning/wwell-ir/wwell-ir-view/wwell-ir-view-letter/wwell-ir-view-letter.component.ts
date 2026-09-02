import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ApprovalChainStep } from '@models/wwell-planning/wwell-planning.model';
import { IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';

const OPEN_HOLE_COMPLETION = 'Open Hole';

/** "Letter" step of the read-only IR view — a printable-looking rendition of the GWD Integrated
 *  Requirements Letter, populated straight from the submitted record (never a separate document
 *  fetched from the backend — there is no such endpoint yet). Section numbering/labels follow
 *  the reference GWD letter template; every value comes directly off `IntegratedRequirement`
 *  fields rather than the editor's `KvRow` builders, since the letter's own labels ("Completion
 *  Design", "Logging Program"…) intentionally read as prose, not as the wizard's field names.
 *  The attachment list is appended at the end, per the same record's `attachmentNames`. */
@Component({
  selector: 'app-wwell-ir-view-letter',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './wwell-ir-view-letter.component.html',
  styleUrl: './wwell-ir-view-letter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellIrViewLetterComponent {
  readonly ir = input.required<IntegratedRequirement>();

  protected readonly isOpenHole = computed(() => this.ir().programDetails.completion === OPEN_HOLE_COMPLETION);
  protected readonly isFlowTest = computed(() => this.ir().testProgram.testType === 'flow-test');

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
