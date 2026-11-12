/**
 * Réglages de rendu 3D adaptés à l'appareil, lus une fois côté client (les scènes 3D ne sont
 * jamais rendues côté serveur). Les ordinateurs gardent la qualité d'origine ; les téléphones
 * calculent moins de pixels ; les appareils modestes (≤ 4 cœurs ou ≤ 4 Go) encore moins.
 * En plus, chaque scène baisse sa résolution si la fluidité chute (PerformanceMonitor).
 */
export type RenderQuality = {
  /** Plage de densité de pixels du canevas. */
  dpr: [number, number];
  /** Échantillons d'anticrénelage du post-traitement. */
  msaa: number;
};

const DESKTOP: RenderQuality = { dpr: [1, 1.75], msaa: 4 };
const PHONE: RenderQuality = { dpr: [1, 1.25], msaa: 2 };
const MODEST: RenderQuality = { dpr: [1, 1], msaa: 2 };

export function renderQuality(): RenderQuality {
  if (typeof window === "undefined") return DESKTOP;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency || 8;
  const memory = nav.deviceMemory ?? 8;
  if (cores <= 4 || memory <= 4) return MODEST;
  const touch = window.matchMedia("(pointer: coarse)").matches;
  if (touch && Math.min(window.innerWidth, window.innerHeight) < 900) return PHONE;
  return DESKTOP;
}

/** Densité de repli quand la fluidité chute. */
export const DPR_FLOOR = 1;
