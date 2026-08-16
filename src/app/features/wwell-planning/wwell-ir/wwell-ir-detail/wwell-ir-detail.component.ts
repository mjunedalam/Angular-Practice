import { ChangeDetectionStrategy, Component, Signal, computed, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { AgGridAngular } from 'ag-grid-angular';
import { WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { IntegratedRequirement } from '@models/wwell-planning/wwell-planning.model';
import { WellBoreViewComponent } from '../../../presentation/well-bore-view/well-bore-view.component';
import { WwellApprovalMiniChainComponent } from '../../shared/wwell-approvals/wwell-approval-timeline/wwell-approval-mini-chain.component';
import { WwellApprovalTimelineComponent } from '../../shared/wwell-approvals/wwell-approval-timeline/wwell-approval-timeline.component';
import { WwellIrDepthScaleComponent } from '../wwell-ir-depth-scale/wwell-ir-depth-scale.component';
import {
  buildWellboreDiagramDataFromIntegratedRequirement,
  hasWellboreDiagramDataForIntegratedRequirement,
} from '../wwell-ir-form/wwell-ir-wellbore-diagram.mapper';
import { WWELL_IR_STATUS_META } from '../wwell-ir.config';
import {
  buildGeologistContactRows,
  buildHydrogeologyRows,
  buildProgramDetailsRows,
  buildRequestReferenceRows,
} from './wwell-ir-detail-rows.util';
import {
  buildLetterDrillingProgramRows,
  buildLetterProductionTestingRows,
  buildLetterWellLocationRows,
  letterApprovedByName,
} from './wwell-ir-letter-rows.util';
import {
  wwellIrOffsetWellsColumnDefs,
  wwellIrOffsetWellsGridOptions,
  wwellIrOffsetWellsGridTheme,
} from './wwell-ir-offset-wells.config';

const SUBMITTABLE_STATUSES: readonly IntegratedRequirement['status'][] = ['draft', 'in-progress'];

@Component({
  selector: 'app-wwell-ir-detail',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    AgGridAngular,
    WellBoreViewComponent,
    WwellIrDepthScaleComponent,
    WwellApprovalTimelineComponent,
    WwellApprovalMiniChainComponent,
  ],
  templateUrl: './wwell-ir-detail.component.html',
  styleUrl: './wwell-ir-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellIrDetailComponent {
  readonly ir = input.required<IntegratedRequirement>();
  readonly submitting = input(false);

  readonly submitForReview = output<IntegratedRequirement>();

  protected readonly statusMeta = WWELL_IR_STATUS_META;
  protected readonly canSubmitForReview = computed(() => SUBMITTABLE_STATUSES.includes(this.ir().status));

  protected readonly requestReferenceRows = computed(() => buildRequestReferenceRows(this.ir()));
  protected readonly programDetailsRows = computed(() => buildProgramDetailsRows(this.ir()));
  protected readonly hydrogeologyRows = computed(() => buildHydrogeologyRows(this.ir()));
  protected readonly geologistContactRows = computed(() => buildGeologistContactRows(this.ir()));

  protected readonly letterWellLocationRows = computed(() => buildLetterWellLocationRows(this.ir()));
  protected readonly letterDrillingProgramRows = computed(() => buildLetterDrillingProgramRows(this.ir()));
  protected readonly letterProductionTestingRows = computed(() => buildLetterProductionTestingRows(this.ir()));
  protected readonly letterApprovedBy = computed(() => letterApprovedByName(this.ir()));

  // Same live `app-well-bore-view` diagram the IR wizard's "Well Design View" step uses,
  // fed from this (already-submitted) IR instead of an in-progress form value — replaces the
  // lighter `wwell-ir-design-preview` sketch that used to sit here.
  protected readonly wellboreDiagramData: Signal<WellboreDiagramData> = computed(() =>
    buildWellboreDiagramDataFromIntegratedRequirement(this.ir()),
  );
  protected readonly hasWellboreData: Signal<boolean> = computed(() =>
    hasWellboreDiagramDataForIntegratedRequirement(this.ir()),
  );

  // AG Grid's `rowData` input wants a mutable array; `ir().offsetWells` is `readonly`.
  protected readonly offsetWellsRows = computed(() => [...this.ir().offsetWells]);

  protected readonly offsetWellsColumnDefs = wwellIrOffsetWellsColumnDefs;
  protected readonly offsetWellsGridOptions = wwellIrOffsetWellsGridOptions;
  protected readonly offsetWellsGridTheme = wwellIrOffsetWellsGridTheme;
  // AG Grid's own module init + first layout pass takes a tick after the component is created —
  // this mirrors the `mat-spinner` + label loading block used in `active-wwell-docs-viewer`
  // (presentation feature) rather than the shimmer-skeleton used on the master list, since a
  // spinner-over-content overlay is the closer match for a widget that's already-visible chrome
  // with in-flight content, not a whole page being fetched.
  protected readonly offsetWellsGridReady = signal(false);

  protected subSeaFt(depthFt: number): number | null {
    const elevation = this.ir().requestReference.surfaceElevationFtAsl;
    return elevation === null ? null : elevation - depthFt;
  }

  protected onOffsetWellsGridReady(): void {
    this.offsetWellsGridReady.set(true);
  }
}
