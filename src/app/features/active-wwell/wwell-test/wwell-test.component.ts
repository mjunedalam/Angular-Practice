import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { catchError, forkJoin, map, merge, of, timer } from 'rxjs';
import { ActiveWwellFormService } from '../active-wwell-form.service';
import { ActiveWwellStore } from '../store/active-wwell.store';
import { ActiveWwellUiStore } from '../active-wwell-ui.store';
import { ActiveWellViewService } from '@core/services/active-well-view.service';
import { NotificationService } from '@shared/components/notification/notification.service';
import { AuthStore } from '../../auth/store/auth.store';
import { RbacStore } from '@store/rbac/rbac.store';
import { formatDateForInput } from '@shared/utils/date.util';
import { calcFlowProductivityIndex, calcPumpProductivityIndex } from '@shared/utils/well-test-math.util';

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
  private readonly auth = inject(AuthStore);
  private readonly rbac = inject(RbacStore);

  protected readonly data = this.store.wwellTest;
  protected readonly isUpdating = this.uiStore.isUpdating;

  protected readonly isFlowTest = signal(false);
  private initialFlowType = false;
  private wellTestSnapshot: string | null = null;

  formService = inject(ActiveWwellFormService);
  form: FormGroup = this.formService.wellTestForm;

  activeWellApiService = inject(ActiveWellViewService)
  notify = inject(NotificationService);

  protected readonly isPublished = signal(false);
  protected readonly productivityInfo = signal<{
    inputs: Array<{ label: string; value: string; unit: string }>;
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
        const flowType = data.flowType === 'Y';
        this.isFlowTest.set(flowType);
        this.initialFlowType = flowType;
      }
    }, { allowSignalWrites: true });

    // Sync toggle → form so hydTestTypCd is always Y (FLOW) or N (PUMP) on submit
    effect(() => {
      this.form.get('hydTestTypCd')!.setValue(
        this.isFlowTest() ? 'Y' : 'N',
        { emitEvent: false },
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
    }, { allowSignalWrites: true });

    // Swap required validators when test type changes
    effect(() => {
      const isFlow = this.isFlowTest();
      const flowOnly = ['siwhp', 'fwhp'];
      const pumpOnly = ['rpm', 'hydPmpDpth', 'statWlvl', 'dyncWlvl'];

      const toRequire  = isFlow ? flowOnly : pumpOnly;
      const toOptional = isFlow ? pumpOnly : flowOnly;

      toOptional.forEach(field => {
        this.form.get(field)?.clearValidators();
        this.form.get(field)?.updateValueAndValidity({ emitEvent: false });
      });
      toRequire.forEach(field => {
        this.form.get(field)?.setValidators(Validators.required);
        this.form.get(field)?.updateValueAndValidity({ emitEvent: false });
      });
    });

    // Re-run calculation when test type changes so tooltip stays in sync
    effect(() => {
      this.isFlowTest();
      this.recalculateProductivity();
    }, { allowSignalWrites: true });

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
    this.form.markAllAsTouched();
    this.formService.drillingRemarksForm.markAllAsTouched();

    const statusInvalid = this.formService.drillingRemarksForm.get('status')?.invalid;
    const areaInvalid   = this.formService.drillingRemarksForm.get('area')?.invalid;
    if ((this.isPublished() && this.form.invalid) || statusInvalid || areaInvalid) return;

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

    // Discriminated union: null = not attempted, true = success, false = failed
    const remarks$ = remarksChanged
      ? this.createOrUpdateDrillingRemarks().pipe(
          map(() => true as const),
          catchError(() => of(false as const)),
        )
      : of(null);
    const wellTest$ = wellTestChanged
      ? this.createOrUpdateWellTest().pipe(
          map(() => true as const),
          catchError(() => of(false as const)),
        )
      : of(null);

    forkJoin({ remarks: remarks$, wellTest: wellTest$, _min: timer(1500) }).subscribe(({ remarks, wellTest }) => {
      this.uiStore.setUpdating(false);

      const remarksFailed = remarks === false;
      const wellTestFailed = wellTest === false;

      if (!remarksFailed && !wellTestFailed) {
        this.notify.info('Well details updated successfully');
        if (remarks === true) this.formService.drillingRemarksForm.markAsPristine();
        if (wellTest === true) {
          this.initialFlowType = this.isFlowTest();
          this.wellTestSnapshot = JSON.stringify(this.form.getRawValue());
        }
        this.store.refreshWellDetail();
      } else if (!remarksFailed && wellTestFailed) {
        if (remarks === true) {
          this.notify.info('Drilling remarks saved');
          this.formService.drillingRemarksForm.markAsPristine();
          this.store.refreshWellDetail();
        }
        this.notify.error('Well test update failed');
      } else if (!wellTestFailed && remarksFailed) {
        if (wellTest === true) {
          this.notify.info('Well test saved');
          this.initialFlowType = this.isFlowTest();
          this.wellTestSnapshot = JSON.stringify(this.form.getRawValue());
          this.store.refreshWellDetail();
        }
        this.notify.error('Drilling remarks update failed');
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
    this.rbac.canUpdateRoute('active-wwell', this.auth.user()?.groups ?? []),
  );

  protected readonly aquiferOptions = [
    'ARUM', 'SAQA', 'UMER', 'WASI', 'SHRA', 'ALAT', 'KHOB', 'MNJQ', 'NOGN',
  ] as const;

  protected onlyNumbers(event: KeyboardEvent): void {
    const allowed = /[\d.-]/.test(event.key) || [
      'Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'
    ].includes(event.key);
    if (!allowed) event.preventDefault();
  }
}