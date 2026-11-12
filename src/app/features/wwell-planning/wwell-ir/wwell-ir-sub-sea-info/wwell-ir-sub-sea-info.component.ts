import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { explainSubSea } from '../wwell-ir-form/wwell-ir-sub-sea.util';

/** The small (i) beside a Sub-sea figure in the read-only views: hover or focus it to see the formula with this row's numbers. */
@Component({
  selector: 'app-wwell-ir-sub-sea-info',
  standalone: true,
  imports: [MatIconModule, MatTooltipModule],
  template: `
    <button
      type="button"
      class="ssi"
      aria-label="How Sub-sea is calculated"
      [matTooltip]="text()"
      matTooltipClass="ir-attachment-tooltip dyf-derived-tooltip"
      matTooltipPosition="above"
      [matTooltipShowDelay]="0"
    >
      <mat-icon>info_outline</mat-icon>
    </button>
  `,
  styles: `
    :host {
      display: inline-flex;
      vertical-align: middle;
    }

    .ssi {
      display: inline-flex;
      align-items: center;
      padding: 0 0 0 0.3rem;
      color: var(--wp-muted, currentColor);
      opacity: 0.7;
      background: transparent;
      border: 0;
      cursor: help;
      transition: opacity 150ms ease, color 150ms ease;
    }

    .ssi:hover,
    .ssi:focus-visible {
      color: var(--wp-accent, currentColor);
      opacity: 1;
    }

    mat-icon {
      width: 16px;
      height: 16px;
      font-size: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellIrSubSeaInfoComponent {
  readonly elevation = input<number | null | undefined>(null);
  readonly depth = input<number | null | undefined>(null);

  protected readonly text = computed(() => explainSubSea(this.elevation(), this.depth()));
}
