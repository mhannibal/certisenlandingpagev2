"use client";

import {
  BadgeCheck,
  BrainCircuit,
  CloudDownload,
  FileCode2,
  Layers,
  RadioTower,
  Route,
  Timer,
  type LucideIcon,
} from "lucide-react";
import { useAnimationFrame, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import * as m from "motion/react-m";
import { useRef, type PointerEvent, type RefObject } from "react";
import { LogoMark } from "@/components/logo";
import { Wire } from "@/components/ui/animated-beam";
import { Reveal } from "@/components/ui/blur-text";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { useDict } from "@/lib/i18n/provider";
import { sectionIndex } from "@/lib/sections";

function Node({
  nodeRef,
  icon: Icon,
  title,
  lines,
}: {
  nodeRef: RefObject<HTMLDivElement | null>;
  icon: LucideIcon;
  title: string;
  lines: string[];
}) {
  return (
    // Contenu centré dans la carte : icône et titre sur une ligne, détail en dessous.
    // Téléphone : tuile miniature (icône au-dessus du titre, détail réservé aux lecteurs d'écran).
    <div ref={nodeRef} className="card relative z-10 rounded-md px-1 py-1.5 text-center transition-colors hover:border-line-2 sm:rounded-lg sm:p-4">
      <div className="flex flex-col items-center gap-1 sm:flex-row sm:justify-center sm:gap-3">
        <span className="card-inset grid size-5 shrink-0 place-items-center rounded text-fg sm:size-8 sm:rounded-md">
          <Icon className="size-3 sm:size-4" strokeWidth={1.6} />
        </span>
        <p className="text-[9.5px] font-medium leading-tight text-fg sm:text-sm">{title}</p>
      </div>
      <p className="sr-only text-xs leading-relaxed text-muted sm:not-sr-only sm:mt-2.5 sm:block">{lines.join(" · ")}</p>
    </div>
  );
}

/**
 * Carte « CertiSen Core » en 3D : inclinaison qui suit la souris (ressort), couches à
 * différentes profondeurs, tranche visible, reflet lumineux et légère oscillation au repos.
 * L'enveloppe extérieure (coreRef) ne bouge pas : les liaisons du schéma s'y accrochent.
 */
function CoreCard3D({
  coreRef,
  label,
  desc,
}: {
  coreRef: RefObject<HTMLDivElement | null>;
  label: string;
  desc: string;
}) {
  const reduce = useReducedMotion();
  const hovering = useRef(false);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const gx = useMotionValue(50);
  const gy = useMotionValue(30);
  const srx = useSpring(rx, { stiffness: 140, damping: 16, mass: 0.6 });
  const sry = useSpring(ry, { stiffness: 140, damping: 16, mass: 0.6 });
  const glare = useMotionTemplate`radial-gradient(420px circle at ${gx}% ${gy}%, rgb(255 255 255 / 0.9), transparent 55%)`;

  // Oscillation au repos, pour qu'on devine le volume sans interaction.
  useAnimationFrame((time) => {
    if (reduce || hovering.current) return;
    rx.set(Math.sin(time / 2200) * 3);
    ry.set(Math.cos(time / 2600) * 6);
  });

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * 24);
    rx.set((0.5 - py) * 24);
    gx.set(px * 100);
    gy.set(py * 100);
  };

  const layer = (z: number) => ({ transform: `translateZ(${z}px)` });

  return (
    <div
      ref={coreRef}
      className="relative z-10 w-full"
      style={{ perspective: 900 }}
      onPointerEnter={() => (hovering.current = true)}
      onPointerLeave={() => {
        hovering.current = false;
        gx.set(50);
        gy.set(30);
      }}
      onPointerMove={onMove}
    >
      <m.div style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }} className="relative">
        {/* Tranche : couches décalées en profondeur, visibles quand la carte s'incline */}
        {[4, 8, 12].map((d, i) => (
          <div
            key={d}
            aria-hidden
            className="absolute inset-0 rounded-xl"
            style={{ transform: `translateZ(-${d}px)`, background: ["#d6d6d6", "#b8b8b8", "#8f8f8f"][i] }}
          />
        ))}
        <div
          aria-hidden
          className="absolute inset-0 rounded-xl shadow-[0_40px_80px_-24px_rgb(0_0_0/0.95)]"
          style={{ transform: "translateZ(-14px)" }}
        />

        {/* Face */}
        {/* Téléphone : logo et « CertiSen Core » seulement ; le détail est repris sous le schéma. */}
        <div className="relative overflow-hidden rounded-lg bg-fg px-2 py-4 text-center text-ink sm:rounded-xl sm:p-5 lg:p-6" style={{ transformStyle: "preserve-3d" }}>
          <m.div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-25 mix-blend-soft-light"
            style={{ background: glare }}
          />
          <div style={layer(45)}>
            <LogoMark size={44} className="mx-auto size-8 text-ink sm:size-9 lg:size-11 drop-shadow-[0_8px_10px_rgb(0_0_0/0.25)]" animate={false} cutout="#fafafa" />
          </div>
          <div style={layer(28)}>
            <p className="mt-2 text-[12px] font-semibold tracking-tight sm:mt-3 sm:text-base lg:text-lg">CertiSen Core</p>
            <p className="hidden font-mono text-[9px] uppercase tracking-[0.18em] text-ink/60 sm:block lg:text-[10px]">{label}</p>
          </div>
          <p className="mt-3 hidden text-[13px] text-ink/75 sm:block lg:mt-4 lg:text-sm" style={layer(14)}>
            {desc}
          </p>
          <div
            className="mt-4 hidden rounded-md bg-ink px-2.5 py-2 font-mono text-[11px] text-fg shadow-[0_12px_20px_-8px_rgb(0_0_0/0.6)] sm:block lg:mt-5 lg:px-3 lg:py-2.5 lg:text-[12px]"
            style={layer(36)}
          >
            AcceptedByAI(x) ⇒ CertifiedByCore(x)
          </div>
        </div>
      </m.div>
    </div>
  );
}

