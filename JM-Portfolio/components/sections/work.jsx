"use client";

import * as React from "react";
import Link from "@/components/compat/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { projects, sortForDisplay } from "@/lib/projects";
import { ProjectImage } from "@/components/site/project-image";
import { EASE_OUT } from "@/lib/motion";

function getVisibleOffsets(length) {
  if (length >= 5) return [-2, -1, 0, 1, 2];
  if (length === 4) return [-1, 0, 1, 2];
  if (length === 3) return [-1, 0, 1];
  if (length === 2) return [0, 1];
  return [0];
}

export function Work() {
  const items = React.useMemo(() => sortForDisplay(projects), []);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const selectedProject = items[activeIndex] ?? items[0];
  const visibleOffsets = getVisibleOffsets(items.length);

  function goTo(index) {
    if (!items.length) return;
    setActiveIndex((index + items.length) % items.length);
  }

  function move(direction) {
    goTo(activeIndex + direction);
  }

  function projectAtOffset(offset) {
    const index = (activeIndex + offset + items.length) % items.length;

    return {
      project: items[index],
      index,
    };
  }

  return (
    <section id="work" className="relative scroll-mt-24 overflow-hidden bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-36">
        {/* Uses the same heading rhythm as the other homepage sections. */}
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="eyebrow">Featured Work</p>

            <h2 className="mt-4 max-w-3xl text-4xl uppercase sm:text-5xl md:text-6xl">
              Digital Products,
              <br />
              Built With 
              <br />Purpose
            </h2>

            <p className="mt-5 max-w-2xl leading-relaxed text-muted-foreground">
              Projects built through thoughtful design, modern development, and technology
              that creates meaningful digital experiences.
            </p>
          </div>

          <Button asChild variant="default" size="lg" className="md:self-end md:mb-1">
            <Link href="/work">
              View More Projects
              <ArrowUpRight
                className="size-4 transition-transform duration-300 group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5"
                aria-hidden
              />
            </Link>
          </Button>
        </div>

        {selectedProject ? (
          <div className="mt-10 md:mt-12">
            {/* Overlapping project gallery — layout kept from your current version. */}
            <div
              className="relative mx-auto h-[180px] max-w-5xl outline-none sm:h-[230px] md:h-[265px] lg:h-[280px]"
              tabIndex={0}
              aria-label="Project gallery. Use the left and right arrow keys to browse projects."
              onKeyDown={(event) => {
                if (event.key === "ArrowLeft") move(-1);
                if (event.key === "ArrowRight") move(1);
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                {visibleOffsets.map((offset) => {
                  const { project, index } = projectAtOffset(offset);
                  const distance = Math.abs(offset);
                  const isSelected = offset === 0;

                  return (
                    <motion.button
                      key={`${project.slug}-${offset}`}
                      type="button"
                      onClick={() => goTo(index)}
                      aria-label={
                        isSelected
                          ? `${project.title}, selected project`
                          : `Show ${project.title}`
                      }
                      initial={false}
                      animate={{
                        x: `${offset * 58}%`,
                        scale: isSelected
                          ? 1
                          : distance === 1
                            ? 0.82
                            : 0.67,
                        opacity: isSelected
                          ? 1
                          : distance === 1
                            ? 0.78
                            : 0.52,
                        zIndex: 50 - distance * 10,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 230,
                        damping: 26,
                      }}
                      className="absolute h-[170px] w-[280px] overflow-hidden rounded-xl border border-border bg-card text-left shadow-lg shadow-foreground/[0.06] outline-none transition-[border-color,box-shadow] hover:border-primary/25 hover:shadow-xl hover:shadow-foreground/[0.08] focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:h-[220px] sm:w-[365px] md:h-[255px] md:w-[430px] lg:h-[270px] lg:w-[460px]"
                    >
                      <ProjectImage
                        src={project.image}
                        alt={`${project.title} preview`}
                        label={project.title.charAt(0)}
                        className="h-full w-full bg-muted"
                        priority={isSelected}
                      />

                      {!isSelected ? (
                        <span className="pointer-events-none absolute inset-0 bg-background/20" />
                      ) : null}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={selectedProject.slug}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: EASE_OUT }}
                className="mx-auto mt-5 max-w-4xl text-center sm:mt-6"
              >
                <h3 className="text-2xl leading-tight sm:text-3xl md:text-4xl">
                  {selectedProject.title}
                </h3>

                <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
                  {selectedProject.outcome ?? selectedProject.description}
                </p>

                <Button asChild variant="link" className="mt-4 h-auto px-0 py-1">
                  <Link href={`/work/${selectedProject.slug}`}>
                    View Project
                    <ArrowRight
                      className="size-4 transition-transform duration-300 group-hover/button:translate-x-1"
                      aria-hidden
                    />
                  </Link>
                </Button>
              </motion.div>
            </AnimatePresence>
          </div>
        ) : null}
      </div>
    </section>
  );
}
