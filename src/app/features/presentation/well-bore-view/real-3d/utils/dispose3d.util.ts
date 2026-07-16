import * as THREE from 'three';

/** Recursively frees GPU geometry/material memory for a subtree before it's discarded — needed
 *  because, unlike the 2D SVG view, every redraw rebuilds real WebGL resources.
 *
 *  Deliberately does NOT dispose `material.map` textures: several materials (steel/liner/rock/
 *  gravel — see materials.factory.ts) share a process-wide cached canvas texture across every
 *  casing/redraw, and disposing one instance's map would blank that texture for every other mesh
 *  still referencing it. Texture memory here is small and bounded (a handful of tiny canvas
 *  bitmaps), so leaving them live for the process lifetime is the safe trade-off. */
export function disposeObject3D(root: THREE.Object3D): void {
  root.traverse(obj => {
    const mesh = obj as Partial<THREE.Mesh & THREE.Sprite>;
    mesh.geometry?.dispose();
    const material = mesh.material;
    const materials = Array.isArray(material) ? material : material ? [material] : [];
    materials.forEach(m => {
      // Label sprites (see label-sprite.util.ts) flag their own uniquely-generated canvas
      // texture with `ownsTexture` — unlike the shared casing/liner textures, nothing else
      // references it, so it must be disposed here or every redraw leaks one more canvas.
      if (obj.userData['ownsTexture']) {
        (m as THREE.MeshStandardMaterial | THREE.SpriteMaterial).map?.dispose();
      }
      m.dispose();
    });
  });
}
