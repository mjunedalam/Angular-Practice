import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

import { FormationInfoViewModel } from '@models/active-wwell/active-wwell-view.model';
import {
  DEFAULT_ANIM_CONFIG,
  DIAGRAM_LAYOUT,
  DiagramLayout,
  WellboreAnimConfig,
  WellboreDiagramData,
} from '@models/well-design/wellbore-diagram.model';
import { DepthScaleComponent } from '../depth-scale/depth-scale.component';
import { Wellbore3DViewComponent } from './real-3d/wellbore-3d-view.component';
import { WellBoreViewComponent } from './well-bore-view.component';

export type WellboreViewMode = '2d' | '3d';

/**
 * Thin presentation switcher — forwards the exact same inputs the 2D `WellBoreViewComponent`
 * already takes to either that (untouched) component or the new Three.js/GSAP `real-3d` view.
 * Business logic (data, store, animation config) is unchanged; only the rendered surface differs.
 *
 * The flat `<app-depth-scale>` SVG ruler is only rendered alongside the 2D view here. In 3D mode
 * it's replaced entirely by a ruler built *inside* the Three.js scene (see
 * `real-3d/builders/depth-scale-3d.builder.ts`) — a flat, static 2D ruler next to a camera that
 * can zoom/pan/orbit can only ever match at the camera's default rest position, so the only way to
 * keep the ruler permanently in sync is to put it in the same scene/camera as the pipes.
 */
@Component({
  selector: 'app-wellbore-view-toggle',
  standalone: true,
  imports: [DepthScaleComponent, WellBoreViewComponent, Wellbore3DViewComponent],
  templateUrl: './wellbore-view-toggle.component.html',
  styleUrl: './wellbore-view-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WellboreViewToggleComponent {
  readonly diagramData = input.required<WellboreDiagramData | null>();
  readonly animTrigger = input.required<number>();
  readonly animConfig = input<WellboreAnimConfig>(DEFAULT_ANIM_CONFIG);
  readonly formationTops = input<FormationInfoViewModel[]>([]);
  readonly diagramLayout = input<DiagramLayout>(DIAGRAM_LAYOUT);
  readonly isFullscreen = input<boolean>(false);

  protected readonly mode = signal<WellboreViewMode>('2d');
  protected readonly totalDepth = computed(() => this.diagramData()?.displayDepth ?? 0);

  protected setMode(mode: WellboreViewMode): void {
    this.mode.set(mode);
  }
}
