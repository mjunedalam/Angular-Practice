import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { trigger, transition, animate, style } from '@angular/animations';
import { DialogModule } from 'primeng/dialog';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { WellStore } from 'src/app/core/store/well.store';
import { WellTestResult } from 'src/app/core/store/well.store';

@Component({
  selector: 'app-wwell-test-result',
  standalone: true,
  imports: [DecimalPipe, TitleCasePipe, DialogModule, BadgeModule, TagModule],
  templateUrl: './wwell-test-result.component.html',
  styleUrl: './wwell-test-result.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('resultTabAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-8px)' }),
        animate('300ms ease', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ]),
  ],
})
export class WwellTestResultComponent {
  protected readonly store = inject(WellStore);

  protected readonly selectedResult = signal<WellTestResult | null>(null);
  protected readonly dialogVisible = signal(false);

  protected openDialog(result: WellTestResult): void {
    this.selectedResult.set(result);
    this.dialogVisible.set(true);
  }

  protected onDialogHide(): void {
    this.selectedResult.set(null);
    this.dialogVisible.set(false);
  }
}
