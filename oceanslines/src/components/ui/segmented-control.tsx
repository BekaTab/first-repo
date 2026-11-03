"use client";

import { motion } from "framer-motion";
import { useId } from "react";
import { cn } from "@/lib/utils";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: readonly SegmentOption<T>[];
  "aria-label": string;
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
}

/** Radio group styled as a pill switch; the active pill glides between options. */
export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  size = "sm",
  disabled,
  className,
  ...aria
}: SegmentedControlProps<T>) {
  const pillId = useId(); // unique per instance so separate controls never share an animation

  return (
    <div
      role="radiogroup"
      aria-label={aria["aria-label"]}
      aria-disabled={disabled || undefined}
      className={cn("inline-flex items-center gap-1 rounded-xl border border-line bg-surface-sunken p-1", disabled && "opacity-50", className)}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => !active && onChange(o.value)}
            className={cn(
              "relative whitespace-nowrap rounded-lg font-medium transition-colors duration-300 disabled:cursor-not-allowed",
              size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
              active ? "text-primary-fg" : "text-fg-muted hover:text-fg",
            )}
          >
            {active ? (
              <motion.span
                layoutId={pillId}
                transition={{ type: "spring", stiffness: 320, damping: 34 }}
                className="absolute inset-0 rounded-lg bg-primary shadow-soft"
              />
            ) : null}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
