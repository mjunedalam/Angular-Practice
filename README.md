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
import { PickedFormationTops, WellStore } from '../../core/stores/wwell-data/well.store';

@Component({
  selector: 'app-picked-formation-tops',
  standalone: true,
  imports: [AgGridAngular],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './picked-formation-tops.component.html',
  styleUrl: './picked-formation-tops.component.scss',
})
export class PickedFormationTopsComponent implements OnInit {
  private readonly store    = inject(WellStore);
  private readonly injector = inject(Injector);
  private gridApi: GridApi<PickedFormationTops> | null = null;

  ngOnInit(): void {
    effect(() => {
      // ⚠️ CRITICAL: read ALL signals BEFORE any if/guard.
      // Angular effect() only tracks signals that are read during execution.
      // If pickedFormations() is inside an if-block that short-circuits,
      // Angular never registers it as a dependency → effect never re-runs.
      const rows     = this.store.pickedFormations(); // always read — always tracked
      const isLoaded = this.store.isLoaded();         // always read — always tracked

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
    accentColor:           '#1a8fc1',
    backgroundColor:       '#e8f6fb',
    foregroundColor:       '#0d3a6e',
    headerBackgroundColor: '#1565c0',
    headerTextColor:       '#ffffff',
    headerFontSize:        12,
    headerFontWeight:      700,
    rowHoverColor:         'rgba(0,150,200,0.12)',
    oddRowBackgroundColor: '#d0eef8',
    borderColor:           '#a8d4e8',
    borderRadius:          0,
    fontSize:              12,
    rowHeight:             32,
    headerHeight:          36,
    spacing:               4,
    fontFamily:            'inherit',
    cellHorizontalPaddingScale: 1.2,
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
