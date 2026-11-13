import * as THREE from "three";
import type { BodyDecal } from "@/lib/car-body";
import { BRAND, SYMBOL_BLUE, WORDMARK } from "@/lib/logo-paths";

/**
 * Marquages CertiSen de la voiture : emblème bleu sur le capot et plaques « CertiSen ».
 * Textures dessinées une seule fois (canvas), partagées par les deux voitures du site.
 */


let badgeTexture: THREE.CanvasTexture | null = null;
let plateTexture: THREE.CanvasTexture | null = null;

/**
 * Logo officiel (version bleue pour fond clair) sur le capot : dessin bleu CertiSen, coche verte ;
 * les parties blanches du logo restent transparentes (on voit la peinture argent).
 */
function badge() {
  if (badgeTexture) return badgeTexture;
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d")!;
  const k = (512 * 0.94) / 100;
  g.translate((512 - SYMBOL_BLUE.w * k) / 2, 512 * 0.03);
  g.scale(k, k);
  g.fillStyle = BRAND.blue;
  g.fill(new Path2D(SYMBOL_BLUE.body), "evenodd");
  g.fillStyle = BRAND.green;
  g.fill(new Path2D(SYMBOL_BLUE.check), "evenodd");
  badgeTexture = new THREE.CanvasTexture(c);
  badgeTexture.colorSpace = THREE.SRGBColorSpace;
  badgeTexture.anisotropy = 8;
  return badgeTexture;
}

/** Plaque au format européen (520 × 110 mm) : fond clair, liseré sombre, mot « CertiSen » du logo au centre. */
function plate() {
  if (plateTexture) return plateTexture;
  const c = document.createElement("canvas");
  c.width = 1040;
  c.height = 220;
  const g = c.getContext("2d")!;
  g.fillStyle = "#e6e6e6";
  g.beginPath();
  g.roundRect(4, 4, 1032, 212, 22);
  g.fill();
  g.lineWidth = 8;
  g.strokeStyle = "#1a1a1a";
  g.stroke();
  // « CertiSen » dans la police du logo officiel (tracé du mot), centré.
  const h = 104;
  const k = h / 100;
  g.translate((1040 - WORDMARK.w * k) / 2, (220 - h) / 2);
  g.scale(k, k);
  g.fillStyle = "#111111";
  g.fill(new Path2D(WORDMARK.d), "evenodd");
  plateTexture = new THREE.CanvasTexture(c);
  plateTexture.colorSpace = THREE.SRGBColorSpace;
  plateTexture.anisotropy = 8;
  return plateTexture;
}

/**
 * Matériau d'un marquage. Transparent pour s'effacer avec sa pièce (démontage) ; dessiné après
 * la carrosserie (renderOrder du maillage) et légèrement avancé (polygonOffset) : pas de scintillement.
 */
export function decalMaterial(kind: BodyDecal["kind"]) {
  if (kind === "badge") {
    return new THREE.MeshPhysicalMaterial({
      map: badge(),
      transparent: true,
      alphaTest: 0.05,
      // Peu de reflets : sous la lumière zénithale de « En action », un vernis brillant
      // blanchissait le bleu du logo.
      metalness: 0,
      roughness: 0.55,
      clearcoat: 0.2,
      clearcoatRoughness: 0.35,
      envMapIntensity: 0.5,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    });
  }
  return new THREE.MeshStandardMaterial({
    map: plate(),
    transparent: true,
    metalness: 0.05,
    roughness: 0.4,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -2,
  });
}
