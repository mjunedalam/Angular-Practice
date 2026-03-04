import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { WellName } from 'src/app/core/models/well-name.model';


@Component({
  selector: 'app-well-name-chips',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './well-name-chips.component.html',
  styleUrl: './well-name-chips.component.scss',
})
export class WellNameChipsComponent {
  readonly wells          = input.required<WellName[]>();
  readonly selectedEpANum = input<number | null>(null);
  readonly hasPrevPage    = input<boolean>(false);
  readonly hasNextPage    = input<boolean>(false);
  readonly currentPage    = input<number>(0);
  readonly totalPages     = input<number>(1);

  readonly chipSelected = output<number>();
  readonly prevPage     = output<void>();
  readonly nextPage     = output<void>();

  protected readonly pageLabel = computed(
    () => `${this.currentPage() + 1} / ${this.totalPages()}`
  );

  protected trackByEpANum(_: number, w: WellName): number {
    return w.epANum;
  }
}