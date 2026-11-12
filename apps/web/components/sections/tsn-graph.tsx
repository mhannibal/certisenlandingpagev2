"use client";

/**
 * Graphe du réseau TSN embarqué, en colonnes par domaine (même principe que la page
 * « Graphe des nœuds » de CertiSen Autoware) : cartes de nœuds à liseré, liens courbes
 * fléchés, points de message qui circulent, survol qui met en avant les échanges.
 * Monochrome : la chaîne de freinage (critique) en blanc, le reste en gris.
 */

import * as m from "motion/react-m";
import { Check } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CRITICAL_PATH, NODES, type CarNode } from "@/lib/car-network";
import { NODE_ICON } from "@/components/three/node-icons";
import { useDict } from "@/lib/i18n/provider";

type Id = CarNode["id"];

const W = 204; // largeur d'une carte
const H = 46; // hauteur d'une carte
const VB = { w: 1000, h: 400 };
const COLS = [
  { key: "sensors", x: 24 },
  { key: "network", x: 290 },
  { key: "compute", x: 556 },
  { key: "actuators", x: 792 },
] as const;
type ColKey = (typeof COLS)[number]["key"];

const PLACE: Record<Id, { col: ColKey; y: number }> = {
  radar: { col: "sensors", y: 96 },
  camera: { col: "sensors", y: 182 },
  lidar: { col: "sensors", y: 268 },
  "sw-front": { col: "network", y: 96 },
  "sw-central": { col: "network", y: 182 },
  "sw-rear": { col: "network", y: 268 },
  ecu: { col: "compute", y: 182 },
  "brake-fl": { col: "actuators", y: 120 },
  "brake-rl": { col: "actuators", y: 244 },
};
const colX = (c: ColKey) => COLS.find((k) => k.key === c)!.x;
const box = (id: Id) => ({ x: colX(PLACE[id].col), y: PLACE[id].y });

/**
 * Téléphone : les domaines deviennent des rangées (capteurs en haut, actionneurs en bas) et
 * le graphe se lit de haut en bas ; cartes plus grandes, nom sur deux lignes, sans le rôle.
 */
const MW = 104;
const MH = 50;
/** Carte du graphe sur téléphone (unités du dessin), reprise par la bascule boutons → cartes. */
export const NARROW_CARD = { w: MW, h: MH } as const;
const ROW_Y: Record<ColKey, number> = { sensors: 6, network: 100, compute: 194, actuators: 288 };
const MPLACE: Record<Id, { row: ColKey; x: number }> = {
  radar: { row: "sensors", x: 8 },
  camera: { row: "sensors", x: 128 },
  lidar: { row: "sensors", x: 248 },
  "sw-front": { row: "network", x: 8 },
  "sw-central": { row: "network", x: 128 },
  "sw-rear": { row: "network", x: 248 },
  ecu: { row: "compute", x: 128 },
  "brake-fl": { row: "actuators", x: 8 },
  "brake-rl": { row: "actuators", x: 248 },
};

type Layout = {
  narrow: boolean;
  vb: { w: number; h: number };
  w: number;
  h: number;
  box: (id: Id) => { x: number; y: number };
  /** En-têtes de domaine : trait et libellé. */
  heads: { key: ColKey; x: number; y: number; w: number }[];
};

const WIDE: Layout = {
  narrow: false,
  vb: VB,
  w: W,
  h: H,
  box,
  heads: COLS.map((c) => ({ key: c.key, x: c.x, y: 34, w: W })),
};

const NARROW: Layout = {
  narrow: true,
  vb: { w: 360, h: 362 },
  w: MW,
  h: MH,
  box: (id) => ({ x: MPLACE[id].x, y: ROW_Y[MPLACE[id].row] + 22 }),
  heads: COLS.map((c) => ({ key: c.key, x: 8, y: ROW_Y[c.key], w: 344 })),
};

/** Nom coupé en deux lignes au plus, à l'espace le plus proche du milieu (cartes étroites du téléphone). */
export function twoLines(name: string) {
  if (name.length <= 13 || !name.includes(" ")) return [name];
  const words = name.split(" ");
  let best = 1;
  let gap = Infinity;
  for (let i = 1; i < words.length; i++) {
    const g = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length);
    if (g < gap) {
      gap = g;
      best = i;
    }
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

/** Vrai sous 640 px de large (lu après le montage : le rendu serveur reste en colonnes). */
export function useNarrowGraph() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(max-width: 639px)");
    const f = () => setNarrow(m.matches);
    f();
    m.addEventListener("change", f);
    return () => m.removeEventListener("change", f);
  }, []);
  return narrow;
}

