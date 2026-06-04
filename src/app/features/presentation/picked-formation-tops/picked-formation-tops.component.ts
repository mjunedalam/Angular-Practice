import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions, RowClassParams, themeQuartz } from 'ag-grid-community';

import { PresentationStore } from '../store/presentation.store';
import { FormationInfoViewModel } from '@models/active-wwell/active-wwell-view.model';

@Component({
  selector: 'app-picked-formation-tops',
  standalone: true,
  imports: [AgGridAngular],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './picked-formation-tops.component.html',
  styleUrl: './picked-formation-tops.component.scss',
})
export class PickedFormationTopsComponent {
  protected readonly store = inject(PresentationStore);

  private readonly blankIfInvalid = ({ value }: { value: unknown }) =>
    value !== null && value !== undefined && value !== '' && isFinite(Number(value))
      ? String(value)
      : '';

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

  readonly columnDefs: ColDef<FormationInfoViewModel>[] = [
    { headerName: 'Formation', field: 'formation', tooltipField: 'formation', flex: 1.2, minWidth: 70 },
    { headerName: 'Prognosed', field: 'prognosed', tooltipField: 'prognosed', flex: 1, minWidth: 70, valueFormatter: this.blankIfInvalid },
    {
      headerName: 'Actual Depth (ft)', field: 'actualDepth', tooltipField: 'actualDepth', flex: 1.2, minWidth: 80,
      valueFormatter: this.blankIfInvalid,
    },
  ];

  readonly gridOptions: GridOptions<FormationInfoViewModel> = {
    animateRows: true,
    suppressMovableColumns: true,
    suppressCellFocus: true,
    domLayout: 'autoHeight',
    tooltipShowDelay: 300,
    defaultColDef: { sortable: true, resizable: true, suppressHeaderMenuButton: true },
    overlayNoRowsTemplate: '<span class="no-rows">No formation tops available.</span>',
    getRowStyle: (params: RowClassParams<FormationInfoViewModel>) =>
      params.data?.isDrlgOnly ? { color: '#16a34a', fontWeight: '600' } : undefined,
  };
}
