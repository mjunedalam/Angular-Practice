import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { WellStore } from 'src/app/core/store/well.store';
import { WellTestResult } from 'src/app/core/store/well.store';

@Component({
  selector: 'app-wwell-test-result',
  standalone: true,
  imports: [DecimalPipe, TitleCasePipe],
  templateUrl: './wwell-test-result.component.html',
  styleUrl: './wwell-test-result.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellTestResultComponent {
  protected readonly store = inject(WellStore);

  /** Which row is open in the dialog — null means dialog is closed */
  protected readonly selectedResult = signal<WellTestResult | null>(null);

  protected openDialog(result: WellTestResult): void {
    this.selectedResult.set(result);
  }

  protected closeDialog(): void {
    this.selectedResult.set(null);
  }

  protected stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }
}