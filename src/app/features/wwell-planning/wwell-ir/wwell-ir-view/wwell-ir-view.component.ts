import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, output, signal, viewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';
import { AuthStore } from '../../../auth/store/auth.store';
import { EmailService } from '@services/email/email.service';
import { EmailStore } from '@store/email/email.store';
import { ConfirmDialogService } from '@shared/components/confirm-dialog/confirm-dialog.service';
import { NotificationService } from '@shared/components/notification/notification.service';
import { WWELL_IR_SECTION_RAIL } from '../wwell-ir-editor/wwell-ir-section-rail.config';
import { wwellIrTimelineStepStatus } from '../wwell-ir-editor/wwell-ir-timeline.util';
import { WwellIrLetterPdfService } from '../wwell-ir-letter-pdf.service';
import { hasKnownIrStatus, irBadgeMeta, resolveLetterStampStatus, resolveLetterWorkflow } from '../wwell-ir.config';
import { WwellIrService } from '../wwell-ir.service';
import { WwellIrStore } from '../store/wwell-ir.store';
import { WwellIrViewDetailsComponent } from './wwell-ir-view-details/wwell-ir-view-details.component';
import { WwellIrViewLetterComponent } from './wwell-ir-view-letter/wwell-ir-view-letter.component';
import { WwellIrViewWellDesignComponent } from './wwell-ir-view-well-design/wwell-ir-view-well-design.component';

type PdfStage = 'status' | 'diagram' | 'letter' | 'attachments' | 'ready';

const PDF_STAGES: readonly { readonly key: PdfStage; readonly busyLabel: string }[] = [
  { key: 'status', busyLabel: 'Checking approval status…' },
  { key: 'diagram', busyLabel: 'Rendering diagram…' },
  { key: 'letter', busyLabel: 'Generating…' },
  { key: 'attachments', busyLabel: 'Merging attachments…' },
  { key: 'ready', busyLabel: 'Ready' },
];

/** How long the green "Ready" tick stays up before the file is handed to the browser. */
const PDF_READY_HOLD_MS = 700;

/** EXAD_DHUB_LKUP_DATA `LKUP_NAME` of the CC list — one row per address. */
const NOTIFY_CC_MENU = 'ir_notify_cc_recipients';

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export type WwellIrViewTab = 'details' | 'well-design' | 'letter';

const TABS: readonly { readonly key: WwellIrViewTab; readonly label: string; readonly icon: string }[] = [
  { key: 'details', label: 'Details', icon: 'description' },
  { key: 'well-design', label: 'Well Design', icon: 'architecture' },
  { key: 'letter', label: 'Letter', icon: 'mail_outline' },
];

/**
 * Read-only counterpart to `WwellIrEditorComponent`, swapped into the exact same detail-panel
 * slot in WwellIrComponent's master-detail layout (see that component's `detailMode` signal) —
 * never a separate route. The master list stays visible and clickable the whole time a record is
 * open here, so moving to another IR (or another View) is just another row click, same as edit
 * mode already works.
 *
 * A plain flat tab bar (Details / Well Design / Letter) — not a Material stepper — matches the
 * reference GWD/AGWA "Integrated Requirements" screen this was built to look like. The approval-
 * workflow sidebar lives one level up, in WwellIrComponent's own template — it sits beside this
 * panel (not inside it) so it reads as a property of the whole detail column, not of whichever
 * tab is currently open.
 */
