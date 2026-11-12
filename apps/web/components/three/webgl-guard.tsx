"use client";

import { Component, useEffect, useSyncExternalStore, type ReactNode } from "react";

let support: boolean | undefined;

/** Rendu par le processeur (pas de carte graphique utilisable) : nom du moteur de rendu. */
const SOFTWARE = /swiftshader|llvmpipe|softpipe|software|basic render driver/i;

/**
 * WebGL utilisable ? (testé une fois ; le contexte d'essai est aussitôt libéré). Un rendu
 * logiciel compte comme « non » : sans carte graphique (serveurs de test comme PageSpeed,
 * vieux PC, pilote bloqué), compiler les scènes figerait la page plusieurs secondes ;
 * la version de secours s'affiche à la place.
 */
export function hasWebGL() {
  if (support !== undefined) return support;
  try {
    const canvas = document.createElement("canvas");
    // « failIfMajorPerformanceCaveat » : le navigateur refuse le contexte s'il serait logiciel.
    const opts = { failIfMajorPerformanceCaveat: true };
    const gl = (canvas.getContext("webgl2", opts) ?? canvas.getContext("webgl", opts)) as WebGLRenderingContext | null;
    let soft = false;
    if (gl) {
      const info = gl.getExtension("WEBGL_debug_renderer_info");
      const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER) ?? "");
      soft = SOFTWARE.test(renderer);
    }
    support = !!gl && !soft;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    support = false;
  }
  return support;
}

const noop = () => () => {};

class Boundary extends Component<
  { fallback: ReactNode; onError?: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError?.();
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * Protège une scène 3D : si WebGL est indisponible ou seulement logiciel (stratégie
 * d'entreprise, pilote graphique, navigateur ancien, pas de carte graphique) ou si la scène lève une erreur,
 * on affiche `fallback` au lieu de faire tomber toute la page. `onFallback` permet
 * de prévenir l'écran de chargement que la scène ne viendra pas.
 */
export function WebGLGuard({
  children,
  fallback,
  onFallback,
}: {
  children: ReactNode;
  fallback: ReactNode;
  onFallback?: () => void;
}) {
  // null côté serveur et à l'hydratation, puis le vrai résultat côté client.
  const ok = useSyncExternalStore(noop, hasWebGL, () => null);
  useEffect(() => {
    if (ok === false) onFallback?.();
  }, [ok, onFallback]);
  if (ok === null) return null;
  if (!ok) return <>{fallback}</>;
  return (
    <Boundary fallback={fallback} onError={onFallback}>
      {children}
    </Boundary>
  );
}
