/**
 * PersentationComponent — SMART component
 */
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { WellStore } from 'src/app/core/store/well.store';
import { WellBoreViewComponent } from './well-bore-view/well-bore-view.component';
import { DepthScaleComponent } from './depth-scale/depth-scale.component';
import { WellNameChipsComponent } from './well-name-chips/well-name-chips.component';
import { MiscPresWellDataComponent } from './misc-pres-well-data/misc-pres-well-data.component';
import { PickedFormationTopsComponent } from './picked-formation-tops/picked-formation-tops.component';
import { ActiveWwellMapComponent } from './active-wwell-map/active-wwell-map.component';
import { OffsetWwellsComponent } from './offset-wwells/offset-wwells.component';
import { WwellsLogsIndicatorsComponent } from './wwells-logs-indicators/wwells-logs-indicators.component';
import { WwellTestResultComponent } from './wwell-test-result/wwell-test-result.component';

@Component({
  selector: 'app-persentation',
  standalone: true,
  imports: [
    WellBoreViewComponent,
    DepthScaleComponent,
    WellNameChipsComponent,
    MiscPresWellDataComponent,
    PickedFormationTopsComponent,
    ActiveWwellMapComponent,
    OffsetWwellsComponent,
    WwellsLogsIndicatorsComponent,
    WwellTestResultComponent,
  ],
  templateUrl: './persentation.component.html',
  styleUrl: './persentation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersentationComponent implements OnInit {
  protected readonly store = inject(WellStore);

  ngOnInit(): void {
    this.store.loadWellNames();
  }
}