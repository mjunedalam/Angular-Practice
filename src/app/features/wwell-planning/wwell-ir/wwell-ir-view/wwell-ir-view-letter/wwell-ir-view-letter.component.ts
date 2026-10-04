import { ChangeDetectionStrategy, Component, ElementRef, Signal, computed, input, signal, viewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { ApprovalChainStep } from '@models/wwell-planning/wwell-planning.model';
import { IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';
import { IrAttachment, IrAttachmentSlot } from '@models/wwell-planning/ir-attachment.model';
import { WWELL_IR_ATTACHMENT_SLOTS, irAttachmentsFor } from '../../wwell-ir-attachments.config';
import { UtmAxis, toUtmAxes } from '../../wwell-ir-coordinates.util';
import { WellBoreViewComponent } from '../../../../presentation/well-bore-view/well-bore-view.component';
import { WwellIrDepthScaleComponent } from '../../wwell-ir-depth-scale/wwell-ir-depth-scale.component';
import {
  buildWellboreDiagramDataFromIntegratedRequirement,
  hasWellboreDiagramDataForIntegratedRequirement,
} from '../../wwell-ir-form/wwell-ir-wellbore-diagram.mapper';
import { WWELL_IR_LETTER_DIAGRAM_LAYOUT } from '../../wwell-ir-editor/wwell-ir-preview-diagram-layout';
import { resolveScaleDepthFt } from '../../wwell-ir-depth-scale/wwell-ir-depth-ticks.util';
import { todayIsoDate } from '../../../shared/wwell-approvals/wwell-approval-request.util';
import { captureWellboreSnapshot } from './wwell-ir-wellbore-snapshot.util';

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
  host: {
    '(window:beforeprint)': 'printing.set(true)',
    '(window:afterprint)': 'printing.set(false)',
  },
})
export class WwellIrViewLetterComponent {
  readonly ir = input.required<IntegratedRequirement>();

  /** The sheet follows the app theme on screen, but paper is white: while the browser is printing it is
   *  pinned back to the light tokens (`.wp-paper`), or a dark-mode print would come out light-on-white.
   *  The PDF download is unaffected either way — it is built server-side, and the diagram in it is
   *  captured from a paper-scoped copy (see wwell-ir-wellbore-snapshot.util.ts). */
  protected readonly printing = signal(false);

  // The masthead's "Date" line is the letter's issue date, not the record's last-modified date
  // (which agwa-planning's own server-rendered irLetter.html stamps as LocalDate.now() too, via
  // IrLetterDataAssembler.issueDate) — independent of whether the record itself has ever been
  // through a real update.
  protected readonly issueDate = todayIsoDate();

  protected readonly attachmentSlots = WWELL_IR_ATTACHMENT_SLOTS;

  protected attachmentsFor(slot: IrAttachmentSlot): readonly IrAttachment[] {
    return irAttachmentsFor(this.ir().attachments, slot);
  }

  private readonly wellboreDiagramRow = viewChild<ElementRef<HTMLElement>>('wellboreDiagramRow');

  /** Public (not protected): WwellIrViewComponent's Download PDF button — hoisted onto the tab bar
   *  so it stays put across tab switches instead of living inside the Letter tab's own scrolling
   *  content — calls this through a `viewChild` reference to get the one piece of this letter it
   *  can't produce itself: a rasterized snapshot of the already-rendered wellbore diagram (see
   *  wwell-ir-wellbore-snapshot.util.ts). The rest of the download (irSeq/loading-state/HTTP call)
   *  lives entirely in the parent now — it already has `ir` as its own input, so there's no risk of
   *  reading a required input before Angular has bound it on a child instance (see git history:
   *  that's exactly what broke when this used to live here and get driven via `viewChild`).
   *  Degrades gracefully — a missing/no-data diagram or a capture failure just means the letter
   *  downloads without that section, not a failed download. */
  async captureWellboreImage(): Promise<string | undefined> {
    if (!this.hasWellboreData()) return undefined;
    const row = this.wellboreDiagramRow()?.nativeElement;
    if (!row) return undefined;
    try {
      return (await captureWellboreSnapshot(row)) ?? undefined;
    } catch {
      return undefined;
    }
  }

  /** "1. Well Location"'s Coordinates line, split into Northing/Easting/UTM Zone — same rule the
   *  wellbore panel's Location card and the Request Reference section already follow: shown as the
   *  raw survey values, no conversion; text that doesn't read as that shape stays one "Coordinates"
   *  line instead of blank Easting/Zone lines next to it. */
  protected readonly coordinateAxes: Signal<readonly UtmAxis[]> = computed(() =>
    toUtmAxes(this.ir().requestReference.coordinates ?? ''),
  );

  protected readonly isOpenHole = computed(() => this.ir().programDetails.completion === OPEN_HOLE_COMPLETION);
  protected readonly isFlowTest = computed(() => this.ir().testProgram.testType === 'flow-test');

  // The real `well-bore-view` layout (not the wizard's 25%-shrunk preview constant) — the letter
  // card is wide enough to afford it, and the shrunk layout's smaller `drawingHeight` was packing
  // casing shoe labels too close together to read (colliding secondary lines) and clipping the
  // longest labels past the SVG's own right edge (see `.letter__diagram-row` in the stylesheet for
  // the matching container width/aspect-ratio change).
  protected readonly diagramLayout = WWELL_IR_LETTER_DIAGRAM_LAYOUT;
  protected readonly wellboreDiagramData: Signal<WellboreDiagramData> = computed(() =>
    buildWellboreDiagramDataFromIntegratedRequirement(this.ir()),
  );
  protected readonly hasWellboreData: Signal<boolean> = computed(() => hasWellboreDiagramDataForIntegratedRequirement(this.ir()));
  /** Target depth, redrawn to the deepest formation top once one goes past it. */
  protected readonly scaleDepth: Signal<number> = computed(() => resolveScaleDepthFt(this.wellboreDiagramData()));
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
