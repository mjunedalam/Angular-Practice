import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';

import { WellStore } from '../../../core/store/well.store';
import { WellNameChipsComponent } from '../well-name-chips/well-name-chips.component';
import { DepthScaleComponent } from '../depth-scale/depth-scale.component';
import { WellBoreViewComponent } from '../well-bore-view/well-bore-view.component';
import { MiscPresWellDataComponent } from '../misc-pres-well-data/misc-pres-well-data.component';
import { PickedFormationTopsComponent } from '../picked-formation-tops/picked-formation-tops.component';
import { OffsetWwellsComponent } from '../offset-wwells/offset-wwells.component';
import { ActiveWwellMapComponent } from '../active-wwell-map/active-wwell-map.component';

@Component({
  selector: 'app-persentation',
  standalone: true,
  imports: [
    WellNameChipsComponent, 
    DepthScaleComponent, 
    WellBoreViewComponent,
    MiscPresWellDataComponent,
    PickedFormationTopsComponent,
    OffsetWwellsComponent,
    ActiveWwellMapComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './presentation.component.html',
  styleUrl: './presentation.component.scss',
})
export class PersentationComponent implements OnInit {
  protected readonly store = inject(WellStore);

  ngOnInit(): void {
    this.store.loadWellNames();
  }

  protected onWellSelected(epANum: number): void {
    this.store.selectWell(epANum);
  }
}