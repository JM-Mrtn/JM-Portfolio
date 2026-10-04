"use client";

/**
 * Futuristic scroll guide — a slim vertical rail fixed to the right edge.
 * The glowing dot can be clicked/dragged to scroll the page, and the rail is
 * keyboard accessible as a slider.
 */
import * as React from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";

import { EASE_OUT } from "@/lib/motion";

const TICKS = 6;

export function ScrollGuide() {
  const { scrollYProgress } = useScroll();
  const railRef = React.useRef(null);
  const draggingRef = React.useRef(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [readout, setReadout] = React.useState("000");

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setReadout(String(Math.round(value * 100)).padStart(3, "0"));
  });

  const dotTop = useTransform(scrollYProgress, (value) => `${value * 100}%`);

  const scrollToProgress = React.useCallback((progress) => {
    const clamped = Math.min(1, Math.max(0, progress));
    const documentHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body?.scrollHeight ?? 0,
    );
    const maxScroll = Math.max(0, documentHeight - window.innerHeight);

    window.scrollTo({
      top: maxScroll * clamped,
      behavior: "auto",
    });
  }, []);

  const scrollFromPointer = React.useCallback(
    (clientY) => {
      const rail = railRef.current;
      if (!rail) return;

      const rect = rail.getBoundingClientRect();
      if (!rect.height) return;

      scrollToProgress((clientY - rect.top) / rect.height);
    },
    [scrollToProgress],
  );

  function handlePointerDown(event) {
    if (event.button !== 0 && event.pointerType === "mouse") return;

    draggingRef.current = true;
    setIsDragging(true);

    event.currentTarget.setPointerCapture?.(event.pointerId);
    scrollFromPointer(event.clientY);
    event.preventDefault();
  }

  function handlePointerMove(event) {
    if (!draggingRef.current) return;
    scrollFromPointer(event.clientY);
    event.preventDefault();
  }

  function finishDragging(event) {
    if (!draggingRef.current) return;

    draggingRef.current = false;
    setIsDragging(false);

    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleKeyDown(event) {
    const current = scrollYProgress.get();
    let next = current;

    switch (event.key) {
      case "ArrowUp":
      case "ArrowLeft":
        next = current - 0.03;
        break;
      case "ArrowDown":
      case "ArrowRight":
        next = current + 0.03;
        break;
      case "PageUp":
        next = current - 0.15;
        break;
      case "PageDown":
        next = current + 0.15;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    scrollToProgress(next);
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: EASE_OUT, delay: 1.3 }}
      className="pointer-events-none fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-4 lg:flex"
    >
      {/* progress readout */}
      <span
        aria-hidden="true"
        className="font-mono text-[11px] font-bold tracking-[0.2em] text-foreground tabular-nums"
      >
        {readout}
      </span>

      {/* Interactive rail */}
      <div
        ref={railRef}
        role="slider"
        tabIndex={0}
        aria-label="Page scroll position"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Number(readout)}
        aria-valuetext={`${Number(readout)}% scrolled`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDragging}
        onPointerCancel={finishDragging}
        onLostPointerCapture={() => {
          draggingRef.current = false;
          setIsDragging(false);
        }}
        onKeyDown={handleKeyDown}
        className={`pointer-events-auto relative h-[38vh] w-5 touch-none select-none outline-none before:absolute before:left-1/2 before:top-0 before:h-full before:w-px before:-translate-x-1/2 before:bg-border focus-visible:rounded-full focus-visible:ring-2 focus-visible:ring-primary/35 ${
          isDragging ? "cursor-grabbing" : "cursor-pointer"
        }`}
      >
        {/* section ticks */}
        {Array.from({ length: TICKS }, (_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 h-px w-3 -translate-x-1/2 bg-muted-foreground/40"
            style={{ top: `${(i / (TICKS - 1)) * 100}%` }}
          />
        ))}

        {/* filled line down to the dot */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 origin-top bg-foreground/70"
          style={{ scaleY: scrollYProgress }}
        />

        {/* draggable glowing position dot */}
        <motion.div
          aria-hidden="true"
          className={`pointer-events-none absolute left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_12px_2px] shadow-primary/60 transition-transform duration-150 ${
            isDragging ? "scale-125" : "scale-100"
          }`}
          style={{ top: dotTop }}
        />
      </div>

      {/* vertical label */}
      <span
        aria-hidden="true"
        className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground"
        style={{ writingMode: "vertical-rl" }}
      >
        Scroll
      </span>
    </motion.div>
  );
}
