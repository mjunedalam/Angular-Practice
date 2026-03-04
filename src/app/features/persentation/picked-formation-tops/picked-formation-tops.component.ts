import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PickedFormationTops } from 'src/app/core/store/well.store';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-picked-formation-tops',
  standalone: true,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './picked-formation-tops.component.html',
  styleUrl: './picked-formation-tops.component.scss'
})
export class PickedFormationTopsComponent {
  readonly tops = input.required<PickedFormationTops[]>();
}