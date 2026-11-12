const isDev = process.env.NODE_ENV === "development";

/**
 * Politique de sécurité du contenu (CSP), méthode officielle Next.js « Without Nonces »
 * (doc : guides/content-security-policy) : garde la génération statique des pages. Le site ne
 * charge rien d'extérieur (polices, images, 3D et scripts viennent du site lui-même) ; les liens
 * sortants (LinkedIn, Google Maps, financeurs) ne sont pas concernés.
 * À savoir : la barre d'outils Vercel des déploiements de prévisualisation (vercel.live) est bloquée.
 */
const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
`;

/** En-têtes de sécurité envoyés avec chaque réponse (12/11/2026). HSTS est déjà ajouté par Vercel. */
const securityHeaders = [
  { key: "Content-Security-Policy", value: cspHeader.replace(/\s{2,}/g, " ").trim() },
  // Pas d'affichage du site dans un cadre d'un autre site (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // Le navigateur respecte le type annoncé des fichiers.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Vers un autre site, seule l'origine est transmise (pas le chemin).
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Fonctions sensibles du navigateur coupées (le presse-papiers et le partage restent permis).
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // React Three Fiber : three doit être transpilé (doc officielle R3F, Next.js 13.1+).
  transpilePackages: ["three"],
  // N'annonce pas « X-Powered-By: Next.js ».
  poweredByHeader: false,
  // Police chinoise de l'image de partage, lue par readFile : à inclure dans le déploiement.
  outputFileTracingIncludes: { "/*": ["./assets/og/**/*"] },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
