import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { WellProfileStore } from './well-profile.store';
import { intervalX } from './well-profile.geometry';

@Component({
  selector: 'app-well-profile-intervals', standalone: true, imports: [DecimalPipe],
  templateUrl: './well-profile-intervals.component.html', styleUrl: './well-profile-svg.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WellProfileIntervalsComponent {
  readonly large = input(false);
  readonly store = inject(WellProfileStore);
  readonly strings = this.store.strings;
  readonly formations = this.store.formations;
  readonly ticks = computed(() => [0, .25, .5, .75, 1].map(n => n * this.store.totalDepth()));
  readonly x = (depth: number) => intervalX(depth, this.store.totalDepth());
  readonly height = computed(() => this.rowY(this.strings().length)+100);
  rowY(index: number): number { return (this.large() ? 76 : 40) + index * (this.large() ? 65 : 23); }
}
