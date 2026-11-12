"use client";

import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { useLenis } from "lenis/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { LOGO_PATHS } from "@/components/logo";
import { useDict } from "@/lib/i18n/provider";
import { hasWebGL } from "@/components/three/webgl-guard";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Étapes réelles du chargement, dans l'ordre affiché, avec leur poids dans la barre.
 * La scène du héros signale elle-même sa fin via useLoaderSignal().
 */
const TASKS = [
  { id: "page", weight: 1 },
  { id: "fonts", weight: 1 },
  { id: "heroModule", weight: 2 },
  { id: "heroScene", weight: 3 },
] as const;
export type LoaderTask = (typeof TASKS)[number]["id"];
const TOTAL = TASKS.reduce((s, t) => s + t.weight, 0);
/** En dessous de ce délai, aucun indicateur : la scène arrive simplement en fondu. */
const GRACE_MS = 900;
/** Au-delà, on ouvre le site quoi qu'il arrive (ex. WebGL indisponible ou très lent). */
const SAFETY_MS = 15000;

/** Vrai quand la scène 3D du héros est prête (ou abandonnée) : fondu de la scène, lecture automatique. */
const ReadyContext = createContext(false);
export const useReady = () => useContext(ReadyContext);

const SignalContext = createContext<(id: LoaderTask) => void>(() => {});
/** Renvoie une fonction stable à appeler quand l'étape `id` est terminée. */
export function useLoaderSignal(id: LoaderTask) {
  const mark = useContext(SignalContext);
  return useCallback(() => mark(id), [mark, id]);
}

/**
 * Indicateur discret, en bas au centre, pour les appareils lents uniquement : le texte du site
 * reste lisible au-dessus. Logo qui se dessine en boucle, étape en cours et barre fine.
 * Les lecteurs d'écran n'entendent que l'étape (pas chaque pourcentage).
 */
function LoadingBadge({ progress, step, label }: { progress: number; step: string; label: string }) {
  return (
    <m.div
      key="loading-badge"
      initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: 8, filter: "blur(4px)", transition: { duration: 0.35 } }}
      transition={{ duration: 0.5, ease: EASE }}
      className="pointer-events-none fixed inset-x-0 bottom-8 z-[60] mx-auto flex w-fit items-center gap-3 rounded-full border border-line-2 bg-card/85 py-2 pl-2.5 pr-4 shadow-[0_12px_40px_-12px_rgb(0_0_0/0.8)] backdrop-blur-xl"
    >
      <svg width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden className="shrink-0 text-fg">
        <path d={LOGO_PATHS.crown} fill="currentColor" />
        <m.path
          d={LOGO_PATHS.shield}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
          initial={{ pathLength: 0.05 }}
          animate={{ pathLength: [0.05, 1, 1, 0.05] }}
          transition={{ duration: 2.4, times: [0, 0.45, 0.7, 1], repeat: Infinity, ease: [0.65, 0, 0.35, 1] }}
        />
      </svg>
      <div className="flex w-36 flex-col gap-1.5 sm:w-44">
        <div className="flex items-baseline justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
          <span role="status" aria-live="polite" className="truncate">
            <span className="sr-only">{label} : </span>
            {step}
          </span>
          <span aria-hidden className="tabular-nums text-fg">
            {String(progress).padStart(3, "0")}
          </span>
        </div>
        <div aria-hidden className="h-px w-full bg-line-2">
          <div className="h-px origin-left bg-fg transition-transform duration-200" style={{ transform: `scaleX(${progress / 100})` }} />
        </div>
      </div>
    </m.div>
  );
}

/**
 * Chargement à l'arrivée, piloté par des étapes RÉELLES : page, polices, module 3D et premier
 * rendu de la scène du héros (shaders compilés). Le texte du site est visible tout de suite ;
 * la scène 3D apparaît en fondu quand elle est prête. Si cela prend plus de GRACE_MS (appareil
 * lent), un petit indicateur s'affiche en bas. La scène de la voiture se prépare à part, plus tard.
 */
export function LoaderProvider({ children }: { children: ReactNode }) {
  const labels = useDict().loader;
  const [finished, setFinished] = useState<ReadonlySet<LoaderTask>>(() => new Set());
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [slow, setSlow] = useState(false);
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;
  const finishedRef = useRef(finished);
  finishedRef.current = finished;

  const mark = useCallback((id: LoaderTask) => {
    setFinished((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  // Étapes suivies directement ici : page, polices, téléchargement du module 3D du héros.
  useEffect(() => {
    if (document.readyState === "complete") mark("page");
    else window.addEventListener("load", () => mark("page"), { once: true });
    document.fonts.ready.then(() => mark("fonts")).catch(() => mark("fonts"));
    // Sans WebGL utilisable, la scène ne sera pas montée : inutile de télécharger le moteur 3D.
    if (!hasWebGL()) mark("heroModule");
    else
      import("@/components/three/hero-film-canvas")
        .then(() => mark("heroModule"))
        .catch(() => mark("heroModule"));
  }, [mark]);

  // Fin dès que tout est réellement prêt ; indicateur seulement si cela tarde ; barre lissée.
  useEffect(() => {
    const start = performance.now();
    let shown = 0;
    let raf = 0;
    const tick = () => {
      const elapsed = performance.now() - start;
      const ok = finishedRef.current;
      const real = TASKS.reduce((s, t) => s + (ok.has(t.id) ? t.weight : 0), 0) / TOTAL;
      if (real >= 1 || elapsed > SAFETY_MS) {
        setProgress(100);
        setDone(true);
        return;
      }
      if (elapsed > GRACE_MS) setSlow(true);
      // Lissage : on rattrape le réel en douceur, sans jamais le dépasser ni reculer.
      shown = Math.min(real, shown + Math.max(0.004, (real - shown) * 0.12));
      setProgress(Math.round(shown * 100));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Défilement bloqué tant que la scène du héros n'est pas prête (le film n'aurait pas d'image).
  useEffect(() => {
    const html = document.documentElement;
    if (!done) {
      html.style.overflow = "hidden";
      lenisRef.current?.stop();
    } else {
      html.style.overflow = "";
      lenisRef.current?.start();
    }
  }, [done, lenis]);

  const step = useMemo(() => {
    const pending = TASKS.find((t) => !finished.has(t.id));
    return pending ? labels.steps[pending.id] : labels.ready;
  }, [finished, labels]);

  return (
    <SignalContext.Provider value={mark}>
      <ReadyContext.Provider value={done}>
        {children}
        <AnimatePresence>
          {slow && !done ? <LoadingBadge progress={progress} step={step} label={labels.label} /> : null}
        </AnimatePresence>
      </ReadyContext.Provider>
    </SignalContext.Provider>
  );
}
