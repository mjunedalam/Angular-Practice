import { ChangeDetectionStrategy, Component, effect, inject, Injector, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WellStore } from 'src/app/core/store/well.store';
import { formatDateForInput, parseDateFromInput } from 'src/utils/date.util';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
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
import { PresentationSkeletonComponent } from './presentation-skeleton/presentation-skeleton.component';

const LEFT_DEFAULT = 340; const LEFT_MIN = 220; const LEFT_MAX = 520;
const RIGHT_DEFAULT = 360; const RIGHT_MIN = 240; const RIGHT_MAX = 560;

@Component({
  selector: 'app-presentation',
  standalone: true,
  imports: [
    DialogModule,
    MessageModule,
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
    PresentationSkeletonComponent,
  ],
  templateUrl: './presentation.component.html',
  styleUrl: './presentation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PresentationComponent implements OnInit {
  protected readonly store = inject(WellStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);

  /** false = fixed three-column (default), true = free draggable modal */
  protected readonly draggableMode = signal(false);

  protected readonly leftWidth = signal(LEFT_DEFAULT);
  protected readonly rightWidth = signal(RIGHT_DEFAULT);

  ngOnInit(): void {
    this.store.loadWellNames();

    const params = this.route.snapshot.queryParamMap;
    const rawEpANum = params.get('epANum');
    const rawDate = params.get('date');

    if (rawEpANum) {
      const epANum = parseInt(rawEpANum, 10);
      const date = rawDate ? parseDateFromInput(rawDate) : this.store.selectedDate();
      this.store.selectWell({ epANum, date });
    }

    effect(() => {
      const epANum = this.store.selectedEpANum();
      const date = this.store.selectedDate();
      if (epANum == null) return;
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { epANum, date: formatDateForInput(date) },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }, { injector: this.injector });
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
