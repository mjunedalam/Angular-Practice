import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, input, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {
  IntegratedRequirementCasingRow,
  IntegratedRequirementFormationTop,
} from '@models/wwell-planning/wwell-planning.model';
import { renderWwellIrDesignPreview } from './wwell-ir-design-preview.renderer';

/**
 * Engineering-sketch style well-bore schematic — shared between the IR detail view and the IR
 * new-page review step (single source of truth, fed purely by the IR's casing/formation-tops
 * form data).
 *
 * Rendering mirrors `presentation/well-bore-view`'s renderer pattern: the SVG is built
 * imperatively with D3 selections (`wwell-ir-design-preview.renderer.ts`) inside an Angular
 * `effect()`, driven off a `viewChild<ElementRef<SVGSVGElement>>` — not Angular template
 * bindings. The renderer measures its own rendered output with `getBBox()` and refits the SVG's
 * viewBox to it on every draw, so the diagram can never render outside its own viewBox regardless
 * of casing count, depth, or label length.
 */
@Component({
  selector: 'app-wwell-ir-design-preview',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './wwell-ir-design-preview.component.html',
  styleUrl: './wwell-ir-design-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellIrDesignPreviewComponent {
  private readonly dialog = inject(MatDialog);

  readonly formationTops = input.required<readonly IntegratedRequirementFormationTop[]>();
  readonly casing = input.required<readonly IntegratedRequirementCasingRow[]>();
  readonly surfaceElevationFtAsl = input<number | null>(null);
  readonly targetDepthFt = input<number>(0);
  readonly wellName = input<string | null>(null);
  readonly wellCode = input<string | null>(null);
  readonly preparedDate = input<string | null>(null);
  // Both suppressed by the "open larger view" dialog itself, which renders this same component
  // full-size with its own chrome (title bar + well name) — otherwise the modal would show a
  // redundant expand button and a duplicate well-name header.
  readonly showExpand = input(true);
  readonly showHeader = input(true);

  private readonly svgRef = viewChild<ElementRef<SVGSVGElement>>('canvas');

  protected readonly hasWellboreData = computed(() => this.casing().length > 0 || this.formationTops().length > 0);

  constructor() {
    effect(() => {
      const svg = this.svgRef();
      const formationTops = this.formationTops();
      const casing = this.casing();
      const surfaceElevationFtAsl = this.surfaceElevationFtAsl();
      const targetDepthFt = this.targetDepthFt();
      if (!svg?.nativeElement) return;

      renderWwellIrDesignPreview(svg.nativeElement, { formationTops, casing, surfaceElevationFtAsl, targetDepthFt });
    });
  }

  // Dynamically imported so this component and its dialog counterpart (which renders this same
  // component again, full-size) don't statically import each other.
  protected async openInModal(): Promise<void> {
    const { WwellIrDesignPreviewDialogComponent } = await import('./wwell-ir-design-preview-dialog.component');
    this.dialog.open(WwellIrDesignPreviewDialogComponent, {
      data: {
        formationTops: this.formationTops,
        casing: this.casing,
        surfaceElevationFtAsl: this.surfaceElevationFtAsl,
        targetDepthFt: this.targetDepthFt,
        wellName: this.wellName,
        wellCode: this.wellCode,
        preparedDate: this.preparedDate,
      },
      width: 'min(96vw, 1100px)',
      height: '90vh',
      maxWidth: '98vw',
      maxHeight: '98vh',
      panelClass: 'wwell-ir-design-preview-dialog-panel',
      autoFocus: false,
      enterAnimationDuration: '200ms',
    });
  }
}
