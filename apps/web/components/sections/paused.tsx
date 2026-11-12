"use client";

import dynamic from "next/dynamic";

/**
 * Sections en pause (lib/sections.ts). Leur code est mis à part et n'est téléchargé que si la
 * section est réactivée et affichée : tant qu'elle est désactivée, le visiteur ne reçoit rien.
 * (Chargement à la demande d'après la doc de Next, « Lazy Loading › Importing Client Components ».)
 */
const SECTIONS_PAUSED = {
  problem: dynamic(() => import("./problem").then((m) => m.Problem)),
  gap: dynamic(() => import("./gap").then((m) => m.Gap)),
  positioning: dynamic(() => import("./positioning").then((m) => m.Positioning)),
  trust: dynamic(() => import("./trust-strip").then((m) => m.TrustStrip)),
};

export function PausedSection({ name }: { name: keyof typeof SECTIONS_PAUSED }) {
  const Section = SECTIONS_PAUSED[name];
  return <Section />;
}
