import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';

import { WellStore } from '../../../core/store/well.store';
import { WellNameChipsComponent } from '../well-name-chips/well-name-chips.component';
import { DepthScaleComponent } from '../depth-scale/depth-scale.component';
import { WellBoreViewComponent } from '../well-bore-view/well-bore-view.component';

@Component({
  selector: 'app-presentation',
  standalone: true,
  imports: [WellNameChipsComponent, DepthScaleComponent, WellBoreViewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './presentation.component.html',
  styleUrl: './presentation.component.scss',
})
export class PresentationComponent implements OnInit {
  protected readonly store = inject(WellStore);

  ngOnInit(): void {
    this.store.loadWellNames();
  }

  protected onWellSelected(epANum: number): void {
    this.store.selectWell(epANum);
  }
}
