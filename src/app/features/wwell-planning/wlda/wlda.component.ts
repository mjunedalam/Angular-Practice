import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '@shared/components/notification/notification.service';
import { WldaFormValue, WldaRecord } from '@models/wwell-planning/wlda.model';
import { WldaStore } from './store/wlda.store';
import { WldaFormComponent } from './wlda-form/wlda-form.component';
import { WldaLetterComponent } from './wlda-letter/wlda-letter.component';
import { WLDA_REQUIRED_FIELDS, WLDA_STATUS_META } from './wlda.config';

@Component({
  selector: 'app-wlda',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatIconModule, WldaFormComponent, WldaLetterComponent],
  templateUrl: './wlda.component.html',
  styleUrl: './wlda.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WldaComponent {
  protected readonly store = inject(WldaStore);
  private readonly notify = inject(NotificationService);

  protected readonly searchTerm = signal('');
  protected readonly statusMeta = WLDA_STATUS_META;

  protected readonly rows = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.store.records();
    return this.store
      .records()
      .filter(r => [r.code, r.waterWellName, r.field, r.wellNumber].some(v => v.toLowerCase().includes(term)));
  });

  /** Names of required fields still blank on the open record. */
  protected readonly missing = computed(() => {
    const record = this.store.selected();
    if (!record) return [];
    return WLDA_REQUIRED_FIELDS.filter(key => String(record[key]).trim() === '');
  });

  protected readonly canCreate = computed(
    () => this.store.selected()?.status === 'draft' && this.missing().length === 0,
  );

  protected newDraft(): void {
    this.store.createDraft('');
  }

  protected select(record: WldaRecord): void {
    this.store.select(record.id);
  }

  protected deselect(): void {
    this.store.select(null);
  }

  protected patch(record: WldaRecord, value: Partial<WldaFormValue>): void {
    this.store.update(record.id, value);
  }

  protected createWlda(record: WldaRecord): void {
    if (!this.canCreate()) return;
    this.store.submit(record.id);
    this.notify.info(`${record.code} created.`);
  }

  protected trackById(_: number, record: WldaRecord): string {
    return record.id;
  }
}
