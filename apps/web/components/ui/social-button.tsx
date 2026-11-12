"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useRef, useState, type FocusEvent, type ReactNode } from "react";
import { copyText } from "@/lib/copy-text";

/**
 * Bouton « Partager » d'après « Social Share Button » de 21st.dev (@Shatlyk1011).
 * Adaptations : motion (déjà dans le projet, nouveau nom de framer-motion) via LazyMotion, couleurs
 * du site et taille réduite (pastille de 36 px), vrais partages, clavier et lecteurs d'écran. Fermé : pastille « Partager ». Ouvert : une icône par élément, puis « copier ».
 * Sur téléphone, une icône ouvre la feuille de partage du système ; sinon son contenu est copié.
 */
export type ShareAction = {
  id: string;
  label: string;
  icon: ReactNode;
  /** Couleurs au survol (comme les réseaux du composant d'origine). */
  color?: string;
  /** Données de la feuille de partage (téléphone). Absent : le bouton copie toujours. */
  data?: () => ShareData;
  /** Texte copié (ordinateur, ou téléphone sans feuille de partage). */
  copy: () => string;
};

// Couleurs du site (12/11, Lucas : « met nos couleurs finalement ») et taille réduite.
const BTN =
  "flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted transition-colors";
const HOVER = "hover:bg-line hover:text-fg";
const COPIED = "bg-accent/10 text-accent";
/** Largeur et hauteur de la pastille fermée (px). */
const CLOSED_W = 104;
const H = 36;

export default function SocialButton({
  label,
  groupLabel,
  copiedLabel,
  actions,
  copyAll,
  className,
}: {
  label: string;
  /** Nom du groupe d'icônes pour les lecteurs d'écran. */
  groupLabel: string;
  copiedLabel: string;
  actions: ShareAction[];
  /** Bouton « copier » après le séparateur. */
  copyAll: ShareAction;
  className?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const first = useRef<HTMLButtonElement>(null);
  const focusBack = useRef(false);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Ouvert : le focus passe à la première icône ; fermé par Échap : il revient sur « Partager ».
  useEffect(() => {
    if (isExpanded) first.current?.focus({ preventScroll: true });
    else if (focusBack.current) {
      focusBack.current = false;
      toggle.current?.focus({ preventScroll: true });
    }
  }, [isExpanded]);

  // Fermeture : toucher ou clic en dehors, ou Échap.
  useEffect(() => {
    if (!isExpanded) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setIsExpanded(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      focusBack.current = true;
      setIsExpanded(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [isExpanded]);

  // Tab vers un élément hors du bouton : on referme (pas quand la fenêtre perd le focus,
  // par exemple à l'ouverture de la feuille de partage).
  const onBlur = (e: FocusEvent<HTMLDivElement>) => {
    const next = e.relatedTarget as Node | null;
    if (isExpanded && next && !root.current?.contains(next)) setIsExpanded(false);
  };

  const run = async (a: ShareAction) => {
    const phone = window.matchMedia("(pointer: coarse)").matches;
    if (a.data && phone && typeof navigator.share === "function") {
      try {
        await navigator.share(a.data());
        return;
      } catch (e) {
        // Feuille fermée par l'utilisateur : rien à faire ; autre refus : on copie.
        if (e instanceof DOMException && e.name === "AbortError") return;
      }
    }
    if (!(await copyText(a.copy()))) return;
    setCopied(a.id);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(null), 2000);
  };

  return (
    // Emplacement fixe (taille de la pastille fermée) : en s'ouvrant, le bouton déborde sans
    // décaler la mise en page du pied de page.
    <div ref={root} onBlur={onBlur} className={`relative ${className ?? ""}`} style={{ width: CLOSED_W, height: H }}>
      <m.div
        animate={{ width: isExpanded ? "auto" : `${CLOSED_W}px`, height: `${H}px` }}
        className="absolute left-1/2 top-0 z-10 flex -translate-x-1/2 items-center overflow-hidden rounded-full border border-line-2 bg-card transition-colors duration-300 hover:border-subtle sm:left-0 sm:translate-x-0"
        initial={false}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <AnimatePresence mode="sync" initial={false}>
          {!isExpanded ? (
            <m.button
              ref={toggle}
              key="share-text"
              type="button"
              aria-expanded={false}
              onClick={() => setIsExpanded(true)}
              className="absolute inset-0 flex cursor-pointer items-center justify-center gap-1.5 text-muted transition-colors hover:text-fg"
              exit={{ opacity: 0, y: -20 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Share2 aria-hidden className="h-3.5 w-3.5" />
              <span className="text-[13px] font-medium">{label}</span>
            </m.button>
          ) : (
            <m.div
              key="actions"
              role="group"
              aria-label={groupLabel}
              className="flex items-center px-1"
              exit={{ opacity: 0, scale: 0.9 }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.2 }}
            >
              {actions.map((a, i) => (
                <button
                  key={a.id}
                  ref={i === 0 ? first : undefined}
                  type="button"
                  title={a.label}
                  aria-label={a.label}
                  onClick={() => run(a)}
                  className={`${BTN} ${copied === a.id ? COPIED : (a.color ?? HOVER)}`}
                >
                  {copied === a.id ? <Check aria-hidden className="h-4 w-4" strokeWidth={2.6} /> : a.icon}
                </button>
              ))}
              <div aria-hidden className="mx-1 h-5 w-px bg-line-2" />
              <button
                type="button"
                title={copyAll.label}
                aria-label={copyAll.label}
                onClick={() => run(copyAll)}
                className={`${BTN} ${copied === copyAll.id ? COPIED : HOVER}`}
              >
                {copied === copyAll.id ? (
                  <Check aria-hidden className="h-4 w-4" strokeWidth={2.6} />
                ) : (
                  <Copy aria-hidden className="h-4 w-4" />
                )}
              </button>
            </m.div>
          )}
        </AnimatePresence>
      </m.div>
      {/* Annonce pour les lecteurs d'écran */}
      <span role="status" className="sr-only">
        {copied ? copiedLabel : ""}
      </span>
    </div>
  );
}

/** Logo LinkedIn (lucide-react 1.x n'a plus les logos de marques). */
export function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
