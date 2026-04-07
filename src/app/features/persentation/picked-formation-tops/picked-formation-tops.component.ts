import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  Injector,
  OnInit,
} from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridOptions, GridReadyEvent, themeQuartz } from 'ag-grid-community';
import { WellStore } from '../../../core/store/well.store';
import { PickedFormationTops } from '../../../core/models/well-details.model';

@Component({
  selector: 'app-picked-formation-tops',
  standalone: true,
  imports: [AgGridAngular],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './picked-formation-tops.component.html',
  styleUrl: './picked-formation-tops.component.scss',
})
export class PickedFormationTopsComponent implements OnInit {
  protected readonly store = inject(WellStore);
  private readonly injector = inject(Injector);
  private gridApi: GridApi<PickedFormationTops> | null = null;

  ngOnInit(): void {
    effect(() => {

      const rows = this.store.pickedFormations();
      const isLoaded = this.store.isLoaded();

      if (this.gridApi && isLoaded) {
        this.gridApi.setGridOption('rowData', rows);
      }
    }, { injector: this.injector });
  }

  onGridReady(event: GridReadyEvent<PickedFormationTops>): void {
    this.gridApi = event.api;
    if (this.store.isLoaded()) {
      this.gridApi.setGridOption('rowData', this.store.pickedFormations());
    }
  }

  readonly theme = themeQuartz.withParams({
    accentColor: '#2563eb',
    backgroundColor: '#ffffff',
    foregroundColor: '#1e3a8a',
    headerBackgroundColor: '#2563eb',
    headerTextColor: '#ffffff',
    headerFontSize: 13,
    headerFontWeight: 700,
    rowHoverColor: '#eff6ff',
    oddRowBackgroundColor: '#eff6ff',
    borderColor: 'transparent',
    borderRadius: 0,
    fontSize: 12,
    rowHeight: 36,
    headerHeight: 40,
    spacing: 2,
    fontFamily: 'inherit',
    cellHorizontalPaddingScale: 1.5,
  });

  readonly columnDefs: ColDef<PickedFormationTops>[] = [
    {
      field: 'formation', headerName: 'Formation', flex: 1, minWidth: 90,
      headerClass: 'header--center', cellClass: 'cell--center cell--formation',
    },
    {
      field: 'depth', headerName: 'Depth', flex: 1, minWidth: 80,
      headerClass: 'header--center', cellClass: 'cell--center cell--depth',
      valueFormatter: ({ value }) => value != null ? value.toLocaleString() : '—',
    },
    {
      field: 'remarks', headerName: 'Remarks', flex: 2, minWidth: 120,
      headerClass: 'header--center', cellClass: 'cell--center cell--remarks',
      valueGetter: (params) => params.data?.remarks?.toUpperCase() || '',
      tooltipField: 'remarks',
    },
  ];

  readonly gridOptions: GridOptions<PickedFormationTops> = {
    animateRows: true,
    suppressMovableColumns: true,
    suppressCellFocus: true,
    overlayNoRowsTemplate: '<span class="no-rows">No formations picked yet.</span>',
    defaultColDef: { sortable: true, resizable: false, suppressHeaderMenuButton: true },
  };
}