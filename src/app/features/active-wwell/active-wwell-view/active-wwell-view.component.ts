import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { ActiveWwellStore } from '../store/active-wwell.store';
import { NotificationService } from '@shared/components/notification/notification.service';
import { blockFutureDigits, clampDateDigits, formatDateForInput, getTodayAtMidnight, parseDateFromInput, validateDateInput } from 'src/app/shared/utils/date.util';
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
import { displayValue, selectLatestFormation, selectWwellTestViewModel } from '../store/active-wwell.selectors';
import { AddStatusDialogComponent } from '../add-status-dialog/add-status-dialog.component';
import { FileUploadComponent } from '@shared/components/file-upload/file-upload.component';
import { ActiveWwellFormService } from '../active-wwell-form.service';
import { skip } from 'rxjs';

const AREAS = [
  { value: 'Western Area' },
  { value: 'Southern Area' },
  { value: 'Northern Area' },
  { value: 'Central Area' },

] as const;

const ADD_NEW_SENTINEL = '__ADD_NEW__';

@Component({
  selector: 'app-active-wwell-view',
  standalone: true,
  imports: [
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
    ReactiveFormsModule
  ],
  templateUrl: './active-wwell-view.component.html',
  styleUrl: './active-wwell-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ActiveWwellUiStore],
})
export class ActiveWwellViewComponent implements OnInit {
  @ViewChild('nativeDateInput') private nativeDateInput?: ElementRef<HTMLInputElement>;

  protected readonly ADD_NEW_SENTINEL = ADD_NEW_SENTINEL;
  protected readonly areas = AREAS;

  protected readonly store = inject(ActiveWwellStore);
  protected readonly uiStore = inject(ActiveWwellUiStore);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private readonly notify = inject(NotificationService);

  protected readonly wells = computed(() => this.store.uniqueWellNames());
  protected readonly statusOptions = this.uiStore.statusOptions;
  protected readonly statusSearchQuery = signal('');
  protected readonly filteredStatusOptions = computed(() => {
    const q = this.statusSearchQuery().trim().toLowerCase();
    return q
      ? this.statusOptions().filter(s => s.toLowerCase().includes(q))
      : this.statusOptions();
  });
  protected readonly selectedArea = this.uiStore.selectedArea;
  protected readonly selectedStatus = computed(() => {
    const epANum = this.store.selectedEpANum();
    return this.uiStore.statusForWell(epANum) ?? deriveStatusLabel(this.store.selectedWell());
  });

  protected readonly summaryStats = computed(() => {
    const details = this.store.selectedWell();
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
    const details = this.store.selectedWell();
    return details?.DRLG_OP_STATUS?.[0]?.wOpRmk ?? details?.DRLG_OP_SMRY?.[0]?.wOpRmk ?? '';
  });

  protected readonly maxDateString = formatDateForInput(getTodayAtMidnight());
  protected readonly selectedDateString = computed(() => formatDateForInput(this.store.selectedDate()));

  protected readonly displayValue = displayValue;

