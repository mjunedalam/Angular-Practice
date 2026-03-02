import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { WellName } from '../../../models/well-design/well-name.model';
import { SHARED_MODULES } from '../../../shared/shared.module';

@Component({
  selector: 'app-well-name-chips',
  standalone: true,
  imports: [...SHARED_MODULES, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './well-name-chips.component.html',
  styleUrl: './well-name-chips.component.scss',
})
export class WellNameChipsComponent {
  readonly wells = input.required<WellName[]>();
  readonly selectedEpANum = input<number | null>(null);
  readonly chipSelected = output<number>();

  protected trackByEpANum(_: number, w: WellName): number {
    return w.epANum;
  }
}
