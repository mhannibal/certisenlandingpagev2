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

/** Bandeau animé des logos (Inria, Rocq, IEEE, OMNeT++, INET) sous le héros. 12/11/2026 (Lucas) : désactivé. */
export const TRUST_STRIP = false;

/**
 * Cartes de la Plateforme « Optimisation par IA » et « Conception visuelle » : désactivées le
 * 10/11/2026 (Lucas). Pour les réactiver, reprendre aussi la disposition du bento à 6 cartes
 * (commit 922ee27).
 */
export const SHOW_AI_DESIGN = false;
/** Carte « Cybersécurité » de la Plateforme : désactivée le 12/11/2026 (Lucas). */
export const SHOW_CYBER = false;
/** Formulaire de Contact : désactivé le 10/11/2026 (Lucas) ; l'e-mail et LinkedIn restent. */
export const CONTACT_FORM = false;
/** Étapes masquées du Parcours (rang dans le dictionnaire) : « Mai 2025 · Faisabilité démontrée » (10/11/2026). */
export const HIDDEN_ROADMAP_STEPS: readonly number[] = [1];

/*
 * Rien de ce qui est désactivé n'est envoyé au visiteur (Lucas, 12/11/2026) : le code des
 * sections en pause est chargé à part (components/sections/paused.tsx), celui des cartes et du
 * formulaire est retiré au build, et leurs textes sont retirés du dictionnaire envoyé au
 * navigateur (lib/i18n/client-dictionary.ts). Tout revient en repassant l'interrupteur à true.
 */

const ORDER: SectionKey[] = ["problem", "gap", "solution", "features", "cinema", "positioning", "roadmap", "contact"];

/** Numéro affiché d'une section (« 01 », « 02 »…), compté parmi les sections actives. */
export function sectionIndex(key: SectionKey) {
  return String(ORDER.filter((k) => SECTIONS[k]).indexOf(key) + 1).padStart(2, "0");
}
