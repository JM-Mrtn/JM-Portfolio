import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Providers } from "../components/providers";
import { Navbar } from "../components/site/navbar";
import { BottomNav } from "../components/site/bottom-nav";
import { ScrollGuide } from "../components/site/scroll-guide";
import { Reveal } from "../components/motion/reveal";
import { WorkBrowser } from "../components/site/work-browser";
import { Button } from "../components/ui/button";
import Link from "../components/compat/link";
import { projects, categories } from "@/lib/projects";
import { site } from "@/lib/site";

export default function WorkPage() {
  React.useEffect(() => {
    document.title = `Work — ${site.name}`;
    window.scrollTo(0, 0);
  }, []);

  return (
    <Providers>
      <Navbar />
      <main id="main" className="flex-1">
        <div className="mx-auto max-w-7xl px-6 pt-32 pb-24 md:pt-40">
          <Reveal>
            <Link
              href="/#work"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Home
            </Link>

            <div className="mt-10 max-w-3xl">
              <p className="eyebrow">All work</p>
              <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl">
                Every project, one page
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                The homepage shows highlights — this is everything. Filter by category,
                open any card for the full problem → solution → outcome story.
              </p>
            </div>
          </Reveal>

          <WorkBrowser projects={projects} categories={categories} />

          <Reveal>
            <div className="mt-24 rounded-2xl border border-border bg-card p-8 md:p-12">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl md:text-3xl">Have a similar problem?</h2>
                  <p className="mt-2 max-w-md text-muted-foreground">
                    Tell me what&apos;s slowing your business down — I&apos;ll tell you honestly
                    whether software can fix it.
                  </p>
                </div>
                <Button asChild size="lg" className="btn-cta shrink-0">
                  <Link href="/#contact">
                    Start a project
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </main>
      <BottomNav />
      <ScrollGuide />
    </Providers>
  );
}
