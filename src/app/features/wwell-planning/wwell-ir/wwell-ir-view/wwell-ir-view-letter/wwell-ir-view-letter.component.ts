import { ChangeDetectionStrategy, Component, ElementRef, Signal, computed, inject, input, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DIAGRAM_LAYOUT, WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { ApprovalChainStep } from '@models/wwell-planning/wwell-planning.model';
import { IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';
import { NotificationService } from '@shared/components/notification/notification.service';
import { WellBoreViewComponent } from '../../../../presentation/well-bore-view/well-bore-view.component';
import { WwellIrDepthScaleComponent } from '../../wwell-ir-depth-scale/wwell-ir-depth-scale.component';
import {
  buildWellboreDiagramDataFromIntegratedRequirement,
  hasWellboreDiagramDataForIntegratedRequirement,
} from '../../wwell-ir-form/wwell-ir-wellbore-diagram.mapper';
import { WwellIrService } from '../../wwell-ir.service';
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
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    WellBoreViewComponent,
    WwellIrDepthScaleComponent,
  ],
  templateUrl: './wwell-ir-view-letter.component.html',
  styleUrl: './wwell-ir-view-letter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellIrViewLetterComponent {
  readonly ir = input.required<IntegratedRequirement>();

  private readonly wwellIrService = inject(WwellIrService);
  private readonly notify = inject(NotificationService);

  protected readonly downloadingPdf = signal(false);
  // Only a persisted record has anything for the backend to render (see IrLetterService, which
  // re-fetches the detail by ir_seq) — a local-only "New IR" draft has never reached the backend.
  protected readonly canDownloadPdf = computed(() => this.ir().irSeq !== null && this.ir().irSeq !== undefined);

  private readonly wellboreDiagramRow = viewChild<ElementRef<HTMLElement>>('wellboreDiagramRow');

  protected async downloadPdf(): Promise<void> {
    const irSeq = this.ir().irSeq;
    if (irSeq === null || irSeq === undefined || this.downloadingPdf()) return;

    this.downloadingPdf.set(true);
    const wellboreImageBase64 = await this.captureWellboreImage();
    this.wwellIrService.downloadLetterPdf(irSeq, wellboreImageBase64).subscribe({
      next: blob => {
        this.downloadingPdf.set(false);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.ir().code}-letter.pdf`;
        link.click();
        URL.revokeObjectURL(url);
      },
      error: () => {
        this.downloadingPdf.set(false);
        this.notify.error('Failed to download the integrated requirement letter PDF.');
      },
    });
  }

  /** Snapshots the already-rendered wellbore diagram (see wwell-ir-wellbore-snapshot.util.ts) so it
   *  rides along in the PDF request. Degrades gracefully — a missing/no-data diagram or a capture
   *  failure just means the letter downloads without that section, not a failed download. */
  private async captureWellboreImage(): Promise<string | undefined> {
    if (!this.hasWellboreData()) return undefined;
    const row = this.wellboreDiagramRow()?.nativeElement;
    if (!row) return undefined;
    try {
      return (await captureWellboreSnapshot(row)) ?? undefined;
    } catch {
      return undefined;
    }
  }

  protected readonly isOpenHole = computed(() => this.ir().programDetails.completion === OPEN_HOLE_COMPLETION);
  protected readonly isFlowTest = computed(() => this.ir().testProgram.testType === 'flow-test');

  // The real `well-bore-view` layout (not the wizard's 25%-shrunk preview constant) — the letter
  // card is wide enough to afford it, and the shrunk layout's smaller `drawingHeight` was packing
  // casing shoe labels too close together to read (colliding secondary lines) and clipping the
  // longest labels past the SVG's own right edge (see `.letter__diagram-row` in the stylesheet for
  // the matching container width/aspect-ratio change).
  protected readonly diagramLayout = DIAGRAM_LAYOUT;
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
