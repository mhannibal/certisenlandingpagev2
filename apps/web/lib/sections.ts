/**
 * Sections de la page d'accueil, dans l'ordre. Désactiver une section la retire de la page
 * et du menu, et renumérote les suivantes (01, 02…) sans toucher à son code.
 *
 * 10/11/2026 (Lucas) : Problème, Fossé et Positionnement désactivés le temps de décider
 * s'ils sont gardés.
 */
export const SECTIONS = {
  problem: false,
  gap: false,
  solution: true,
  features: true,
  cinema: true,
  positioning: false,
  roadmap: true,
  contact: true,
} as const;

export type SectionKey = keyof typeof SECTIONS;

const ORDER: SectionKey[] = ["problem", "gap", "solution", "features", "cinema", "positioning", "roadmap", "contact"];

/** Numéro affiché d'une section (« 01 », « 02 »…), compté parmi les sections actives. */
export function sectionIndex(key: SectionKey) {
  return String(ORDER.filter((k) => SECTIONS[k]).indexOf(key) + 1).padStart(2, "0");
}
