import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  effect,
  inject,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { WellStore } from '@store/active-wwell/active-wwell.store';
import { formatDateForInput } from 'src/app/shared/utils/date.util';
import { CasingInfoComponent } from '../casing-info/casing-info.component';
import { DatabaseInfoComponent } from '../database-info/database-info.component';
import { FormationTopsAndCasingComponent } from '../formation-tops-and-casing/formation-tops-and-casing.component';
import { OperationSummaryComponent } from '../operation-summary/operation-summary.component';
import { WwellHeaderComponent } from '../wwell-header/wwell-header.component';
import { WwellTestComponent } from '../wwell-test/wwell-test.component';
import { ActiveWwellUiStore } from '../active-wwell-ui.store';
import {
  ACTIVE_WWELL_FALLBACK,
  deriveStatusLabel,
} from '../active-wwell.helpers';
import { displayValue, selectLatestFormation } from '@store/active-wwell/active-wwell.selectors';
import { AddStatusDialogComponent } from '../add-status-dialog/add-status-dialog.component';
import { FileUploadComponent } from '../file-upload/file-upload.component';

const AREAS = [
  { value: 'RAK' },
  { value: 'Central' },
  { value: 'North West' },
  { value: 'Jafurah' },
  { value: 'GH' },
] as const;

const ADD_NEW_SENTINEL = '__ADD_NEW__';

@Component({
  selector: 'app-active-wwell-view',
  standalone: true,
  imports: [
    NgClass,
    FormsModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressBarModule,
    MatSelectModule,
    WwellHeaderComponent,
    OperationSummaryComponent,
    DatabaseInfoComponent,
    CasingInfoComponent,
    FormationTopsAndCasingComponent,
    WwellTestComponent,
    FileUploadComponent,
  ],
  templateUrl: './active-wwell-view.component.html',
  styleUrl: './active-wwell-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ActiveWwellUiStore],
})
export class ActiveWwellViewComponent implements OnInit {
  protected readonly ADD_NEW_SENTINEL = ADD_NEW_SENTINEL;
  protected readonly areas = AREAS;

  protected readonly store = inject(WellStore);
  protected readonly uiStore = inject(ActiveWwellUiStore);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);

  protected readonly wells = computed(() => this.store.uniqueWellNames());
  protected readonly statusOptions = this.uiStore.statusOptions;
  protected readonly selectedArea = this.uiStore.selectedArea;
  protected readonly selectedStatus = computed(() => {
    const epANum = this.store.selectedEpANum();
    return this.uiStore.statusForWell(epANum) ?? deriveStatusLabel(this.store.wellDetails());
  });

  protected readonly summaryStats = computed(() => {
    const details = this.store.wellDetails();
    const latestFormation = selectLatestFormation(details);

    return {
      formationDrilling:
        latestFormation?.stLongCd ??
        details?.EXAD_RCD_PREWAP?.[0]?.targetFormation ??
        ACTIVE_WWELL_FALLBACK,
      bitSize: details?.BITINFO?.[0]?.bitSz ?? ACTIVE_WWELL_FALLBACK,
      circulation: details?.DRLG_OP_STATUS?.[0]?.wMudCircPc ?? ACTIVE_WWELL_FALLBACK,
      mudWeight: details?.actualRm ?? ACTIVE_WWELL_FALLBACK,
      avgRop: details?.ROP_DATA?.[0]?.rop ?? ACTIVE_WWELL_FALLBACK,
    };
  });

  protected readonly drillingRemarks = computed(() => {
    const details = this.store.wellDetails();
    return details?.DRLG_OP_STATUS?.[0]?.wOpRmk ?? details?.DRLG_OP_SMRY?.[0]?.wOpRmk ?? '';
  });

  protected readonly displayValue = displayValue;

  constructor() {
    effect(() => {
      const epANum = this.store.selectedEpANum();
      const selectedDate = this.store.selectedDate();

      if (epANum == null) {
        return;
      }

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          epANum,
          date: formatDateForInput(selectedDate),
        },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });

    effect(() => {
      const epANum = this.store.selectedEpANum();
      const details = this.store.wellDetails();
      const detailsEpANum = details?.DRLG_OP_STATUS?.[0]?.epANum ?? null;

      if (epANum == null || epANum !== detailsEpANum) {
        return;
      }

      this.uiStore.ensureStatusForWell(epANum, deriveStatusLabel(details));
    });
  }

  ngOnInit(): void {
    this.store.loadWellNames();

    const params = this.route.snapshot.queryParamMap;
    const rawEpANum = params.get('epANum');
    const rawDate = params.get('date');

    if (!rawEpANum) {
      return;
    }

    const epANum = Number.parseInt(rawEpANum, 10);
    const date = rawDate ?? formatDateForInput(this.store.selectedDate());

    if (!Number.isNaN(epANum)) {
      this.store.selectWell({ epANum, date });
    }
  }

  protected onWellSelect(epANum: number): void {
    this.store.selectWell({
      epANum,
      date: formatDateForInput(this.store.selectedDate()),
    });
  }

  protected onSelect(status: string): void {
    if (status === ADD_NEW_SENTINEL) {
      this.openAddDialog();
      return;
    }

    this.uiStore.setStatusForWell(this.store.selectedEpANum(), status);
  }

  protected onAreaChange(area: string): void {
    this.uiStore.setSelectedArea(area);
  }

  private openAddDialog(): void {
    const dialogRef = this.dialog.open(AddStatusDialogComponent, {
      width: '280px',
      data: { name: '' },
      disableClose: true,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((name?: string) => {
        if (!name) {
          return;
        }

        this.uiStore.setStatusForWell(this.store.selectedEpANum(), name);
      });
  }
}
