import * as THREE from 'three';

/** All textures are generated procedurally on an offscreen canvas — no network/CDN assets,
 *  keeping the 3D view fully self-contained and CSP-safe. */

function canvasTexture(draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, w = 128, h = 128): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  draw(ctx, w, h);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Vertical Fresnel-style metal band: bright edge → dark shadow → specular streak → dark → bright edge.
 *  Mirrors the `mainGradient` / `actualCasingGradient` stops used by the 2D wellbore renderer. */
function metalStripeTexture(stops: readonly [number, string][]): THREE.CanvasTexture {
  return canvasTexture((ctx, w, h) => {
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    stops.forEach(([offset, color]) => grad.addColorStop(offset, color));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }, 256, 32);
}

// The 2D SVG version uses near-black Fresnel bands to *fake* cylindrical shading on a flat
// rectangle. An actual 3D cylinder already gets real shading from the scene's lights, so those
// dark bands just make the surface read as patchy/blackish here — these stops stay bright and
// let real lighting do the shading work instead.
//
// Est(imated)/act(ual) color scheme mirrors the 2D renderer exactly: planned casings/liners fill
// with `mainGradient`/`linerGradient` (silver-gray), actual (as-drilled) ones fill with
// `actualCasingGradient`/`actualLinerGradient` (green) — see defs.renderer.ts. In the 2D SVG the
// conductor is *not* a separate color, only a separate opacity (isConductor ? 0.75 : 0.40 when
// planned); it still switches to the actual/green gradient whenever drlgCasings has actual data
// for it. Conductor gets the same treatment here — no dedicated conductor palette.
const PLANNED_STEEL_STOPS: readonly [number, string][] = [
  [0.00, '#e2e8f0'], [0.25, '#94a3b8'], [0.50, '#cbd5e1'],
  [0.75, '#94a3b8'], [1.00, '#e2e8f0'],
];

const ACTUAL_STEEL_STOPS: readonly [number, string][] = [
  [0.00, '#bbf7d0'], [0.25, '#22c55e'], [0.50, '#4ade80'],
  [0.75, '#22c55e'], [1.00, '#bbf7d0'],
];

let cachedPlanned: THREE.CanvasTexture | null = null;
let cachedActual: THREE.CanvasTexture | null = null;
let cachedRock: THREE.CanvasTexture | null = null;
let cachedGravel: THREE.CanvasTexture | null = null;

export function createCasingMaterial(hasActual: boolean, isConductor = false): THREE.MeshStandardMaterial {
  const map = hasActual
    ? (cachedActual ??= metalStripeTexture(ACTUAL_STEEL_STOPS))
    : (cachedPlanned ??= metalStripeTexture(PLANNED_STEEL_STOPS));

  // Low metalness is deliberate: `MeshStandardMaterial` renders metallic surfaces dark/black
  // without a reflection environment map (metals show almost nothing but their reflected
  // environment, and this scene doesn't set one) — a low-metalness "painted steel" look lets
  // the actual green/silver pigment in the texture read clearly under the scene's direct lights.
  return new THREE.MeshStandardMaterial({
    map,
    metalness: 0.12,
    roughness: 0.5,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: hasActual ? 0.7 : (isConductor ? 0.6 : 0.5),
    depthWrite: false,
  });
}

export function createLinerMaterial(hasActual: boolean, isScreen: boolean): THREE.MeshStandardMaterial {
  const mat = createCasingMaterial(hasActual, false);
  mat.roughness = isScreen ? 0.6 : 0.5;
  mat.opacity = hasActual ? 0.78 : 0.6;
  return mat;
}

/** Speckled rock face for the open-hole section below the last casing shoe. */
export function createRockMaterial(): THREE.MeshStandardMaterial {
  const map = (cachedRock ??= canvasTexture((ctx, w, h) => {
    ctx.fillStyle = '#2b2420';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = Math.random() * 1.6 + 0.3;
      const shade = 30 + Math.floor(Math.random() * 60);
      ctx.fillStyle = `rgba(${shade + 40}, ${shade + 25}, ${shade}, 0.6)`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }, 256, 256));

  return new THREE.MeshStandardMaterial({
    map,
    color: '#3b332c',
    roughness: 0.95,
    metalness: 0.02,
    side: THREE.DoubleSide,
  });
}

/** Gravel-pack annulus: dense light/dark speckle matching the 2D `gravelpattern`. */
export function createGravelMaterial(): THREE.MeshStandardMaterial {
  const map = (cachedGravel ??= canvasTexture((ctx, w, h) => {
    ctx.fillStyle = '#8a7a63';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 1400; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = Math.random() * 2.2 + 0.5;
      const light = Math.random() > 0.5;
      ctx.fillStyle = light ? 'rgba(230,214,180,0.8)' : 'rgba(60,48,32,0.7)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }, 256, 256));

  return new THREE.MeshStandardMaterial({ map, roughness: 0.9, metalness: 0.05, side: THREE.DoubleSide });
}

export function createWaterMaterial(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: '#0ea5e9',
    transparent: true,
    opacity: 0.45,
    roughness: 0.15,
    metalness: 0,
    transmission: 0.35,
    thickness: 0.5,
    side: THREE.DoubleSide,
  });
}

export function createScreenGridMaterial(): THREE.MeshStandardMaterial {
  const map = canvasTexture((ctx, w, h) => {
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 2;
    for (let x = 0; x <= w; x += 10) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y <= h; y += 10) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
  }, 64, 64);
  map.repeat.set(1, 6);

  return new THREE.MeshStandardMaterial({ map, roughness: 0.7, metalness: 0.2, side: THREE.DoubleSide, transparent: true, opacity: 0.92 });
}

/** Frees the process-wide texture cache — call once when the app fully tears down (not per-redraw). */
export function disposeMaterialCache(): void {
  cachedPlanned?.dispose(); cachedPlanned = null;
  cachedActual?.dispose(); cachedActual = null;
  cachedRock?.dispose(); cachedRock = null;
  cachedGravel?.dispose(); cachedGravel = null;
}
