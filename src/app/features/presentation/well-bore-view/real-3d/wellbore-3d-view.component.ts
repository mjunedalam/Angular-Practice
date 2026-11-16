import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { frameTicker } from './utils/frame-ticker.util';
import * as THREE from 'three';

import { FormationInfoViewModel } from '@models/active-wwell/active-wwell-view.model';
import {
  DEFAULT_ANIM_CONFIG,
  DIAGRAM_LAYOUT,
  DiagramLayout,
  WellboreAnimConfig,
  WellboreDiagramData,
} from '@models/well-design/wellbore-diagram.model';
import { pickTickInterval } from '@shared/utils/wellbore-math.util';
import { buildCasings3D } from './builders/casing-3d.builder';
import { buildDepthScale3D } from './builders/depth-scale-3d.builder';
import { WellboreSceneEngine } from './engine/scene-engine';
import { createDepth3DScale, SCENE_HEIGHT_UNITS } from './utils/depth-3d.util';
import { disposeObject3D } from './utils/dispose3d.util';
import { Depth3DScale } from './wellbore-3d.types';

/** Only used when the built content is empty (e.g. no casing data yet) — real framing is
 *  always computed from the nominal depth range + actual geometry width, see `frameCamera()` below. */
const FALLBACK_REST_RADIUS = SCENE_HEIGHT_UNITS * 1.5;

/** Extra world-space buffer beyond the widest depth-scale label so text never touches the exact
 *  edge of the visible frustum. */
const DEPTH_SCALE_SAFETY_MARGIN = 0.5;
/** Floor on how close to the pipe the ruler is ever allowed to sit, however tight the frustum
 *  gets at the closest permitted zoom — keeps the reach calculation from ever going negative. */
const DEPTH_SCALE_MIN_REACH = 0.5;
const WORLD_UP = new THREE.Vector3(0, 1, 0);

/**
 * TEMP scope reduction, per request: this view currently draws ONLY the conductor/casing/liner
 * pipes, fully visible and static (no reveal animation, no cinematic camera). Open hole, gravel
 * pack, water level, drill string, pump marker and geologic-top rings — plus the reveal
 * timeline that animated all of it — are on hold until the core casing/liner geometry itself is
 * confirmed to render correctly. See the `real-3d/builders/` and `real-3d/animation/` folders
 * for that code; nothing was deleted, this component just doesn't call into it right now.
 */
@Component({
  selector: 'app-wellbore-3d-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './wellbore-3d-view.component.html',
  styleUrl: './wellbore-3d-view.component.scss',
})
export class Wellbore3DViewComponent {
  readonly diagramData = input.required<WellboreDiagramData | null>();
  readonly animTrigger = input.required<number>();
  readonly animConfig = input<WellboreAnimConfig>(DEFAULT_ANIM_CONFIG);
  readonly formationTops = input<FormationInfoViewModel[]>([]);
  readonly diagramLayout = input<DiagramLayout>(DIAGRAM_LAYOUT);
  readonly isFullscreen = input<boolean>(false);

  private readonly hostRef = viewChild<ElementRef<HTMLDivElement>>('canvasHost');
  private readonly destroyRef = inject(DestroyRef);

  private engine: WellboreSceneEngine | null = null;
  private activeLayout: DiagramLayout | null = null;
  /** Pipe meshes only — the *only* group ever measured for camera framing. */
  private contentGroup: THREE.Group | null = null;
  /** Casing/liner text label sprites + leader lines — cosmetic, excluded from framing. */
  private labelsGroup: THREE.Group | null = null;
  private restRadius = FALLBACK_REST_RADIUS;
  private pendingFrameId: number | null = null;

  // ── Depth-scale ruler state — built once per `rebuildScene()` call (same tick logic/interval as
  // the 2D ruler), then only *repositioned* every frame as the camera zooms/orbits (see
  // `syncDepthScaleToZoom`). Deliberately never added under `contentGroup`, so the ruler can never
  // feed back into the pipes' own framing. ──
  private depthScale: Depth3DScale | null = null;
  private displayDepthValue = 0;
  private depthScaleAxisGroup: THREE.Group | null = null;
  private depthScaleLabelsGroup: THREE.Group | null = null;
  private depthScaleLeftReach = 0;

  /** Runs every render frame for the lifetime of the component (not just while data is loaded) —
   *  reads `this.engine` fresh each time so it never goes stale across teardown/rebuild cycles,
   *  and no-ops cheaply whenever there's nothing to sync yet. */
  private readonly zoomSyncFn = (): void => {
    if (!this.engine) return;
    this.syncDepthScaleToZoom(this.engine);
  };

