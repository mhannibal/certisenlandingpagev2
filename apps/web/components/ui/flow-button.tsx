"use client";

import { ArrowRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Bouton « Flow » (d'après FlowButton de Kain Xu sur 21st.dev, licence MIT, recréé d'après
 * la démo — source verrouillée sans compte), aux couleurs du site : pilule à contour clair ;
 * au survol, un disque blanc grandit depuis le centre et remplit le bouton, les coins se
 * resserrent, l'icône de droite sort pendant qu'une autre entre à gauche et le texte glisse.
 */
const ROOT =
  "group relative inline-flex cursor-pointer items-center gap-1 overflow-hidden rounded-[100px] border-[1.5px] border-fg/40 bg-ink/60 px-8 py-3 text-sm font-semibold text-fg backdrop-blur-xl outline-none transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:rounded-[12px] hover:border-transparent hover:text-ink focus-visible:rounded-[12px] focus-visible:border-transparent focus-visible:text-ink active:scale-[0.95]";
const ICON_IN =
  "absolute left-[-25%] z-[9] size-4 transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:left-4 group-focus-visible:left-4";
const ICON_OUT =
  "absolute right-4 z-[9] size-4 transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:right-[-25%] group-focus-visible:right-[-25%]";
const TEXT =
  "relative z-[1] -translate-x-3 whitespace-nowrap transition-all duration-[800ms] ease-out group-hover:translate-x-3 group-focus-visible:translate-x-3";
const DISC =
  "absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg opacity-0 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:size-[24rem] group-hover:opacity-100 group-focus-visible:size-[24rem] group-focus-visible:opacity-100";

type Common = {
  children: ReactNode;
  /** Icône des deux côtés (flèche par défaut). */
  icon?: LucideIcon;
  /** Icône pleine (ex. lecture) plutôt qu'en trait. */
  filled?: boolean;
  className?: string;
  "aria-label"?: string;
  title?: string;
};

function Inner({ children, icon: Icon = ArrowRight, filled }: Pick<Common, "children" | "icon" | "filled">) {
  const fill = filled ? "fill-current" : "";
  return (
    <>
      <Icon aria-hidden className={`${ICON_IN} ${fill}`} strokeWidth={2} />
      <span className={TEXT}>{children}</span>
      <span aria-hidden className={DISC} />
      <Icon aria-hidden className={`${ICON_OUT} ${fill}`} strokeWidth={2} />
    </>
  );
}

/** Lien (href) ou bouton (onClick). */
export function FlowButton(props: Common & ({ href: string; onClick?: never } | { href?: never; onClick: () => void })) {
  const { children, icon, filled, className, href, onClick, ...rest } = props;
  const cls = `${ROOT} ${className ?? ""}`;
  return href ? (
    <a href={href} className={cls} {...rest}>
      <Inner icon={icon} filled={filled}>
        {children}
      </Inner>
    </a>
  ) : (
    <button type="button" onClick={onClick} className={cls} {...rest}>
      <Inner icon={icon} filled={filled}>
        {children}
      </Inner>
    </button>
  );
}
