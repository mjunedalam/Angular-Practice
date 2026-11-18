import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';
import { WwellCollapseAnimateDirective } from '../../shared/wwell-collapse-animate/wwell-collapse-animate.directive';
import {
  EMPTY_VALUE,
  buildProgramCompletionRows,
  buildProgramDevRows,
  buildProgramTreatmentRows,
} from '../wwell-ir-editor/wwell-ir-detail-rows.util';
import { WwellIrKvValueComponent } from '../wwell-ir-kv-value/wwell-ir-kv-value.component';

/** A KV value as its instructions, one per line — empty when nothing was entered. */
function splitSteps(value: string): readonly string[] {
  return value
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && line !== EMPTY_VALUE);
}

function hasValue(value: string): boolean {
  return !!value.trim() && value.trim() !== EMPTY_VALUE;
}

/** Read-only Program Details, shared by the editor's General step and the IR view's Details page.
 *
 *  Three blocks — Completion (captioned), Treatment and Pumping Test (set apart by a rule); a block with nothing
 *  to show is left out. In each, short values (type, sizes) are a spec strip across the top and long-form ones (picked
 *  instructions, remarks) are rows of one aligned accordion list: label on the left, then the first instruction as a
 *  one-line preview (or, opened, every instruction as a numbered step), then a chevron. Rows with nothing entered are
 *  hidden, except Flow Test and Pumping Test. The first card (Completion Remarks) starts open. The host can fold/unfold everything through
 *  `toggleAll()` / `allOpen()` (the editor's section-head button does). */
@Component({
  selector: 'app-wwell-ir-program-details',
  standalone: true,
  imports: [MatIconModule, WwellCollapseAnimateDirective, WwellIrKvValueComponent],
  templateUrl: './wwell-ir-program-details.component.html',
  styleUrl: './wwell-ir-program-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellIrProgramDetailsComponent {
  /** Optional so a host that reads `allOpen()` earlier in its own template than this element (the editor's section-head
   *  button) can't hit a required-input error before the first binding — until `ir` arrives there is simply nothing to show. */
  readonly ir = input<IntegratedRequirement | null>(null);

  /** Labels of the cards currently expanded. */
  protected readonly openCards = signal<ReadonlySet<string>>(new Set(['Completion Remarks']));

  protected readonly groups = computed(() => {
    const ir = this.ir();
    if (!ir) return [];
    return [
      { title: 'Completion', showTitle: true, rows: buildProgramCompletionRows(ir) },
      { title: 'Treatment', showTitle: false, rows: buildProgramTreatmentRows(ir) },
      { title: 'Pumping Test', showTitle: false, rows: buildProgramDevRows(ir) },
    ]
      .map(({ title, showTitle, rows }) => ({
        title,
        showTitle,
        // Nothing entered means nothing shown — a blank spec cell or an empty row is noise. Only rows flagged `alwaysShow`
        // (Flow Test, Pumping Test) stay listed, as "Not specified".
        specs: rows.filter(row => !row.options && !row.wide && hasValue(row.value)),
        cards: rows
          .filter(row => row.options || row.wide)
          .map(row => ({ row, steps: splitSteps(row.value) }))
          .filter(card => card.steps.length || card.row.alwaysShow),
      }))
      .filter(group => group.specs.length || group.cards.length);
  });

  /** Rows that have something to fold — a row with one instruction (or none) just shows it, so it has no toggle. */
  private readonly expandableCards = computed(() =>
    this.groups().flatMap(group => group.cards.filter(card => card.steps.length > 1).map(card => card.row.label)),
  );

  /** Every foldable card is open. */
  readonly allOpen = computed(() => {
    const labels = this.expandableCards();
    const open = this.openCards();
    return labels.length > 0 && labels.every(label => open.has(label));
  });

  toggleAll(): void {
    this.openCards.set(this.allOpen() ? new Set() : new Set(this.expandableCards()));
  }

  protected toggleCard(label: string): void {
    this.openCards.update(open => {
      const next = new Set(open);
      if (!next.delete(label)) next.add(label);
      return next;
    });
  }
}
