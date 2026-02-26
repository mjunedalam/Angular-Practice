import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MiscWellData } from '../../../core/store/well.store';
import { DecimalPipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-misc-pres-well-data',
  standalone: true,
 imports: [NgIf, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './misc-pres-well-data.component.html',
  styleUrl: './misc-pres-well-data.component.scss'
})
export class MiscPresWellDataComponent {
  readonly data = input<MiscWellData | null>(null);
}