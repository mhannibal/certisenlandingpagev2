"use client";

import { motion } from "motion/react";

import { LOGO_PATHS } from "@/lib/logo-paths";

/**
 * Logo CertiSen (monochrome) : bouclier plein = sûreté, couronne et poussoir
 * de chronomètre = temps réel, coche en réserve = certifié. Tracés dans lib/logo-paths.
 */
export { LOGO_PATHS };

export function LogoMark({
  size = 28,
  animate = true,
  className,
  cutout = "var(--color-ink)",
}: {
  size?: number;
  animate?: boolean;
  className?: string;
  /** Couleur de la coche en réserve (celle du fond). */
  cutout?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <path d={LOGO_PATHS.crown} fill="currentColor" />
      <path d={LOGO_PATHS.pusher} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d={LOGO_PATHS.shield} fill="currentColor" />
      <motion.path
        d={LOGO_PATHS.check}
        stroke={cutout}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={animate ? { pathLength: 0 } : false}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.7, delay: 0.5, ease: [0.65, 0, 0.35, 1] }}
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-fg ${className ?? ""}`}>
      <LogoMark size={26} />
      <span className="text-[17px] font-medium tracking-[-0.025em]">CertiSen</span>
    </span>
  );
}