  constructor() {

    effect(() => {
      const wellData = this.store.wellData();

      // this.form.reset();
      // this.wellTestForm.reset();
      if (wellData == null) return;

      const wellTestData = selectWwellTestViewModel(wellData);

      const exadGwdDailyRemarks = wellData?.EXAD_GWD_DAILY_REMARKS?.[0];
      const drlgOpStatus = wellData?.DRLG_OP_STATUS?.[0];
      let wDrlgSmryRmk: any = '';
      let wOpRmk: any = '';
      let nxt24HrPlanRmk: any = '';
      if (exadGwdDailyRemarks?.drlgSmryRmk != null || exadGwdDailyRemarks?.opRmk != null || exadGwdDailyRemarks?.next24HrPlanRrmk != null) {
        wDrlgSmryRmk = exadGwdDailyRemarks?.drlgSmryRmk;
        wOpRmk = exadGwdDailyRemarks?.opRmk;
        nxt24HrPlanRmk = exadGwdDailyRemarks?.next24HrPlanRrmk;
      } else {
        wDrlgSmryRmk = drlgOpStatus?.wDrlgSmryRmk;
        wOpRmk = drlgOpStatus?.wOpRmk;
        nxt24HrPlanRmk = drlgOpStatus?.nxt24HrPlanRmk;
      }

      //const formattedDate = formatDateForInput(this.store.selectedDate());

      const status = this.store.status();
      const area = this.store.area();
      this.form.patchValue({
        area: area,
        epANum: this.store.selectedEpANum(),
        status: status ?? deriveStatusLabel(this.store.selectedWell()),
        wDrlgSmryRmk: wDrlgSmryRmk,
        wOpRmk: wOpRmk,
        nxt24HrPlanRmk: nxt24HrPlanRmk
      })



      this.wellTestForm.patchValue({
        epANum: this.store.selectedEpANum(),
        rsvrCd: wellTestData?.aquiferActual,
        hydH2sCnc: wellTestData?.h2sActual,
        temp: wellTestData?.temp,
        hydTestTypCd: wellTestData?.flowType,
        wtrSaTdsCnc: wellTestData?.tds,
        rpm: wellTestData?.rpm,
        duration: wellTestData?.duration,
        testerNetworkId: wellTestData?.conductedBy,
        testStaDt: this.selectedDateString,
        hydProdRt: wellTestData?.rate,
        siwhp: wellTestData?.siwhp,
        hydProduct: wellTestData?.productivityActual,
        hydPmpDpth: wellTestData?.hydPmpDpth,
        statWlvl: wellTestData?.swl,
        dyncWlvl: wellTestData?.dwl
      }, {
        emitEvent: false
      })

    })




    effect(() => {
      const epANum = this.store.selectedEpANum();
      const date = this.store.selectedDate();

      if (epANum == null) {
        return;
      }

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          epANum,
          date: formatDateForInput(date),
        },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });


    });

    effect(() => {
      const epANum = this.store.selectedEpANum();
      const details = this.store.selectedWell();
      const detailsEpANum = details?.DRLG_OP_STATUS?.[0]?.epANum ?? null;

      if (epANum == null || epANum !== detailsEpANum) {
        return;
      }

      this.uiStore.ensureStatusForWell(epANum, deriveStatusLabel(details));
    });
  }


  protected onDateInputChange(value: string): void {
    this.commitDate(value);
  }

  protected onDateAutoFormat(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selStart = input.selectionStart ?? 0;
    const rawVal = input.value;

    const rawDigits = rawVal.replace(/\D/g, '').slice(0, 8);
    const endsWithHyphen = rawVal.trimEnd().endsWith('-');

    // Auto-pad single month digit when user types '-' to jump to day segment (e.g. "2026-2-" → "202602")
    const paddedDigits = (endsWithHyphen && rawDigits.length === 5)
      ? rawDigits.slice(0, 4) + '0' + rawDigits[4]
      : rawDigits;

    const { digits, isFuture } = blockFutureDigits(clampDateDigits(paddedDigits));

    if (isFuture) {
      this.notify.error('Future dates are not allowed');
    }

    let formatted = digits;
    if (digits.length >= 5) formatted = digits.slice(0, 4) + '-' + digits.slice(4);
    if (digits.length >= 7) formatted = digits.slice(0, 4) + '-' + digits.slice(4, 6) + '-' + digits.slice(6);

    // Preserve trailing hyphen at valid segment boundary (after YYYY or MM)
    const trailingHyphen = endsWithHyphen && !isFuture && (digits.length === 4 || digits.length === 6);
    if (trailingHyphen) formatted += '-';

    const oldDashes = (rawVal.slice(0, selStart).match(/-/g) ?? []).length;
    const newDashes = (formatted.slice(0, selStart).match(/-/g) ?? []).length;
    const newCursor = trailingHyphen
      ? formatted.length
      : Math.min(selStart + (newDashes - oldDashes), formatted.length);

    input.value = formatted;
    input.setSelectionRange(newCursor, newCursor);

    if (digits.length === 8) {
      this.commitDate(formatted);
    }
  }

  protected onDateTextCommit(value: string): void {
    this.commitDate(value);
  }

  protected openNativePicker(): void {
    this.nativeDateInput?.nativeElement.showPicker?.();
  }

  private commitDate(value: string): void {
    let digits = clampDateDigits(value.trim().replace(/\D/g, '').slice(0, 8));

    if (digits.length < 6) return;

    // Auto-pad incomplete day on Enter/blur
    if (digits.length === 6) digits += '01';
    else if (digits.length === 7) digits = digits.slice(0, 6) + '0' + digits[6];

    const normalized = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;

    const error = validateDateInput(normalized);
    if (error === 'invalid') { this.notify.error('Invalid date — use YYYY-MM-DD format'); return; }
    if (error === 'future') { this.notify.error('Future dates are not allowed'); return; }

    const newStr = formatDateForInput(parseDateFromInput(normalized));
    if (newStr !== this.selectedDateString()) {
      this.store.setDate(newStr);
    }
  }

  private applyQueryParams(params: ParamMap, forceLoad = false): void {
    const requestedDate = this.normalizeDateParam(params.get('date'));
    const rawEpANum = params.get('epANum');
    const epANum = rawEpANum ? Number.parseInt(rawEpANum, 10) : null;
    const currentDate = formatDateForInput(this.store.selectedDate());
    const currentEpANum = this.store.selectedEpANum();

    if (!forceLoad && requestedDate === currentDate && (epANum ?? null) === currentEpANum) {
      return;
    }
    // this.form.get('wActDt').patchValue(requestedDate, { emitEvent: false })
    // this.wellTestForm.get('testStaDt').patchValue(requestedDate, { emitEvent: false });
    this.store.initialize(
      requestedDate,
      epANum != null && !Number.isNaN(epANum) ? epANum : undefined,
    );
  }


  private normalizeDateParam(value: string | null): string {
    if (!value) {
      return formatDateForInput(getTodayAtMidnight());
    }

    const parsed = parseDateFromInput(value);
    const today = getTodayAtMidnight();

    if (Number.isNaN(parsed.getTime()) || parsed > today) {
      return formatDateForInput(today);
    }

    return value;
  }

  formService = inject(ActiveWwellFormService);
  form: any = this.formService.drillingRemarksForm;
  wellTestForm: any = this.formService.wellTestForm;
  ngOnInit(): void {
    this.form = this.formService.drillingRemarksForm;




    this.applyQueryParams(this.route.snapshot.queryParamMap, true);

    this.route.queryParamMap
      .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => this.applyQueryParams(params));
  }

  protected onWellSelect(epANum: number): void {
    this.store.selectWell({ epANum, date: this.selectedDateString() });
  }



  openDialog() {
    this.openAddDialog();
  }


  protected onStatusPanelToggle(opened: boolean): void {
    if (!opened) this.statusSearchQuery.set('');
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
        this.form.get('status').patchValue(name);
      });
  }
}