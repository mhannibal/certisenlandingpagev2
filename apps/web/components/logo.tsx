"use client";

import * as m from "motion/react-m";

import { BRAND, SYMBOL, SYMBOL_BLUE, WORDMARK } from "@/lib/logo-paths";

/**
 * Logo officiel CertiSen (13/11/2026) : demi-bouclier, chronomètre et coche verte. Tracés
 * vectorisés depuis les logos fournis (lib/logo-paths.ts, scripts/logo-trace.py).
 * - `tone="dark"` (par défaut) : pour fond sombre, dessin de la couleur du texte (blanc) ;
 * - `tone="light"` : pour fond clair, dessin bleu CertiSen (cadran plein).
 */
export { BRAND, SYMBOL, SYMBOL_BLUE, WORDMARK };

export function LogoMark({
  size = 28,
  animate = true,
  tone = "dark",
  className,
}: {
  /** Hauteur en pixels (la largeur suit les proportions du symbole). */
  size?: number;
  animate?: boolean;
  tone?: "dark" | "light";
  className?: string;
}) {
  const s = tone === "light" ? SYMBOL_BLUE : SYMBOL;
  return (
    <svg
      width={(size * s.w) / 100}
      height={size}
      viewBox={`0 0 ${s.w} 100`}
      fill="none"
      className={className}
      aria-hidden
    >
      <path d={s.body} fill={tone === "light" ? BRAND.blue : "currentColor"} fillRule="evenodd" />
      <m.path
        d={s.check}
        fill={BRAND.green}
        fillRule="evenodd"
        style={{ transformBox: "fill-box", transformOrigin: "30% 70%" }}
        initial={animate ? { opacity: 0, scale: 0.4 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

/** Mot « CertiSen » dans la police du logo officiel (couleur du texte). */
export function Wordmark({ height = 14, className }: { height?: number; className?: string }) {
  return (
    <svg
      width={(height * WORDMARK.w) / 100}
      height={height}
      viewBox={`0 0 ${WORDMARK.w} 100`}
      className={className}
      aria-hidden
    >
      <path d={WORDMARK.d} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}

/** Logo horizontal (barre de navigation, pied de page) : symbole + mot. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-fg ${className ?? ""}`}>
      <LogoMark size={28} />
      <Wordmark height={15} />
      <span className="sr-only">CertiSen</span>
    </span>
  );
}
