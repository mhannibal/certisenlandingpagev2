import { ImageResponse } from "next/og";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { LOGO_PATHS } from "@/lib/logo-paths";

/** Image de partage (réseaux sociaux, messageries) : logo, accroche et description, en noir et blanc. */
export const alt = "CertiSen";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  // La police par défaut de l'image n'a pas les caractères chinois : version anglaise pour /zh.
  const l = hasLocale(lang) && lang !== "zh" ? lang : "en";
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
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="64" height="64" viewBox="0 0 32 32" fill="none">
            <path d={LOGO_PATHS.crown} fill="#fafafa" />
            <path d={LOGO_PATHS.pusher} stroke="#fafafa" strokeWidth="1.8" strokeLinecap="round" />
            <path d={LOGO_PATHS.shield} fill="#fafafa" />
            <path d={LOGO_PATHS.check} stroke="#0a0a0a" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ fontSize: 42, fontWeight: 600, letterSpacing: "-0.02em" }}>CertiSen</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ fontSize: 68, fontWeight: 600, lineHeight: 1.04, letterSpacing: "-0.035em" }}>
            {`${dict.hero.title1} ${dict.hero.title2}`}
          </div>
          <div style={{ fontSize: 28, lineHeight: 1.35, color: "#a3a3a3", maxWidth: 1000 }}>{dict.meta.description}</div>
        </div>
        <div style={{ display: "flex", fontSize: 20, letterSpacing: "0.14em", color: "#737373" }}>
          TSN · IEEE 802.1Qbv · Rocq · OTA · ASIL-D
        </div>
      </div>
    ),
    { ...size },
  );
}