/** Liens orientés dans le sens principal des messages ; `both` = échange dans les deux sens. */
const EDGES: { from: Id; to: Id; both?: boolean }[] = [
  { from: "radar", to: "sw-front" },
  { from: "camera", to: "sw-central" },
  { from: "lidar", to: "sw-rear" },
  { from: "sw-front", to: "sw-central", both: true },
  { from: "sw-rear", to: "sw-central", both: true },
  { from: "sw-central", to: "ecu", both: true },
  { from: "sw-front", to: "brake-fl" },
  { from: "sw-rear", to: "brake-rl" },
];

const onCritical = (a: Id, b: Id) =>
  CRITICAL_PATH.some((id, i) => {
    const n = CRITICAL_PATH[i + 1];
    return n !== undefined && ((id === a && n === b) || (id === b && n === a));
  });

/** Tracé d'un lien : courbe entre colonnes, ou arc sur le côté droit dans une même colonne. */
function edgePath(from: Id, to: Id, L: Layout) {
  if (L.narrow) {
    const a = L.box(from);
    const b = L.box(to);
    // Même rangée : trait horizontal entre cartes voisines ; sinon courbe du bas de l'une au haut de l'autre.
    if (MPLACE[from].row === MPLACE[to].row) {
      const ltr = a.x < b.x;
      const y = a.y + MH / 2;
      return `M ${ltr ? a.x + MW : a.x} ${y} L ${ltr ? b.x : b.x + MW} ${y}`;
    }
    const x1 = a.x + MW / 2;
    const y1 = a.y + MH;
    const x2 = b.x + MW / 2;
    const y2 = b.y;
    const my = (y1 + y2) / 2;
    return `M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`;
  }
  const a = box(from);
  const b = box(to);
  if (PLACE[from].col === PLACE[to].col) {
    const x = a.x + W;
    const y1 = a.y + H / 2;
    const y2 = b.y + H / 2;
    return `M ${x} ${y1} C ${x + 46} ${y1}, ${x + 46} ${y2}, ${x} ${y2}`;
  }
  const x1 = a.x + W;
  const y1 = a.y + H / 2;
  const x2 = b.x;
  const y2 = b.y + H / 2;
  const mx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
}

const SVG_NS = "http://www.w3.org/2000/svg";
const TRAVEL_MS = 1300;

