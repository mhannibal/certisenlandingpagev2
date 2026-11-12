"use client";

import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

/**
 * Prépare la scène dès son montage, même si elle est hors écran : compile tous les
 * shaders (en parallèle si possible) puis calcule une image complète (post-traitement compris). Signale ensuite
 * la fin à l'écran de chargement. À placer en DERNIER dans le <Canvas>.
 */
export function Precompile({ onReady }: { onReady?: () => void }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const advance = useThree((s) => s.advance);

  useEffect(() => {
    if (!onReady) return;
    let cancelled = false;
    const raf = requestAnimationFrame(async () => {
      try {
        // Compilation en tâche de fond (extension KHR_parallel_shader_compile) quand elle existe :
        // la page reste réactive pendant que les shaders se préparent ; sinon, compilation directe.
        if (typeof gl.compileAsync === "function") await gl.compileAsync(scene, camera);
        else gl.compile(scene, camera);
        if (!cancelled) advance(performance.now());
      } catch {
        /* la scène s'affichera quand même ; on ne bloque pas le chargement */
      } finally {
        if (!cancelled) onReady();
      }
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [gl, scene, camera, advance, onReady]);

  return null;
}
