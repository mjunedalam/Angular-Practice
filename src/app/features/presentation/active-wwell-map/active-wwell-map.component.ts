import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DrillingDataStore } from '@store/drilling-data/drilling-data.store';

@Component({
  selector: 'app-active-wwell-map',
  standalone: true,
  imports: [],
  templateUrl: './active-wwell-map.component.html',
  styleUrl: './active-wwell-map.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActiveWwellMapComponent {
  protected readonly store = inject(DrillingDataStore);
}
