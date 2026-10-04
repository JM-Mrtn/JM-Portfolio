/** Signature easing — fast start, long elegant settle */
export const EASE_OUT = [0.25, 1, 0.5, 1];
export const DURATION = {
    fast: 0.25,
    base: 0.6,
    slow: 0.9,
};
/** Fade + subtle rise — the house entrance move */
export const fadeRise = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: DURATION.base, ease: EASE_OUT },
    },
};
/** Container that staggers its fadeRise children */
export const stagger = (staggerChildren = 0.08, delayChildren = 0) => ({
    hidden: {},
    visible: { transition: { staggerChildren, delayChildren } },
});
/** Standard viewport config for scroll-triggered reveals */
export const VIEWPORT = { once: true, margin: "0px 0px -80px 0px" };