@Component({
  selector: 'app-wwell-ir-view',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    WwellIrViewDetailsComponent,
    WwellIrViewWellDesignComponent,
    WwellIrViewLetterComponent,
  ],
  templateUrl: './wwell-ir-view.component.html',
  styleUrl: './wwell-ir-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellIrViewComponent {
  readonly ir = input.required<IntegratedRequirement>();
  // Resolves `requestReference.linkedRequestId` to a well name — see the Details step's own
  // input of the same name / buildRequestReferenceRows' doc comment.
  readonly linkedRequestWellOptions = input<readonly { readonly value: string; readonly label: string }[]>([]);

  /** WwellIrComponent listens and flips its `detailMode` back to 'edit' for this same record —
   *  this component has no editing surface of its own. */
  readonly editRequested = output<void>();
  /** The header's back arrow — WwellIrComponent listens and closes the whole detail panel
   *  (deselects). Unlike the editor's own `backRequested`, nothing here needs a save/discard guard
   *  first: this is a read-only surface with no edits of its own to lose. */
  readonly backRequested = output<void>();

  // Same rule the list badge uses (wwell-ir.config.ts) — the sidebar right beside this panel
  // (WwellIrComponent's own template) is what refreshes `sapWfStatusText` from SAP, on selection
  // and via its own "Refresh" button; this badge just mirrors whatever it last resolved.
  protected readonly hasKnownStatus = hasKnownIrStatus;
  protected readonly badgeMeta = irBadgeMeta;

  protected readonly tabs = TABS;
  /** Owned by WwellIrComponent, not by this component: the whole detail panel is torn down and
   *  rebuilt on every row switch (the loading skeleton replaces it), so a tab held here reset to
   *  'details' each time you picked another record. Same fix, and the same reason, as the editor's
   *  `viewMode` — see the `viewTab` signal this is two-way bound to. */
  readonly activeTab = model<WwellIrViewTab>('details');

  private readonly wwellIrService = inject(WwellIrService);
  private readonly notify = inject(NotificationService);
  private readonly letterPdf = inject(WwellIrLetterPdfService);
  private readonly irStore = inject(WwellIrStore);
  private readonly emailStore = inject(EmailStore);
  private readonly emailService = inject(EmailService);
  private readonly authStore = inject(AuthStore);
  private readonly confirmDialog = inject(ConfirmDialogService);

  /** Only resolves while the `letter` tab is active — the `@switch` in the template below destroys
   *  the child otherwise. Used solely to reach `captureWellboreImage()`, the one piece of the
   *  download this component can't produce itself (rasterizing the diagram SVG the Letter tab
   *  renders). Everything else about the download — state, `ir`, the HTTP call — is handled right
   *  here instead of being driven through this query: an earlier version put `canDownloadPdf` and
   *  `downloadPdf()` on the child and read them from here via this same `viewChild`, which threw
   *  NG0950 ("Input is required but no value is available yet") — reading a query into a
   *  freshly-created child can race Angular's own input-binding for that child's `ir`, since view
   *  queries aren't guaranteed to resolve only after a child's inputs are bound. Reading `this.ir()`
   *  (this component's own long-lived input) instead sidesteps that race entirely. */
  private readonly letterView = viewChild(WwellIrViewLetterComponent);

  protected readonly downloadingPdf = signal(false);
  /** What the button is busy with — shown as its tooltip/label so a slow render never looks frozen. */
  protected readonly pdfStage = signal<PdfStage | null>(null);
  protected readonly pdfStageLabel = computed(() => PDF_STAGES.find(stage => stage.key === this.pdfStage())?.busyLabel ?? '');
  protected readonly pdfReady = computed(() => this.pdfStage() === 'ready');
  // Only a persisted record has anything for the backend to render (see IrLetterService, which
  // re-fetches the detail by ir_seq) — a local-only "New IR" draft has never reached the backend.
  protected readonly canDownloadPdf = computed(() => this.ir().irSeq !== null && this.ir().irSeq !== undefined);

  protected readonly notifying = signal(false);
  protected readonly isSendingEmail = this.emailStore.isSending;
  /** TEMPORARY (testing): shown for any saved IR. Restore `&& resolveLetterStampStatus(this.ir()) === 'APPROVED'` before release. */
  protected readonly canNotify = computed(() => this.canDownloadPdf());

  constructor() {
    effect(() => {
      if (this.emailStore.isSent()) {
        this.notify.info('Approved IR copy sent.');
        this.emailStore.reset();
      } else if (this.emailStore.hasFailed()) {
        this.notify.error(this.emailStore.error() ?? 'Failed to send the approved IR copy.');
        this.emailStore.reset();
      }
    });
  }

  /** Same flow as the morning report's "Send": confirm the recipients, then hand the request to EmailStore
   *  (whose status effect in the constructor toasts the result). */
  protected async notifyApproved(): Promise<void> {
    if (this.notifying() || this.downloadingPdf()) return;
    const recipientEmail = this.authStore.userEmail();
    if (!recipientEmail) {
      this.notify.error('Unable to determine the logged-in user email.');
      return;
    }
    this.notifying.set(true);
    try {
      const menus = await firstValueFrom(this.wwellIrService.getDropdownMenus());
      const cc = [...(menus[NOTIFY_CC_MENU] ?? [])];
      const confirmed = await firstValueFrom(
        this.confirmDialog.open({
          title: 'Send Approved IR',
          rows: [
            { label: 'IR', value: this.ir().code },
            { label: 'Recipient', value: recipientEmail },
            { label: 'CC', value: cc.length ? cc.join(', ') : '—' },
          ],
          confirmLabel: 'Send',
        }),
      );
      if (!confirmed) return;
      const blob = await this.buildPdfBlob();
      if (!blob) return;
      this.downloadingPdf.set(false);
      this.pdfStage.set(null);
      const label = this.ir().requestReference.wellName || this.ir().code;
      this.emailStore.sendEmail(
        this.emailService.buildIrApprovedEmailRequest(recipientEmail, cc, label, this.pdfFileName(), await blobToBase64(blob)),
      );
    } catch {
      this.notify.error('Failed to send the approved IR copy.');
    } finally {
      this.notifying.set(false);
    }
  }

  protected async downloadPdf(): Promise<void> {
    const blob = await this.buildPdfBlob();
    if (!blob) return;
    this.pdfStage.set('ready');
    await new Promise<void>(resolve => setTimeout(resolve, PDF_READY_HOLD_MS));
    this.downloadingPdf.set(false);
    this.pdfStage.set(null);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = this.pdfFileName();
    link.click();
    URL.revokeObjectURL(url);
  }

  /** "GWD-49-2026_SHYB_1031.pdf" — the letter number and well, falling back to the IR code. */
  private pdfFileName(): string {
    const { letterNumber, wellName } = this.ir().requestReference;
    const parts = [letterNumber ? `GWD-${letterNumber}` : this.ir().code, wellName].filter((part): part is string => !!part);
    return `${parts.join('_').replace(/[\\/:*?"<>|\s]+/g, '-')}.pdf`;
  }

  /** Captures the diagram, has the backend render the letter and merges the attachments; `null` (after
   *  a toast) when the backend refuses. Drives `downloadingPdf`/`pdfStage` for the download. */
  private async buildPdfBlob(): Promise<Blob | null> {
    const irSeq = this.ir().irSeq;
    if (irSeq === null || irSeq === undefined || this.downloadingPdf()) return null;

    this.downloadingPdf.set(true);
    try {
      // Always print SAP's live workflow (status, stamp and approval table), never what was cached
      // when the record was opened — it may have been approved/rejected/resubmitted since.
      this.pdfStage.set('status');
      const ir = await this.irStore.syncApprovalStatus(this.ir());
      this.pdfStage.set('diagram');
      const wellboreImageBase64 = await this.letterView()?.captureWellboreImage();
      this.pdfStage.set('letter');
      const letterBlob = await firstValueFrom(
        this.wwellIrService.downloadLetterPdf(
          irSeq,
          wellboreImageBase64,
          resolveLetterStampStatus(ir),
          resolveLetterWorkflow(ir) ?? undefined,
        ),
      );
      this.pdfStage.set('attachments');
      return await this.letterPdf.mergeAttachments(letterBlob, ir);
    } catch (err: unknown) {
      this.downloadingPdf.set(false);
      this.pdfStage.set(null);
      const message = await this.extractDownloadErrorMessage(err);
      this.notify.error(message ?? 'Failed to download the integrated requirement letter PDF.');
      return null;
    }
  }

  /** `downloadLetterPdf` requests `responseType: 'blob'` so a successful PDF response can be
   *  turned straight into a download link — but Angular's HttpClient applies that same
   *  responseType to error bodies too, so even agwa-planning's JSON error envelope
   *  (`{ message: "Cannot generate IR letter: missing required field(s): ..." }`) arrives as an
   *  unparsed Blob instead of a plain object. Without this, the backend's specific reason (e.g.
   *  a missing Letter Number) was silently discarded in favor of a generic failure message.
   *  Reads it via `FileReader` rather than `Blob.text()` — the latter isn't implemented by
   *  jsdom (this repo's test environment), while `FileReader.readAsText` is. */
  private extractDownloadErrorMessage(err: unknown): Promise<string | null> {
    if (!(err instanceof HttpErrorResponse) || !(err.error instanceof Blob)) return Promise.resolve(null);
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(this.parseErrorMessage(reader.result));
      reader.onerror = () => resolve(null);
      reader.readAsText(err.error as Blob);
    });
  }

  private parseErrorMessage(text: FileReader['result']): string | null {
    if (typeof text !== 'string') return null;
    try {
      const parsed: unknown = JSON.parse(text);
      const message = parsed && typeof parsed === 'object' ? (parsed as { message?: unknown }).message : undefined;
      return typeof message === 'string' ? message : null;
    } catch {
      return null;
    }
  }

  /** Header stat: how many of the editor's 7 rail sections (Wellbore, General, Horizons, Casing,
   *  Hydrogeology, Area Water Wells, Attachments) hold meaningful data, per the same
   *  wwellIrTimelineStepStatus completeness rule the editor's Timeline view already uses — so this
   *  view's "N/7 sections" reading always agrees with what Timeline mode shows for the same record. */
  protected readonly sectionProgress = computed(() => {
    const ir = this.ir();
    const total = WWELL_IR_SECTION_RAIL.length;
    const completed = WWELL_IR_SECTION_RAIL.filter(group => wwellIrTimelineStepStatus(ir, group.key) === 'completed').length;
    return { completed, total, percent: Math.round((completed / total) * 100) };
  });

  protected setTab(tab: WwellIrViewTab): void {
    this.activeTab.set(tab);
  }
}
