import "server-only";
import {
  CONTACT_FORM,
  HIDDEN_ROADMAP_STEPS,
  SECTIONS,
  SHOW_AI_DESIGN,
  SHOW_CYBER,
  TRUST_STRIP,
} from "@/lib/sections";
import type { Dictionary } from "./dictionaries/en";

/** Copie de `o` sans les clés qui valent `true` dans `drop`. */
function without<T extends object>(o: T, drop: Partial<Record<keyof T, boolean>>): T {
  const r = { ...o } as Record<PropertyKey, unknown>;
  for (const k of Object.keys(drop) as (keyof T)[]) if (drop[k]) delete r[k as PropertyKey];
  return r as T;
}

/**
 * Dictionnaire transmis au navigateur (I18nProvider) : sans les textes des éléments désactivés
 * dans lib/sections.ts — sections en pause, cartes de la Plateforme, formulaire de Contact,
 * étape masquée du Parcours — ni les métadonnées (déjà dans le <head>). Les fichiers de langue
 * restent complets : réactiver un élément remet ses textes automatiquement.
 * (Lucas, 12/11/2026 : ce qui est désactivé ne doit pas être envoyé à l'utilisateur.)
 */
export function clientDictionary(d: Dictionary): Dictionary {
  const out = without(d, {
    meta: true,
    trust: !TRUST_STRIP,
    problem: !SECTIONS.problem,
    gap: !SECTIONS.gap,
    positioning: !SECTIONS.positioning,
  });
  out.nav = { ...d.nav, links: without(d.nav.links, { problem: !SECTIONS.problem }) };
  out.features = {
    ...d.features,
    items: without(d.features.items, { ai: !SHOW_AI_DESIGN, design: !SHOW_AI_DESIGN, cyber: !SHOW_CYBER }),
    // Libellés des visuels des cartes IA (GCL, cycle) et Conception (pré-certifié).
    visuals: without(d.features.visuals, { gcl: !SHOW_AI_DESIGN, cycle: !SHOW_AI_DESIGN, precertified: !SHOW_AI_DESIGN }),
  };
  out.contact = without(d.contact, { form: !CONTACT_FORM });
  out.roadmap = { ...d.roadmap, steps: d.roadmap.steps.filter((_, i) => !HIDDEN_ROADMAP_STEPS.includes(i)) };
  return out;
}
