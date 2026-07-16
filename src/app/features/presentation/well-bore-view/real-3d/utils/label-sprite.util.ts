import * as THREE from 'three';

export interface LabelSpriteOptions {
  readonly text: string;
  readonly color?: string;
  readonly background?: string;
  readonly fontSize?: number;
  readonly fontWeight?: string;
  readonly paddingX?: number;
  readonly scale?: number;
}

/** Builds a billboard text sprite (canvas texture) — the 3D equivalent of an SVG `<text>` label.
 *  Sprites always face the camera, keeping labels legible from any orbit angle. */
export function createLabelSprite(options: LabelSpriteOptions): THREE.Sprite {
  const {
    text,
    color = '#0f172a',
    background = 'rgba(255,255,255,0.92)',
    fontSize = 32,
    fontWeight = '800',
    paddingX = 18,
    scale = 1,
  } = options;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const font = `${fontWeight} ${fontSize}px 'DM Sans', sans-serif`;
  ctx.font = font;
  const textWidth = ctx.measureText(text).width;

  canvas.width = Math.ceil(textWidth + paddingX * 2);
  canvas.height = Math.ceil(fontSize * 1.8);

  // measureText resets on resize — reapply before drawing.
  ctx.font = font;
  ctx.fillStyle = background;
  const r = canvas.height * 0.28;
  roundRect(ctx, 0, 0, canvas.width, canvas.height, r);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 1);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true });
  const sprite = new THREE.Sprite(material);
  const worldScale = 0.018 * scale;
  sprite.scale.set(canvas.width * worldScale, canvas.height * worldScale, 1);
  sprite.renderOrder = 10;
  // Unlike the casing/liner materials (which share process-wide cached canvas textures — see
  // materials.factory.ts), this texture is freshly generated per label and used nowhere else, so
  // it's safe — and necessary — for `disposeObject3D` to free it instead of leaving it live.
  sprite.userData['ownsTexture'] = true;
  return sprite;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
