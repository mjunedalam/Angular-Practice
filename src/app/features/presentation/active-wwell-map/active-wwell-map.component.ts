import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { WellStore } from '../../../core/store/well.store';

@Component({
  selector: 'app-active-wwell-map',
  standalone: true,
  imports: [],
  templateUrl: './active-wwell-map.component.html',
  styleUrl: './active-wwell-map.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActiveWwellMapComponent {
  protected readonly store = inject(WellStore);
}
