import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActiveWwellFormService } from '../active-wwell-form.service';
import { ActiveWwellStore } from '../store/active-wwell.store';
import { ActiveWellViewService } from '@core/services/active-well-view.service';
import { NotificationService } from '@shared/components/notification/notification.service';
import { forkJoin } from 'rxjs';
import { AuthStore } from '../../auth/store/auth.store';
import { RbacStore } from '@store/rbac/rbac.store';
import { formatDateForInput } from '@shared/utils/date.util';

@Component({
  selector: 'app-wwell-test',
  standalone: true,
  imports: [MatButtonModule, MatFormFieldModule, MatSelectModule, MatSlideToggleModule, ReactiveFormsModule, FormsModule],
  templateUrl: './wwell-test.component.html',
  styleUrl: './wwell-test.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellTestComponent {
  private readonly store = inject(ActiveWwellStore);
  private readonly auth = inject(AuthStore);
  private readonly rbac = inject(RbacStore);

  protected readonly data = this.store.wwellTest;
  protected readonly isUpdating = signal(false);

  protected readonly isFlowTest = computed(() => {
    const data = this.data();
    if (!data) return false;
    return data.flowType === 'Y' || data.testType?.toLowerCase() === 'flow';
  });


  formService = inject(ActiveWwellFormService);
  form: FormGroup = this.formService.wellTestForm;

  activeWellApiService = inject(ActiveWellViewService)
  notify = inject(NotificationService);

  protected readonly isPublished = signal(false);

  constructor() {
    effect(() => {
      if (this.isPublished()) {
        this.form.enable({ emitEvent: false });
      } else {
        this.form.disable({ emitEvent: false });
      }
    });
  }

  createOrUpdateActiveWwell() {
    this.isUpdating.set(true);
    forkJoin({
      drillingRemarksResponse: this.createOrUpdateDrillingRemarks(),
      wellTestResponse: this.createOrUpdateWellTest()
    }).subscribe({
      next: () => {
        this.isUpdating.set(false);
        this.notify.info('Active water well details updated successfully');
        this.store.refreshWellDetail();
      },
      error: () => {
        this.isUpdating.set(false);
        this.notify.error('Error updating active water well details');
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