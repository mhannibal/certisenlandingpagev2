import { CONTACT_EMAIL, LINKEDIN_URL, SITE_URL } from "@/lib/site";

/**
 * /llms.txt (convention llmstxt.org) : résumé du site en Markdown pour les assistants IA.
 * Uniquement ce que le site publie déjà : rien de confidentiel, aucune donnée de marché, rien
 * des sections désactivées (mis à jour le 12/11/2026 : nouveaux textes, ASIL-D retiré).
 */
export const dynamic = "force-static";

export function GET() {
  const body = `# CertiSen

> The Intelligence Behind Tomorrow's Vehicles. CertiSen is the continuous assurance layer for software-defined vehicles (SDV): it guarantees the timing safety and the cybersecurity of in-vehicle Time-Sensitive Networking (TSN) after every over-the-air (OTA) update, with machine-checked mathematical proofs.

CertiSen is a deep-tech project born at Inria (Grenoble, France), funded by Inria, Inria Startup Studio and Bpifrance, and selected for the French "Pionniers de l'IA" programme (France 2030). Its approach: AI-native engineering, formal verification and continuous safety assurance. The website is available in English, French and Chinese.

## What CertiSen does

- Formal certification: specifies TSN protocols (IEEE 802.1Qbv time-aware scheduling, IEEE 802.1AS time synchronization) and proves that every network configuration meets its end-to-end deadlines in the worst case. Proofs are machine-checked by the Rocq proof assistant.
- Continuous OTA certification: from first design to every update, each over-the-air update is re-certified before deployment, so timing guarantees hold over the vehicle's lifetime.
- Runtime monitoring: in service, CertiSen watches the parameters the proof relies on (switching delay, clock synchronization precision) on every switch.
- Cybersecurity: within the same chain of trust, a compromised ECU flooding the network is isolated at its switch and injected frames are dropped.
- AI and formal core: AI proposes and ranks network configurations (priorities, paths, gate control lists); only the formal core certifies them ("AI searches, the core decides").
- Ecosystem: complements existing validation tools (testing, simulation, analysis) by adding formal guarantees to the TSN design process.

## Pages

- [CertiSen (English)](${SITE_URL}/en): solution, platform, a scroll-driven 3D film from the factory to the road, an interactive 3D vehicle ("In action"), journey and contact.
- [CertiSen (Français)](${SITE_URL}/fr): même contenu en français.
- [CertiSen (中文)](${SITE_URL}/zh): 中文版本。

## Journey

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
