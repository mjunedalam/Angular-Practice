import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { GridApi } from 'ag-grid-community';
import { WwellPlanningStore } from '../store/wwell-planning.store';
import { wwellIrColumnDefs, wwellIrGridOptions, wwellIrGridTheme } from './wwell-ir.config';

@Component({
  selector: 'app-wwell-ir',
  standalone: true,
  imports: [AgGridAngular],
  templateUrl: './wwell-ir.component.html',
  styleUrl: './wwell-ir.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellIrComponent implements OnInit {
  protected readonly store = inject(WwellPlanningStore);

  protected readonly rows = this.store.integratedRequirements;
  protected readonly isLoading = this.store.integratedRequirementsLoading;
  protected readonly hasError = this.store.hasError;
  protected readonly errorMessage = this.store.error;

  protected readonly columnDefs = wwellIrColumnDefs;
  protected readonly gridOptions = wwellIrGridOptions;
  protected readonly gridTheme = wwellIrGridTheme;

  private gridApi: GridApi | null = null;

  ngOnInit(): void {
    this.store.loadIntegratedRequirements();
  }

  protected onGridReady(api: GridApi): void {
    this.gridApi = api;
    this.gridApi.sizeColumnsToFit();
  }
}
