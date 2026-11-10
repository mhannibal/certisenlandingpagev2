import { CONTACT_EMAIL, LINKEDIN_URL, SITE_URL } from "@/lib/site";

/**
 * /llms.txt (convention llmstxt.org) : résumé du site en Markdown pour les assistants IA.
 * Uniquement ce que le site publie déjà : rien de confidentiel, aucune donnée de marché.
 */
export const dynamic = "force-static";

export function GET() {
  const body = `# CertiSen

> CertiSen is the continuous formal verification layer for software-defined vehicles (SDV). It guarantees the timing safety and the cybersecurity of in-vehicle Time-Sensitive Networking (TSN) after every over-the-air (OTA) update, with machine-checked mathematical proofs.

CertiSen is a deep-tech project born at Inria (Grenoble, France), supported by Inria Startup Studio and Bpifrance, and selected for the French "Pionniers de l'IA" programme (France 2030). The website is available in English, French and Chinese.

## What CertiSen does

- Formal certification: specifies TSN protocols (IEEE 802.1Qbv time-aware scheduling, IEEE 802.1AS time synchronization) and proves that every network configuration meets its end-to-end deadlines in the worst case. Proofs are checked by the Rocq proof assistant.
- Continuous OTA certification: each over-the-air update is re-certified before deployment, so timing guarantees hold over the vehicle's lifetime.
- Cybersecurity: cybersecurity compliance for TSN networks within the same chain of trust (e.g. a compromised ECU is isolated, injected frames are rejected).
- AI and formal core: AI can propose network configurations; only the formal core certifies them ("AI searches, the core decides").
- Ecosystem: complements existing validation tools (testing, simulation, timing analysis) by adding formal guarantees. Target assurance level: ASIL-D.

## Pages

- [CertiSen (English)](${SITE_URL}/en): product overview, platform, interactive 3D demonstration, roadmap and contact.
- [CertiSen (Français)](${SITE_URL}/fr): même contenu en français.
- [CertiSen (中文)](${SITE_URL}/zh): 中文版本。

## Roadmap

- 2017: origin, formal certification of real-time systems at Inria (CertiCAN).
- November 2025: project launch, supported by Inria Startup Studio.
- June 2026: selected for the "Pionniers de l'IA" programme.
- September 2026: MVP and end-to-end demonstration, from configuration to verification report.
- 2027: company creation and first pilots with car manufacturers.

## Contact

- Email: ${CONTACT_EMAIL}
- LinkedIn: ${LINKEDIN_URL}
- Address: Inria Grenoble, 655 avenue de l'Europe, 38330 Montbonnot-Saint-Martin, France
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
