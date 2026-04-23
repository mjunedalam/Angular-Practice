import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DrillingDataStore } from '@store/drilling-data/drilling-data.store';

@Component({
  selector: 'app-casing-info',
  standalone: true,
  imports: [],
  templateUrl: './casing-info.component.html',
  styleUrl: './casing-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CasingInfoComponent {
  private readonly store = inject(DrillingDataStore);

  protected readonly data = this.store.casingInfo;
}
