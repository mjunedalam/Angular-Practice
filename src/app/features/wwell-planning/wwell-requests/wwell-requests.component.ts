import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CellClickedEvent, GridApi } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { WwellPlanningRequest } from '@models/wwell-planning/wwell-planning.model';
import { WwellPlanningStore } from '../store/wwell-planning.store';
import {
  WWELL_REQUESTS_ACTIONS_COL_ID,
  wwellRequestsColumnDefs,
  wwellRequestsGridOptions,
  wwellRequestsGridTheme,
} from './wwell-requests.config';
import { WwellRequestFormComponent, WwellRequestFormResult } from './wwell-request-form/wwell-request-form.component';

const SNACKBAR_DURATION_MS = 3000;

@Component({
  selector: 'app-wwell-requests',
  standalone: true,
  imports: [AgGridAngular, FormsModule, MatButtonModule, MatIconModule],
  templateUrl: './wwell-requests.component.html',
  styleUrl: './wwell-requests.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellRequestsComponent implements OnInit {
  protected readonly store = inject(WwellPlanningStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly rows = this.store.requests;
  protected readonly isLoading = this.store.requestsLoading;
  protected readonly isCreating = this.store.creatingRequest;
  protected readonly loadError = this.store.requestsError;

  protected readonly totalCount = computed(() => this.rows().length);
  protected readonly inProgressCount = computed(() => this.rows().filter(r => r.status === 'in-progress').length);
  protected readonly inReviewCount = computed(() => this.rows().filter(r => r.status === 'in-review').length);
  protected readonly approvedCount = computed(() => this.rows().filter(r => r.status === 'approved').length);

  protected readonly searchTerm = signal('');

  protected readonly columnDefs = wwellRequestsColumnDefs;
  protected readonly gridOptions = wwellRequestsGridOptions;
  protected readonly gridTheme = wwellRequestsGridTheme;

  private gridApi: GridApi<WwellPlanningRequest> | null = null;

  constructor() {
    effect(() => {
      const message = this.store.createRequestError();
      if (message) {
        this.snackBar.open(message, 'Dismiss', { duration: SNACKBAR_DURATION_MS });
      }
    });
  }

  ngOnInit(): void {
    this.store.loadRequests();
  }

  protected onGridReady(api: GridApi<WwellPlanningRequest>): void {
    this.gridApi = api;
    this.gridApi.sizeColumnsToFit();
  }

  protected onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.gridApi?.setGridOption('quickFilterText', term);
  }

  protected onCellClicked(event: CellClickedEvent<WwellPlanningRequest>): void {
    if (event.colDef.colId !== WWELL_REQUESTS_ACTIONS_COL_ID || !event.data) return;
    this.openViewDialog(event.data);
  }

  protected openNewRequestDialog(): void {
    this.dialog
      .open<WwellRequestFormComponent, unknown, WwellRequestFormResult | undefined>(WwellRequestFormComponent, {
        data: { mode: 'create' },
        panelClass: 'wwell-request-form-panel',
        maxWidth: '95vw',
        autoFocus: false,
      })
      .afterClosed()
      .subscribe(result => {
        if (!result) return;
        this.store.createRequest(result.payload, result.files);
      });
  }

  private openViewDialog(request: WwellPlanningRequest): void {
    this.dialog.open(WwellRequestFormComponent, {
      data: { mode: 'view', request },
      panelClass: 'wwell-request-form-panel',
      maxWidth: '95vw',
      autoFocus: false,
      enterAnimationDuration: '0ms',
      exitAnimationDuration: '0ms',
    });
  }
}
