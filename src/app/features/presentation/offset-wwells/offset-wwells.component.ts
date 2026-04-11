/**
 * OffsetWwellsComponent — SMART
 * Reads store.offsetWells() directly.
 * No @Input needed.
 */
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { WellStore } from 'src/app/core/store/well.store';

@Component({
  selector: 'app-offset-wwells',
  standalone: true,
  imports: [DecimalPipe, AccordionModule, BadgeModule, TagModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './offset-wwells.component.html',
  styleUrl: './offset-wwells.component.scss',
})
export class OffsetWwellsComponent {
  protected readonly store = inject(WellStore);
  protected readonly activeValue = signal<string>('0');

  protected onValueChange(value: string | number | string[] | number[]): void {
    if (Array.isArray(value)) {
      this.activeValue.set(String(value[0] ?? '0'));
    } else {
      this.activeValue.set(String(value));
    }
  }
}