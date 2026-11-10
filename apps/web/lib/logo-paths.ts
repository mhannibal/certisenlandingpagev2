/**
 * Tracés du logo CertiSen (repère 32 × 32) : bouclier plein = sûreté, couronne et poussoir
 * de chronomètre = temps réel, coche en réserve = certifié. Module sans « use client » :
 * utilisable côté serveur (image Open Graph) comme côté client (logo, scène 3D).
 */
export const LOGO_PATHS = {
  crown: "M13.6 1.2h4.8a1 1 0 0 1 0 2h-1.4v1.6h-2V3.2h-1.4a1 1 0 0 1 0-2Z",
  pusher: "M24.3 6.9 25.9 5.3",
  shield: "M16 5.2 26.4 8.9v6.8c0 6.4-4.2 11.1-10.4 13.6C9.8 26.8 5.6 22.1 5.6 15.7V8.9L16 5.2Z",
  check: "m11.3 16.9 3.3 3.3 6.2-6.6",
};
