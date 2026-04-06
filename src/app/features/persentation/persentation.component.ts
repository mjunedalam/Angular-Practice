import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { WellStore } from 'src/app/core/store/well.store';
import { ResizeDividerComponent } from '../../shared/components/resize-divider/resize-divider.component';
import { WellBoreViewComponent } from './well-bore-view/well-bore-view.component';
import { DepthScaleComponent } from './depth-scale/depth-scale.component';
import { WellNameChipsComponent } from './well-name-chips/well-name-chips.component';
import { MiscPresWellDataComponent } from './misc-pres-well-data/misc-pres-well-data.component';
import { PickedFormationTopsComponent } from './picked-formation-tops/picked-formation-tops.component';
import { ActiveWwellMapComponent } from './active-wwell-map/active-wwell-map.component';
import { OffsetWwellsComponent } from './offset-wwells/offset-wwells.component';
import { WwellsLogsIndicatorsComponent } from './wwells-logs-indicators/wwells-logs-indicators.component';
import { WwellTestResultComponent } from './wwell-test-result/wwell-test-result.component';

const LEFT_DEFAULT = 280; const LEFT_MIN = 180; const LEFT_MAX = 520;
const RIGHT_DEFAULT = 360; const RIGHT_MIN = 240; const RIGHT_MAX = 560;

@Component({
  selector: 'app-persentation',
  standalone: true,
  imports: [

    ResizeDividerComponent,
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

  /** false = fixed three-column (default), true = free draggable canvas */
  protected readonly draggableMode = signal(false);

  protected readonly leftWidth = signal(LEFT_DEFAULT);
  protected readonly rightWidth = signal(RIGHT_DEFAULT);

  ngOnInit(): void {
    this.store.loadWellNames();
  }

  protected toggleDraggable(): void {
    this.draggableMode.update(v => !v);
  }

  protected onLeftDrag(delta: number): void {
    this.leftWidth.update(w => Math.min(LEFT_MAX, Math.max(LEFT_MIN, w + delta)));
  }

  protected onRightDrag(delta: number): void {
    this.rightWidth.update(w => Math.min(RIGHT_MAX, Math.max(RIGHT_MIN, w - delta)));
  }
}