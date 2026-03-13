/**
 * PersentationComponent — SMART component
 * ─────────────────────────────────────────────────────────────────────────────
 * Responsibilities:
 *   ✔ Bootstrap well data on init
 *   ✔ Expose store signals to template
 *   ✔ Orchestrate layout of dumb child components
 *
 * What it does NOT do:
 *   ✗ Pass data down as inputs to store-aware children
 *   ✗ Handle child events — children call store methods directly
 *   ✗ Contain any business logic
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