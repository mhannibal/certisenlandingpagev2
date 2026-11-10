import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import "lenis/dist/lenis.css";
import "../globals.css";
import { SmoothScroll } from "@/components/smooth-scroll";
import { DEFAULT_LOCALE, LOCALES, LOCALE_META, hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { I18nProvider } from "@/lib/i18n/provider";
import { CONTACT_EMAIL, LINKEDIN_URL, OG_LOCALE, SITE_NAME, SITE_URL } from "@/lib/site";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export async function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const { title, description, keywords } = dict.meta;
  const url = `/${lang}`;
  return {
    // Adresse publique : rend absolues les URL canoniques, hreflang et Open Graph.
    metadataBase: new URL(SITE_URL),
    title,
    description,
    keywords,
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: "technology",
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(LOCALES.map((l) => [LOCALE_META[l].htmlLang, `/${l}`])),
        "x-default": `/${DEFAULT_LOCALE}`,
      },
    },
    // L'image de partage vient de opengraph-image.tsx (même dossier).
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      title,
      description,
      locale: OG_LOCALE[lang],
      alternateLocale: LOCALES.filter((l) => l !== lang).map((l) => OG_LOCALE[l]),
    },
    twitter: { card: "summary_large_image", title, description },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    formatDetection: { email: false, address: false, telephone: false },
  };
}

/** Données structurées (schema.org) : l'organisation CertiSen et le site, pour les moteurs et les IA. */
function jsonLd(lang: keyof typeof LOCALE_META, description: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/icon.svg`,
        email: CONTACT_EMAIL,
        description,
        sameAs: [LINKEDIN_URL],
        address: {
          "@type": "PostalAddress",
          streetAddress: "655 avenue de l'Europe",
          postalCode: "38330",
          addressLocality: "Montbonnot-Saint-Martin",
          addressCountry: "FR",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/${lang}`,
        name: SITE_NAME,
        description,
        inLanguage: LOCALE_META[lang].htmlLang,
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };
}

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    // Variables de police sur <html> : le thème Tailwind (--font-sans, --font-mono) est défini
    // sur :root et doit pouvoir les lire, sinon les polices Geist ne s'appliquent jamais.
    <html lang={LOCALE_META[lang].htmlLang} className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <script
          type="application/ld+json"
          // Échappement de « < » (recommandation Next.js contre l'injection de balises).
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(lang, dict.meta.description)).replace(/</g, "\\u003c") }}
        />
        <I18nProvider locale={lang} dict={dict}>
          <SmoothScroll>{children}</SmoothScroll>
        </I18nProvider>
      </body>
    </html>
  );
}
