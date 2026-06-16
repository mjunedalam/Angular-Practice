import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActiveWwellStore } from '../store/active-wwell.store';

@Component({
  selector: 'app-database-info',
  standalone: true,
  imports: [DecimalPipe, NgClass, FormsModule],
  templateUrl: './database-info.component.html',
  styleUrl: './database-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatabaseInfoComponent {
  private readonly store = inject(ActiveWwellStore);

  protected readonly data = this.store.databaseInfo;
  protected readonly actualRm  = computed(() => this.store.selectedWell()?.actualRm  ?? null);
  protected readonly kpiRm     = computed(() => this.store.selectedWell()?.kpiRm     ?? null);
  protected readonly rigMoveDays = computed(() => this.store.selectedWell()?.rigMoveDays ?? null);

  protected readonly depthSectionLabel = signal('Depth & Formation');
  protected readonly isEditingDepthLabel = signal(false);

  protected startEditDepthLabel(): void {
    this.isEditingDepthLabel.set(true);
  }

  protected commitDepthLabel(value: string): void {
    const trimmed = value.trim();
    if (trimmed) this.depthSectionLabel.set(trimmed);
    this.isEditingDepthLabel.set(false);
  }

  protected rigMoveTone(value: number | null): 'positive' | 'negative' | 'neutral' {
    if (value == null) return 'neutral';
    return value < 0 ? 'positive' : 'negative';
  }
}
