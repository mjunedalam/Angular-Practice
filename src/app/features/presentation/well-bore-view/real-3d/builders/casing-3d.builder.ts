import * as THREE from 'three';

import { ANIM, DiagramLayout, WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { ICasingIR } from '@shared/models/wwell/casing-ir.model';
import { IDrlgCsg } from '@shared/models/wwell/drlg-csg.model';
import { computeCasingHalfWidth, inchLabel } from '@shared/utils/wellbore-math.util';
import { LinerEntry, resolveLiners } from '../../renderers/liner.renderer';
import { getCasingTier } from '../../renderers/wellbore-depth.helpers';
import { createCasingMaterial, createLinerMaterial, createScreenGridMaterial } from '../utils/materials.factory';
import { createLabelSprite } from '../utils/label-sprite.util';
import { Depth3DScale, Reveal3DTarget } from '../wellbore-3d.types';

const RADIAL_SEGMENTS = 40;

// Label styling/positioning mirrors the 2D SVG's `.casing-label__primary` line — same "est vs
// act" text content and green-for-actual color, plus a thin leader line matching 2D's
// `.casing-label__line` connector. Labels are collected into their own group (see
// `CasingBuildResult.labelsGroup`) that the caller keeps *out* of the camera's bounding-box fit —
// a single long label (e.g. a screen + pre-perf liner's tags) sitting on a narrow inner pipe can
// be visually wider than every casing combined, and letting that drive the fit zoomed the whole
// scene out until the pipes themselves looked tiny. Framing on pipe geometry alone keeps the
// zoom level predictable; labels can now afford to be large and bold instead of squeezed down to
// avoid blowing up that measurement.
const LABEL_GAP = 0.4;
const LABEL_FONT_SIZE = 48;
const LABEL_SCALE = 1.6;
const LABEL_PLANNED_COLOR = '#0f172a';
const LABEL_ACTUAL_COLOR = '#16a34a';
const LEADER_LINE_MATERIAL = new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.85 });

// Mirrors 2D's `.casing-size-inner` text — the OD size painted directly on the pipe itself
// (centered on its axis, no leader line, no background pill), always black regardless of
// est/act, unlike the callout label above which keeps the green/black distinction.
const INNER_LABEL_FONT_SIZE = 40;
const INNER_LABEL_SCALE = 1.1;
const INNER_LABEL_COLOR = '#000000';

function attachPipeLabel(labelsGroup: THREE.Group, text: string, radius: number, y: number, hasActual: boolean): void {
  const sprite = createLabelSprite({
    text,
    color: hasActual ? LABEL_ACTUAL_COLOR : LABEL_PLANNED_COLOR,
    fontSize: LABEL_FONT_SIZE,
    fontWeight: '900',
    scale: LABEL_SCALE,
  });
  const leaderEndX = radius + LABEL_GAP;
  sprite.position.set(leaderEndX + sprite.scale.x / 2, y, 0);
  labelsGroup.add(sprite);

  // Thin leader line from the pipe wall to the label — same role as 2D's `.casing-label__line`.
  const leader = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(radius, y, 0),
      new THREE.Vector3(leaderEndX, y, 0),
    ]),
    LEADER_LINE_MATERIAL,
  );
  labelsGroup.add(leader);
}

/** Mirrors `renderCasingLabels`'/`renderLinerLabels`' `.casing-size-inner` text — just the OD
 *  size, centered on the pipe's own axis at the given depth, painted straight onto the pipe. */
function attachInnerSizeLabel(labelsGroup: THREE.Group, size: string, y: number): void {
  const sprite = createLabelSprite({
    text: `${inchLabel(size)}`,
    color: INNER_LABEL_COLOR,
    background: 'rgba(255,255,255,0)',
    fontSize: INNER_LABEL_FONT_SIZE,
    fontWeight: '900',
    scale: INNER_LABEL_SCALE,
  });
  sprite.position.set(0, y, 0);
  labelsGroup.add(sprite);
}

// Mirrors 2D's `.liner-hanger` — a solid black marker at the point each liner is hung/anchored
// from the bottom of the tubular above it (`buildScreenHanger`, drawn as two flat wedges flaring
// inward from the liner's own OD wall). A cylindrical liner has no single flat "wall" to flare
// two wedges from, so the 3D equivalent is a real 360° collar instead: a short black cone frustum,
// wide (`HANGER_FLARE_PX` beyond the liner's own half-width, matching 2D's `size` flare) at the
// shallow end where it meets the casing above, tapering back down to the liner's own OD over a
// short vertical span (`HANGER_HEIGHT_UNITS`).
const HANGER_COLOR = 0x000000;
const HANGER_FLARE_PX = 26;
const HANGER_HEIGHT_UNITS = 0.3;

