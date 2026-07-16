import gsap from 'gsap';
import * as THREE from 'three';

import { FormationRing } from '../builders/formation-3d.builder';
import { OrbitCameraController } from '../utils/orbit-camera.controller';
import { Gsap3DTiming } from '../utils/anim-speed.util';
import { Reveal3DTarget } from '../wellbore-3d.types';

export interface DrillPhase {
  readonly bit: THREE.Mesh;
  readonly string: THREE.Mesh;
  readonly targetY: number;
  readonly start: number;
  readonly duration: number;
}

export interface RevealTimelineOptions {
  /** Casings + liners + open hole + gravel pack — all clip-plane "grow downward" reveals. */
  readonly pipeReveals: Reveal3DTarget[];
  readonly formationRings: FormationRing[];
  readonly waterRipple: THREE.Mesh | null;
  readonly waterStart: number;
  readonly drill: DrillPhase;
  readonly totalDepthLabel: THREE.Sprite;
  readonly totalDepthStart: number;
  readonly orbit: OrbitCameraController;
  readonly introRadius: number;
  readonly restRadius: number;
  readonly timing: Gsap3DTiming;
}

/**
 * Builds the master GSAP timeline for one wellbore-3d-view redraw — a direct 3D analogue of
 * `WellBoreViewComponent.buildDiagram()`'s sequential D3 transition chain: casings drill down
 * one by one, then liners, open hole, gravel pack, water, drill string and labels follow.
 */
export function buildRevealTimeline(options: RevealTimelineOptions): gsap.core.Timeline {
  const tl = gsap.timeline();

  addCameraIntro(tl, options);
  addPipeReveals(tl, options.pipeReveals);
  addFormationReveals(tl, options.formationRings, options.timing);
  addWaterReveal(tl, options.waterRipple, options.waterStart);
  addDrillPhase(tl, options.drill);
  addTotalDepthPop(tl, options.totalDepthLabel, options.totalDepthStart, options.timing);

  return tl;
}

function addCameraIntro(tl: gsap.core.Timeline, options: RevealTimelineOptions): void {
  const { orbit, introRadius, restRadius } = options;
  orbit.radius = introRadius;
  orbit.resetOrientation();
  orbit.autoRotate = false;

  // Simple dolly-in on the flat front-elevation angle — no azimuth swing, so the well reads
  // like the 2D diagram (stable, no spinning) until the user manually orbits it.
  tl.to(orbit, { radius: restRadius, duration: 2.2, ease: 'power2.out' }, 0);
}

function addPipeReveals(tl: gsap.core.Timeline, reveals: Reveal3DTarget[]): void {
  reveals.forEach(({ clipPlane, topY, bottomY, delay, duration }) => {
    const proxy = { y: topY };
    tl.to(proxy, {
      y: bottomY,
      duration: Math.max(0.05, duration),
      ease: 'power2.inOut',
      onUpdate: () => { clipPlane.constant = -proxy.y; },
    }, delay);
  });
}

function addFormationReveals(tl: gsap.core.Timeline, rings: FormationRing[], timing: Gsap3DTiming): void {
  rings.forEach(({ ring, label, isTarget, delay }) => {
    const ringMat = ring.material as THREE.MeshStandardMaterial;
    const targetOpacity = isTarget ? 0.85 : 0.6;

    tl.fromTo(ring.scale, { x: 0.2, y: 0.2, z: 0.2 }, {
      x: 1, y: 1, z: 1, duration: timing.popDur, ease: timing.popEase,
    }, delay)
      .to(ringMat, { opacity: targetOpacity, duration: timing.fadeDur, ease: 'power1.out' }, delay)
      .to(label.material, { opacity: 1, duration: timing.fadeDur, ease: 'power1.out' }, delay + timing.popDur * 0.4);

    if (isTarget) {
      tl.to(ringMat, {
        emissiveIntensity: 1.4,
        duration: 0.9,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      }, delay + timing.popDur);
    }
  });
}

function addWaterReveal(tl: gsap.core.Timeline, ripple: THREE.Mesh | null, waterStart: number): void {
  if (!ripple) return;
  const mat = ripple.material as THREE.MeshBasicMaterial;

  tl.to(ripple.scale, {
    x: 9, y: 9, z: 9,
    duration: 2.2,
    ease: 'sine.out',
    repeat: -1,
  }, waterStart)
    .to(mat, {
      opacity: 0,
      duration: 2.2,
      ease: 'sine.out',
      repeat: -1,
    }, waterStart);
}

function addDrillPhase(tl: gsap.core.Timeline, drill: DrillPhase): void {
  const { bit, string: drillString, targetY, start, duration } = drill;

  tl.to(drillString.scale, { y: 1, duration: Math.max(0.1, duration), ease: 'none' }, start)
    .to(bit.position, { y: targetY, duration: Math.max(0.1, duration), ease: 'none' }, start);

  // Idle drill-bit spin — independent of the timeline so it keeps turning after the reveal settles.
  gsap.to(bit.rotation, { y: `+=${Math.PI * 2}`, duration: 1.4, ease: 'none', repeat: -1 });
}

function addTotalDepthPop(tl: gsap.core.Timeline, label: THREE.Sprite, start: number, timing: Gsap3DTiming): void {
  const baseScale = label.scale.clone();
  label.scale.set(0, 0, 1);
  tl.to(label.scale, {
    x: baseScale.x, y: baseScale.y,
    duration: timing.popDur,
    ease: timing.popEase,
  }, start);
}
