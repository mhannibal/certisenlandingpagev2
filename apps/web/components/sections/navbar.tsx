"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowUpRight, Check, ChevronDown, Globe } from "lucide-react";
import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { Logo } from "@/components/logo";
import { LOCALES, LOCALE_COOKIE, LOCALE_META, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/provider";
import { SECTIONS, type SectionKey } from "@/lib/sections";

/** Change de langue : retient le choix (cookie, 1 an) puis charge la page dans cette langue. */
function switchLocale(next: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  window.location.assign(`/${next}${window.location.hash}`);
}

/** Largeur du sélecteur de langue ouvert. */
const LANG_PANEL_W = 188;

/**
 * Sélecteur de langue : le bouton s'étire et devient le panneau (vers la gauche et vers le bas),
 * puis les langues apparaissent en cascade. Les langues sont de vrais liens (/en, /fr, /zh)
 * avec leur langue déclarée : lisibles par les moteurs de recherche et les lecteurs d'écran.
 */
function LanguageMenu() {
  const { locale, dict } = useI18n();
  const [open, setOpen] = useState(false);
  const [btnW, setBtnW] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const listId = useId();

  // Largeur du bouton fermé : point de départ de l'étirement.
  useEffect(() => {
    const el = btn.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBtnW(el.offsetWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      btn.current?.focus();
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Flèches haut / bas entre les langues.
  const onListKey = (e: ReactKeyboardEvent<HTMLUListElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const links = Array.from(list.current?.querySelectorAll<HTMLAnchorElement>("a") ?? []);
    const i = links.indexOf(document.activeElement as HTMLAnchorElement);
    const next = links[(i + (e.key === "ArrowDown" ? 1 : -1) + links.length) % links.length];
    next?.focus();
  };

  return (
    <div
      ref={ref}
      className="relative"
      // Le focus quitte le sélecteur (Tab) : il se referme.
      onBlur={(e) => {
        if (open && !e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      {/* Surface qui s'étire depuis le bouton jusqu'au panneau. */}
      <motion.div
        initial={false}
        animate={open ? { width: LANG_PANEL_W, height: "auto" } : { width: btnW || "100%", height: 36 }}
        transition={{ type: "spring", stiffness: 420, damping: 36, mass: 0.8 }}
        className={`absolute right-0 top-0 z-40 overflow-hidden rounded-[18px] border transition-[background-color,border-color,box-shadow] duration-300 ${
          open
            ? "border-line-2 bg-card shadow-[0_18px_50px_-16px_rgb(0_0_0/0.9),inset_0_1px_0_rgb(255_255_255/0.05)]"
            : "pointer-events-none border-transparent bg-transparent"
        }`}
      >
        <div className="flex h-9 items-center pl-4">
          <motion.span
            aria-hidden
            initial={false}
            animate={open ? { opacity: 1, x: 0 } : { opacity: 0, x: 6 }}
            transition={{ duration: 0.2, delay: open ? 0.08 : 0 }}
            className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.16em] text-subtle"
          >
            {dict.nav.language}
          </motion.span>
        </div>
        <ul ref={list} id={listId} aria-label={dict.nav.language} inert={!open} onKeyDown={onListKey} className="p-1 pt-0.5">
          {LOCALES.map((l, i) => (
            <motion.li
              key={l}
              initial={false}
              animate={open ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: -6, filter: "blur(4px)" }}
              transition={{ duration: 0.22, delay: open ? 0.06 + i * 0.045 : 0 }}
            >
              <a
                href={`/${l}`}
                hrefLang={LOCALE_META[l].htmlLang}
                lang={LOCALE_META[l].htmlLang}
                aria-current={l === locale ? "true" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  if (l === locale) setOpen(false);
                  else switchLocale(l);
                }}
                className={`flex w-full items-center justify-between rounded-[12px] px-3 py-2 text-left text-sm outline-none transition-colors hover:bg-white/5 focus-visible:bg-white/[0.08] ${
                  l === locale ? "text-fg" : "text-muted hover:text-fg"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span aria-hidden className="w-7 font-mono text-[11px] text-subtle">
                    {LOCALE_META[l].short}
                  </span>
                  {LOCALE_META[l].label}
                </span>
                {l === locale ? <Check aria-hidden className="size-4" /> : null}
              </a>
            </motion.li>
          ))}
        </ul>
      </motion.div>
      <button
        ref={btn}
        type="button"
        aria-label={`${dict.nav.language} : ${LOCALE_META[locale].label}`}
        aria-expanded={open}
        aria-controls={listId}
        onClick={(e) => {
          const opening = !open;
          setOpen(opening);
          // Ouvert au clavier : le focus va sur la langue actuelle.
          if (opening && e.detail === 0) {
            requestAnimationFrame(() => list.current?.querySelector<HTMLAnchorElement>("[aria-current]")?.focus());
          }
        }}
        className={`relative z-50 inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm text-muted transition-colors duration-300 hover:text-fg ${
          open ? "border-transparent" : "border-line-2 hover:border-subtle"
        }`}
      >
        <Globe aria-hidden className="size-4" strokeWidth={1.6} />
        <span className="text-fg">{LOCALE_META[locale].short}</span>
        <ChevronDown aria-hidden className={`size-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
    </div>
  );
}

/**
 * Bouton du menu mobile : les trois traits se rejoignent puis se croisent en X,
 * le bouton s'enfonce et se remplit, une onde part du bord à chaque clic.
 */
function MenuButton({ open, label, onClick }: { open: boolean; label: string; onClick: () => void }) {
  const [taps, setTaps] = useState(0);
  return (
    <motion.button
      type="button"
      aria-label={label}
      aria-expanded={open}
      onClick={() => {
        setTaps((n) => n + 1);
        onClick();
      }}
      whileTap={{ scale: 0.86 }}
      transition={{ type: "spring", stiffness: 500, damping: 22 }}
      className={`relative grid size-10 cursor-pointer place-items-center rounded-full border transition-colors duration-300 lg:hidden ${
        open ? "border-fg bg-fg text-ink" : "border-line-2 text-fg hover:border-subtle"
      }`}
    >
      {taps ? (
        <motion.span
          key={taps}
          aria-hidden
          initial={{ scale: 1, opacity: 0.55 }}
          animate={{ scale: 1.75, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute inset-0 rounded-full border border-fg"
        />
      ) : null}
      <span aria-hidden className="relative block h-3.5 w-[18px]">
        {[-1, 0, 1].map((k) => (
          <motion.span
            key={k}
            className="absolute inset-x-0 top-1/2 -mt-[0.75px] h-[1.5px] rounded-full bg-current"
            initial={false}
            animate={
              open
                ? { y: 0, rotate: k * -45, opacity: k ? 1 : 0, scaleX: k ? 1 : 0.2 }
                : { y: k * 6, rotate: 0, opacity: 1, scaleX: 1 }
            }
            // Ouverture : les traits se rejoignent, puis tournent ; fermeture : l'inverse.
            transition={{
              y: { duration: 0.18, delay: open ? 0 : 0.14, ease: "easeInOut" },
              rotate: { type: "spring", stiffness: 380, damping: 20, delay: open ? 0.14 : 0 },
              opacity: { duration: 0.12, delay: open ? 0.06 : 0.14 },
              scaleX: { duration: 0.18, delay: open ? 0 : 0.14 },
            }}
          />
        ))}
      </span>
    </motion.button>
  );
}

/** Barre flottante : transparente en haut de page, pilule resserrée au défilement. */
export function Navbar() {
  const { dict } = useI18n();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  // État de base pendant tout le film du héros (#top) ; la pilule se resserre une fois le film terminé.
  useMotionValueEvent(scrollY, "change", (v) => {
    const hero = document.getElementById("top");
    const end = hero ? hero.offsetTop + hero.offsetHeight - window.innerHeight : 40;
    setScrolled(v > Math.max(40, end - 40));
  });

  const links = [
    { href: "#probleme", label: dict.nav.links.problem, key: "problem" },
    { href: "#solution", label: dict.nav.links.solution, key: "solution" },
    { href: "#plateforme", label: dict.nav.links.platform, key: "features" },
    { href: "#montage", label: dict.nav.links.action, key: "cinema" },
    { href: "#feuille-de-route", label: dict.nav.links.journey, key: "roadmap" },
  ].filter((l) => SECTIONS[l.key as SectionKey]);

  return (
    // Entrée en CSS dès la première image : la barre n'attend ni le JavaScript ni la 3D.
    <header className="fixed inset-x-0 top-0 z-50 flex animate-nav-in justify-center px-4 pt-4 motion-reduce:animate-none">
      {/* Lien d'évitement : invisible, il apparaît au premier Tab et mène directement au contenu. */}
      <a
        href="#contenu"
        className="sr-only rounded-full bg-fg px-4 py-2 text-sm font-medium text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]"
      >
        {dict.nav.skip}
      </a>
      <motion.nav
        animate={{
          maxWidth: scrolled ? 960 : 1200,
          paddingTop: scrolled ? 8 : 12,
          paddingBottom: scrolled ? 8 : 12,
        }}
        transition={{ type: "spring", stiffness: 220, damping: 30 }}
        className={`flex w-full items-center justify-between gap-4 rounded-full px-4 transition-[background-color,border-color,box-shadow] duration-500 sm:px-5 ${
          scrolled
            ? "border border-line-2 bg-card/80 shadow-[0_12px_40px_-12px_rgb(0_0_0/0.8),inset_0_1px_0_rgb(255_255_255/0.05)] backdrop-blur-xl"
            : "border border-transparent"
        }`}
      >
        {/* Lien en flex : sans cela, le logo (inline-flex) reposait sur la ligne de base du lien et
            remontait de ~3 px au-dessus du centre de la barre. */}
        <a href="#top" aria-label={dict.nav.home} className="flex items-center">
          <Logo />
        </a>

        <ul className="hidden items-center gap-1 lg:flex" onMouseLeave={() => setHover(null)}>
          {links.map((l) => (
            <li key={l.href} className="relative">
              <a
                href={l.href}
                onMouseEnter={() => setHover(l.href)}
                className="relative z-10 block whitespace-nowrap px-3.5 py-2 text-sm text-muted transition-colors hover:text-fg"
              >
                {l.label}
              </a>
              {hover === l.href ? (
                <motion.span
                  layoutId="nav-hover"
                  className="absolute inset-0 rounded-full bg-white/[0.07]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              ) : null}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <LanguageMenu />
          {/* Appel à l'action : onde qui s'élargit, reflet qui balaie le bouton, flèche qui repart au survol. */}
          <a
            href="#contact"
            className="group relative hidden items-center gap-1.5 whitespace-nowrap rounded-full bg-fg px-4 py-2 text-sm font-medium text-ink transition-transform duration-300 hover:scale-[1.04] active:scale-[0.98] sm:inline-flex"
          >
            <span aria-hidden className="pointer-events-none absolute inset-0 animate-cta-ring rounded-full border border-fg" />
            <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
              <span className="absolute inset-y-0 left-0 w-1/3 animate-cta-shine bg-gradient-to-r from-transparent via-black/10 to-transparent" />
            </span>
            <span className="relative">{dict.nav.contact}</span>
            <span className="relative inline-flex overflow-hidden">
              <ArrowUpRight className="size-4 group-hover:animate-cta-arrow" />
            </span>
          </a>
          <MenuButton open={open} label={open ? dict.nav.closeMenu : dict.nav.openMenu} onClick={() => setOpen((o) => !o)} />
        </div>
      </motion.nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, scale: 0.96, filter: "blur(6px)" }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="card absolute inset-x-4 top-20 origin-top-right rounded-3xl p-3 lg:hidden"
          >
            {[...links, { href: "#contact", label: dict.nav.contact }].map((l, i) => (
              <motion.a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * i }}
                className="block rounded-2xl px-4 py-3 text-base text-fg hover:bg-white/5"
              >
                {l.label}
              </motion.a>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
