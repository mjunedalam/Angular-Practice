import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IntegratedRequirement } from '@models/wwell-planning/wwell-planning.model';
import { buildDetailRevealTimeline } from '../shared/dynamic-form/detail-reveal.animation';
import { playIfMotionAllowed } from '../shared/dynamic-form/gsap-motion.util';
import { WwellPlanningStore } from '../store/wwell-planning.store';
import { WwellIrDetailComponent } from './wwell-ir-detail/wwell-ir-detail.component';
import { WWELL_IR_STATUS_META } from './wwell-ir.config';

const SNACKBAR_DURATION_MS = 3000;

@Component({
  selector: 'app-wwell-ir',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatIconModule, WwellIrDetailComponent],
  templateUrl: './wwell-ir.component.html',
  styleUrl: './wwell-ir.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellIrComponent implements OnInit {
  protected readonly store = inject(WwellPlanningStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly isLoading = this.store.integratedRequirementsLoading;
  protected readonly loadError = this.store.integratedRequirementsError;
  protected readonly isSubmittingForReview = this.store.updatingIntegratedRequirementStatus;

  protected readonly searchTerm = signal('');
  protected readonly selectedId = signal<string | null>(null);

  protected readonly rows = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const all = this.store.integratedRequirements();
    if (!term) return all;

    return all.filter(
      ir =>
        ir.code.toLowerCase().includes(term) ||
        ir.requestReference.wellName.toLowerCase().includes(term) ||
        (ir.requestReference.linkedRequestId ?? '').toLowerCase().includes(term) ||
        ir.requestReference.client.toLowerCase().includes(term),
    );
  });

  // Deliberately looks up the *unfiltered* store list (not `rows()`) so narrowing the search
  // never drops the current selection just because it fell outside the filtered results.
  protected readonly selectedIr = computed<IntegratedRequirement | null>(
    () => this.store.integratedRequirements().find(ir => ir.id === this.selectedId()) ?? null,
  );

  protected readonly statusMeta = WWELL_IR_STATUS_META;

  @ViewChild('detailHost') private readonly detailHost?: ElementRef<HTMLElement>;
  private previousSelectedId: string | null = null;

  constructor() {
    effect(() => {
      const message = this.store.createIntegratedRequirementError();
      if (message) {
        this.snackBar.open(message, 'Dismiss', { duration: SNACKBAR_DURATION_MS });
      }
    });

    effect(() => {
      const message = this.store.updateIntegratedRequirementStatusError();
      if (message) {
        this.snackBar.open(message, 'Dismiss', { duration: SNACKBAR_DURATION_MS });
      }
    });

    // Default to the first record once the list loads — mirrors the reference app, which
    // always has something selected in the detail pane rather than starting on an empty state.
    effect(() => {
      const all = this.store.integratedRequirements();
      if (all.length > 0 && this.selectedId() === null) {
        this.selectedId.set(all[0].id);
      }
    });

    effect(() => {
      const id = this.selectedId();
      if (id === null || id === this.previousSelectedId) return;

      const host = this.detailHost?.nativeElement;
      if (host) playIfMotionAllowed(buildDetailRevealTimeline(host));
      this.previousSelectedId = id;
    });
  }

  ngOnInit(): void {
    this.store.loadIntegratedRequirements();
  }

  protected onSearchChange(term: string): void {
    this.searchTerm.set(term);
  }

  protected selectIr(id: string): void {
    this.selectedId.set(id);
  }

  protected openNewIrPage(): void {
    this.router.navigate(['new'], { relativeTo: this.route });
  }

  protected submitForReview(ir: IntegratedRequirement): void {
    this.store.submitIntegratedRequirementForReview(ir);
  }
}
