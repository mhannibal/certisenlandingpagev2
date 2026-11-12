"use client";

import { useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import * as THREE from "three";

/** Panneau lumineux rectangulaire, tourné vers le centre de la scène (comme `Lightformer` de drei). */
export type StudioPanel = {
  position: [number, number, number];
  scale: [number, number];
  intensity: number;
};

/**
 * Éclairage d'ambiance « studio » : des panneaux lumineux rendus une seule fois dans une carte
 * d'environnement (PMREM de three.js), qui donne les reflets des matériaux. Remplace
 * `<Environment><Lightformer/></Environment>` de drei, dont le module embarquait des chargeurs
 * d'images HDR (fflate, gainmap…) jamais utilisés ici (≈ 37 Ko de moins à télécharger).
 */
export function StudioEnvironment({ panels }: { panels: StudioPanel[] }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);

  useLayoutEffect(() => {
    const room = new THREE.Scene();
    const geometry = new THREE.PlaneGeometry(1, 1);
    const materials: THREE.Material[] = [];
    for (const p of panels) {
      // Couleur multipliée par l'intensité, sans courbe de tons : mêmes valeurs que Lightformer.
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(1, 1, 1).multiplyScalar(p.intensity),
        side: THREE.DoubleSide,
        toneMapped: false,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...p.position);
      mesh.scale.set(p.scale[0], p.scale[1], 1);
      mesh.lookAt(0, 0, 0);
      room.add(mesh);
      materials.push(material);
    }
    const pmrem = new THREE.PMREMGenerator(gl);
    const target = pmrem.fromScene(room, 0, 0.1, 100);
    const previous = scene.environment;
    scene.environment = target.texture;
    pmrem.dispose();
    geometry.dispose();
    materials.forEach((m) => m.dispose());
    return () => {
      scene.environment = previous;
      target.dispose();
    };
  }, [gl, scene, panels]);

  return null;
}
