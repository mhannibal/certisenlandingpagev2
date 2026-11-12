"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/**
 * Vrai si TOUS les libellés d'une rangée tiennent en entier dans leur case. Chaque case a un
 * double invisible du libellé complet (« sonde ») : on compare sa largeur à celle de la case.
 * `key` change quand les libellés changent (langue).
 */
export function useAllFit(key: string) {
  const cells = useRef<(HTMLElement | null)[]>([]);
  const probes = useRef<(HTMLElement | null)[]>([]);
  const [fit, setFit] = useState(true);
  useLayoutEffect(() => {
    const check = () =>
      setFit(
        cells.current.every((c, i) => {
          const p = probes.current[i];
          return !c || !p || p.offsetWidth <= c.clientWidth + 0.5;
        }),
      );
    check();
    const ro = new ResizeObserver(check);
    cells.current.forEach((c) => c && ro.observe(c));
    document.fonts?.ready.then(check).catch(() => {});
    return () => ro.disconnect();
  }, [key]);
  return { cells, probes, fit };
}

/**
 * Case de libellé : le libellé complet s'il tient (`fit`), sinon sa forme courte (son numéro).
 * Les lecteurs d'écran entendent toujours le libellé complet.
 */
export function FitCell({
  full,
  short,
  fit,
  cellRef,
  probeRef,
  className,
  children,
}: {
  full: string;
  short: string;
  fit: boolean;
  cellRef: (el: HTMLSpanElement | null) => void;
  probeRef: (el: HTMLSpanElement | null) => void;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <span ref={cellRef} className={`relative block min-w-0 overflow-hidden whitespace-nowrap ${className ?? ""}`}>
      <span ref={probeRef} aria-hidden className="invisible absolute left-0 top-0 whitespace-nowrap">
        {full}
      </span>
      {fit ? (
        full
      ) : (
        <>
          <span aria-hidden>{short}</span>
          <span className="sr-only">{full}</span>
        </>
      )}
      {children}
    </span>
  );
}

/**
 * Rangée de libellés (chapitres) : tous en entier s'ils tiennent TOUS, sinon tous réduits à
 * leur numéro. Jamais de libellé coupé par « … », jamais de mélange des deux.
 */
export function FitLabels({
  items,
  className,
  itemClassName,
  onSelect,
  current,
}: {
  items: { full: string; short: string }[];
  className?: string;
  itemClassName?: string;
  /** Si fourni, chaque libellé est un bouton (ex. aller au chapitre). */
  onSelect?: (index: number) => void;
  /** Libellé actif (mis en avant). */
  current?: number;
}) {
  const { cells, probes, fit } = useAllFit(items.map((it) => it.full).join("|"));
  return (
    <div className={className}>
      {items.map((it, i) => {
        const cell = (
          <FitCell
            full={it.full}
            short={it.short}
            fit={fit}
            className={`${itemClassName ?? ""} ${current === undefined ? "" : current === i ? "text-fg" : "text-muted"}`}
            cellRef={(el) => void (cells.current[i] = el)}
            probeRef={(el) => void (probes.current[i] = el)}
          />
        );
        return onSelect ? (
          <button
            key={it.full}
            type="button"
            onClick={() => onSelect(i)}
            aria-current={current === i ? "step" : undefined}
            className="min-w-0 cursor-pointer text-left transition-colors hover:[&>span]:text-fg"
          >
            {cell}
          </button>
        ) : (
          <span key={it.full} className="contents">
            {cell}
          </span>
        );
      })}
    </div>
  );
}
