import { NeutralToneMapping } from "three";

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
  /**
   * Post-traitement (lueur des lumières, vignette). Coupé sur téléphone et appareil modeste
   * (« scène allégée », Lucas, 13/11/2026) : sa compilation bloquait la première image ; la courbe
   * de tons est alors appliquée par le rendu lui-même et la vignette par un dégradé CSS.
   */
  post: boolean;
  /** Finesse de la carrosserie générée (1 = complète ; 0,6 sur téléphone : calcul ≈ 3 fois plus court). */
  detail: number;
};

const DESKTOP: RenderQuality = { dpr: [1, 1.75], msaa: 4, post: true, detail: 1 };
const PHONE: RenderQuality = { dpr: [1, 1.25], msaa: 2, post: false, detail: 0.6 };
const MODEST: RenderQuality = { dpr: [1, 1], msaa: 2, post: false, detail: 0.6 };

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

/**
 * Options du rendu WebGL. Sans post-traitement, la courbe de tons « PBR Neutral » (celle du
 * post-traitement sur ordinateur) est appliquée directement : mêmes couleurs, sans la lueur.
 */
export function glOptions(q: RenderQuality) {
  return {
    antialias: true,
    powerPreference: "high-performance" as const,
    ...(q.post ? {} : { toneMapping: NeutralToneMapping }),
  };
}

/** Vignette en CSS (sans post-traitement) : bords assombris comme l'effet Vignette du rendu. */
export const CSS_VIGNETTE = "radial-gradient(ellipse at center, transparent 50%, rgb(0 0 0 / 0.5) 100%)";
