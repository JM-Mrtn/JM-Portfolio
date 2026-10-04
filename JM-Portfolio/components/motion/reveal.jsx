"use client";
/**
 * Scroll-reveal system — the house motion vocabulary.
 *
 * <Reveal>        one element fades + rises when it enters the viewport
 * <RevealGroup>   staggers its <RevealItem> children
 * <RevealItem>    child of RevealGroup (no own viewport trigger)
 *
 * All transform/opacity only; reduced-motion handled globally by MotionConfig.
 */
import { motion } from "framer-motion";
import { DURATION, EASE_OUT, VIEWPORT, fadeRise, stagger } from "@/lib/motion";
export function Reveal({ children, className, delay = 0, as = "div" }) {
    const Tag = motion[as];
    return (<Tag className={className} initial="hidden" whileInView="visible" viewport={VIEWPORT} variants={{
            hidden: { opacity: 0, y: 24 },
            visible: {
                opacity: 1,
                y: 0,
                transition: { duration: DURATION.base, ease: EASE_OUT, delay },
            },
        }}>
      {children}
    </Tag>);
}
export function RevealGroup({ children, className, staggerChildren = 0.08, delayChildren = 0, as = "div", }) {
    const Tag = motion[as];
    return (<Tag className={className} initial="hidden" whileInView="visible" viewport={VIEWPORT} variants={stagger(staggerChildren, delayChildren)}>
      {children}
    </Tag>);
}
export function RevealItem({ children, className, as = "div" }) {
    const Tag = motion[as];
    return (<Tag className={className} variants={fadeRise}>
      {children}
    </Tag>);
}
