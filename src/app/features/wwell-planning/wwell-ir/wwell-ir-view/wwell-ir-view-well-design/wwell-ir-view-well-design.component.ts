import { ChangeDetectionStrategy, Component, Signal, computed, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { IntegratedRequirement, IntegratedRequirementStatus } from '@models/wwell-planning/integrated-requirement.model';
import { WwellIrStore } from '../../store/wwell-ir.store';
import { buildHydrogeologyRows } from '../../wwell-ir-editor/wwell-ir-detail-rows.util';
import { WWELL_IR_EXPANDED_DIAGRAM_LAYOUT } from '../../wwell-ir-editor/wwell-ir-preview-diagram-layout';
import { mapIntegratedRequirementToRawFormValue } from '../../wwell-ir-form/wwell-ir-edit.mapper';
import { mapIrFormValueToSubmission } from '../../wwell-ir-form/wwell-ir-form.mapper';
import { buildWwellIrBulkSavePayload } from '../../wwell-ir-form/wwell-ir-payload.mapper';
import {
  buildWellboreDiagramDataFromIntegratedRequirement,
  wellboreDiagramDataEqual,
  hasWellboreDiagramDataForIntegratedRequirement,
} from '../../wwell-ir-form/wwell-ir-wellbore-diagram.mapper';
import { WwellIrWellborePanelComponent } from '../../wwell-ir-wellbore-panel/wwell-ir-wellbore-panel.component';
import { WwellIrViewKvCardComponent } from '../wwell-ir-view-kv-card/wwell-ir-view-kv-card.component';

/** "Well Design" step of the read-only IR view: the same submitted-record wellbore diagram
 *  WwellIrEditorComponent's own "Wellbore Preview" card renders (via
 *  buildWellboreDiagramDataFromIntegratedRequirement — no live FormArray override here, this
 *  page never edits), plus read-only Formation Tops / Casing tables and an Estimated Hydrology
 *  card (the same KvRow builder the Details step's card also uses — the record only has one set
 *  of hydrogeology values, shown in both places per the "Well Design" step's own spec).
 *
 *  The one exception is the Formation Tops remarks note: it gets its own lightweight inline edit
 *  (pencil → textarea → Save/Cancel) rather than requiring "Edit" up top to switch the whole panel
 *  into WwellIrEditorComponent just to touch one field — mirrors how WwellIrViewDetailsComponent's
 *  "Request Approval" button already calls the store directly from view mode. Persists through the
 *  exact same mapIntegratedRequirementToRawFormValue → mapIrFormValueToSubmission →
 *  buildWwellIrBulkSavePayload → store.createIr pipeline WwellIrEditorComponent's own
 *  saveMergedRaw uses, so this reaches the backend identically (same ir_seq threading, same
 *  existing-record diff for every other section) — see wwell-ir-edit.mapper.ts's own doc comment
 *  on mapIntegratedRequirementToRawFormValue for why it exists precisely for this kind of reuse.
 *  This page is only ever reachable for an already-persisted record (see WwellIrComponent's
 *  `viewIr`, gated on a real `irSeq`), so `current.irSeq` below is never null. */
@Component({
  selector: 'app-wwell-ir-view-well-design',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule, WwellIrWellborePanelComponent, WwellIrViewKvCardComponent],
  templateUrl: './wwell-ir-view-well-design.component.html',
  styleUrl: './wwell-ir-view-well-design.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellIrViewWellDesignComponent {
  readonly ir = input.required<IntegratedRequirement>();

  private readonly store = inject(WwellIrStore);

  // The maximised view's layout (its leader labels and casing remarks all have room), drawn inside a panel that fills
  // the visible page — see `fit` on the panel and `.ir-well-design__view` in the stylesheet.
  protected readonly diagramLayout = WWELL_IR_EXPANDED_DIAGRAM_LAYOUT;

  /** Structural `equal` for the same reason as the editor's: the store hands this component a fresh
   *  `IntegratedRequirement` whenever the record is re-fetched (a status refresh, say), and without it
   *  every one of those re-ran `well-bore-view`'s redraw effect and replayed the whole animation even
   *  though nothing the diagram draws had moved. */
  protected readonly wellboreDiagramData: Signal<WellboreDiagramData> = computed(
    () => buildWellboreDiagramDataFromIntegratedRequirement(this.ir()),
    { equal: wellboreDiagramDataEqual },
  );
  protected readonly hasWellboreData: Signal<boolean> = computed(() => hasWellboreDiagramDataForIntegratedRequirement(this.ir()));
  // Hides the D3-rendered "TOTAL DEPTH: 0 FT" label — same gate the editor's own preview uses
  // (wwell-ir-editor.component.ts's `hasTargetDepth`) — for the rare submitted record whose
  // target depth never actually got filled in.
  protected readonly hasTargetDepth: Signal<boolean> = computed(() => (this.ir().requestReference.targetDepthFt ?? 0) > 0);
  protected readonly hydrogeologyRows = computed(() => buildHydrogeologyRows(this.ir()));

  /** Depths read as figures, not raw numbers: same thousands separators the panel's own tables use. */
  protected formatDepth(depthFt: number): string {
    return depthFt.toLocaleString('en-US');
  }

  /** Surface elevation is a decimal (605.2 ft asl), so the subtraction carries binary-float noise
   *  (485.20000000000005); one decimal is all the precision the figure has. */
  protected subSeaFt(depthFt: number): string | null {
    const elevation = this.ir().requestReference.surfaceElevationFtAsl;
    if (elevation === null) return null;
    return (elevation - depthFt).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }

  // ── Inline edit — Formation Tops remarks only, see this component's own doc comment. ─────────
  protected readonly editingRemarks = signal(false);
  protected readonly remarksDraft = signal('');
  protected readonly savingRemarks = this.store.creatingIr;

  protected openRemarksEdit(): void {
    this.remarksDraft.set(this.ir().topsRemarks ?? '');
    this.editingRemarks.set(true);
  }

  protected cancelRemarksEdit(): void {
    this.editingRemarks.set(false);
  }

  protected onRemarksInput(event: Event): void {
    this.remarksDraft.set((event.target as HTMLTextAreaElement).value);
  }

  /** Resubmits every other section unchanged (via mapIntegratedRequirementToRawFormValue) with
   *  only the Formation Tops remarks field overridden — same "resend the untouched sections too"
   *  approach WwellIrEditorComponent.saveMergedRaw uses for a single open section. */
  protected saveRemarksEdit(): void {
    const current = this.ir();
    const raw = mapIntegratedRequirementToRawFormValue(current);
    const updatedRaw = {
      ...raw,
      subsurface: { ...raw.subsurface, remarks: { topsRemarks: this.remarksDraft() } },
    };
    const status: Extract<IntegratedRequirementStatus, 'draft' | 'in-progress'> =
      current.status === 'draft' || current.status === 'in-progress' ? current.status : 'in-progress';
    const { payload } = mapIrFormValueToSubmission(updatedRaw, status);
    const irBulkPayload = buildWwellIrBulkSavePayload(updatedRaw, {
      irSeq: current.irSeq ?? null,
      existing: current,
      geologistEmpNumByName: this.store.geologistEmpNumByName(),
    });
    this.store.createIr(payload, irBulkPayload);
    this.editingRemarks.set(false);
  }
}
