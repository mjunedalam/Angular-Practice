import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { WellboreGlyphKind } from './wwell-ir-wellbore-facts.util';

/** The small pictograms the panel's readout tiles use, so a thing looks the same wherever it is shown: a drop
 *  for the static water level, a pump (volute, impeller, motor, outlet pipe) for the pump setting, a guide
 *  shoe for the deepest casing shoe, an arrow down from a ground bar for total depth.
 *  They take their colour from the surrounding `color` and are decorative — the text beside them says what
 *  they are. The pump is wider than the rest (16 × 14 against 10 × 14) and is drawn with its outlet pipe on
 *  the centre line, so it hangs from a pin by that pipe. */
@Component({
  selector: 'app-wwell-ir-wellbore-glyph',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-kind]': 'kind()' },
  template: `
    <svg [attr.viewBox]="viewBox()" aria-hidden="true" focusable="false">
      @switch (kind()) {
        @case ('water') {
          <path d="M5 .5C5 .5 .8 5.6 .8 9a4.2 4.2 0 0 0 8.4 0C9.2 5.6 5 .5 5 .5Z" />
          <path class="shine" d="M2.9 9.4a2.3 2.3 0 0 0 1.7 2.2" />
        }
        @case ('pump') {
          <rect x="6.6" y=".9" width="2.8" height="3.2" />
          <rect x="5.9" y="0" width="4.2" height="1.1" rx=".3" />
          <circle cx="8" cy="8.6" r="4.6" />
          <rect x="12" y="7.4" width="2" height="2.4" />
          <rect x="13.6" y="6.9" width="1.4" height="3.4" rx=".3" />
          <rect x="3.6" y="7.7" width="1.6" height="1.8" />
          <rect x=".4" y="5.6" width="3.8" height="6" rx="1.1" />
          <circle class="shine" cx="8" cy="8.6" r="2.3" />
          <path class="shine" d="M1.6 7.2v3M2.9 7.2v3" />
        }
        @case ('shoe') {
          <path d="M2 1h6v6.2L6.4 13H3.6L2 7.2Z" />
          <path class="shine" d="M3.6 2.6v4" />
        }
        @case ('depth') {
          <rect x="1" y="1" width="8" height="1.6" rx=".5" />
          <rect x="4.2" y="3.4" width="1.6" height="4.6" />
          <path d="M5 13 1.5 7.8h7Z" />
        }
      }
    </svg>
  `,
  styles: `
    :host {
      display: block;
      width: 12px;
      height: 16.8px;
      line-height: 0;
    }

    :host([data-kind='pump']) {
      width: 19px;
      height: 16.6px;
    }

    svg {
      display: block;
      width: 100%;
      height: 100%;
      overflow: visible;
      fill: currentColor;
    }

    /* Detail lines cut into the shape: the surface the glyph sits on, so they read as gaps in it. */
    .shine {
      fill: none;
      stroke: var(--wp-surface-alt);
      stroke-width: 0.8;
      stroke-linecap: round;
      opacity: 0.75;
    }
  `,
})
export class WwellIrWellboreGlyphComponent {
  readonly kind = input.required<WellboreGlyphKind>();
  protected readonly viewBox = computed(() => (this.kind() === 'pump' ? '0 0 16 14' : '0 0 10 14'));
}
