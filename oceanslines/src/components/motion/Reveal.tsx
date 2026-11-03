"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { fadeUp, luxeTransition, stagger } from "@/lib/motion";

interface RevealProps extends HTMLMotionProps<"div"> {
  /** Delay before this element starts, in seconds. */
  delay?: number;
}

/** Fades and lifts its content into place the first time it scrolls into view. */
export function Reveal({ delay = 0, ...props }: RevealProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { ...luxeTransition, delay } },
      }}
      {...props}
    />
  );
}

/** Parent that staggers `RevealItem` children as the group enters the viewport. */
export function RevealGroup({ gap = 0.12, delay = 0, ...props }: HTMLMotionProps<"div"> & { gap?: number; delay?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={stagger(gap, delay)}
      {...props}
    />
  );
}

export function RevealItem(props: HTMLMotionProps<"div">) {
  return <motion.div variants={fadeUp} {...props} />;
}