export function Solution() {
  const t = useDict().solution;
  const n = t.nodes;
  const box = useRef<HTMLDivElement>(null);
  const model = useRef<HTMLDivElement>(null);
  const reqs = useRef<HTMLDivElement>(null);
  const tools = useRef<HTMLDivElement>(null);
  const ai = useRef<HTMLDivElement>(null);
  const core = useRef<HTMLDivElement>(null);
  const ota = useRef<HTMLDivElement>(null);
  const cert = useRef<HTMLDivElement>(null);
  const conf = useRef<HTMLDivElement>(null);
  const mon = useRef<HTMLDivElement>(null);

  return (
    <section id="solution" className="relative py-14 sm:py-24 md:py-28 lg:py-36">
      <Container>
        <SectionHeading index={sectionIndex("solution")} eyebrow={t.eyebrow} title={t.title} accent={t.accent} description={t.description} />

        <Reveal className="mt-10 sm:mt-16">
          {/* Même schéma qu'au PC à toutes les tailles (demande de Lucas) : entrées | IA, Core, OTA | sorties,
              reliés par les liaisons animées ; en miniature sur téléphone. */}
          <div
            ref={box}
            className="bg-dots relative grid grid-cols-[1fr_1.2fr_1fr] gap-x-4 rounded-xl border border-line bg-ink-2 px-2.5 py-3 sm:gap-x-10 sm:p-6 lg:grid-cols-[1fr_1.1fr_1fr] lg:gap-16 lg:p-10"
          >
            {/* Entrées */}
            <div className="relative flex flex-col justify-center gap-2 sm:gap-3 lg:gap-4">
              <p className="text-center font-mono text-[8px] uppercase tracking-[0.12em] text-subtle sm:text-left sm:text-[11px] sm:tracking-[0.16em]">{t.inputs}</p>
              <Node nodeRef={model} icon={Route} title={n.model.title} lines={n.model.lines} />
              <Node nodeRef={reqs} icon={Timer} title={n.reqs.title} lines={n.reqs.lines} />
              <Node nodeRef={tools} icon={Layers} title={n.tools.title} lines={n.tools.lines} />
            </div>

            {/* Cœur : IA au-dessus, Core au centre, OTA en dessous */}
            <div className="relative flex flex-col items-center justify-center gap-6 sm:gap-10 lg:gap-12">
              <div className="w-full">
                <Node nodeRef={ai} icon={BrainCircuit} title={n.ai.title} lines={n.ai.lines} />
              </div>

              <CoreCard3D coreRef={core} label={t.core.label} desc={t.core.desc} />

              <div className="w-full">
                <Node nodeRef={ota} icon={CloudDownload} title={n.ota.title} lines={n.ota.lines} />
              </div>
            </div>

            {/* Sorties */}
            <div className="relative flex flex-col justify-center gap-2 sm:gap-3 lg:gap-4">
              <p className="text-center font-mono text-[8px] uppercase tracking-[0.12em] text-subtle sm:text-left sm:text-[11px] sm:tracking-[0.16em]">{t.outputs}</p>
              <Node nodeRef={cert} icon={BadgeCheck} title={n.cert.title} lines={n.cert.lines} />
              <Node nodeRef={conf} icon={FileCode2} title={n.conf.title} lines={n.conf.lines} />
              <Node nodeRef={mon} icon={RadioTower} title={n.mon.title} lines={n.mon.lines} />
            </div>

            <Wire container={box} from={model} to={core} />
            <Wire container={box} from={reqs} to={core} delay={0.6} />
            <Wire container={box} from={tools} to={core} delay={1.2} />
            <Wire container={box} from={ai} to={core} dir="v" duration={1.6} />
            <Wire container={box} from={ota} to={core} dir="v" duration={1.6} delay={0.8} />
            <Wire container={box} from={core} to={cert} delay={0.3} />
            <Wire container={box} from={core} to={conf} delay={0.9} />
            <Wire container={box} from={core} to={mon} delay={1.5} />
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-5 text-[13px] text-muted sm:text-sm">
          {t.footnote[0]}
          <span className="text-fg">{t.footnote[1]}</span>
        </Reveal>
        {/* Téléphone : détail de la carte CertiSen Core, retiré du schéma pour qu'il reste lisible. */}
        <Reveal delay={0.15} className="mt-4 sm:hidden">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
            <span className="text-fg">CertiSen Core</span> · {t.core.label}
          </p>
          <p className="mt-1.5 text-[13px] text-muted">{t.core.desc}</p>
          <p className="mt-2.5 inline-block rounded-md border border-line-2 bg-card px-2.5 py-1.5 font-mono text-[11px] text-fg">
            AcceptedByAI(x) ⇒ CertifiedByCore(x)
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
