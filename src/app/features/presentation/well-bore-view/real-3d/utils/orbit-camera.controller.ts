import * as THREE from 'three';

const MIN_POLAR = 0.25;
const MAX_POLAR = Math.PI - 0.25;
const DAMPING = 0.08;
const AUTO_ROTATE_SPEED = 0.06; // radians / second

/**
 * Minimal spherical-coordinates orbit/zoom/pan controller.
 *
 * A hand-rolled replacement for `three/addons/controls/OrbitControls` — the addons build
 * ships ESM-only and isn't transformable under the project's current Jest config, so this
 * keeps the 3D view fully self-contained and test-safe without touching jest.config.js.
 */
/** Default azimuth/polar angle the view opens on. Casing/liner/conductor pipes are built with no
 *  top or bottom caps (see `buildPipeMesh`), so whichever end faces the camera reads as a hollow
 *  opening rather than a solid surface. A level, phi=90° camera sits at the vertical *midpoint* of
 *  the well (the target is the framed box's center) — that put the camera *below* the shallower
 *  casings/conductor near ground level, looking up into their open tops from underneath, which
 *  read as the tube flaring outward/upward like a megaphone bell instead of a shaft going down
 *  into the ground. Tilting the camera down (phi < 90°) puts it above that midpoint looking
 *  downward instead, so every open top — including the conductor's, at the very top — is seen
 *  from above like looking down a shaft, matching the "going into the ground" read the 2D
 *  elevation diagram implies. `resetOrientation()`/the "recenter" button return to this same angle. */
const FRONT_THETA = 0;
const FRONT_PHI = 1.05;

export class OrbitCameraController {
  /** Starts static (like the 2D diagram) — the user opts into auto-rotate via the toolbar. */
  autoRotate = false;

  private smoothedRadius: number;
  private targetRadius: number;
  private smoothedTheta: number;      // azimuth
  private targetTheta: number;
  private smoothedPhi: number;        // polar
  private targetPhi: number;
  private readonly target = new THREE.Vector3();
  private isDragging = false;
  private lastX = 0;
  private lastY = 0;
  private minRadius: number;
  private maxRadius: number;

  private readonly onPointerDown = (e: PointerEvent): void => {
    this.isDragging = true;
    this.autoRotate = false;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.dom.setPointerCapture(e.pointerId);
  };

  private readonly onPointerMove = (e: PointerEvent): void => {
    if (!this.isDragging) return;
    const dx = e.clientX - this.lastX;
    const dy = e.clientY - this.lastY;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.targetTheta -= dx * 0.006;
    this.targetPhi = Math.min(MAX_POLAR, Math.max(MIN_POLAR, this.targetPhi - dy * 0.006));
  };

  private readonly onPointerUp = (e: PointerEvent): void => {
    this.isDragging = false;
    this.dom.releasePointerCapture(e.pointerId);
  };

  private readonly onWheel = (e: WheelEvent): void => {
    e.preventDefault();
    const factor = Math.exp(e.deltaY * 0.001);
    this.targetRadius = Math.min(this.maxRadius, Math.max(this.minRadius, this.targetRadius * factor));
  };

  constructor(
    private readonly camera: THREE.PerspectiveCamera,
    private readonly dom: HTMLElement,
    opts: { initialRadius: number; targetY: number; minRadius: number; maxRadius: number },
  ) {
    this.smoothedRadius = this.targetRadius = opts.initialRadius;
    this.smoothedTheta = this.targetTheta = FRONT_THETA;
    this.smoothedPhi = this.targetPhi = FRONT_PHI;
    this.minRadius = opts.minRadius;
    this.maxRadius = opts.maxRadius;
    this.target.set(0, opts.targetY, 0);

    this.dom.addEventListener('pointerdown', this.onPointerDown);
    this.dom.addEventListener('pointermove', this.onPointerMove);
    this.dom.addEventListener('pointerup', this.onPointerUp);
    this.dom.addEventListener('pointerleave', this.onPointerUp);
    this.dom.addEventListener('wheel', this.onWheel, { passive: false });
  }

  setTargetY(y: number): void {
    this.target.y = y;
  }

  /** GSAP-tweenable orbit radius — lets the reveal timeline drive a cinematic dolly with its
   *  own easing curve, on top of the controller's own per-frame damping. */
  get radius(): number {
    return this.targetRadius;
  }

  set radius(value: number) {
    this.targetRadius = Math.min(this.maxRadius, Math.max(this.minRadius, value));
  }

  /** The *damped* radius actually applied to the camera this frame — unlike `radius` (the
   *  target the user just scrolled/tweened to), this is what the camera position is built from
   *  in `update()`. Anything that needs to stay pixel-perfect in sync with the rendered camera
   *  (e.g. the depth ruler re-anchoring itself to the current view every frame) must read this,
   *  not `radius`, or it will visibly snap ahead of the camera's own eased motion. */
  get currentRadius(): number {
    return this.smoothedRadius;
  }

  /** Read-only snapshot of the current look-at target, in case it's ever off the X=0 centerline. */
  get targetPosition(): THREE.Vector3 {
    return this.target.clone();
  }

  /** GSAP-tweenable azimuth (radians) — used for the establishing-shot swing-around. */
  get azimuth(): number {
    return this.targetTheta;
  }

