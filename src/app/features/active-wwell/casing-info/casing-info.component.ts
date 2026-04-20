import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { WellStore } from '@store/active-wwell/active-wwell.store';

@Component({
  selector: 'app-casing-info',
  standalone: true,
  imports: [],
  templateUrl: './casing-info.component.html',
  styleUrl: './casing-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CasingInfoComponent {
  private readonly store = inject(WellStore);

  protected readonly data = this.store.casingInfo;
}
