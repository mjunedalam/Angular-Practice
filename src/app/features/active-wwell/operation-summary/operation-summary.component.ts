import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AbstractControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TextExpandModalComponent } from '@shared/components/text-expand-modal/text-expand-modal.component';
import { ActiveWwellFormService } from '../active-wwell-form.service';
import { ActiveWwellStore } from '../store/active-wwell.store';
import { ActiveWwellUiStore } from '../active-wwell-ui.store';
import { RbacStore } from '@store/rbac/rbac.store';
import { ACTIONS } from '@models/rbac/role.constants';

@Component({
  selector: 'app-operation-summary',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './operation-summary.component.html',
  styleUrl: './operation-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationSummaryComponent {
  private readonly store = inject(ActiveWwellStore);
  protected readonly uiStore = inject(ActiveWwellUiStore);
  private readonly rbac = inject(RbacStore);

  protected readonly data = this.store.operationSummary;

  formService = inject(ActiveWwellFormService);
  form: FormGroup = this.formService.drillingRemarksForm;

  protected readonly canUpdate = computed(() =>
    this.rbac.hasPermission('active-wwell', ACTIONS.UPDATE),
  );

  private readonly dialog = inject(MatDialog);

  protected openExpand(title: string, control: AbstractControl | null): void {
    if (!control) return;
    this.dialog
      .open(TextExpandModalComponent, {
        data: { title, control, readonly: !this.canUpdate() },
        width: '65vw',
        maxWidth: '95vw',
        minHeight: '50vh',
        panelClass: 'resizable-dialog',
      })
      .afterClosed()
      .subscribe((result: string | undefined) => {
        if (result !== undefined) {
          control.setValue(result);
          control.markAsDirty();
        }
      });
  }
}