  constructor() {
    effect(() => {
      const hostEl = this.hostRef();
      const data = this.diagramData();
      const layout = this.diagramLayout();
      this.animTrigger();  // track — parent bumps this when it wants a fresh redraw
      this.isFullscreen(); // track — layout identity changes alongside this, see below

      if (!hostEl?.nativeElement || !data) return;

      // Re-bootstrap the renderer when layout identity changes (normal ↔ fullscreen), mirroring
      // WellBoreViewComponent's `_activeLayout` guard for the 2D SVG root.
      if (this.activeLayout !== layout) {
        this.activeLayout = layout;
        this.teardownEngine();
      }

      if (!this.engine) {
        this.engine = new WellboreSceneEngine(hostEl.nativeElement);
      }

      this.rebuildScene(data, layout);
    });

    frameTicker.add(this.zoomSyncFn);
    this.destroyRef.onDestroy(() => {
      frameTicker.remove(this.zoomSyncFn);
      this.teardownEngine();
    });
  }

  protected resetCamera(): void {
    if (!this.engine) return;
    this.engine.orbit.radius = this.restRadius;
    this.engine.orbit.resetOrientation();
  }

  protected toggleAutoRotate(): void {
    if (!this.engine) return;
    this.engine.orbit.autoRotate = !this.engine.orbit.autoRotate;
  }

  private rebuildScene(data: WellboreDiagramData, layout: DiagramLayout): void {
    const engine = this.engine;
    if (!engine) return;

    if (this.contentGroup) {
      engine.rigGroup.remove(this.contentGroup);
      disposeObject3D(this.contentGroup);
    }
    if (this.labelsGroup) {
      engine.rigGroup.remove(this.labelsGroup);
      disposeObject3D(this.labelsGroup);
    }
    if (this.depthScaleAxisGroup) {
      engine.rigGroup.remove(this.depthScaleAxisGroup);
      disposeObject3D(this.depthScaleAxisGroup);
      this.depthScaleAxisGroup = null;
    }
    if (this.depthScaleLabelsGroup) {
      engine.rigGroup.remove(this.depthScaleLabelsGroup);
      disposeObject3D(this.depthScaleLabelsGroup);
      this.depthScaleLabelsGroup = null;
    }

    const group = new THREE.Group();
    group.name = 'wellbore-3d-content';
    engine.rigGroup.add(group);
    this.contentGroup = group;

    const labelsGroup = new THREE.Group();
    labelsGroup.name = 'wellbore-3d-labels';
    engine.rigGroup.add(labelsGroup);
    this.labelsGroup = labelsGroup;

    const displayDepth = Math.max(data.totalDepth, data.displayDepth);
    const depthScale = createDepth3DScale(displayDepth);
    this.depthScale = depthScale;
    this.displayDepthValue = displayDepth;

    const casings = buildCasings3D(data, layout, depthScale, { casingsStart: 0, linersStart: 0 });
    group.add(casings.group);
    labelsGroup.add(casings.labelsGroup);

    // No reveal animation for now — snap every clip plane straight to "fully shown" so the
    // conductor/casing/liner pipes are immediately visible instead of waiting on a reveal timeline.
    casings.reveals.forEach(({ clipPlane, bottomY }) => {
      clipPlane.constant = -bottomY;
    });

    // Exactly mirrors `DepthScaleComponent.drawScale`'s interval logic — same 100/200/500ft
    // buckets, doubled in fullscreen — so tick spacing reads identically to the 2D ruler. Built
    // once here (like the pipes), never rebuilt reactively; `syncDepthScaleToZoom` only
    // repositions the already-built groups every frame.
    const baseInterval = pickTickInterval(displayDepth);
    const interval = this.isFullscreen() ? baseInterval * 2 : baseInterval;
    const builtScale = buildDepthScale3D({ totalDepth: displayDepth, depthScale, interval });
    engine.rigGroup.add(builtScale.axisGroup);
    engine.rigGroup.add(builtScale.labelsGroup);
    this.depthScaleAxisGroup = builtScale.axisGroup;
    this.depthScaleLabelsGroup = builtScale.labelsGroup;
    this.depthScaleLeftReach = builtScale.leftReach;

    this.frameCamera(engine, group, depthScale, displayDepth);
  }

  /** Fits the orbit camera to the pipe geometry just built (never the depth-scale ruler — see the
   *  field doc comments above). Runs once synchronously and once more on the next animation
   *  frame — the host element's ResizeObserver may not have reported its real size yet on the
   *  very first pass (e.g. right after this view is inserted behind the `@defer` block), which
   *  would frame against a stale 1:1 aspect ratio and leave the pipes off-center in the canvas. */
  private frameCamera(engine: WellboreSceneEngine, group: THREE.Group, depthScale: Depth3DScale, displayDepth: number): void {
    if (this.pendingFrameId !== null) {
      cancelAnimationFrame(this.pendingFrameId);
      this.pendingFrameId = null;
    }

    const apply = (): number => {
      // `Box3.setFromObject` reads each mesh's `matrixWorld`, which is only populated during a
      // render pass — measuring it synchronously, before the scene has ever actually rendered,
      // reads stale (identity) transforms and produces a bounding box that has nothing to do
      // with where the pipes really are. Force the update explicitly instead of hoping a render
      // happened to run first.
      group.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(group);
      if (box.isEmpty()) return FALLBACK_REST_RADIUS;

      // Pin the vertical frame to the *nominal* [0, displayDepth] range instead of the casing
      // geometry's actual extent — mirroring the 2D SVG diagram's `createDepthScale(displayDepth,
      // drawingHeight)`, which always maps this exact same fixed range across its full height.
      // Most wells' casings/liners stop well short of displayDepth (it's totalDepth plus a fixed
      // padding — see `selectDisplayDepth`), so framing on pipe height alone would zoom in
      // tighter than "ground level" and the deepest nominal depth actually correspond to.
      box.min.y = depthScale.toY(displayDepth);
      box.max.y = depthScale.toY(0);

      return engine.orbit.frameBox(box);
    };

    this.restRadius = apply();
    engine.orbit.radius = this.restRadius;

    this.pendingFrameId = requestAnimationFrame(() => {
      this.pendingFrameId = null;
      this.restRadius = apply();
      engine.orbit.radius = this.restRadius;
    });
  }

