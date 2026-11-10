"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";

/**
 * Bouton Ripple (d'après RippleButton de Magic UI, licence MIT) aux couleurs du site : au clic,
 * une onde blanche part du point cliqué et s'étend sur le bouton. Version lien (href) : la
 * navigation par ancre reste gérée par le défilement doux du site. Même hauteur et même forme
 * de pilule que le bouton Flow voisin.
 */
type Ripple = { x: number; y: number; size: number; key: number };
/** Attente entre le clic et le départ vers la section : le temps de voir l'onde s'étendre. */
const NAV_DELAY_MS = 450;

function Wave({ ripple, duration, color, onDone }: { ripple: Ripple; duration: number; color: string; onDone: (key: number) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDone(ripple.key), duration);
    return () => clearTimeout(t);
  }, [duration, onDone, ripple.key]);
  return (
    <span
      className="absolute animate-rippling rounded-full opacity-30"
      style={
        {
          width: ripple.size,
          height: ripple.size,
          top: ripple.y,
          left: ripple.x,
          backgroundColor: color,
          transform: "scale(0)",
          "--duration": `${duration}ms`,
        } as CSSProperties
      }
    />
  );
}

export function RippleButton({
  href,
  children,
  className,
  color = "#fafafa",
  duration = 600,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  /** Couleur de l'onde. */
  color?: string;
  /** Durée d'une onde (ms). */
  duration?: number;
}) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const next = useRef(0);
  // Second clic, rejoué après le délai : il laisse le défilement doux du site faire la navigation.
  const replay = useRef(false);
  const remove = useCallback((key: number) => setRipples((r) => r.filter((x) => x.key !== key)), []);
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (replay.current) {
      replay.current = false;
      return;
    }
    // L'onde d'abord : la navigation part un peu après, pour qu'on la voie s'étendre.
    e.preventDefault();
    const a = e.currentTarget;
    const rect = a.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    // Clavier (Entrée) : pas de position de souris, l'onde part du centre.
    const cx = e.detail === 0 ? rect.width / 2 : e.clientX - rect.left;
    const cy = e.detail === 0 ? rect.height / 2 : e.clientY - rect.top;
    next.current += 1;
    setRipples((r) => [...r, { x: cx - size / 2, y: cy - size / 2, size, key: next.current }]);
    window.setTimeout(() => {
      replay.current = true;
      a.click();
    }, NAV_DELAY_MS);
  };
  return (
    <a
      href={href}
      onClick={onClick}
      className={`relative inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-[100px] border-[1.5px] border-line-2 bg-card/70 px-6 py-3 text-sm font-semibold text-fg backdrop-blur-xl transition-colors duration-300 hover:border-subtle hover:bg-card-2 active:scale-[0.97] ${className ?? ""}`}
    >
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      <span className="pointer-events-none absolute inset-0">
        {ripples.map((r) => (
          <Wave key={r.key} ripple={r} duration={duration} color={color} onDone={remove} />
        ))}
      </span>
    </a>
  );
}
