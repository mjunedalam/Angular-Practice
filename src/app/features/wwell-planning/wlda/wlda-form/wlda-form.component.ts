import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, input, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MAX_UPLOAD_SIZE_LABEL, isUploadFileAllowed, toAcceptAttribute } from '@core/config/file-upload.config';
import { WldaAttachment, WldaDraft } from '@models/wwell-planning/wlda.model';
import { NotificationService } from '@shared/components/notification/notification.service';
import { WldaFieldErrors } from '../wlda.util';
import { WLDA_UTM_ZONES, WLDA_WELL_TYPES } from '../wlda.config';

type TextField =
  | 'waterWellName'
  | 'field'
  | 'wellNumber'
  | 'reservoir'
  | 'totalDepth'
  | 'svYutmCord'
  | 'svXutmCord'
  | 'ltrRmks'
  | 'distribution';

/**
 * The WLDA creation form. The pre-well plan a letter is filed under is matched from the typed Field and
 * Well Number (see findPlanForWell); edit mode locks everything the update procedure cannot change.
 */
@Component({
  selector: 'app-wlda-form',
  standalone: true,
  imports: [MatIconModule, MatSelectModule],
  templateUrl: './wlda-form.component.html',
  styleUrl: './wlda-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The select's option panel is portaled to <body>, so its styles have to be global.
  encapsulation: ViewEncapsulation.None,
})
export class WldaFormComponent {
  readonly draft = input.required<WldaDraft>();
  /** The values the draft started from; fields that differ are highlighted as unsaved edits. */
  readonly baseline = input<WldaDraft | null>(null);
  /** Validation messages keyed by field; each shows under its own field once that field is touched or filled. */
  readonly errors = input<WldaFieldErrors>({});
  readonly linkOptions = input<readonly { prewapSeq: number; label: string }[]>([]);
  readonly fieldOptions = input<readonly string[]>([]);
  readonly wellNumberOptions = input<readonly string[]>([]);
  readonly mode = input<'create' | 'edit'>('create');
  /** Stored files (minus removed ones) followed by pending picks, as the sheet shows them. */
  readonly attachments = input<readonly WldaAttachment[]>([]);
  readonly patch = output<Partial<WldaDraft>>();
  readonly linkWell = output<number | null>();

  private readonly notify = inject(NotificationService);

  protected readonly zones = WLDA_UTM_ZONES;
  protected readonly selectPanelClass = 'wf-select-panel';
  protected readonly attachAccept = toAcceptAttribute();
  protected readonly isCreate = computed(() => this.mode() === 'create');
  protected readonly locked = computed(() => this.mode() === 'edit');

  /** The configured types, plus the draft's own value when a plan supplied one outside the list. */
  protected readonly wellTypes = computed(() => {
    const current = this.draft().wellType;
    return current && !WLDA_WELL_TYPES.includes(current) ? [...WLDA_WELL_TYPES, current] : WLDA_WELL_TYPES;
  });

  /** True when `key` differs from the baseline — an unsaved edit, shown green like the IR editor. */
  protected changed(key: keyof WldaDraft): boolean {
    const base = this.baseline();
    if (!base) return false;
    const draft = this.draft();
    if (key === 'files') return draft.files.length > 0 || draft.removedKeys.length > 0;
    return draft[key] !== base[key];
  }

  private readonly touched = signal<ReadonlySet<keyof WldaDraft>>(new Set());

  /** Marks a field as visited (on blur / dropdown close) so its "required" message can appear. */
  protected touch(key: keyof WldaDraft): void {
    if (!this.touched().has(key)) this.touched.set(new Set([...this.touched(), key]));
  }

  /** The inline message for `key`: shown once the field was visited or already holds a value. */
  protected errorOf(key: keyof WldaDraft): string | null {
    const message = this.errors()[key];
    if (!message) return null;
    const value = this.draft()[key];
    const filled = typeof value === 'string' ? value.trim() !== '' : value !== null;
    return this.touched().has(key) || filled ? message : null;
  }

  protected isRequired(): boolean {
    return this.isCreate();
  }

  protected setText(key: TextField, event: Event): void {
    this.patch.emit({ [key]: (event.target as HTMLInputElement | HTMLTextAreaElement).value });
  }

  protected setLink(change: MatSelectChange): void {
    this.linkWell.emit(change.value === '' ? null : (change.value as number));
  }

  protected setWellType(change: MatSelectChange): void {
    this.patch.emit({ wellType: change.value as string });
  }

  protected setZone(change: MatSelectChange): void {
    this.patch.emit({ svUtmZn: change.value as string });
  }

  protected setCathodic(required: boolean): void {
    this.patch.emit({ cathodicProtection: required });
  }

  protected addFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selected = Array.from(input.files ?? []);
    input.value = '';
    // `accept` is only a picker hint, so the type and size are re-checked here.
    const rejected = selected.filter(file => !isUploadFileAllowed(file));
    if (rejected.length > 0) {
      this.notify.error(`Skipped (unsupported type or over ${MAX_UPLOAD_SIZE_LABEL}): ${rejected.map(file => file.name).join(', ')}`);
    }
    const accepted = selected.filter(file => isUploadFileAllowed(file));
    if (accepted.length > 0) this.patch.emit({ files: [...this.draft().files, ...accepted] });
  }

  protected removeAttachment(attachment: WldaAttachment): void {
    const draft = this.draft();
    if (attachment.key) {
      this.patch.emit({ removedKeys: [...draft.removedKeys, attachment.key] });
    } else {
      this.patch.emit({ files: draft.files.filter((_, index) => index !== attachment.pendingIndex) });
    }
  }
}
