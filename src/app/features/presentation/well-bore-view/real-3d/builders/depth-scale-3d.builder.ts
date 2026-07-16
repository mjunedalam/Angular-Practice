import * as THREE from 'three';

import { createLabelSprite } from '../utils/label-sprite.util';
import { Depth3DScale } from '../wellbore-3d.types';

const AXIS_COLOR = 0x0f172a;
const AXIS_OPACITY = 0.85;
const TICK_HALF_LENGTH = 0.55;
const LABEL_GAP = 0.35;
const LABEL_FONT_SIZE = 46;
const LABEL_SCALE = 1.5;
const TITLE_TEXT = 'DEPTH (FT BGL)';
const TITLE_FONT_SIZE = 40;
const TITLE_SCALE = 1.65;
const TITLE_MARGIN = 2.1;

export interface DepthScale3DOptions {
  readonly totalDepth: number;
  readonly depthScale: Depth3DScale;
  /** Same value `DepthScaleComponent.drawScale` computes: `pickTickInterval(totalDepth)`,
   *  doubled when fullscreen — the caller (`wellbore-3d-view.component.ts`) is responsible for
   *  matching that exactly so tick spacing reads identically to the 2D ruler. */
  readonly interval: number;
}

export interface DepthScale3DResult {
  /** Axis + tick lines only, built at local x=0 — pass this (and only this) to the camera's
   *  bounding-box fit, and reposition the whole group via `.position` (see
   *  `wellbore-3d-view.component.ts`, which re-anchors it to the current view every frame). */
  readonly axisGroup: THREE.Group;
  /** Tick/title label sprites, also built at local x=0 — render these, keep them out of the
   *  camera-fit measurement, and move them by the same `.position` as `axisGroup`. */
  readonly labelsGroup: THREE.Group;
  /** Farthest any label reaches to the left of local x=0 — the caller needs this to know how
   *  much room to reserve so labels don't spill past the visible frustum edge. */
  readonly leftReach: number;
}

function buildRoundTicks(totalDepth: number, interval: number): number[] {
  const ticks: number[] = [];
  for (let depth = 0; depth <= totalDepth; depth += interval) {
    ticks.push(depth);
  }
  return ticks;
}

/**
 * Builds a 3D depth ruler that lives *inside* the same Three.js scene/camera as the casings —
 * the Three.js equivalent of the sibling `<app-depth-scale>` SVG, but a real part of the 3D
 * world instead of a flat overlay next to it.
 *
 * The flat 2D ruler only lines up with the wellbore at the camera's default rest position: as
 * soon as the user zooms, pans, or orbits the 3D view, a separate 2D overlay can no longer track
 * where each depth actually renders on screen. Putting the ruler in the same scene/camera as the
 * pipes means it can zoom/pan/orbit along with them (see `wellbore-3d-view.component.ts`'s
 * `syncDepthScaleToZoom`, which repositions — but does not rebuild — this every frame).
 *
 * Tick placement is deliberately the *exact* same logic as the 2D ruler — plain round-number
 * intervals only (`interval` is `pickTickInterval(totalDepth)`, doubled for fullscreen, computed
 * once by the caller), no casing/liner-specific markers. Built at local x=0 rather than baking in
 * a world position, so the caller can reposition the whole thing without rebuilding geometry.
 */
export function buildDepthScale3D({ totalDepth, depthScale, interval }: DepthScale3DOptions): DepthScale3DResult {
  const axisGroup = new THREE.Group();
  axisGroup.name = 'depth-scale-axis';
  const labelsGroup = new THREE.Group();
  labelsGroup.name = 'depth-scale-labels';

  const ticks = buildRoundTicks(totalDepth, interval);
  const lineMaterial = new THREE.LineBasicMaterial({ color: AXIS_COLOR, transparent: true, opacity: AXIS_OPACITY });

  const surfaceY = depthScale.toY(0);
  const bottomY = depthScale.toY(totalDepth);
  let leftReach = 0;

  const axisLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, surfaceY, 0),
      new THREE.Vector3(0, bottomY, 0),
    ]),
    lineMaterial,
  );
  axisGroup.add(axisLine);

  ticks.forEach((depth) => {
    const y = depthScale.toY(depth);

    const tickLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-TICK_HALF_LENGTH, y, 0),
        new THREE.Vector3(TICK_HALF_LENGTH, y, 0),
      ]),
      lineMaterial,
    );
    axisGroup.add(tickLine);

    const label = createLabelSprite({
      text: depth === 0 ? '0' : depth.toLocaleString(),
      color: '#0f172a',
      fontSize: LABEL_FONT_SIZE,
      fontWeight: '900',
      scale: LABEL_SCALE,
    });
    const labelCenterX = -TICK_HALF_LENGTH - LABEL_GAP - label.scale.x / 2;
    label.position.set(labelCenterX, y, 0);
    labelsGroup.add(label);
    leftReach = Math.max(leftReach, -(labelCenterX - label.scale.x / 2));
  });

  const title = createLabelSprite({
    text: TITLE_TEXT,
    color: '#0f172a',
    fontSize: TITLE_FONT_SIZE,
    fontWeight: '900',
    scale: TITLE_SCALE,
  });
  title.position.set(0, surfaceY + TITLE_MARGIN, 0);
  labelsGroup.add(title);
  leftReach = Math.max(leftReach, title.scale.x / 2);

  return { axisGroup, labelsGroup, leftReach };
}
