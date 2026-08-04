import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  IntegratedRequirementCasingRow,
  IntegratedRequirementFormationTop,
} from '@models/wwell-planning/wwell-planning.model';
import { buildCasingPath, computeCasingHalfWidth, createDepthScale } from '@shared/utils/wellbore-math.util';

interface CasingShape {
  readonly type: string;
  readonly sizeIn: string;
  readonly remarks: string | null;
  readonly depthFtBgl: number;
  readonly path: string;
  readonly fill: string;
  readonly labelY: number;
}

interface FormationLine {
  readonly name: string;
  readonly depthFt: number;
  readonly y: number;
}

const VIEW_WIDTH = 260;
const DRAWING_HEIGHT = 340;
const TOP_MARGIN = 24;
const BOTTOM_MARGIN = 20;
const BASE_HALF_WIDTH = 12;
const HALF_WIDTH_INCREMENT = 16;
const SHOE_CURVE_OFFSET = 10;
const CENTER_X = VIEW_WIDTH / 2;
// Darkest (deepest/narrowest, e.g. Production) first, lightest (shallowest/widest, e.g. Conductor) last.
const CASING_FILL_PALETTE: readonly string[] = ['#1d4ed8', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

/**
 * Read-only well-bore schematic for the IR detail view. Deliberately NOT built on the
 * heavier `presentation/well-bore-view` renderer system — that one does imperative D3 DOM
 * manipulation (hover tooltips, actual-vs-planned overlays, liners/gravel packs) tuned for a
 * full engineering wellbore design view. Per CLAUDE.md, D3 here is used only for the depth
 * scale/half-width math (reused from the same `wellbore-math.util` this repo already has);
 * the actual rendering is plain Angular template bindings driven by computed signals.
 */
@Component({
  selector: 'app-wwell-ir-design-preview',
  standalone: true,
  imports: [],
  templateUrl: './wwell-ir-design-preview.component.html',
  styleUrl: './wwell-ir-design-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellIrDesignPreviewComponent {
  readonly formationTops = input.required<readonly IntegratedRequirementFormationTop[]>();
  readonly casing = input.required<readonly IntegratedRequirementCasingRow[]>();
  readonly surfaceElevationFtAsl = input<number | null>(null);
  readonly targetDepthFt = input<number>(0);

  protected readonly centerX = CENTER_X;
  protected readonly surfaceY = TOP_MARGIN;
  protected readonly viewBox = `0 0 ${VIEW_WIDTH} ${DRAWING_HEIGHT + TOP_MARGIN + BOTTOM_MARGIN}`;

  private readonly maxDepthFt = computed(() => {
    const depths = [this.targetDepthFt(), ...this.casing().map(row => row.depthFtBgl), ...this.formationTops().map(top => top.depthFt)].filter(
      (value): value is number => typeof value === 'number' && value > 0,
    );
    return depths.length ? Math.max(...depths) : 1;
  });

  private readonly depthScale = computed(() => createDepthScale(this.maxDepthFt(), DRAWING_HEIGHT));

  protected readonly casingShapes = computed<readonly CasingShape[]>(() => {
    const scale = this.depthScale();
    // Tiered deepest-first, matching this repo's established convention (see wellbore-math.util's
    // computeCasingHalfWidth): tier 0 = deepest string = narrowest.
    const byDepthDesc = [...this.casing()].sort((a, b) => b.depthFtBgl - a.depthFtBgl);

    const shapes = byDepthDesc.map((row, tier) => {
      const halfWidth = computeCasingHalfWidth(tier, BASE_HALF_WIDTH, HALF_WIDTH_INCREMENT);
      const bottomPx = TOP_MARGIN + scale(row.depthFtBgl);
      return {
        type: row.type,
        sizeIn: row.sizeIn,
        remarks: row.remarks,
        depthFtBgl: row.depthFtBgl,
        path: buildCasingPath(CENTER_X, halfWidth, TOP_MARGIN, bottomPx, SHOE_CURVE_OFFSET),
        fill: CASING_FILL_PALETTE[Math.min(tier, CASING_FILL_PALETTE.length - 1)],
        labelY: bottomPx,
      };
    });

    // Paint shallow/wide first, then deep/narrow on top, so telescoping strings read correctly.
    return [...shapes].reverse();
  });

  protected readonly formationLines = computed<readonly FormationLine[]>(() => {
    const scale = this.depthScale();
    return [...this.formationTops()]
      .sort((a, b) => a.depthFt - b.depthFt)
      .map(top => ({ name: top.name, depthFt: top.depthFt, y: TOP_MARGIN + scale(top.depthFt) }));
  });
}
