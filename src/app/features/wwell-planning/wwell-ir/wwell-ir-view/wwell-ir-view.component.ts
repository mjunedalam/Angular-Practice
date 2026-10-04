import { ChangeDetectionStrategy, Component, computed, inject, input, model, output, signal, viewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';
import { NotificationService } from '@shared/components/notification/notification.service';
import { WWELL_IR_SECTION_RAIL } from '../wwell-ir-editor/wwell-ir-section-rail.config';
import { wwellIrTimelineStepStatus } from '../wwell-ir-editor/wwell-ir-timeline.util';
import { hasKnownIrStatus, irBadgeMeta, resolveLetterStampStatus } from '../wwell-ir.config';
import { WwellIrService } from '../wwell-ir.service';
import { WwellIrViewDetailsComponent } from './wwell-ir-view-details/wwell-ir-view-details.component';
import { WwellIrViewLetterComponent } from './wwell-ir-view-letter/wwell-ir-view-letter.component';
import { WwellIrViewWellDesignComponent } from './wwell-ir-view-well-design/wwell-ir-view-well-design.component';

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
  // Only a persisted record has anything for the backend to render (see IrLetterService, which
  // re-fetches the detail by ir_seq) — a local-only "New IR" draft has never reached the backend.
  protected readonly canDownloadPdf = computed(() => this.ir().irSeq !== null && this.ir().irSeq !== undefined);

  protected async downloadPdf(): Promise<void> {
    const irSeq = this.ir().irSeq;
    if (irSeq === null || irSeq === undefined || this.downloadingPdf()) return;

    this.downloadingPdf.set(true);
    const wellboreImageBase64 = await this.letterView()?.captureWellboreImage();
    this.wwellIrService.downloadLetterPdf(irSeq, wellboreImageBase64, resolveLetterStampStatus(this.ir())).subscribe({
      next: (blob: Blob) => {
        this.downloadingPdf.set(false);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.ir().code}-letter.pdf`;
        link.click();
        URL.revokeObjectURL(url);
      },
      error: (err: unknown) => {
        this.downloadingPdf.set(false);
        void this.extractDownloadErrorMessage(err).then(message => {
          this.notify.error(message ?? 'Failed to download the integrated requirement letter PDF.');
        });
      },
    });
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
