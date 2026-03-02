import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DecimalPipe, NgIf } from '@angular/common';

import { MiscWellData } from '../../../core/stores/wwell-data/well.store';

@Component({
  selector: 'app-misc-pres-well-data',
  standalone: true,
  imports: [NgIf, DecimalPipe],
  templateUrl: './misc-pres-well-data.component.html',
  styleUrl: './misc-pres-well-data.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush // Optimized performance
})
export class MiscPresWellDataComponent {

  readonly data = input<MiscWellData | null>(null);


  // private readonly store = inject(WellStore);


  // readonly misc = this.store.miscWellData;


  // constructor() {



  //   this.store.loadWellNames();
  // }

}
