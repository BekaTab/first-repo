import type { Transition, Variants } from "framer-motion";

/** Shared motion language: slow-in, long settle, no overshoot. */
export const EASE_LUXE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const luxeTransition: Transition = { duration: 0.8, ease: EASE_LUXE };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: luxeTransition },
};

export const stagger = (staggerChildren = 0.12, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren, delayChildren } },
});
