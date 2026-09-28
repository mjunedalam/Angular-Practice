import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { WellProfileStore } from './well-profile.store';
import { depthY, projectStrings } from './well-profile.geometry';

@Component({
  selector: 'app-well-profile-diagram', standalone: true, imports: [DecimalPipe],
  templateUrl: './well-profile-diagram.component.html',
  styleUrl: './well-profile-svg.scss', changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WellProfileDiagramComponent {
  readonly store = inject(WellProfileStore);
  readonly y = (depth: number) => depthY(depth, this.store.totalDepth());
  readonly formations = this.store.formations;
  readonly ticks = computed(() => Array.from({ length: 11 }, (_, i) => this.store.totalDepth() * i / 10));
  readonly strings = computed(() => projectStrings(this.store.strings(), this.store.spread(), this.store.totalDepth()));
  readonly drawOrder = computed(() => [...this.strings()].reverse());
  readonly coreX = computed(() => 380 + 270 * this.store.spread());
  readonly labelsOpacity = computed(() => Math.max(0, 1 - this.store.spread() * 2));
  readonly explodedOpacity = computed(() => Math.max(0, this.store.spread() * 2 - 1));
  readonly pumpSlots = [4, 7, 10];
}
