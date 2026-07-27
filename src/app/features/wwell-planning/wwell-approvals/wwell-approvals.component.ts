import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AgGridAngular } from 'ag-grid-angular';
import { GridApi } from 'ag-grid-community';
import { WwellPlanningApproval } from '@models/wwell-planning/wwell-planning.model';
import { WwellPlanningStore } from '../store/wwell-planning.store';
import { wwellApprovalsColumnDefs, wwellApprovalsGridOptions, wwellApprovalsGridTheme } from './wwell-approvals.config';

@Component({
  selector: 'app-wwell-approvals',
  standalone: true,
  imports: [AgGridAngular, FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './wwell-approvals.component.html',
  styleUrl: './wwell-approvals.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellApprovalsComponent implements OnInit {
  protected readonly store = inject(WwellPlanningStore);

  protected readonly rows = this.store.approvals;
  protected readonly isLoading = this.store.approvalsLoading;
  protected readonly hasError = this.store.hasError;
  protected readonly errorMessage = this.store.error;

  protected readonly columnDefs = wwellApprovalsColumnDefs;
  protected readonly gridOptions = wwellApprovalsGridOptions;
  protected readonly gridTheme = wwellApprovalsGridTheme;

  protected readonly selectedApproval = signal<WwellPlanningApproval | null>(null);
  protected readonly comments = signal('');
  protected readonly canDecide = computed(() => this.selectedApproval()?.decision === 'pending');

  private gridApi: GridApi | null = null;

  ngOnInit(): void {
    this.store.loadApprovals();
  }

  protected onGridReady(api: GridApi): void {
    this.gridApi = api;
    this.gridApi.sizeColumnsToFit();
  }

  protected onSelectionChanged(): void {
    const [selected] = (this.gridApi?.getSelectedRows() as WwellPlanningApproval[]) ?? [];
    this.selectedApproval.set(selected ?? null);
    this.comments.set('');
  }

  protected approve(): void {
    this.decide('approved');
  }

  protected reject(): void {
    this.decide('rejected');
  }

  private decide(decision: 'approved' | 'rejected'): void {
    const approval = this.selectedApproval();
    if (!approval) return;

    this.store.decideApproval(approval.id, decision, this.comments().trim() || null);
    this.selectedApproval.set(null);
    this.comments.set('');
  }
}
