"use client";

import { useScroll, useTransform } from "motion/react";
import * as m from "motion/react-m";
import { useRef } from "react";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { useDict } from "@/lib/i18n/provider";
import { sectionIndex } from "@/lib/sections";



/** Étapes masquées (rang dans la liste des dictionnaires). */
const HIDDEN_STEPS = new Set([1]);

export function Roadmap() {
  const t = useDict().roadmap;
  // Étape 2 (« Mai 2025 · Faisabilité démontrée ») désactivée le 10/11/2026 (Lucas).
  const STEPS = t.steps.filter((_, i) => !HIDDEN_STEPS.has(i));
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="feuille-de-route" className="bg-fade relative py-14 sm:py-24 md:py-28 lg:py-36">
      <Container>
        <SectionHeading index={sectionIndex("roadmap")} eyebrow={t.eyebrow} title={t.title} accent={t.accent} />

        {/* Traits de la frise hors de la liste : une <ol> ne doit contenir que des <li> (lecteurs d'écran). */}
        <div className="relative mt-10 sm:mt-16">
          <span aria-hidden className="absolute bottom-0 left-[7px] top-0 w-px bg-line md:left-[calc(25%+7px)]" />
          <m.span
            aria-hidden
            style={{ scaleY }}
            className="absolute bottom-0 left-[7px] top-0 w-px origin-top bg-fg md:left-[calc(25%+7px)]"
          />
          <ol ref={ref} className="relative">
            {STEPS.map((s, i) => (
              <m.li
                key={s.date}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15% 0px" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative grid gap-1.5 pb-8 pl-9 last:pb-0 sm:gap-2 sm:pb-12 sm:pl-10 md:grid-cols-[25%_1fr] md:gap-0 md:pl-0"
              >
                <p className="font-mono text-[13px] text-muted sm:text-sm md:pr-10 md:text-right">{s.date}</p>
                <span
                  className={`absolute left-0 top-1 size-[15px] rounded-full border md:left-[25%] ${
                    i === STEPS.length - 1 ? "border-fg bg-ink" : "border-fg bg-fg"
                  }`}
                />
                <div className="md:pl-12">
                  <h3 className="text-lg font-medium tracking-tight text-fg sm:text-xl">{s.title}</h3>
                  <p className="mt-1 max-w-lg text-[15px] leading-relaxed text-muted sm:mt-1.5 sm:text-base">{s.text}</p>
                </div>
              </m.li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
