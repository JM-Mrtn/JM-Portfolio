"use client";

/**
 * HeroProfile
 *
 * Displays the custom JM line-art portrait using ProfileArt.
 * The portrait stays black while ProfileArt handles the
 * animated blue comet/tracing effect.
 */

import { motion } from "framer-motion";

import { ProfileArt } from "@/components/site/profile-art";
import { EASE_OUT } from "@/lib/motion";
import { site } from "@/lib/site";

export function HeroProfile() {
  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
      {/* Portrait */}
      <motion.div
        initial={{
          opacity: 0,
          y: 32,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.9,
          ease: EASE_OUT,
          delay: 0.25,
        }}
        className="relative"
      >
        <ProfileArt
          src="/images/JM_Hero.svg"
          label={`Illustrated line-art portrait of ${site.name}`}
          className="aspect-[2/3] w-full"
        />
      </motion.div>

      {/* Floating identity card */}
      <motion.div
        initial={{
          opacity: 0,
          y: 16,
          scale: 0.92,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 22,
          delay: 0.9,
        }}
        className="
          absolute
          bottom-6
          -left-2
          flex
          items-center
          gap-3
          rounded-xl
          border
          border-border
          bg-card
          px-4
          py-3
          shadow-xl
          shadow-foreground/[0.1]
          sm:left-0
        "
      >
        {/* Initials */}
        <span
          className="font-display text-xl leading-none text-primary"
          aria-hidden="true"
        >
          JM
        </span>

        {/* Name + Role */}
        <div>
          <p className="text-xs font-semibold leading-none tracking-tight">
            {site.name}
          </p>

          <p className="mt-1 text-[10px] leading-none text-muted-foreground">
            Developer x Engineer
          </p>
        </div>
      </motion.div>
    </div>
  );
}