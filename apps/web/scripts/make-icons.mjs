// Icônes du site depuis le logo officiel (lib/logo-paths.ts) : symbole blanc et coche verte sur
// le bleu CertiSen, comme le logo « blanc sur bleu » fourni par Lucas (13/11/2026).
//   app/icon.svg                        favicon (vectoriel)
//   app/apple-icon.png                  180 × 180 (iOS arrondit lui-même les coins)
//   public/icons/icon-192.png, -512     écran d'accueil (manifeste)
//   public/icons/icon-maskable-512.png  Android : symbole dans la zone sûre (cercle de 80 %)
// À relancer après scripts/logo-trace.py (depuis apps/web) :  node scripts/make-icons.mjs
// sharp est celui fourni avec Next (pas de dépendance en plus).
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sharp = createRequire(createRequire(import.meta.url).resolve("next/package.json"))("sharp");

const src = readFileSync(path.join(ROOT, "lib/logo-paths.ts"), "utf8");
const block = (name) => src.slice(src.indexOf(`export const ${name} =`));
const field = (text, key) => text.match(new RegExp(`${key}: "([^"]*)"`))[1];
const BLUE = src.match(/blue: "(#[0-9a-f]{6})"/)[1];
const GREEN = src.match(/green: "(#[0-9a-f]{6})"/)[1];
const sym = block("SYMBOL");
const W = Number(sym.match(/w: ([\d.]+)/)[1]);
const BODY = field(sym, "body");
const CHECK = field(sym, "check");

/** Carré de côté `size` : fond bleu (coins arrondis `r`), symbole de hauteur `h` centré. */
function iconSvg(size, h, r) {
  const k = h / 100;
  const x = (size - W * k) / 2;
  const y = (size - h) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="${BLUE}"/>
  <g transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${k})">
    <path d="${BODY}" fill="#ffffff" fill-rule="evenodd"/>
    <path d="${CHECK}" fill="${GREEN}" fill-rule="evenodd"/>
  </g>
</svg>
`;
}

/** Rendu net (densité élevée) puis réduction à la taille exacte de l'icône. */
const png = (size, svg, file) =>
  sharp(Buffer.from(svg), { density: 384 }).resize(size, size).png({ compressionLevel: 9 }).toFile(path.join(ROOT, file));

writeFileSync(path.join(ROOT, "app/icon.svg"), iconSvg(32, 25, 7));
await png(180, iconSvg(180, 128, 0), "app/apple-icon.png");
await png(192, iconSvg(192, 140, 40), "public/icons/icon-192.png");
await png(512, iconSvg(512, 372, 108), "public/icons/icon-512.png");
await png(512, iconSvg(512, 290, 0), "public/icons/icon-maskable-512.png");
console.log("icônes écrites : app/icon.svg, app/apple-icon.png, public/icons/icon-{192,512,maskable-512}.png");