  /**
   * Keeps the 3D depth ruler acting like a real depth-wheel gauge: every frame it re-anchors
   * itself to the extreme left edge of whatever's *currently* in view (using the camera's
   * damped, actually-rendered radius — see `OrbitCameraController.currentRadius` — so it never
   * visibly snaps ahead of the camera's own eased motion). Tick geometry itself is built once per
   * `rebuildScene()` call (same fixed interval as the 2D ruler) and never rebuilt here — this only
   * repositions the existing groups, so zooming/orbiting can't trigger the flashing/duplication
   * that came from rebuilding tick geometry reactively.
   *
   * Position is computed from the camera's *actual* current forward/right vectors, not a
   * world-X assumption — the earlier version placed the ruler along the fixed world X axis,
   * which only happens to line up with "screen left" at the default front-elevation angle
   * (theta=0). As soon as the user orbits left/right, world-X stops meaning "left of camera": the
   * ruler would swing through world space independently of where the camera actually pointed,
   * at some angles cutting straight through the pipes. Deriving "left" from the camera's own
   * forward vector each frame keeps the ruler at a constant apparent position to the camera's
   * left — sitting still on screen while the camera orbits around the well, not swinging.
   */
  private syncDepthScaleToZoom(engine: WellboreSceneEngine): void {
    if (!this.depthScale || !this.depthScaleAxisGroup || !this.depthScaleLabelsGroup) return;

    const safeAspect = Number.isFinite(engine.camera.aspect) && engine.camera.aspect > 0 ? engine.camera.aspect : 1;
    const halfV = THREE.MathUtils.degToRad(engine.camera.fov) / 2;
    const halfH = Math.atan(Math.tan(halfV) * safeAspect);

    // Re-anchor to the extreme left of the current view every frame — "rolls" with the camera
    // instead of sitting at a fixed world position that would drift toward (or past) the pipes
    // as the user zooms in, or shrink into the middle of a lot of empty space zooming out.
    const radius = engine.orbit.currentRadius;
    const frustumHalfWidth = radius * Math.tan(halfH);

    // Camera's actual horizontal forward direction, whatever the current orbit angle — not an
    // assumed fixed axis. `getWorldDirection` recomputes from the camera's own current
    // position/quaternion, so this is correct at any theta, not just the front-elevation default.
    const forward = new THREE.Vector3();
    engine.camera.getWorldDirection(forward);
    forward.y = 0;
    if (forward.lengthSq() < 1e-6) forward.set(0, 0, -1); // camera looking straight down/up (polar-clamped, shouldn't happen)
    forward.normalize();
    const right = new THREE.Vector3().crossVectors(forward, WORLD_UP).normalize();

    const target = engine.orbit.targetPosition;
    const reach = Math.max(DEPTH_SCALE_MIN_REACH, frustumHalfWidth - this.depthScaleLeftReach - DEPTH_SCALE_SAFETY_MARGIN);
    const rulerX = target.x - right.x * reach;
    const rulerZ = target.z - right.z * reach;

    this.depthScaleAxisGroup.position.set(rulerX, 0, rulerZ);
    this.depthScaleLabelsGroup.position.set(rulerX, 0, rulerZ);
  }

  private teardownEngine(): void {
    if (this.pendingFrameId !== null) {
      cancelAnimationFrame(this.pendingFrameId);
      this.pendingFrameId = null;
    }
    if (this.contentGroup) {
      disposeObject3D(this.contentGroup);
      this.contentGroup = null;
    }
    if (this.labelsGroup) {
      disposeObject3D(this.labelsGroup);
      this.labelsGroup = null;
    }
    if (this.depthScaleAxisGroup) {
      disposeObject3D(this.depthScaleAxisGroup);
      this.depthScaleAxisGroup = null;
    }
    if (this.depthScaleLabelsGroup) {
      disposeObject3D(this.depthScaleLabelsGroup);
      this.depthScaleLabelsGroup = null;
    }
    this.depthScale = null;
    this.engine?.dispose();
    this.engine = null;
  }
}
