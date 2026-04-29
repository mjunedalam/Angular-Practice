import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActiveWwellStore } from '../store/active-wwell.store';

@Component({
  selector: 'app-formation-tops-and-casing',
  standalone: true,
  imports: [],
  templateUrl: './formation-tops-and-casing.component.html',
  styleUrl: './formation-tops-and-casing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormationTopsAndCasingComponent {
  private readonly store = inject(ActiveWwellStore);

  protected readonly data = this.store.formationInfo;
}
