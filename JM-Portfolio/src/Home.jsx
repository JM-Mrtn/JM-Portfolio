import React from "react";
import { Providers } from "../components/providers";
import { Navbar } from "../components/site/navbar";
import { BottomNav } from "../components/site/bottom-nav";
import { ScrollGuide } from "../components/site/scroll-guide";
import { Hero } from "../components/sections/hero";
import { TechMarquee } from "../components/sections/tech-marquee";
import { Services } from "../components/sections/services";
import { Work } from "../components/sections/work";
import { Journey } from "../components/sections/journey";
import { Process } from "../components/sections/process";
import { Testimonials } from "../components/sections/testimonials";
import { Contact } from "../components/sections/contact";

export default function Home() {
  return (
    <Providers>
      <Navbar />
      <main id="main" className="flex-1">
        <Hero />
        <TechMarquee />
        <Services />
        <Work />
        <Journey />
        <Process />
        <Testimonials />
        <Contact />
      </main>
      <BottomNav />
      <ScrollGuide />
    </Providers>
  );
}
