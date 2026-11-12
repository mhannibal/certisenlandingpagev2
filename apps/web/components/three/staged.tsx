"use client";

import { Children, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * Monte les éléments d'une scène 3D un par un, chacun dans sa propre tâche du navigateur :
 * la construction (géométries, matériaux) est découpée en petits morceaux au lieu d'un seul
 * long blocage, et la page reste réactive pendant ce temps. L'ordre est conservé (celui des
 * mises à jour par image en dépend). `then` est monté une fois tout le reste en place
 * (ex. la compilation des shaders).
 */
export function Staged({ children, then }: { children: ReactNode; then?: ReactNode }) {
  // Liste figée tant que les enfants ne changent pas : à chaque étape, seuls les nouveaux
  // éléments sont montés, ceux déjà en place ne refont pas leur rendu.
  const items = useMemo(() => Children.toArray(children), [children]);
  const [count, setCount] = useState(1);
  useEffect(() => {
    if (count >= items.length) return;
    const id = window.setTimeout(() => setCount((c) => c + 1), 0);
    return () => window.clearTimeout(id);
  }, [count, items.length]);
  return (
    <>
      {items.slice(0, count)}
      {count >= items.length ? then : null}
    </>
  );
}
