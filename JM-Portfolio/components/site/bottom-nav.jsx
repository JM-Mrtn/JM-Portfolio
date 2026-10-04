"use client";

/**
 * Floating bottom dock — primary homepage navigation.
 * The active item is selected from the section that currently crosses a
 * viewport marker, which is more reliable than the old IntersectionObserver
 * approach for tall sections such as Journey.
 */
import * as React from "react";
import Link from "@/components/compat/link";
import { usePathname } from "@/components/compat/navigation";
import { motion } from "framer-motion";
import {
  House,
  LayoutGrid,
  Briefcase,
  Waypoints,
  ListChecks,
  Mail,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { EASE_OUT } from "@/lib/motion";

const ITEMS = [
  { id: "home", label: "Home", href: "/#home", icon: House },
  { id: "services", label: "Services", href: "/#services", icon: LayoutGrid },
  { id: "work", label: "Work", href: "/#work", icon: Briefcase },
  { id: "journey", label: "Journey", href: "/#journey", icon: Waypoints },
  { id: "process", label: "Process", href: "/#process", icon: ListChecks },
  { id: "contact", label: "Contact", href: "/#contact", icon: Mail },
];

export function BottomNav() {
  const pathname = usePathname();
  const [spied, setSpied] = React.useState("home");

  // Case-study/work routes should always keep Work highlighted.
  const active = pathname.startsWith("/work") ? "work" : spied;

  React.useEffect(() => {
    // The homepage sections do not exist on case-study pages.
    if (pathname.startsWith("/work")) return;

    const getSections = () =>
      ITEMS.map((item) => document.getElementById(item.id)).filter(Boolean);

    let frame = 0;

    const updateActiveSection = () => {
      cancelAnimationFrame(frame);

      frame = requestAnimationFrame(() => {
        const sections = getSections();
        if (!sections.length) return;

        // Use a point a little above the viewport center. This makes the
        // highlight switch naturally as soon as a section becomes the main
        // section on screen, including when arriving through a hash link.
        const marker = window.innerHeight * 0.38;

        let next = sections[0].id;
        let nearestDistance = Number.POSITIVE_INFINITY;

        for (const section of sections) {
          const rect = section.getBoundingClientRect();

          // Best case: the marker is physically inside this section.
          if (rect.top <= marker && rect.bottom > marker) {
            next = section.id;
            nearestDistance = 0;
            break;
          }

          // Fallback for any gaps between sections: choose the closest one.
          const distance = Math.min(
            Math.abs(rect.top - marker),
            Math.abs(rect.bottom - marker),
          );

          if (distance < nearestDistance) {
            nearestDistance = distance;
            next = section.id;
          }
        }

        setSpied((current) => (current === next ? current : next));
      });
    };

    const syncFromHash = () => {
      const hashId = window.location.hash.replace("#", "");

      if (ITEMS.some((item) => item.id === hashId)) {
        setSpied(hashId);
      }

      // Run again after the browser finishes moving to the anchor.
      requestAnimationFrame(updateActiveSection);
    };

    syncFromHash();
    updateActiveSection();

    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    window.addEventListener("hashchange", syncFromHash);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
      window.removeEventListener("hashchange", syncFromHash);
    };
  }, [pathname]);

  return (
    <motion.nav
      aria-label="Section navigation"
      initial={{ y: 56, x: "-50%", opacity: 0 }}
      animate={{ y: 0, x: "-50%", opacity: 1 }}
      transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.9 }}
      className="fixed bottom-8 left-1/2 z-50 flex items-center gap-1 rounded-full border border-border bg-background/85 p-2 shadow-xl shadow-foreground/[0.08] backdrop-blur-md"
    >
      {ITEMS.map(({ id, label, href, icon: Icon }) => {
        const isActive = active === id;

        return (
          <Link
            key={id}
            href={href}
            aria-current={isActive ? "page" : undefined}
            onClick={() => setSpied(id)}
            className={cn(
              "flex items-center gap-2 rounded-full px-3.5 py-2.5 font-mono text-xs uppercase tracking-[0.12em] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:px-4",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span className={isActive ? "inline" : "hidden sm:inline"}>
              {label}
            </span>
          </Link>
        );
      })}
    </motion.nav>
  );
}
