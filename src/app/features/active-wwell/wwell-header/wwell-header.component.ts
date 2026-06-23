import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ActiveWwellStore } from '../store/active-wwell.store';
import { ActiveWwellFormService } from '../active-wwell-form.service';
import { ActiveWwellUiStore } from '../active-wwell-ui.store';
import { AddStatusDialogComponent } from '../add-status-dialog/add-status-dialog.component';
import { RbacStore } from '@store/rbac/rbac.store';
import { ACTIONS } from '@models/rbac/role.constants';

const AREAS = [
  { value: 'Western Area' },
  { value: 'Southern Area' },
  { value: 'Northern Area' },
  { value: 'Central Area' },
] as const;

@Component({
  selector: 'app-wwell-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatIconModule],
  templateUrl: './wwell-header.component.html',
  styleUrl: './wwell-header.component.scss'
})
export class WwellHeaderComponent {
  protected readonly areas = AREAS;
  protected readonly store = inject(ActiveWwellStore);
  protected readonly activeWwellFormService = inject(ActiveWwellFormService);
  protected readonly uiStore = inject(ActiveWwellUiStore);
  private readonly dialog = inject(MatDialog);
  private readonly rbac = inject(RbacStore);

  protected readonly canUpdate = computed(() =>
    this.rbac.hasPermission('active-wwell', ACTIONS.UPDATE),
  );

  protected readonly data = this.store.wellHeaderData;
  protected readonly drillingForm = this.activeWwellFormService.drillingRemarksForm;

  protected readonly statusOptions = this.uiStore.statusOptions;
  protected readonly statusSearchQuery = signal('');
  protected readonly filteredStatusOptions = computed(() => {
    const q = this.statusSearchQuery().trim().toLowerCase();
    return q
      ? this.statusOptions().filter(s => s.toLowerCase().includes(q))
      : this.statusOptions();
  });

  protected onStatusPanelToggle(opened: boolean): void {
    if (!opened) this.statusSearchQuery.set('');
  }

  protected openAddStatusDialog(): void {
    this.dialog.open(AddStatusDialogComponent, { width: '280px', data: { name: '' } });
  }
}
