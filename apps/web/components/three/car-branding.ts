import * as THREE from "three";
import type { BodyDecal } from "@/lib/car-body";
import { LOGO_PATHS } from "@/lib/logo-paths";

/**
 * Marquages CertiSen de la voiture : emblème bleu sur le capot et plaques « CertiSen ».
 * Textures dessinées une seule fois (canvas), partagées par les deux voitures du site.
 */

/** Bleu de la marque (certisen.com), demandé par Lucas pour l'emblème du capot. */
const BRAND_BLUE = "#102d6e";

let badgeTexture: THREE.CanvasTexture | null = null;
let plateTexture: THREE.CanvasTexture | null = null;

/** Logo CertiSen (bouclier, couronne, poussoir) en bleu ; la coche est évidée (on voit la peinture). */
function badge() {
  if (badgeTexture) return badgeTexture;
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d")!;
  g.scale(512 / 32, 512 / 32);
  g.fillStyle = BRAND_BLUE;
  g.strokeStyle = BRAND_BLUE;
  g.lineCap = "round";
  g.lineJoin = "round";
  g.fill(new Path2D(LOGO_PATHS.crown));
  g.lineWidth = 1.8;
  g.stroke(new Path2D(LOGO_PATHS.pusher));
  g.fill(new Path2D(LOGO_PATHS.shield));
  g.globalCompositeOperation = "destination-out";
  g.lineWidth = 2.6;
  g.stroke(new Path2D(LOGO_PATHS.check));
  badgeTexture = new THREE.CanvasTexture(c);
  badgeTexture.colorSpace = THREE.SRGBColorSpace;
  badgeTexture.anisotropy = 8;
  return badgeTexture;
}

/** Plaque au format européen (520 × 110 mm) : fond clair, liseré sombre, « CertiSen » au centre. */
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
  // Police du site (Geist, chargée par next/font), sinon police système.
  const family = getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
  g.fillStyle = "#111111";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = `600 136px ${family}`;
  g.fillText("CertiSen", 520, 116);
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
