import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { BRAND, SYMBOL, WORDMARK } from "@/lib/logo-paths";

/** Image de partage (réseaux sociaux, messageries) : logo officiel, accroche et description. */
export const alt = "CertiSen";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Chinois : la police par défaut de l'image n'a pas ces caractères. On charge un extrait de
 * Noto Sans SC (OFL) limité aux textes de l'image (assets/og, regénéré par
 * scripts/og-font-subset.py si ces textes changent). Méthode de la doc Next : readFile + fonts.
 */
const ZH_FONT = "Noto Sans SC";
async function zhFonts() {
  const dir = join(process.cwd(), "assets/og");
  const [regular, medium] = await Promise.all([
    readFile(join(dir, "NotoSansSC-Regular-og.otf")),
    readFile(join(dir, "NotoSansSC-Medium-og.otf")),
  ]);
  return [
    { name: ZH_FONT, data: regular, style: "normal" as const, weight: 400 as const },
    { name: ZH_FONT, data: medium, style: "normal" as const, weight: 500 as const },
  ];
}

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = hasLocale(lang) ? lang : "en";
  const zh = l === "zh";
  const dict = await getDictionary(l);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          color: "#fafafa",
          padding: "72px 80px",
          ...(zh ? { fontFamily: ZH_FONT } : {}),
        }}
      >
        {/* Logo officiel : symbole (blanc, coche verte) et mot « CertiSen ». */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width={(76 * SYMBOL.w) / 100} height="76" viewBox={`0 0 ${SYMBOL.w} 100`}>
            <path d={SYMBOL.body} fill="#fafafa" fillRule="evenodd" />
            <path d={SYMBOL.check} fill={BRAND.green} fillRule="evenodd" />
          </svg>
          <svg width={(40 * WORDMARK.w) / 100} height="40" viewBox={`0 0 ${WORDMARK.w} 100`}>
            <path d={WORDMARK.d} fill="#fafafa" fillRule="evenodd" />
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ fontSize: 68, fontWeight: zh ? 500 : 600, lineHeight: zh ? 1.2 : 1.04, letterSpacing: zh ? "0" : "-0.035em" }}>
            {/* Pas d'espace entre les deux parties du titre en chinois. */}
            {`${dict.hero.title1}${zh ? "" : " "}${dict.hero.title2}`}
          </div>
          <div style={{ fontSize: 28, lineHeight: 1.35, color: "#a3a3a3", maxWidth: 1000 }}>{dict.meta.description}</div>
        </div>
        <div style={{ display: "flex", fontSize: 20, letterSpacing: "0.14em", color: "#737373" }}>
          TSN · IEEE 802.1Qbv · Rocq · OTA
        </div>
      </div>
    ),
    { ...size, ...(zh ? { fonts: await zhFonts() } : {}) },
  );
}
