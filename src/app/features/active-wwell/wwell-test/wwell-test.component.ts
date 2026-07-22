import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, filter, forkJoin, map, merge, of, timer } from 'rxjs';
import { DeleteWellTestDialogComponent } from './delete-well-test-dialog.component';
import { ActiveWwellFormService } from '../active-wwell-form.service';
import { ActiveWwellStore } from '../store/active-wwell.store';
import { ActiveWwellUiStore } from '../active-wwell-ui.store';
import { ActiveWellViewService } from '@core/services/active-well-view.service';
import { NotificationService } from '@shared/components/notification/notification.service';
import { RbacStore } from '@store/rbac/rbac.store';
import { ACTIONS } from '@models/rbac/role.constants';
import { formatDateForInput } from '@shared/utils/date.util';
import { calcFlowProductivityIndex, calcPumpProductivityIndex } from '@shared/utils/well-test-math.util';
import { allowKeypress, NETWORK_ID_KEY_PATTERN, NUMERIC_KEY_PATTERN } from '@shared/validators/agwa-data-validator';
import { getMissingDetailLabels } from '../active-wwell.helpers';

@Component({
  selector: 'app-wwell-test',
  standalone: true,
  imports: [MatButtonModule, MatFormFieldModule, MatSelectModule, ReactiveFormsModule, FormsModule],
  templateUrl: './wwell-test.component.html',
  styleUrl: './wwell-test.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellTestComponent {
  private readonly store = inject(ActiveWwellStore);
  private readonly uiStore = inject(ActiveWwellUiStore);
  private readonly rbac = inject(RbacStore);

  protected readonly data = this.store.wwellTest;
  protected readonly isUpdating = this.uiStore.isUpdating;

  protected readonly isFlowTest = signal(false);
  private initialFlowType = false;
  private wellTestSnapshot: string | null = null;

  formService = inject(ActiveWwellFormService);
  form: FormGroup = this.formService.wellTestForm;

  activeWellApiService = inject(ActiveWellViewService);
  notify = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  protected readonly isPublished = signal(false);
  protected readonly productivityInfo = signal<{
    inputs: { label: string; value: string; unit: string }[];
    calculation: string;
  } | null>(null);

  protected readonly tooltipVisible = signal(false);
  protected readonly tooltipPos = signal({ bottom: 0, right: 0 });

  protected showTooltip(event: MouseEvent): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.tooltipPos.set({
      bottom: window.innerHeight - rect.top + 10,
      right: window.innerWidth - rect.right,
    });
    this.tooltipVisible.set(true);
  }

  protected hideTooltip(): void {
    this.tooltipVisible.set(false);
  }

  constructor() {
    effect(() => {
      const data = this.data();
      if (data) {
        const flowType = data.flowType === 'FLOW';
        this.isFlowTest.set(flowType);
        this.initialFlowType = flowType;
      }
    });

    // Sync mode → hydTestTypCd and re-evaluate the requiredFor validators
    effect(() => {
      const isFlow = this.isFlowTest();
      this.form.get('hydTestTypCd')!.setValue(isFlow ? 'FLOW' : 'PUMP', { emitEvent: false });
      ['siwhp', 'fwhp', 'rpm', 'hydPmpDpth', 'statWlvl', 'dyncWlvl'].forEach(f =>
        this.form.get(f)?.updateValueAndValidity({ emitEvent: false }),
      );
    });

    effect(() => {
      if (this.isPublished()) {
        this.form.enable({ emitEvent: false });
        this.form.get('hydProduct')!.disable({ emitEvent: false });
        this.wellTestSnapshot = JSON.stringify(this.form.getRawValue());
      } else {
        this.form.disable({ emitEvent: false });
        this.form.get('hydProduct')!.disable({ emitEvent: false });
        this.wellTestSnapshot = null;
      }
    });

    // Reset edit mode and clear validation state when well or date changes
    effect(() => {
      this.store.selectedEpANum();
      this.store.selectedDate();

      this.isPublished.set(false);
      this.form.markAsUntouched();
      this.formService.drillingRemarksForm.markAsUntouched();
    });


    // Re-run calculation when test type changes so tooltip stays in sync
    effect(() => {
      this.isFlowTest();
      this.recalculateProductivity();
    });

    merge(
      this.form.get('statWlvl')!.valueChanges,
      this.form.get('dyncWlvl')!.valueChanges,
      this.form.get('siwhp')!.valueChanges,
      this.form.get('fwhp')!.valueChanges,
      this.form.get('hydProdRt')!.valueChanges,
    ).pipe(takeUntilDestroyed()).subscribe(() => this.recalculateProductivity());
  }

  private recalculateProductivity(): void {
    const v = this.form.getRawValue();

    if (this.isFlowTest()) {
      const result = calcFlowProductivityIndex(v.hydProdRt, v.siwhp, v.fwhp);
      this.form.get('hydProduct')!.setValue(
        result != null ? +result.toFixed(4) : null,
        { emitEvent: false },
      );
      const flowRate = v.hydProdRt ?? '—';
      const siwhp = v.siwhp ?? '—';
      const fwhp = v.fwhp ?? '—';
      this.productivityInfo.set({
        inputs: [
          { label: 'Test Rate', value: `${flowRate}`, unit: 'GPM' },
          { label: 'SIWHP', value: `${siwhp}`, unit: 'psi' },
          { label: 'FWHP', value: `${fwhp}`, unit: 'psi' },
        ],
        calculation: result != null
          ? `${flowRate} ÷ (2.3072 × (${siwhp} − ${fwhp})) = ${result.toFixed(4)} GPM/ft`
          : '—',
      });
    } else {
      const result = calcPumpProductivityIndex(v.hydProdRt, v.dyncWlvl, v.statWlvl);
      this.form.get('hydProduct')!.setValue(
        result != null ? +result.toFixed(4) : null,
        { emitEvent: false },
      );
      const pumpRate = v.hydProdRt ?? '—';
      const dynamicWaterLevel = v.dyncWlvl ?? '—';
      const staticWaterLevel = v.statWlvl ?? '—';
      this.productivityInfo.set({
        inputs: [
          { label: 'Test Rate', value: `${pumpRate}`, unit: 'GPM' },
          { label: 'DWL', value: `${dynamicWaterLevel}`, unit: 'ft' },
          { label: 'SWL', value: `${staticWaterLevel}`, unit: 'ft' },
        ],
        calculation: result != null
          ? `${pumpRate} ÷ (${dynamicWaterLevel} − ${staticWaterLevel}) = ${result.toFixed(4)} GPM/ft`
          : '—',
      });
    }
  }

  createOrUpdateActiveWwell() {
    const isMissing = (v: unknown) => v == null || String(v).trim() === '' || String(v).trim() === 'N/A';

    const f = this.formService.drillingRemarksForm.getRawValue();
    const missing = getMissingDetailLabels();

    if (isMissing(f['status'])) missing.push('Status');
    if (isMissing(f['area']))   missing.push('Area');

    if (this.isPublished()) {
      const wt = this.form.getRawValue();
      if (isMissing(wt['rsvrCd']))         missing.push('Aquifer');
      if (isMissing(wt['temp']))           missing.push('Temperature');
      if (isMissing(wt['hydH2sCnc']))      missing.push('H2S');
      if (isMissing(wt['wtrSaTdsCnc']))    missing.push('TDS');
      if (isMissing(wt['hydProdRt']))      missing.push('Test Rate');
      if (isMissing(wt['testerNetworkId'])) missing.push('Conducted By');
      if (isMissing(wt['duration']))       missing.push('Test Duration');

      if (this.isFlowTest()) {
        if (isMissing(wt['siwhp'])) missing.push('SIWHP');
        if (isMissing(wt['fwhp']))  missing.push('FWHP');
      } else {
        if (isMissing(wt['rpm']))        missing.push('RPM');
        if (isMissing(wt['hydPmpDpth'])) missing.push('Pump Depth');
        if (isMissing(wt['statWlvl']))   missing.push('SWL');
        if (isMissing(wt['dyncWlvl']))   missing.push('DWL');
      }
    }

    if (missing.length > 0) {
      this.notify.warn(
        `Missing required details: ${missing.join(', ')}`,
        { durationMs: 12000 },
      );
      return;
    }

    this.form.markAllAsTouched();
    this.formService.drillingRemarksForm.markAllAsTouched();

    if (this.isPublished() && this.form.get('testerNetworkId')?.hasError('invalidNetworkIds')) {
      this.notify.warn(
        'Conducted by must be a comma-separated list of Network IDs (e.g. jd12345, ab67890)',
        { durationMs: 10000 },
      );
      return;
    }

    if (this.isPublished() && this.form.invalid) return;

    const wellTestChanged = this.isPublished() && (
      this.isFlowTest() !== this.initialFlowType ||
      JSON.stringify(this.form.getRawValue()) !== this.wellTestSnapshot
    );
    const remarksChanged = this.formService.drillingRemarksForm.dirty;

    if (!wellTestChanged && !remarksChanged) {
      this.notify.info('No changes to save');
      return;
    }

    this.uiStore.setUpdating(true);

    const isCreatingWellTest = wellTestChanged && !this.egwtId();

    const extractMsg = (err: unknown): string => {
      if (err instanceof Error) return err.message;
      if (err instanceof HttpErrorResponse) return err.error?.detail ?? err.error?.message ?? err.message ?? 'Unknown error';
      return 'Unknown error';
    };

    // Discriminated union: null = not attempted, true = success, Error = failed with message
    const remarks$ = remarksChanged
      ? this.createOrUpdateDrillingRemarks().pipe(
          map(() => true as const),
          catchError((err: unknown) => of(new Error(extractMsg(err)))),
        )
      : of(null);
    const wellTest$ = wellTestChanged
      ? this.createOrUpdateWellTest().pipe(
          map(() => true as const),
          catchError((err: unknown) => of(new Error(extractMsg(err)))),
        )
      : of(null);

    forkJoin({ remarks: remarks$, wellTest: wellTest$, _min: timer(1500) }).subscribe(({ remarks, wellTest }) => {
      this.uiStore.setUpdating(false);

      const remarksFailed = remarks instanceof Error;
      const wellTestFailed = wellTest instanceof Error;

      if (!remarksFailed && !wellTestFailed) {
        if (remarks === true) this.formService.drillingRemarksForm.markAsPristine();
        if (wellTest === true) {
          this.notify.info(isCreatingWellTest ? 'Well test created successfully' : 'Well test updated successfully');
          this.initialFlowType = this.isFlowTest();
          this.wellTestSnapshot = JSON.stringify(this.form.getRawValue());
        } else {
          this.notify.info('Drilling remarks updated successfully');
        }
        this.store.refreshWellDetail();
      } else if (!remarksFailed && wellTestFailed) {
        if (remarks === true) {
          this.notify.info('Drilling remarks saved');
          this.formService.drillingRemarksForm.markAsPristine();
          this.store.refreshWellDetail();
        }
        this.notify.error(`Well test ${isCreatingWellTest ? 'creation' : 'update'} failed — ${(wellTest as Error).message}`);
      } else if (!wellTestFailed && remarksFailed) {
        if (wellTest === true) {
          this.notify.info(isCreatingWellTest ? 'Well test created successfully' : 'Well test updated successfully');
          this.initialFlowType = this.isFlowTest();
          this.wellTestSnapshot = JSON.stringify(this.form.getRawValue());
          this.store.refreshWellDetail();
        }
        this.notify.error(`Drilling remarks update failed — ${(remarks as Error).message}`);
      } else {
        this.notify.error('Update failed — please try again');
      }
    });
  }


  createOrUpdateDrillingRemarks() {
    const bodyGwdDailyRemarks = this.formService.drillingRemarksForm.value;
    const egdrId = this.store.wellData()?.EXAD_GWD_DAILY_REMARKS?.[0]?.egdr_id;
    bodyGwdDailyRemarks.egdrId = egdrId;
    bodyGwdDailyRemarks.wActDt = formatDateForInput(this.store.selectedDate());
    return this.activeWellApiService.createOrUpdateGwdDailyRemark(bodyGwdDailyRemarks)
  }

  createOrUpdateWellTest() {
    const bodyGwdWellTest = this.formService.wellTestForm.getRawValue()
    const egwtId = this.store.wellData()?.EXAD_GWD_WELL_TESTS?.[0]?.egwt_id;
    bodyGwdWellTest.egwtId = egwtId;
    bodyGwdWellTest.testStaDt = formatDateForInput(this.store.selectedDate());
    return this.activeWellApiService.createOrUpdateGwdWellTest(bodyGwdWellTest)
  }



  protected readonly canUpdate = computed(() =>
    this.rbac.hasPermission('active-wwell', ACTIONS.UPDATE),
  );

  protected readonly canDelete = computed(() =>
    this.rbac.hasPermission('active-wwell', ACTIONS.DELETE),
  );

  protected readonly egwtId = computed(() =>
    this.store.wellData()?.EXAD_GWD_WELL_TESTS?.[0]?.egwt_id ?? null,
  );

  protected readonly isDeleting = signal(false);

  protected readonly deleteDisabled = computed(() =>
    !this.isPublished() || !this.egwtId() || this.isUpdating() || this.isDeleting(),
  );

  protected deleteWellTest(): void {
    const egwtId = this.egwtId();
    if (!egwtId) return;

    this.dialog.open(DeleteWellTestDialogComponent, { width: '400px', disableClose: false })
      .afterClosed()
      .pipe(filter(confirmed => confirmed === true))
      .subscribe(() => {
        const wellName = this.store.wellHeaderData()?.wellName ?? 'Unknown';
        const testDate = formatDateForInput(this.store.selectedDate());
        const testType = this.isFlowTest() ? 'Flow' : 'Pump';

        this.isDeleting.set(true);

        forkJoin([
          this.activeWellApiService.deleteGwdWellTest(egwtId),
          timer(1500),
        ]).subscribe({
          next: () => {
            this.isDeleting.set(false);
            this.notify.info(
              `Well test deleted — ${wellName} | ${testType} test | ${testDate} | ID: ${egwtId}`,
              { durationMs: 10000 },
            );
            this.isPublished.set(false);
            this.store.refreshWellDetail();
          },
          error: () => {
            this.isDeleting.set(false);
            this.notify.error('Failed to delete well test — please try again');
          },
        });
      });
  }

  protected readonly aquiferOptions = this.store.aquifers;

  protected onlyNumbers(event: KeyboardEvent): void {
    allowKeypress(event, NUMERIC_KEY_PATTERN);
  }

  protected onlyNetworkIdListChars(event: KeyboardEvent): void {
    allowKeypress(event, NETWORK_ID_KEY_PATTERN);
  }
}