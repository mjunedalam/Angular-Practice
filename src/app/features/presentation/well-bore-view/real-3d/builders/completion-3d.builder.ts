import * as THREE from 'three';

import { ANIM, DiagramLayout, WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { computeCasingHalfWidth } from '@shared/utils/wellbore-math.util';
import {
  resolveCompletionBottomDepth,
  resolveCompletionTopDepth,
  resolveOhHalfWidth,
  shouldRenderGravelPack,
  shouldRenderOpenHole,
} from '../../renderers/wellbore-depth.helpers';
import { buildPipeMesh } from './casing-3d.builder';
import { createGravelMaterial, createRockMaterial, createWaterMaterial } from '../utils/materials.factory';
import { createLabelSprite } from '../utils/label-sprite.util';
import { Depth3DScale, Reveal3DTarget } from '../wellbore-3d.types';

export interface CompletionBuildResult {
  readonly group: THREE.Group;
  readonly reveals: Reveal3DTarget[];
  readonly waterRipple: THREE.Mesh | null;
  readonly drillBit: THREE.Mesh;
  readonly drillString: THREE.Mesh;
  readonly drillBitTargetY: number;
  readonly totalDepthLabel: THREE.Sprite;
  readonly totalDepthY: number;
}

/** Red→amber→green, matching the 2D mud-circulation gradient used on the drill-string arrow. */
function circulationColor(pct: number): string {
  const clamped = Math.max(0, Math.min(100, pct));
  if (clamped === 0) return '#e53e3e';
  if (clamped === 100) return '#16a34a';
  const hue = 30 + ((clamped - 1) / 98) * 25;
  return `hsl(${hue.toFixed(1)}, 90%, 50%)`;
}

function resolveWaterLevelDepth(data: WellboreDiagramData): number | null {
  const wd = data.wellDesign;
  if (!wd) return null;
  const rawTxt = wd.swLvlTxt ?? '';
  const isFlowing = /flow/i.test(rawTxt);
  if (isFlowing) {
    const match = /SIWHP[:\s]*(-?\d+(?:\.\d+)?)/i.exec(rawTxt) ?? /(-?\d+(?:\.\d+)?)\s*psi/i.exec(rawTxt);
    const psi = match ? Number(match[1]) : null;
    return psi !== null ? -(psi * 2.37) : 0;
  }
  return wd.staWaterLvl || null;
}

function buildOpenHoleAndScreen(
  data: WellboreDiagramData,
  layout: DiagramLayout,
  depthScale: Depth3DScale,
  ohStart: number,
  group: THREE.Group,
  reveals: Reveal3DTarget[],
): void {
  if (!data.casings.length || !shouldRenderOpenHole(data.wellDesign)) return;

  const ohHW = resolveOhHalfWidth(data, layout);
  const topDepth = resolveCompletionTopDepth(data.casings, data.drlgCasings);
  const bottomDepth = resolveCompletionBottomDepth(data);
  const topY = depthScale.toY(topDepth);
  const bottomY = depthScale.toY(bottomDepth);

  const material = createRockMaterial();
  const mesh = buildPipeMesh(depthScale.toRadius(ohHW), topY, bottomY, material);
  mesh.name = 'open-hole';
  group.add(mesh);

  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -topY);
  material.clippingPlanes = [plane];
  reveals.push({ mesh, clipPlane: plane, topY, bottomY, delay: ohStart, duration: ANIM.OH_DURATION / 1000 });

  const label = createLabelSprite({
    text: data.wellDesign?.ohRemarks ?? `${ohHW.toFixed(0)}px Open Hole`,
    color: '#334155',
    fontSize: 26,
  });
  label.position.set(depthScale.toRadius(ohHW) + 1.4, topY + (bottomY - topY) * 0.2, 0);
  group.add(label);
}

function buildGravelPack(
  data: WellboreDiagramData,
  layout: DiagramLayout,
  depthScale: Depth3DScale,
  gravelStart: number,
  group: THREE.Group,
  reveals: Reveal3DTarget[],
): void {
  const wellDesign = data.wellDesign;
  if (!wellDesign || !shouldRenderGravelPack(wellDesign) || !data.casings.length) return;

  const { baseHalfWidth, halfWidthIncrement, linerScreenInset, gpScreenGap, gpFillRatio } = layout;
  const innerHW = computeCasingHalfWidth(0, baseHalfWidth, halfWidthIncrement);
  const ohHW = resolveOhHalfWidth(data, layout);
  const lsHW = Math.min(innerHW, ohHW) - linerScreenInset;
  const gpMaxOuter = ohHW - gpScreenGap;
  const annulusWidth = Math.max(0, (gpMaxOuter - lsHW) * gpFillRatio);
  const innerR = depthScale.toRadius(lsHW);
  const outerR = depthScale.toRadius(lsHW + annulusWidth);
  if (outerR <= innerR) return;

  const topDepth = resolveCompletionTopDepth(data.casings, data.drlgCasings);
  const bottomDepth = resolveCompletionBottomDepth(data);
  const topY = depthScale.toY(topDepth);
  const bottomY = depthScale.toY(bottomDepth);
  const height = Math.max(0.05, topY - bottomY);

  const shape = new THREE.Shape();
  shape.absarc(0, 0, outerR, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, innerR, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  const geometry = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false, curveSegments: 48 });
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, 0, 0);

  const material = createGravelMaterial();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = bottomY;
  mesh.name = 'gravel-pack';
  group.add(mesh);

  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -topY);
  material.clippingPlanes = [plane];
  reveals.push({ mesh, clipPlane: plane, topY, bottomY, delay: gravelStart, duration: ANIM.GRAVEL_DURATION / 1000 });
}

