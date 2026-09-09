import { ChangeDetectionStrategy, Component, Signal, computed, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DIAGRAM_LAYOUT, WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { IntegratedRequirement, IntegratedRequirementStatus } from '@models/wwell-planning/integrated-requirement.model';
import { WellBoreViewComponent } from '../../../../presentation/well-bore-view/well-bore-view.component';
import { WwellIrStore } from '../../store/wwell-ir.store';
import { buildHydrogeologyRows } from '../../wwell-ir-editor/wwell-ir-detail-rows.util';
import { mapIntegratedRequirementToRawFormValue } from '../../wwell-ir-form/wwell-ir-edit.mapper';
import { mapIrFormValueToSubmission } from '../../wwell-ir-form/wwell-ir-form.mapper';
import { buildWwellIrBulkSavePayload } from '../../wwell-ir-form/wwell-ir-payload.mapper';
import {
  buildWellboreDiagramDataFromIntegratedRequirement,
  hasWellboreDiagramDataForIntegratedRequirement,
} from '../../wwell-ir-form/wwell-ir-wellbore-diagram.mapper';
import { WwellIrDepthScaleComponent } from '../../wwell-ir-depth-scale/wwell-ir-depth-scale.component';
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
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule, WellBoreViewComponent, WwellIrDepthScaleComponent, WwellIrViewKvCardComponent],
  templateUrl: './wwell-ir-view-well-design.component.html',
  styleUrl: './wwell-ir-view-well-design.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellIrViewWellDesignComponent {
  readonly ir = input.required<IntegratedRequirement>();

  private readonly store = inject(WwellIrStore);

  // The real `well-bore-view` layout, not the editor wizard's 25%-shrunk preview constant — see
  // `.ir-well-design__diagram-row` in the stylesheet and wwell-ir-view-letter.component.ts's
  // identical change for why (label collisions/clipping from the shrunk `drawingHeight`).
  protected readonly diagramLayout = DIAGRAM_LAYOUT;

  protected readonly wellboreDiagramData: Signal<WellboreDiagramData> = computed(() =>
    buildWellboreDiagramDataFromIntegratedRequirement(this.ir()),
  );
  protected readonly hasWellboreData: Signal<boolean> = computed(() => hasWellboreDiagramDataForIntegratedRequirement(this.ir()));
  // Hides the D3-rendered "TOTAL DEPTH: 0 FT" label — same gate the editor's own preview uses
  // (wwell-ir-editor.component.ts's `hasTargetDepth`) — for the rare submitted record whose
  // target depth never actually got filled in.
  protected readonly hasTargetDepth: Signal<boolean> = computed(() => (this.ir().requestReference.targetDepthFt ?? 0) > 0);
  protected readonly hydrogeologyRows = computed(() => buildHydrogeologyRows(this.ir()));

  protected subSeaFt(depthFt: number): number | null {
    const elevation = this.ir().requestReference.surfaceElevationFtAsl;
    return elevation === null ? null : elevation - depthFt;
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
