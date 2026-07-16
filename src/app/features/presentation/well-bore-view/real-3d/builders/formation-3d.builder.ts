import * as THREE from 'three';

import { FormationInfoViewModel } from '@models/active-wwell/active-wwell-view.model';
import { ANIM } from '@models/well-design/wellbore-diagram.model';
import { ITopsIR } from '@shared/models/wwell/tops-ir.model';
import { createLabelSprite } from '../utils/label-sprite.util';
import { Depth3DScale } from '../wellbore-3d.types';

/** A formation top fades/pops in rather than clip-revealing like a pipe, so the timeline
 *  builder animates opacity/scale directly off this list instead of `Reveal3DTarget`. */
export interface FormationRing {
  readonly ring: THREE.Mesh;
  readonly label: THREE.Sprite;
  readonly isTarget: boolean;
  readonly delay: number;
}

export interface FormationBuildResult {
  readonly group: THREE.Group;
  readonly rings: FormationRing[];
}

const RING_TUBE = 0.12;

export function buildFormationTops3D(
  tops: ITopsIR[],
  formationTops: FormationInfoViewModel[],
  targetAquifer: string | null,
  depthScale: Depth3DScale,
  /** Radius the rings encircle at — derived from the *actual* casing/open-hole geometry just
   *  built (see Wellbore3DViewComponent), not a fixed guess, so they always sit just outside
   *  the pipes regardless of how wide or slender this particular well's casings turned out. */
  ringRadius: number,
): FormationBuildResult {
  const group = new THREE.Group();
  group.name = 'formation-tops';
  const rings: FormationRing[] = [];

  const actualMap = new Map(
    formationTops
      .filter(f => {
        const n = Number(f.actualDepth);
        return f.actualDepth !== null && f.actualDepth !== undefined && f.actualDepth !== '' && isFinite(n) && n > 0;
      })
      .map(f => [f.formation, Number(f.actualDepth)]),
  );

  const sorted = [...tops].sort((a, b) => a.planTvdDepth - b.planTvdDepth);

  sorted.forEach((top, idx) => {
    const isTarget = !!targetAquifer && top.stLongCd === targetAquifer;
    const actualDepth = actualMap.get(top.stLongCd);
    const hasActual = actualDepth !== undefined;
    const depth = hasActual ? actualDepth! : top.planTvdDepth;
    const y = depthScale.toY(depth);

    const color = isTarget ? '#2563eb' : hasActual ? '#16a34a' : '#94a3b8';
    const ringMat = new THREE.MeshStandardMaterial({
      color,
      emissive: isTarget ? new THREE.Color('#2563eb') : new THREE.Color('#000000'),
      emissiveIntensity: isTarget ? 0.6 : 0,
      roughness: 0.5,
      metalness: 0.3,
      transparent: true,
      opacity: 0,
    });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(ringRadius, isTarget ? RING_TUBE * 2.2 : RING_TUBE, 12, 64), ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = y;
    ring.name = `geo-top-${top.stLongCd}`;
    group.add(ring);

    const label = createLabelSprite({
      text: `${top.stLongCd}  ${depth.toLocaleString()} ft`,
      color: isTarget ? '#2563eb' : hasActual ? '#16a34a' : '#334155',
      fontSize: 24,
    });
    label.position.set(ringRadius + 1.2, y, 0);
    label.material.opacity = 0;
    group.add(label);

    const delay = (ANIM.GEO_DELAY + idx * ANIM.GEO_STAGGER) / 1000;
    rings.push({ ring, label, isTarget, delay });
  });

  return { group, rings };
}
