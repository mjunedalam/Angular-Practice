import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';
import { WWELL_IR_SECTION_RAIL } from '../wwell-ir-editor/wwell-ir-section-rail.config';
import { wwellIrTimelineStepStatus } from '../wwell-ir-editor/wwell-ir-timeline.util';
import { WWELL_IR_STATUS_META } from '../wwell-ir.config';
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
  imports: [MatButtonModule, MatIconModule, WwellIrViewDetailsComponent, WwellIrViewWellDesignComponent, WwellIrViewLetterComponent],
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
