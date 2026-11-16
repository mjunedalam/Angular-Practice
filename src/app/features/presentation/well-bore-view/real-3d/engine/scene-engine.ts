import * as THREE from 'three';

import { OrbitCameraController } from '../utils/orbit-camera.controller';
import { frameTicker } from '../utils/frame-ticker.util';
import { SCENE_HEIGHT_UNITS } from '../utils/depth-3d.util';

/**
 * Owns the Three.js renderer/scene/camera/lights and the render loop for one wellbore-3d-view
 * instance. Rendering is driven by the shared `frameTicker` (one `requestAnimationFrame` loop), so the
 * render pass and the component's zoom sync run in a fixed order each frame.
 */
export class WellboreSceneEngine {
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly renderer: THREE.WebGLRenderer;
  readonly rigGroup = new THREE.Group();
  readonly orbit: OrbitCameraController;

  private readonly resizeObserver: ResizeObserver;
  private readonly tickFn: (time: number, deltaTime: number) => void;
  private lastWidth = 0;
  private lastHeight = 0;
  private disposed = false;

  constructor(private readonly host: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.localClippingEnabled = true;
    this.renderer.shadowMap.enabled = false;

    // This canvas is inserted via plain DOM API, not Angular's template — so it never receives
    // the component's `_ngcontent-*` encapsulation attribute, and the component SCSS rule that
    // stretches `canvas` to 100% width/height silently never matches it. Combined with
    // `setSize(..., false)` below (which intentionally skips setting CSS size), the canvas would
    // otherwise render at its raw attribute size (CSS pixels = display size × device pixel ratio)
    // instead of the container's actual size — i.e. up to 2x too big, clipped by the parent's
    // `overflow: hidden` down to just its top-left quadrant, with anything centered in the real
    // scene appearing to sit in the bottom-right corner of that crop. Setting these inline
    // guarantees correct sizing regardless of Angular's style scoping.
    const canvasEl = this.renderer.domElement;
    canvasEl.style.display = 'block';
    canvasEl.style.width = '100%';
    canvasEl.style.height = '100%';
    canvasEl.style.touchAction = 'none';
    canvasEl.style.cursor = 'grab';
    host.appendChild(canvasEl);

    // Without explicit tone mapping, bright specular highlights on the fairly metallic casing
    // material simply clip to pure white instead of rolling off — which is what was reading as
    // "washed out white" instead of the intended green/silver metal colors.
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500);
    this.scene.add(this.rigGroup);
    // Plain white, matching the 2D SVG diagram's card background.
    this.scene.background = new THREE.Color(0xffffff);
    this.scene.fog = new THREE.Fog(0xffffff, 90, 220);

    this.setupLights();

    this.orbit = new OrbitCameraController(this.camera, this.renderer.domElement, {
      initialRadius: SCENE_HEIGHT_UNITS * 1.1,
      targetY: -SCENE_HEIGHT_UNITS * 0.4,
      minRadius: SCENE_HEIGHT_UNITS * 0.35,
      maxRadius: SCENE_HEIGHT_UNITS * 2.4,
    });

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(host);
    this.handleResize();

    this.tickFn = (_time, deltaTime) => {
      this.orbit.update(deltaTime / 1000);
      this.renderer.render(this.scene, this.camera);
    };
    frameTicker.add(this.tickFn);
  }

  private setupLights(): void {
    const hemi = new THREE.HemisphereLight(0xffffff, 0x3a4657, 0.65);
    this.scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(18, 30, 22);
    this.scene.add(key);

    const rim = new THREE.DirectionalLight(0x8fd3ff, 0.3);
    rim.position.set(-20, 10, -18);
    this.scene.add(rim);

    const fill = new THREE.PointLight(0xffe8b8, 0.25, 60);
    fill.position.set(0, 4, 12);
    this.scene.add(fill);
  }

  private handleResize(): void {
    const width = Math.max(1, this.host.clientWidth);
    const height = Math.max(1, this.host.clientHeight);
    if (width === this.lastWidth && height === this.lastHeight) return;
    this.lastWidth = width;
    this.lastHeight = height;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    frameTicker.remove(this.tickFn);
    this.resizeObserver.disconnect();
    this.orbit.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
