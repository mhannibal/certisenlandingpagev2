import { Cinema } from "@/components/sections/cinema";
import { Contact, Footer } from "@/components/sections/contact";
import { Features } from "@/components/sections/features";
import { Gap } from "@/components/sections/gap";
import { HeroFilm } from "@/components/sections/hero-film";
import { Navbar } from "@/components/sections/navbar";
import { Positioning } from "@/components/sections/positioning";
import { Problem } from "@/components/sections/problem";
import { Roadmap } from "@/components/sections/roadmap";
import { Solution } from "@/components/sections/solution";
import { TrustStrip } from "@/components/sections/trust-strip";
import { SECTIONS } from "@/lib/sections";

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <HeroFilm />
      <TrustStrip />
      {SECTIONS.problem ? <Problem /> : null}
      {SECTIONS.gap ? <Gap /> : null}
      {SECTIONS.solution ? <Solution /> : null}
      {SECTIONS.features ? <Features /> : null}
      {SECTIONS.cinema ? <Cinema /> : null}
      {SECTIONS.positioning ? <Positioning /> : null}
      {SECTIONS.roadmap ? <Roadmap /> : null}
      {SECTIONS.contact ? <Contact /> : null}
      <Footer />
    </main>
  );
}
