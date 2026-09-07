import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';
import { NotificationService } from '@shared/components/notification/notification.service';
import { WWELL_IR_SECTION_RAIL } from '../wwell-ir-editor/wwell-ir-section-rail.config';
import { wwellIrTimelineStepStatus } from '../wwell-ir-editor/wwell-ir-timeline.util';
import { WWELL_IR_STATUS_META } from '../wwell-ir.config';
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

  protected readonly statusMeta = WWELL_IR_STATUS_META;

  protected readonly tabs = TABS;
  protected readonly activeTab = signal<WwellIrViewTab>('details');

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
    this.wwellIrService.downloadLetterPdf(irSeq, wellboreImageBase64).subscribe({
      next: (blob: Blob) => {
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