  set azimuth(value: number) {
    this.targetTheta = value;
  }

  /** Snaps back to the flat, front-elevation angle the view opens on — used by the "recenter" button. */
  resetOrientation(): void {
    this.targetTheta = FRONT_THETA;
    this.targetPhi = FRONT_PHI;
  }

  /**
   * Fits a world-space bounding box into the camera's current FOV/aspect and updates the orbit
   * target + zoom bounds to match. Returns the "rest" distance that comfortably frames it.
   *
   * Deliberately fits the box's actual height/width per axis rather than wrapping it in a
   * bounding *sphere* — a well is extremely tall and thin (tens of units tall, a handful of
   * units wide), so a sphere large enough to enclose the full height is mostly empty space
   * around a sliver-thin object. Backing the camera off far enough to fit that sphere in every
   * direction left the well looking tiny in the middle of the frame; fitting height-to-vertical-
   * FOV and width-to-horizontal-FOV separately lets the camera sit much closer.
   *
   * The two axes intentionally use *different* margins. `marginHeight` defaults to ~1.14 so the
   * vertical fill ratio (1/marginHeight ≈ 88%) matches the 2D SVG's fixed
   * `drawingHeight / svgHeight` ratio (740/840) — the caller passes in a box whose Y range is
   * pinned to the nominal [0, displayDepth] depth range (see `wellbore-3d-view.component.ts`'s
   * `frameCamera`), so this keeps "ground level" (depth 0) sitting at the same proportional
   * screen height as the sibling `<app-depth-scale>` ruler's "0" tick, instead of drifting per
   * well based on how deep that well's actual casings happen to reach. `marginWidth` stays more
   * generous (1.4) since the ruler has no opinion on width — that only needs to guarantee wells
   * with many (wide) casings never clip outside the viewbox.
   *
   * Zoom bounds are pinned tightly to this same fit, on purpose: `minRadius` is set to the exact
   * *unmargined* distance for whichever axis is dominant — the distance at which that axis fills
   * 100% of the frame edge-to-edge — so scrolling in can never push the geometry outside the
   * viewbox. `maxRadius` stays within a modest multiple of the fit distance so scrolling out
   * can't shrink the content down to an illegibly tiny speck either.
   */
  frameBox(box: THREE.Box3, marginHeight = 1.14, marginWidth = 1.4): number {
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    this.target.copy(center);

    const halfHeight = Math.max(size.y / 2, 0.05);
    const halfWidth = Math.max(Math.max(size.x, size.z) / 2, 0.05);

    // `camera.aspect` can be a stale/garbage value for the very first frame or two before the
    // host element's ResizeObserver has fired — falling back to 1 keeps this fully finite
    // instead of ever letting a NaN/zero aspect poison targetRadius (and blank the whole scene).
    const safeAspect = Number.isFinite(this.camera.aspect) && this.camera.aspect > 0 ? this.camera.aspect : 1;
    const halfV = THREE.MathUtils.degToRad(this.camera.fov) / 2;
    const halfH = Math.atan(Math.tan(halfV) * safeAspect);
    const heightFit = (halfHeight / Math.tan(halfV)) * marginHeight;
    const widthFit = (halfWidth / Math.tan(halfH)) * marginWidth;
    const fitDistance = Math.max(heightFit, widthFit);

    // Whichever axis is dominant, dividing its own margin back out gives the exact distance at
    // which it fills the frame edge-to-edge (still inside the viewbox, just with zero breathing
    // room) — anything closer than that would clip. Using the dominant axis's own margin (rather
    // than always the smaller one) keeps this precise instead of overly conservative.
    const noMarginFit = heightFit >= widthFit ? heightFit / marginHeight : widthFit / marginWidth;
    this.minRadius = noMarginFit;
    this.maxRadius = fitDistance * 1.5;

    return fitDistance;
  }

  /** Advances damping/auto-rotate and writes the resulting position onto the camera. Call once per frame. */
  update(deltaSeconds: number): void {
    if (this.autoRotate && !this.isDragging) {
      this.targetTheta += AUTO_ROTATE_SPEED * deltaSeconds;
    }

    this.smoothedRadius += (this.targetRadius - this.smoothedRadius) * DAMPING;
    this.smoothedTheta += (this.targetTheta - this.smoothedTheta) * DAMPING;
    this.smoothedPhi += (this.targetPhi - this.smoothedPhi) * DAMPING;

    const sinPhi = Math.sin(this.smoothedPhi);
    this.camera.position.set(
      this.target.x + this.smoothedRadius * sinPhi * Math.sin(this.smoothedTheta),
      this.target.y + this.smoothedRadius * Math.cos(this.smoothedPhi),
      this.target.z + this.smoothedRadius * sinPhi * Math.cos(this.smoothedTheta),
    );
    this.camera.lookAt(this.target);
  }

  dispose(): void {
    this.dom.removeEventListener('pointerdown', this.onPointerDown);
    this.dom.removeEventListener('pointermove', this.onPointerMove);
    this.dom.removeEventListener('pointerup', this.onPointerUp);
    this.dom.removeEventListener('pointerleave', this.onPointerUp);
    this.dom.removeEventListener('wheel', this.onWheel);
  }
}
