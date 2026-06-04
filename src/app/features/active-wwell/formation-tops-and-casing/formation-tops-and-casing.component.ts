import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActiveWwellStore } from '../store/active-wwell.store';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions, RowClassParams, themeQuartz } from 'ag-grid-community';
import { FormationInfoViewModel } from '@models/active-wwell/active-wwell-view.model';


@Component({
  selector: 'app-formation-tops-and-casing',
  standalone: true,
  imports: [AgGridAngular],
  templateUrl: './formation-tops-and-casing.component.html',
  styleUrl: './formation-tops-and-casing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormationTopsAndCasingComponent {
  private readonly store = inject(ActiveWwellStore);

  protected readonly data = this.store.allFormationTops;

  private readonly blankIfInvalid = ({ value }: { value: unknown }) =>
    value !== null && value !== undefined && value !== '' && isFinite(Number(value)) ? String(value) : '';

  columnDefs: ColDef[] = [
    { headerName: 'Formation', field: 'formation', tooltipField: 'formation' },
    { headerName: 'Prognosed', field: 'prognosed', tooltipField: 'prognosed', valueFormatter: this.blankIfInvalid },
    { headerName: 'Actual Depth (ft)', field: 'actualDepth', tooltipField: 'actualDepth', valueFormatter: this.blankIfInvalid },
    { headerName: 'Difference', field: 'difference', tooltipField: 'difference', minWidth: 90, valueFormatter: this.blankIfInvalid },
    { headerName: 'Remarks', field: 'remarks', tooltipField: 'remarks', flex: 1 },
  ];

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

  defaultColDef: ColDef = {
    sortable: true,
    filter: false,
    resizable: true,
    minWidth: 120,
  };

  readonly gridOptions: GridOptions<FormationInfoViewModel> = {
    animateRows: true,
    suppressMovableColumns: true,
    suppressCellFocus: true,
    domLayout: 'autoHeight',
    tooltipShowDelay: 300,
    defaultColDef: this.defaultColDef,
    overlayNoRowsTemplate: '<span class="no-rows">No formation tops available.</span>',
    getRowStyle: (params: RowClassParams<FormationInfoViewModel>) =>
      params.data?.isDrlgOnly ? { color: '#16a34a', fontWeight: '600' } : undefined,
    onGridReady: (params) => params.api.sizeColumnsToFit(),
  };


}
