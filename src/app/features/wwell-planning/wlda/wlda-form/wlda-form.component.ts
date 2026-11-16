import { ChangeDetectionStrategy, Component, ViewEncapsulation, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { WldaFormValue, WldaRecord, WldaWellType } from '@models/wwell-planning/wlda.model';
import { WLDA_REQUIRED_FIELDS, WLDA_UTM_ZONES, WLDA_WELL_TYPES } from '../wlda.config';

type TextField = 'waterWellName' | 'field' | 'wellNumber' | 'reservoir' | 'totalDepth' | 'north' | 'east' | 'remarks' | 'distribution';

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
  readonly record = input.required<WldaRecord>();
  readonly patch = output<Partial<WldaFormValue>>();

  protected readonly wellTypes = WLDA_WELL_TYPES;
  protected readonly zones = WLDA_UTM_ZONES;
  protected readonly selectPanelClass = 'wf-select-panel';

  protected isRequired(key: keyof WldaFormValue): boolean {
    return WLDA_REQUIRED_FIELDS.includes(key);
  }

  protected setText(key: TextField, event: Event): void {
    this.patch.emit({ [key]: (event.target as HTMLInputElement | HTMLTextAreaElement).value });
  }

  protected setWellType(change: MatSelectChange): void {
    this.patch.emit({ wellType: change.value as WldaWellType | '' });
  }

  protected setZone(change: MatSelectChange): void {
    this.patch.emit({ zone: change.value as string });
  }

  protected setCathodic(required: boolean): void {
    this.patch.emit({ cathodicProtection: required });
  }

  protected addFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    const names = Array.from(input.files ?? [], file => file.name);
    input.value = '';
    if (names.length === 0) return;
    this.patch.emit({ attachments: [...this.record().attachments, ...names] });
  }

  protected removeFile(index: number): void {
    this.patch.emit({ attachments: this.record().attachments.filter((_, i) => i !== index) });
  }
}
