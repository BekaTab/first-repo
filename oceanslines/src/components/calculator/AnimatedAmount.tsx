"use client";

import { animate, useMotionValue, useTransform, motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import { formatMoney } from "@/lib/utils";

/** Counts smoothly from the previous amount to the new one. */
export function AnimatedAmount({ value, currency, className }: { value: number; currency: string; className?: string }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => formatMoney(Math.round(v), currency));

  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration: 0.9, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [value, reduce, mv]);

  return (
    <motion.span className={className} aria-hidden>
      {text}
    </motion.span>
  );
}
