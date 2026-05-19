import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import { ActiveWwellStore } from '../store/active-wwell.store';
import { NotificationService } from '@shared/components/notification/notification.service';
import { forkJoin } from 'rxjs';
import { AuthStore } from '../../auth/store/auth.store';
import { RbacStore } from '@store/rbac/rbac.store';
import { formatDateForInput } from '@shared/utils/date.util';
import { ActiveWwellFormService } from '../active-wwell-form.service';

@Component({
  selector: 'app-wwell-test',
  standalone: true,
  imports: [MatButtonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './wwell-test.component.html',
  styleUrl: './wwell-test.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellTestComponent {
  private readonly store = inject(ActiveWwellStore);
  private readonly auth = inject(AuthStore);
  private readonly rbac = inject(RbacStore);

  protected readonly data = this.store.wwellTest;

  protected readonly isFlowTest = computed(() => {
    const data = this.data();
    if (!data) return false;
    return data.flowType === 'Y' || data.testType?.toLowerCase() === 'flow';
  });


  formService = inject(ActiveWwellFormService);
  form: any = this.formService.wellTestForm;

  ngOnInit() {

  }

  activeWellApiService: any = null; // TODO: inject when ActiveWellViewService is created
  notify = inject(NotificationService);

  createOrUpdateActiveWwell() {

    forkJoin({
      drillingRemarksResponse: this.createOrUpdateDrillingRemarks(),
      wellTestResponse: this.createOrUpdateWellTest()
    }).subscribe({
      next: ({ drillingRemarksResponse, wellTestResponse }) => {
        this.notify.info('Active water well details updated successfully');
      },
      error: (err) => {
        this.notify.error('Error updating active water well details');
      }
    })
  }


  createOrUpdateDrillingRemarks() {
    let bodyGwdDailyRemarks = this.formService.drillingRemarksForm.value;
    let egdrId = this.store.wellData()?.EXAD_GWD_DAILY_REMARKS?.[0]?.egdr_id;
    bodyGwdDailyRemarks.egdrId = egdrId;
    bodyGwdDailyRemarks.wActDt = formatDateForInput(this.store.selectedDate());
    return this.activeWellApiService.createOrUpdateGwdDailyRemark(bodyGwdDailyRemarks)
  }

  createOrUpdateWellTest() {
    let bodyGwdWellTest = this.formService.wellTestForm.value
    let egwtId = this.store.wellData()?.EXAD_GWD_WELL_TESTS?.[0]?.egwt_id;
    bodyGwdWellTest.egwtId = egwtId;
    bodyGwdWellTest.testStaDt = formatDateForInput(this.store.selectedDate());
    return this.activeWellApiService.createOrUpdateGwdWellTest(bodyGwdWellTest)
  }



  protected readonly canUpdate = computed(() =>
    this.rbac.canUpdateRoute('active-wwell', this.auth.user()?.groups ?? []),
  );
}
