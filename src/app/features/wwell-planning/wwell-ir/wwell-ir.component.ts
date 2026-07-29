import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CreateIntegratedRequirementPayload } from '@models/wwell-planning/wwell-planning.model';
import { WwellPlanningStore } from '../store/wwell-planning.store';
import { WWELL_IR_STATUS_META } from './wwell-ir.config';
import { WwellIrFormComponent } from './wwell-ir-form/wwell-ir-form.component';

const SNACKBAR_DURATION_MS = 3000;

@Component({
  selector: 'app-wwell-ir',
  standalone: true,
  imports: [DecimalPipe, FormsModule, MatButtonModule, MatIconModule],
  templateUrl: './wwell-ir.component.html',
  styleUrl: './wwell-ir.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellIrComponent implements OnInit {
  protected readonly store = inject(WwellPlanningStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly isLoading = this.store.integratedRequirementsLoading;
  protected readonly isCreating = this.store.creatingIntegratedRequirement;
  protected readonly loadError = this.store.integratedRequirementsError;

  protected readonly searchTerm = signal('');

  protected readonly rows = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const all = this.store.integratedRequirements();
    if (!term) return all;

    return all.filter(
      ir =>
        ir.code.toLowerCase().includes(term) ||
        ir.wellName.toLowerCase().includes(term) ||
        ir.requestId.toLowerCase().includes(term) ||
        ir.client.toLowerCase().includes(term),
    );
  });

  protected readonly statusMeta = WWELL_IR_STATUS_META;

  constructor() {
    effect(() => {
      const message = this.store.createIntegratedRequirementError();
      if (message) {
        this.snackBar.open(message, 'Dismiss', { duration: SNACKBAR_DURATION_MS });
      }
    });
  }

  ngOnInit(): void {
    this.store.loadIntegratedRequirements();
  }

  protected onSearchChange(term: string): void {
    this.searchTerm.set(term);
  }

  protected openNewIrDialog(): void {
    this.dialog
      .open<WwellIrFormComponent, unknown, CreateIntegratedRequirementPayload | undefined>(WwellIrFormComponent, {
        panelClass: 'wwell-ir-form-panel',
        maxWidth: '95vw',
        autoFocus: false,
      })
      .afterClosed()
      .subscribe(payload => {
        if (!payload) return;
        this.store.createIntegratedRequirement(payload);
      });
  }
}
