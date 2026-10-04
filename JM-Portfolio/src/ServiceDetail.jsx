import React from "react";
import { ArrowLeft, ArrowRight, Blocks, Bot, Check } from "lucide-react";
import { Providers } from "../components/providers";
import { Navbar } from "../components/site/navbar";
import { BottomNav } from "../components/site/bottom-nav";
import { ScrollGuide } from "../components/site/scroll-guide";
import Link from "../components/compat/link";
import { Button } from "../components/ui/button";
import { WindowCard } from "../components/ui/window-card";
import { AutomationFlow, MiniDashboard } from "../components/site/service-graphics";
import { Reveal, RevealGroup, RevealItem } from "../components/motion/reveal";
import { getService, services } from "../lib/services";
import { site } from "../lib/site";

const ICONS = { blocks: Blocks, bot: Bot };
const GRAPHICS = { blocks: MiniDashboard, bot: AutomationFlow };

function NotFound() {
  return (
    <Providers>
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 pt-32 pb-24">
        <p className="eyebrow">404</p>
        <h1 className="mt-4 text-4xl md:text-6xl">Service not found</h1>
        <Button asChild className="mt-8">
          <Link href="/#services">Back to services</Link>
        </Button>
      </main>
      <BottomNav />
      <ScrollGuide />
    </Providers>
  );
}

export default function ServiceDetail({ slug }) {
  const service = getService(slug);
  if (!service) return <NotFound />;

  const Icon = ICONS[service.icon];
  const Graphic = GRAPHICS[service.icon];
  const other = services.find((s) => s.slug !== service.slug);

  React.useEffect(() => {
    document.title = `${service.title} — ${site.name}`;
    window.scrollTo(0, 0);
  }, [service.title]);

  return (
    <Providers>
      <Navbar />
      <main id="main" className="flex-1">
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-24 md:pt-28">
          <Reveal>
            <Link
              href="/#services"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" aria-hidden />
              All services
            </Link>

            <WindowCard
              label={service.window}
              className="mt-10"
              contentClassName="p-4 md:p-6"
            >
              <Graphic size="lg" />
            </WindowCard>

            <div className="mt-14 max-w-3xl">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-6" aria-hidden />
              </div>
              <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl">{service.title}</h1>
              <p className="mt-3 text-lg font-medium text-primary">{service.tagline}</p>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                {service.detail.intro}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="btn-cta group">
                  <Link href="/#contact">
                    Start a project
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="ghost" className="bg-primary/5 text-primary/70 hover:bg-primary/10 hover:text-primary/80">
                  <Link href="/#process">How I work</Link>
                </Button>
              </div>
            </div>
          </Reveal>

          <div className="mt-24">
            <Reveal>
              <p className="eyebrow">What you get</p>
              <h2 className="mt-4 max-w-2xl text-3xl sm:text-4xl md:text-5xl">
                Built for your business, not around it
              </h2>
            </Reveal>
            <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" staggerChildren={0.07}>
              {service.detail.features.map((feature) => (
                <RevealItem
                  key={feature.title}
                  className="rounded-2xl border border-border bg-card p-6 transition-colors duration-300 hover:border-ring/30"
                >
                  <h3 className="font-sans text-base font-semibold tracking-tight">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>

          <Reveal>
            <div className="mt-24 grid gap-10 rounded-2xl border border-border bg-secondary/40 p-8 md:grid-cols-[minmax(0,360px)_1fr] md:p-12">
              <div>
                <p className="eyebrow">Is this you?</p>
                <h2 className="mt-4 text-3xl sm:text-4xl">A perfect fit if…</h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  If two or more of these sound familiar, this is exactly the kind of problem I build for.
                </p>
              </div>
              <ul className="space-y-4">
                {service.detail.fitFor.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10" aria-hidden>
                      <Check className="size-3 text-primary" />
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal>
            <div className="mt-24 rounded-2xl border border-border bg-card p-8 md:p-12">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl md:text-3xl">Sounds like your business?</h2>
                  <p className="mt-2 max-w-md text-muted-foreground">
                    Tell me what&apos;s eating your team&apos;s time. I&apos;ll tell you honestly whether this can fix it.
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
            {other ? (
              <div className="mt-6 flex justify-end">
                <Link
                  href={`/services/${other.slug}`}
                  className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Also: {other.title}
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </div>
            ) : null}
          </Reveal>
        </div>
      </main>
      <BottomNav />
      <ScrollGuide />
    </Providers>
  );
}
