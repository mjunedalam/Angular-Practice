import * as THREE from 'three';

/** A mesh reveal driven by the reveal timeline — clipped top-to-bottom like the 2D clip-rect grow. */
export interface Reveal3DTarget {
  readonly mesh: THREE.Object3D;
  readonly clipPlane: THREE.Plane;
  /** World-space Y of the reveal start (top) and end (bottom). Plane constant is interpolated between them. */
  readonly topY: number;
  readonly bottomY: number;
  readonly delay: number;
  readonly duration: number;
}

/** Depth (ft, positive down) → Three.js scene units (negative Y down) conversion context. */
export interface Depth3DScale {
  toY(depthFt: number): number;
  toRadius(pxHalfWidth: number): number;
}

export interface Scene3DContext {
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly renderer: THREE.WebGLRenderer;
  readonly rigGroup: THREE.Group;
}

export interface BuildResult {
  readonly group: THREE.Group;
  readonly reveals: Reveal3DTarget[];
  readonly drillBitTargetY: number;
  readonly totalDepthY: number;
}
