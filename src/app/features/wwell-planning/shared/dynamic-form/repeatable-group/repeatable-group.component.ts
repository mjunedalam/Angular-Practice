import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  QueryList,
  ViewChildren,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DynamicFieldComponent, WwellDynamicFieldMode } from '../dynamic-field/dynamic-field.component';
import { playIfMotionAllowed } from '../gsap-motion.util';
import { addRepeatableRow } from '../wwell-dynamic-form.builder';
import { WwellRepeatableRowConfig } from '../wwell-dynamic-form.types';
import { buildRowEnterTimeline, buildRowExitTimeline } from './repeatable-row.animation';

@Component({
  selector: 'app-repeatable-group',
  standalone: true,
  imports: [DynamicFieldComponent, MatButtonModule, MatIconModule],
  templateUrl: './repeatable-group.component.html',
  styleUrl: './repeatable-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RepeatableGroupComponent {
  private readonly fb = inject(FormBuilder);

  readonly config = input.required<WwellRepeatableRowConfig>();
  readonly formArray = input.required<FormArray>();
  readonly mode = input<WwellDynamicFieldMode>('edit');
  readonly selectPanelClass = input('');

  @ViewChildren('rowHost') private readonly rowHosts?: QueryList<ElementRef<HTMLElement>>;

  /** Bumped only on user-triggered `addRow()` so the effect below can play an entrance animation for it. */
  private readonly addedRowTick = signal(0);

  constructor() {
    effect(() => {
      const tick = this.addedRowTick();
      if (tick === 0) return;
      const last = this.rowHosts?.last;
      if (last) playIfMotionAllowed(buildRowEnterTimeline(last.nativeElement));
    });
  }

  protected rows(): FormGroup[] {
    return this.formArray().controls as FormGroup[];
  }

  protected fieldControl(row: FormGroup, key: string): FormControl {
    return row.get(key) as FormControl;
  }

  protected addRow(): void {
    addRepeatableRow(this.formArray(), this.config().rowFields, this.fb);
    this.addedRowTick.update(tick => tick + 1);
  }

  protected removeRow(index: number): void {
    const host = this.rowHosts?.get(index);
    if (!host) {
      this.formArray().removeAt(index);
      return;
    }

    playIfMotionAllowed(buildRowExitTimeline(host.nativeElement, () => this.formArray().removeAt(index)));
  }
}
