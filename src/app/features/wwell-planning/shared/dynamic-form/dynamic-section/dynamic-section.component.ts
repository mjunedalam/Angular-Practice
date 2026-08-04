import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  QueryList,
  ViewChildren,
  computed,
  input,
} from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DynamicFieldComponent, WwellDynamicFieldMode } from '../dynamic-field/dynamic-field.component';
import { playIfMotionAllowed } from '../gsap-motion.util';
import { RepeatableGroupComponent } from '../repeatable-group/repeatable-group.component';
import { defaultValueFor } from '../wwell-dynamic-form.builder';
import { WwellFieldConfig, WwellFormSectionConfig } from '../wwell-dynamic-form.types';
import {
  buildConditionalFieldEnterTimeline,
  buildConditionalFieldExitTimeline,
  setConditionalFieldVisibility,
} from './conditional-field.animation';

@Component({
  selector: 'app-dynamic-section',
  standalone: true,
  imports: [DynamicFieldComponent, RepeatableGroupComponent],
  templateUrl: './dynamic-section.component.html',
  styleUrl: './dynamic-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicSectionComponent implements AfterViewInit, OnDestroy {
  readonly section = input.required<WwellFormSectionConfig>();
  readonly control = input.required<AbstractControl>();
  readonly mode = input<WwellDynamicFieldMode>('edit');
  readonly selectPanelClass = input('');

  @ViewChildren('fieldHost') private readonly fieldHosts?: QueryList<ElementRef<HTMLElement>>;

  /** Only fields with `visibleWhen` grow a `#fieldHost` wrapper — this stays index-aligned with that query list. */
  protected readonly conditionalFields = computed(() => (this.section().fields ?? []).filter(field => field.visibleWhen));

  /** Tracks last-applied visibility per field key so we only animate on an actual flip, not every keystroke. */
  private readonly lastVisibility = new Map<string, boolean>();
  private valueChangesSubscription?: Subscription;

  ngAfterViewInit(): void {
    this.syncConditionalFields();
    this.valueChangesSubscription = this.control().valueChanges.subscribe(() => this.syncConditionalFields());
  }

  ngOnDestroy(): void {
    this.valueChangesSubscription?.unsubscribe();
  }

  protected fieldControl(key: string): FormControl {
    return (this.control() as FormGroup).get(key) as FormControl;
  }

  protected asFormArray(): FormArray {
    return this.control() as FormArray;
  }

  private syncConditionalFields(): void {
    this.conditionalFields().forEach((field, index) => {
      const host = this.fieldHosts?.get(index)?.nativeElement;
      if (host) this.applyFieldVisibility(field, host);
    });
  }

  private applyFieldVisibility(field: WwellFieldConfig, host: HTMLElement): void {
    const isVisible = this.isFieldVisible(field);
    const seenBefore = this.lastVisibility.has(field.key);
    const wasVisible = this.lastVisibility.get(field.key);
    this.lastVisibility.set(field.key, isVisible);

    if (!seenBefore) {
      setConditionalFieldVisibility(host, isVisible);
      this.syncControlEnabled(field, isVisible);
      return;
    }
    if (isVisible === wasVisible) return;

    if (isVisible) {
      this.syncControlEnabled(field, true);
      playIfMotionAllowed(buildConditionalFieldEnterTimeline(host));
    } else {
      playIfMotionAllowed(buildConditionalFieldExitTimeline(host, () => this.syncControlEnabled(field, false)));
    }
  }

  private isFieldVisible(field: WwellFieldConfig): boolean {
    if (!field.visibleWhen) return true;
    const sibling = (this.control() as FormGroup).get(field.visibleWhen.field);
    return sibling?.value === field.visibleWhen.equals;
  }

  /** Hidden fields are disabled (excluded from validity/`.value`) and reset so a stale value from the other mode never submits. */
  private syncControlEnabled(field: WwellFieldConfig, isVisible: boolean): void {
    const control = this.fieldControl(field.key);
    if (isVisible) {
      if (control.disabled) control.enable({ emitEvent: false });
      return;
    }
    if (control.enabled) {
      control.reset(defaultValueFor(field), { emitEvent: false });
      control.disable({ emitEvent: false });
    }
  }
}