function buildLinerHanger(depthScale: Depth3DScale, halfWidth: number, hangerDepth: number): THREE.Mesh {
  const innerRadius = depthScale.toRadius(halfWidth);
  const outerRadius = depthScale.toRadius(halfWidth + HANGER_FLARE_PX);
  const topY = depthScale.toY(hangerDepth);
  const geometry = new THREE.CylinderGeometry(outerRadius, innerRadius, HANGER_HEIGHT_UNITS, RADIAL_SEGMENTS);
  const material = new THREE.MeshStandardMaterial({ color: HANGER_COLOR, roughness: 0.5, metalness: 0.3 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'liner-hanger';
  mesh.position.y = topY - HANGER_HEIGHT_UNITS / 2;
  return mesh;
}

/** Mirrors `renderCasingLabels`' primary label text in casing.renderer.ts (size/type/depth,
 *  trailing " *" only for as-drilled/actual entries). */
function casingLabelText(entry: CasingEntry): string {
  const suffix = entry.hasActual ? ' *' : '';
  return `${inchLabel(entry.size)} ${entry.csgType} @ ${Math.round(entry.bottomDepth).toLocaleString()} ft${suffix}`;
}

/** Mirrors `renderLinerLabels`' primary label text in liner.renderer.ts (OD/screen/pre-perf tags
 *  and trailing " *" for as-drilled/actual entries). */
function linerLabelText(liner: LinerEntry): string {
  const screenTag = liner.isScreen ? ' (Screen)' : '';
  const prePerfTag = liner.isPrePerfLiner ? ' (Pre Perf Liner)' : '';
  const suffix = liner.hasActual ? ' *' : '';
  return `${inchLabel(liner.odSz)} Liner @ ${Math.round(liner.botDepth).toLocaleString()} ft${screenTag}${prePerfTag}${suffix}`;
}

export interface CasingBuildResult {
  /** Pipe meshes only — pass this (and only this) to the camera's bounding-box fit. */
  readonly group: THREE.Group;
  /** Text label sprites — render these, but keep them out of the camera-fit measurement. */
  readonly labelsGroup: THREE.Group;
  readonly reveals: Reveal3DTarget[];
  /** Bottom-most Y of the deepest structural casing shoe — completion builder anchors off this. */
  readonly lastCasingBottomY: number;
}

interface CasingEntry {
  readonly size: string;
  readonly csgType: string;
  readonly topDepth: number;
  readonly bottomDepth: number;
  readonly tier: number;
  readonly hasActual: boolean;
}

function uniqueByOd(drlgCasings: IDrlgCsg[]): IDrlgCsg[] {
  const map = new Map<string, IDrlgCsg>();
  for (const d of drlgCasings) {
    if (d.wCsgBotDpth <= 0) continue;
    const existing = map.get(d.wCsgOdSz);
    if (!existing || d.wCsgBotDpth > existing.wCsgBotDpth) map.set(d.wCsgOdSz, d);
  }
  return [...map.values()].sort((a, b) => b.wCsgBotDpth - a.wCsgBotDpth);
}

function resolveCasingEntries(casings: ICasingIR[], drlgCasings: IDrlgCsg[]): CasingEntry[] {
  if (casings.length === 0) {
    return uniqueByOd(drlgCasings).map((actual, i) => ({
      size: actual.wCsgOdSz,
      csgType: 'Casing',
      topDepth: 0,
      bottomDepth: actual.wCsgBotDpth,
      tier: i,
      hasActual: true,
    }));
  }

  return casings
    .filter(c => c.csgType !== 'Liner' && c.csgType !== 'Gravel Pack')
    .map(csg => {
      const tier = getCasingTier(csg, casings);
      const actual = drlgCasings.find(d => d.wCsgOdSz === csg.csgSize) ?? null;
      const hasActual = actual !== null && actual.wCsgBotDpth > 0;
      return {
        size: hasActual ? actual!.wCsgOdSz : csg.csgSize,
        csgType: csg.csgType,
        topDepth: 0,
        bottomDepth: hasActual ? actual!.wCsgBotDpth : csg.csgDepth,
        tier,
        hasActual,
      };
    });
}

/** Plain, constant-radius open pipe wall — a straight tube like a real drilling casing, with no
 *  decorative shoe taper. `openEnded` (no top/bottom caps) so the transparent walls read as a
 *  hollow tube, letting inner casings/liners show through. */
export function buildPipeMesh(radius: number, topY: number, bottomY: number, material: THREE.Material): THREE.Mesh {
  const height = Math.max(0.05, topY - bottomY);
  const geometry = new THREE.CylinderGeometry(radius, radius, height, RADIAL_SEGMENTS, 1, true);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = (topY + bottomY) / 2;
  return mesh;
}

export interface CasingTiming {
  /** Seconds — mirrors `t_casingsStart` in the 2D component's sequential timeline. */
  readonly casingsStart: number;
  /** Seconds — mirrors `t_linersStart` (computed via `computeOverlayDelay`, kept identical to 2D). */
  readonly linersStart: number;
}

export function buildCasings3D(
  data: WellboreDiagramData,
  layout: DiagramLayout,
  depthScale: Depth3DScale,
  { casingsStart, linersStart }: CasingTiming,
): CasingBuildResult {
  const group = new THREE.Group();
  group.name = 'casings';
  const labelsGroup = new THREE.Group();
  labelsGroup.name = 'casing-labels';
  const reveals: Reveal3DTarget[] = [];
  const entries = resolveCasingEntries(data.casings, data.drlgCasings);
  let lastCasingBottomY = 0;
  let lastCasingBottomDepth = 0;

  // Mirrors `renderCasingLabels`' `sortedShoeDepths`/rank lookup exactly: the inner size label
  // for a given casing sits at the midpoint of the section unique to it — from the next-shallower
  // casing's shoe (or ground level for the shallowest) down to its own shoe — not simply its own
  // top/bottom, since `entry.topDepth` is always 0 here (every structural casing starts at
  // ground) and would otherwise put every inner label at the same nonsensical near-surface spot.
  const sortedShoeDepths = entries.map((e) => e.bottomDepth).sort((a, b) => a - b);

  entries.forEach((entry, i) => {
    const hw = computeCasingHalfWidth(entry.tier, layout.baseHalfWidth, layout.halfWidthIncrement);
    const radius = depthScale.toRadius(hw);
    const topY = depthScale.toY(entry.topDepth);
    const bottomY = depthScale.toY(entry.bottomDepth);
    const isConductor = entry.csgType.toLowerCase() === 'conductor';
    const material = createCasingMaterial(entry.hasActual, isConductor);
    const mesh = buildPipeMesh(radius, topY, bottomY, material);
    mesh.name = `casing-${entry.size}`;
    group.add(mesh);
    attachPipeLabel(labelsGroup, casingLabelText(entry), radius, bottomY, entry.hasActual);

    const rank = sortedShoeDepths.indexOf(entry.bottomDepth);
    const innerTopDepth = rank > 0 ? sortedShoeDepths[rank - 1] : 0;
    const innerMidY = depthScale.toY((innerTopDepth + entry.bottomDepth) / 2);
    attachInnerSizeLabel(labelsGroup, entry.size, innerMidY);

    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -topY);
    material.clippingPlanes = [plane];
    const animOrder = entries.length - 1 - i;
    reveals.push({
      mesh,
      clipPlane: plane,
      topY,
      bottomY,
      delay: casingsStart + animOrder * (ANIM.CASING_STAGGER / 1000),
      duration: ANIM.CASING_DURATION / 1000,
    });

    lastCasingBottomY = Math.min(lastCasingBottomY, bottomY);
    lastCasingBottomDepth = Math.max(lastCasingBottomDepth, entry.bottomDepth);
  });

  const liners = resolveLiners(data.casings, data.drlgCasings, layout, data.wellDesign);

  liners.forEach((liner, i) => {
    const radius = depthScale.toRadius(liner.halfWidth);
    const topY = depthScale.toY(liner.topDepth);
    const bottomY = depthScale.toY(liner.botDepth);
    const material = liner.isScreen ? createScreenGridMaterial() : createLinerMaterial(liner.hasActual, liner.isScreen);
    const mesh = buildPipeMesh(radius, topY, bottomY, material);
    mesh.name = `liner-${liner.odSz}`;
    group.add(mesh);

    // Mirrors 2D's `hangerY`: anchored where *this* liner exits the tubular above it — the
    // deepest structural casing shoe for the first liner, or the previous liner's own shoe for
    // every liner after that — not this liner's own `topDepth`, which as-drilled data can report
    // as sitting well above that overlap point.
    const hangerDepth = i === 0 ? lastCasingBottomDepth : liners[i - 1].botDepth;
    group.add(buildLinerHanger(depthScale, liner.halfWidth, hangerDepth));

    attachPipeLabel(labelsGroup, linerLabelText(liner), radius, bottomY, liner.hasActual);
    const linerMidY = depthScale.toY((liner.topDepth + liner.botDepth) / 2);
    attachInnerSizeLabel(labelsGroup, liner.odSz, linerMidY);

    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -topY);
    material.clippingPlanes = [plane];
    const delay = (liners.length - 1 - i) * (ANIM.CASING_STAGGER / 1000);
    reveals.push({
      mesh,
      clipPlane: plane,
      topY,
      bottomY,
      delay: linersStart + delay,
      duration: ANIM.OH_DURATION / 1000,
    });

    lastCasingBottomY = Math.min(lastCasingBottomY, bottomY);
  });

  return { group, labelsGroup, reveals, lastCasingBottomY };
}