export function TsnGraph({
  visible,
  certified,
  selected,
  onSelect,
  nodesHidden = false,
}: {
  visible: boolean;
  /** Cartes masquées pendant que les boutons de la voiture viennent prendre leur place. */
  nodesHidden?: boolean;
  certified: boolean;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const d = useDict();
  const L = useNarrowGraph() ? NARROW : WIDE;
  const [hover, setHover] = useState<Id | null>(null);
  const focus = (selected as Id | null) ?? hover;
  const paths = useRef(new Map<string, SVGPathElement>());
  const dots = useRef<SVGGElement>(null);
  const edges = useMemo(
    () =>
      EDGES.map((e) => ({
        ...e,
        key: `${e.from}-${e.to}`,
        d: edgePath(e.from, e.to, L),
        crit: onCritical(e.from, e.to),
      })),
    [L],
  );

  // Points de message : la chaîne de freinage en continu (blanc), les autres flux plus espacés (gris).
  useEffect(() => {
    const g = dots.current;
    if (!g || !visible) return;
    type Dot = {
      el: SVGCircleElement;
      path: SVGPathElement;
      len: number;
      start: number;
      reverse: boolean;
    };
    let list: Dot[] = [];
    const next = new Map(
      edges.map((e) => [e.key, performance.now() + Math.random() * 400]),
    );
    let raf = 0;
    const frame = (now: number) => {
      for (const e of edges) {
        if (now < next.get(e.key)!) continue;
        const path = paths.current.get(e.key);
        if (!path) continue;
        const el = document.createElementNS(SVG_NS, "circle");
        el.setAttribute("r", e.crit ? "3.2" : "2.4");
        el.style.fill = e.crit ? "#ffffff" : "#8a8a8a";
        el.style.pointerEvents = "none";
        g.appendChild(el);
        list.push({
          el,
          path,
          len: path.getTotalLength(),
          start: now,
          reverse: !!e.both && Math.random() < 0.5,
        });
        // Trafic dense : un message toutes les ~0,25 s sur la chaîne critique, ~0,5 s ailleurs.
        next.set(e.key, now + (e.crit ? 220 : 480) + Math.random() * 200);
      }
      list = list.filter((dt) => {
        const p = (now - dt.start) / TRAVEL_MS;
        if (p >= 1) {
          dt.el.remove();
          return false;
        }
        const q = dt.path.getPointAtLength((dt.reverse ? 1 - p : p) * dt.len);
        dt.el.setAttribute("cx", String(q.x));
        dt.el.setAttribute("cy", String(q.y));
        return true;
      });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      g.replaceChildren();
    };
  }, [visible, edges]);

  const neighbours = new Set<Id>();
  if (focus)
    for (const e of edges)
      if (e.from === focus || e.to === focus) {
        neighbours.add(e.from);
        neighbours.add(e.to);
      }

  return (
    <svg
      viewBox={`0 0 ${L.vb.w} ${L.vb.h}`}
      className="h-auto w-full select-none"
      role="img"
      aria-label={d.cinema.graph.label}
    >
      <defs>
        {(
          [
            ["tsn-arrow", "#6e6e6e"],
            ["tsn-arrow-on", "#fafafa"],
          ] as const
        ).map(([id, fill]) => (
          <marker
            key={id}
            id={id}
            viewBox="0 0 10 10"
            refX={9}
            refY={5}
            markerWidth={7}
            markerHeight={7}
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" style={{ fill }} />
          </marker>
        ))}
      </defs>

      {/* En-têtes de colonnes */}
      {L.heads.map((c, i) => {
        const count = NODES.filter((n) => PLACE[n.id].col === c.key).length;
        return (
          <m.g
            key={c.key}
            initial={false}
            animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -8 }}
            transition={{ duration: 0.5, delay: visible ? 0.1 + i * 0.08 : 0 }}
          >
            <rect
              x={c.x}
              y={c.y}
              width={c.w}
              height={2.5}
              rx={1.25}
              fill={c.key === "network" ? "#fafafa" : "#4a4a4a"}
            />
            {/* Sur téléphone, le libellé est dessiné plus bas, par-dessus les liens. */}
            {L.narrow ? null : (
              <text
                x={c.x}
                y={c.y + 20}
                className="fill-[#a3a3a3] font-mono text-[11px] uppercase tracking-[0.14em]"
              >
                {d.cinema.graph.columns[c.key]} ({count})
              </text>
            )}
          </m.g>
        );
      })}

      {/* Liens */}
      <g>
        {edges.map((e, i) => {
          const on = !!focus && (e.from === focus || e.to === focus);
          const dim = !!focus && !on;
          const lit = e.crit || on;
          return (
            <m.path
              key={e.key}
              ref={(el) => {
                if (el) paths.current.set(e.key, el);
                else paths.current.delete(e.key);
              }}
              d={e.d}
              fill="none"
              strokeWidth={lit ? 1.8 : 1.2}
              stroke={lit ? "#fafafa" : "#6e6e6e"}
              strokeDasharray={e.crit ? undefined : "5 4"}
              markerEnd={`url(#${lit ? "tsn-arrow-on" : "tsn-arrow"})`}
              markerStart={
                e.both
                  ? `url(#${lit ? "tsn-arrow-on" : "tsn-arrow"})`
                  : undefined
              }
              initial={false}
              animate={{
                pathLength: visible ? 1 : 0,
                opacity: visible ? (dim ? 0.12 : lit ? 0.95 : 0.6) : 0,
              }}
              transition={{
                pathLength: {
                  duration: 0.9,
                  delay: visible ? 0.35 + i * 0.06 : 0,
                  ease: [0.65, 0, 0.35, 1],
                },
                opacity: { duration: 0.2 },
              }}
            />
          );
        })}
      </g>

      {/* Points de message : au-dessus des liens, sous les libellés et les cartes. */}
      <g ref={dots} />

      {/* Téléphone : libellés des rangées par-dessus les liens qui les traversent, sur un fond plein
          (largeur estimée : police à chasse fixe de 11 px, lettres espacées). */}
      {L.narrow
        ? L.heads.map((c) => {
            const label = `${d.cinema.graph.columns[c.key]} (${NODES.filter((n) => PLACE[n.id].col === c.key).length})`;
            return (
              <g
                key={`label-${c.key}`}
                className="pointer-events-none"
                style={{ opacity: visible ? 1 : 0, transition: "opacity 0.5s" }}
              >
                <rect x={c.x - 2} y={c.y + 4} width={label.length * 8.3 + 6} height={15} fill="#0a0a0a" />
                <text x={c.x} y={c.y + 15} className="fill-[#a3a3a3] font-mono text-[11px] uppercase tracking-[0.14em]">
                  {label}
                </text>
              </g>
            );
          })
        : null}

      {/* Nœuds */}
      {NODES.map((n) => {
        const { x, y } = L.box(n.id);
        const Icon = NODE_ICON[n.id];
        const isSel = n.id === selected;
        const isFocus = n.id === focus;
        const dim = !!focus && !isFocus && !neighbours.has(n.id);
        const name = d.car[n.id].name;
        return (
          <m.g
            key={n.id}
            className="cursor-pointer"
            initial={false}
            animate={{
              opacity: visible && !nodesHidden ? (dim ? 0.28 : 1) : 0,
            }}
            transition={{ duration: nodesHidden ? 0.05 : 0.2 }}
            onClick={(ev) => {
              ev.stopPropagation();
              onSelect(n.id);
            }}
            onMouseEnter={() => setHover(n.id)}
            onMouseLeave={() => setHover((h) => (h === n.id ? null : h))}
          >
            <rect
              data-graph-node={n.id}
              x={x}
              y={y}
              width={L.w}
              height={L.h}
              rx={6}
              fill="#151515"
              stroke={isFocus ? "#fafafa" : "#363636"}
              strokeWidth={isFocus ? 1.6 : 1}
            />
            <rect
              x={x}
              y={y}
              width={4}
              height={L.h}
              rx={2}
              fill={n.critical ? "#fafafa" : "#6e6e6e"}
            />
            <foreignObject
              x={x + (L.narrow ? 10 : 12)}
              y={y + (L.narrow ? 5 : 11)}
              width={L.narrow ? 20 : 24}
              height={L.narrow ? 20 : 24}
              className="pointer-events-none"
            >
              <div
                className={`grid place-items-center rounded-md border ${L.narrow ? "size-5" : "size-6"} ${isSel ? "border-fg bg-fg text-ink" : "border-line-2 bg-ink text-fg"}`}
              >
                <Icon className={L.narrow ? "size-3" : "size-3.5"} strokeWidth={1.8} />
              </div>
            </foreignObject>
            {L.narrow ? (
              <text className="pointer-events-none fill-[#fafafa] text-[10.5px] font-medium">
                {twoLines(name).map((line, k) => (
                  <tspan key={k} x={x + 10} y={y + 35 + k * 11.5}>
                    {line}
                  </tspan>
                ))}
              </text>
            ) : (
              <>
                <text
                  x={x + 44}
                  y={y + 20}
                  className="pointer-events-none fill-[#fafafa] text-[12px] font-medium"
                >
                  {name.length > 26 ? `${name.slice(0, 25)}…` : name}
                </text>
                <text
                  x={x + 44}
                  y={y + 35}
                  className="pointer-events-none fill-[#858585] font-mono text-[9.5px] uppercase tracking-[0.1em]"
                >
                  {d.car[n.id].role}
                </text>
              </>
            )}
            {certified ? (
              <g transform={`translate(${x + L.w - 9}, ${y - 1})`}>
                <circle
                  r={7.5}
                  fill="#fafafa"
                  stroke="#0a0a0a"
                  strokeWidth={2}
                />
                <foreignObject
                  x={-5}
                  y={-5}
                  width={10}
                  height={10}
                  className="pointer-events-none"
                >
                  <div className="grid size-2.5 place-items-center text-ink">
                    <Check className="size-2.5" strokeWidth={3.5} />
                  </div>
                </foreignObject>
              </g>
            ) : null}
            <title>{name}</title>
          </m.g>
        );
      })}
    </svg>
  );
}