function buildWaterLevel(
  data: WellboreDiagramData,
  layout: DiagramLayout,
  depthScale: Depth3DScale,
  group: THREE.Group,
): THREE.Mesh | null {
  const waterDepth = resolveWaterLevelDepth(data);
  if (waterDepth === null) return null;

  const widestTier = data.casings.length > 0 ? data.casings.length - 1 : 0;
  const innerHW = computeCasingHalfWidth(widestTier, layout.baseHalfWidth, layout.halfWidthIncrement);
  const radius = depthScale.toRadius(innerHW) + 0.6;
  const y = depthScale.toY(waterDepth);

  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 48),
    createWaterMaterial(),
  );
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = y;
  disc.name = 'water-level';
  group.add(disc);

  const ripple = new THREE.Mesh(
    new THREE.RingGeometry(radius * 0.2, radius * 0.28, 48),
    new THREE.MeshBasicMaterial({ color: '#0ea5e9', transparent: true, opacity: 0.85, side: THREE.DoubleSide }),
  );
  ripple.rotation.x = -Math.PI / 2;
  ripple.position.y = y + 0.02;
  ripple.name = 'water-ripple';
  group.add(ripple);

  const label = createLabelSprite({ text: `Water Level: ${waterDepth.toLocaleString()} ft`, color: '#0ea5e9', fontSize: 26 });
  label.position.set(-(radius + 1.6), y + 0.3, 0);
  group.add(label);

  return ripple;
}

function buildDrillString(
  data: WellboreDiagramData,
  depthScale: Depth3DScale,
  group: THREE.Group,
): { bit: THREE.Mesh; string: THREE.Mesh; targetY: number } {
  const currentDepth = Math.max(0, Math.min(data.currentDepth, data.totalDepth));
  const targetY = depthScale.toY(currentDepth);
  const stringHeight = Math.max(0.001, -targetY);
  const lastPct = data.mudCirculation.length > 0 ? data.mudCirculation[data.mudCirculation.length - 1].pct : 100;

  // Geometry is pre-translated so the mesh's local origin sits at its TOP edge (surface) —
  // animating `scale.y` from 0 → 1 then grows the string straight down from the rig floor,
  // instead of scaling outward from a centered pivot.
  const stringGeom = new THREE.CylinderGeometry(0.18, 0.18, stringHeight, 16);
  stringGeom.translate(0, -stringHeight / 2, 0);
  const stringMat = new THREE.MeshStandardMaterial({ color: circulationColor(lastPct), metalness: 0.6, roughness: 0.4 });
  const stringMesh = new THREE.Mesh(stringGeom, stringMat);
  stringMesh.position.y = 0;
  stringMesh.scale.y = 0;
  stringMesh.name = 'drill-string';
  group.add(stringMesh);

  const bitMat = new THREE.MeshStandardMaterial({ color: '#facc15', metalness: 0.8, roughness: 0.3 });
  const bit = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.1, 24), bitMat);
  bit.name = 'drill-bit';
  bit.position.y = 0; // rig-floor rest position; the reveal timeline drives it down to targetY
  group.add(bit);

  return { bit, string: stringMesh, targetY };
}

function buildPumpMarker(data: WellboreDiagramData, depthScale: Depth3DScale, group: THREE.Group): void {
  const pumpLvl = data.wellDesign?.pumpLvl;
  if (pumpLvl == null) return;
  const label = createLabelSprite({ text: `Pump Set @ ${pumpLvl.toLocaleString()} ft`, color: '#1e293b', fontSize: 26 });
  label.position.set(0, depthScale.toY(pumpLvl), 0.01);
  group.add(label);
}

export function buildCompletion3D(
  data: WellboreDiagramData,
  layout: DiagramLayout,
  depthScale: Depth3DScale,
  timing: { ohStart: number; gravelStart: number },
): CompletionBuildResult {
  const group = new THREE.Group();
  group.name = 'completion';
  const reveals: Reveal3DTarget[] = [];

  buildOpenHoleAndScreen(data, layout, depthScale, timing.ohStart, group, reveals);
  buildGravelPack(data, layout, depthScale, timing.gravelStart, group, reveals);
  const waterRipple = buildWaterLevel(data, layout, depthScale, group);
  const { bit, string: drillString, targetY } = buildDrillString(data, depthScale, group);
  buildPumpMarker(data, depthScale, group);

  const isBeyondTarget = data.targetDepth > 0 && data.currentDepth > data.targetDepth;
  const labelDepth = isBeyondTarget ? data.currentDepth : data.totalDepth;
  const totalDepthY = depthScale.toY(resolveCompletionBottomDepth(data));
  const totalDepthLabel = createLabelSprite({
    text: `${isBeyondTarget ? 'CURRENT DEPTH' : 'TOTAL DEPTH'}: ${labelDepth.toLocaleString()} FT`,
    color: isBeyondTarget ? '#16a34a' : '#2563eb',
    fontSize: 30,
    fontWeight: '900',
  });
  totalDepthLabel.position.set(0, totalDepthY - 2, 0);
  group.add(totalDepthLabel);

  return {
    group,
    reveals,
    waterRipple,
    drillBit: bit,
    drillString,
    drillBitTargetY: targetY,
    totalDepthLabel,
    totalDepthY,
  };
}
