import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AgGridAngular } from 'ag-grid-angular';
import { IntegratedRequirement } from '@models/wwell-planning/wwell-planning.model';
import { WwellApprovalTimelineComponent } from '../../shared/wwell-approvals/wwell-approval-timeline/wwell-approval-timeline.component';
import { WwellIrDesignPreviewComponent } from '../wwell-ir-design-preview/wwell-ir-design-preview.component';
import { WWELL_IR_STATUS_META } from '../wwell-ir.config';
import {
  buildGeneralInfoRows,
  buildGeologistContactRows,
  buildHydrogeologyRows,
  buildProgramDetailsRows,
} from './wwell-ir-detail-rows.util';
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
    AgGridAngular,
    WwellIrDesignPreviewComponent,
    WwellApprovalTimelineComponent,
  ],
  templateUrl: './wwell-ir-detail.component.html',
  styleUrl: './wwell-ir-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellIrDetailComponent implements AfterViewInit, OnDestroy {
  readonly ir = input.required<IntegratedRequirement>();
  readonly submitting = input(false);

  readonly submitForReview = output<IntegratedRequirement>();

  protected readonly statusMeta = WWELL_IR_STATUS_META;
  protected readonly canSubmitForReview = computed(() => SUBMITTABLE_STATUSES.includes(this.ir().status));

  protected readonly generalInfoRows = computed(() => buildGeneralInfoRows(this.ir()));
  protected readonly programDetailsRows = computed(() => buildProgramDetailsRows(this.ir()));
  protected readonly hydrogeologyRows = computed(() => buildHydrogeologyRows(this.ir()));
  protected readonly geologistContactRows = computed(() => buildGeologistContactRows(this.ir()));

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

  // Feeds `.ird__sidebar`'s `top: calc(var(--ird-header-h) + ...)` in the stylesheet — the
  // sidebar and the header are both `position: sticky` against the same scroll container, so
  // the sidebar needs the header's *live* height (title/badge wrapping can change it) to know
  // how far down to park itself instead of sliding underneath the frozen header.
  @ViewChild('headerEl') private readonly headerEl?: ElementRef<HTMLElement>;
  protected readonly headerHeight = signal(0);
  private headerResizeObserver?: ResizeObserver;

  protected subSeaFt(depthFt: number): number | null {
    const elevation = this.ir().requestReference.surfaceElevationFtAsl;
    return elevation === null ? null : elevation - depthFt;
  }

  protected onOffsetWellsGridReady(): void {
    this.offsetWellsGridReady.set(true);
  }

  ngAfterViewInit(): void {
    const el = this.headerEl?.nativeElement;
    if (!el || typeof ResizeObserver === 'undefined') return;

    this.headerResizeObserver = new ResizeObserver(([entry]) => {
      if (entry) this.headerHeight.set(Math.round(entry.contentRect.height));
    });
    this.headerResizeObserver.observe(el);
  }

  ngOnDestroy(): void {
    this.headerResizeObserver?.disconnect();
  }
}
