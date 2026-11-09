import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, Signal, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { S3Service } from '@services/s3/s3.service';
import { NotificationService } from '@shared/components/notification/notification.service';
import { WwellIrAttachmentViewerComponent } from '../../wwell-ir-attachment-viewer/wwell-ir-attachment-viewer.component';
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
import { WWELL_COMPLETION_TYPE, isLinerCompletionType } from '../../wwell-ir-form/wwell-ir-completion-type.config';
import { captureWellboreSnapshot } from './wwell-ir-wellbore-snapshot.util';

interface LetterTopsRow {
  readonly name: string;
  readonly depthFt: number;
  readonly subSeaFt: number | null;
}

const STEP_STATUS_LABELS: Record<ApprovalChainStep['status'], string> = {
  approved: 'Approved',
  'in-progress': 'In progress',
  pending: 'Pending',
  rejected: 'Rejected',
};

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
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, WellBoreViewComponent, WwellIrDepthScaleComponent],
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

  private readonly s3 = inject(S3Service);
  private readonly dialog = inject(MatDialog);
  private readonly notify = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  /** Object key of the attachment currently being fetched for the viewer — disables just that row's button. */
  protected readonly openingKey = signal<string | null>(null);

  /** Object-URL thumbnails of the image attachments (PDFs keep their icon), keyed by object key. */
  protected readonly thumbnails = signal<Readonly<Record<string, string>>>({});
  private readonly requestedThumbnails = new Set<string>();

  constructor() {
    effect(() => {
      for (const attachment of this.ir().attachments) {
        if (!attachment.contentType.startsWith('image/') || this.requestedThumbnails.has(attachment.objectKey)) continue;
        this.requestedThumbnails.add(attachment.objectKey);
        this.s3
          .download(attachment.objectKey, attachment.fileName)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: file => this.thumbnails.update(current => ({ ...current, [attachment.objectKey]: URL.createObjectURL(file) })),
            // A missing thumbnail just leaves the slot icon in place; the View button reports real failures.
            error: () => undefined,
          });
      }
    });
    this.destroyRef.onDestroy(() => Object.values(this.thumbnails()).forEach(url => URL.revokeObjectURL(url)));
  }

  /** Opens a stored attachment in the same full-screen viewer the editor uses. */
  protected viewAttachment(attachment: IrAttachment, label: string): void {
    this.openingKey.set(attachment.objectKey);
    this.s3
      .download(attachment.objectKey, attachment.fileName)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: file => {
          this.openingKey.set(null);
          this.dialog.open(WwellIrAttachmentViewerComponent, {
            data: { file, label },
            panelClass: 'ir-viewer-panel',
            width: '92vw',
            maxWidth: '1500px',
            height: '92vh',
            autoFocus: false,
          });
        },
        error: () => {
          this.openingKey.set(null);
          this.notify.error(`Failed to open ${attachment.fileName}.`);
        },
      });
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

  /** The Completion pick with its size where one applies (e.g. "Open Hole (8 1/2")"), followed by
   *  the Completion Remarks. A legacy record with no pick shows just its remarks text. */
  protected readonly completionDesign = computed(() => {
    const { completionType, openHoleSizeIn, linerSizeIn, completion } = this.ir().programDetails;
    const size = completionType === WWELL_COMPLETION_TYPE.OPEN_HOLE ? openHoleSizeIn : isLinerCompletionType(completionType) ? linerSizeIn : null;
    const pick = completionType ? (size ? `${completionType} (${size})` : completionType) : '';
    return [pick, completion].filter(part => part.trim()).join(' — ');
  });
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

  protected axisValue(label: string): string {
    const axes = this.coordinateAxes();
    const value = axes.find(axis => axis.label === label)?.value ?? (axes.length === 1 && label === 'Easting' ? axes[0].value : 'N/A');
    return value.replace(/ m$/, ''); // the PDF prints the bare survey number; the unit is in the column's meaning
  }

  protected readonly elevationLabel = computed(() => {
    const elevation = this.ir().requestReference.surfaceElevationFtAsl;
    return elevation === null || elevation === undefined ? 'N/A' : `${elevation} ft`;
  });

  /** Formation tops in depth order with the well's Total Depth slotted in, as the downloaded letter prints them. */
  protected readonly topsRows: Signal<readonly LetterTopsRow[]> = computed(() => {
    const rows: LetterTopsRow[] = this.ir().formationTops.map(top => ({
      name: top.name,
      depthFt: top.depthFt,
      subSeaFt: top.subSeaFtAsl ?? this.subSeaFt(top.depthFt),
    }));
    const totalDepth = this.ir().requestReference.targetDepthFt;
    if (totalDepth > 0) rows.push({ name: 'Total Depth', depthFt: totalDepth, subSeaFt: this.subSeaFt(totalDepth) });
    return rows.sort((a, b) => a.depthFt - b.depthFt);
  });

  protected readonly h2sPresence = computed(() => {
    const ppm = this.ir().hydrogeology.h2sPpm;
    if (ppm === null || ppm === undefined) return 'N/A';
    return ppm > 0 ? 'Yes' : 'No';
  });

  protected readonly initiatorInitials = computed(() => {
    const name = this.ir().chain[0]?.name ?? '';
    return name
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(word => word[0].toUpperCase())
      .join('');
  });

  protected stepStatusLabel(status: ApprovalChainStep['status']): string {
    return STEP_STATUS_LABELS[status];
  }

  protected subSeaFt(depthFt: number): number | null {
    const elevation = this.ir().requestReference.surfaceElevationFtAsl;
    return elevation === null ? null : Math.round((elevation - depthFt) * 10) / 10;
  }
}
