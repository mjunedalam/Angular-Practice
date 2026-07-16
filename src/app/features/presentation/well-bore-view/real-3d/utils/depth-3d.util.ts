import { createDepthScale } from '@shared/utils/wellbore-math.util';
import { Depth3DScale } from '../wellbore-3d.types';

/** Total vertical span of the 3D rig, in scene units, regardless of well depth. */
export const SCENE_HEIGHT_UNITS = 46;

/** Divides a 2D layout half-width (px) down to a 3D radius (scene units). Now that the camera
 *  fits the real bounding box per axis (see `OrbitCameraController.frameBox`) rather than a
 *  guessed distance, a wider ratio no longer breaks the framing — it just reads as a chunkier,
 *  more clearly telescoped set of pipes instead of a hair-thin column. */
const RADIUS_PX_TO_UNIT = 1 / 20;

/** Converts the same depth (ft) / half-width (px) space the 2D SVG renderers use into
 *  Three.js scene units — depth grows downward as negative Y, radii shrink proportionally
 *  so casing telescoping reads the same way in both views. */
export function createDepth3DScale(totalDepthFt: number): Depth3DScale {
  const px = createDepthScale(totalDepthFt, SCENE_HEIGHT_UNITS);
  return {
    toY: (depthFt: number) => -px(Math.max(0, depthFt)),
    toRadius: (pxHalfWidth: number) => Math.max(0.35, pxHalfWidth * RADIUS_PX_TO_UNIT),
  };
}
