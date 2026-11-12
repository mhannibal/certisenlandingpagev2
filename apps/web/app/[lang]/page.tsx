import { Cinema } from "@/components/sections/cinema";
import { Contact, Footer } from "@/components/sections/contact";
import { Features } from "@/components/sections/features";
import { HeroFilm } from "@/components/sections/hero-film";
import { Navbar } from "@/components/sections/navbar";
import { PausedSection } from "@/components/sections/paused";
import { Roadmap } from "@/components/sections/roadmap";
import { Solution } from "@/components/sections/solution";
import { SECTIONS, TRUST_STRIP } from "@/lib/sections";

export default function Home() {
  return (
    <>
      <Navbar />
      {/* Cible du lien d'évitement « Aller au contenu » (barre de navigation). */}
      <main id="contenu" tabIndex={-1} className="relative outline-none">
        <HeroFilm />
        {TRUST_STRIP ? <PausedSection name="trust" /> : null}
        {SECTIONS.problem ? <PausedSection name="problem" /> : null}
        {SECTIONS.gap ? <PausedSection name="gap" /> : null}
        {SECTIONS.solution ? <Solution /> : null}
        {SECTIONS.features ? <Features /> : null}
        {SECTIONS.cinema ? <Cinema /> : null}
        {SECTIONS.positioning ? <PausedSection name="positioning" /> : null}
        {SECTIONS.roadmap ? <Roadmap /> : null}
        {SECTIONS.contact ? <Contact /> : null}
      </main>
      <Footer />
    </>
  );
}
