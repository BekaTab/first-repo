import type { Config } from "tailwindcss";

/**
 * Colors are CSS variables holding space-separated RGB channels ("44 44 44"),
 * so Tailwind's opacity modifiers keep working: `bg-primary/10`, `border-line/60`.
 *
 * Two families:
 *  - Brand / landing ("Quiet Luxury"): cashmere, charcoal, gold, slate-blue, ocean, navy.
 *    Fixed values, defined on :root in globals.css.
 *  - Portal (role-themed): surface, fg, line, primary, … These are re-declared per
 *    `[data-portal-theme="member" | "super"]`, so one DOM renders two themes.
 */
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" },
      screens: { "2xl": "1240px" },
    },
    extend: {
      colors: {
        // Brand / landing
        cashmere: v("cashmere"),
        charcoal: v("charcoal"),
        gold: { DEFAULT: v("gold"), soft: v("gold-soft") },
        "slate-blue": v("slate-blue"),
        ocean: v("ocean"),
        navy: v("navy"),

        // Portal — role themed
        surface: {
          DEFAULT: v("surface"),
          raised: v("surface-raised"),
          sunken: v("surface-sunken"),
        },
        fg: { DEFAULT: v("fg"), muted: v("fg-muted"), subtle: v("fg-subtle") },
        line: { DEFAULT: v("line"), strong: v("line-strong") },
        primary: { DEFAULT: v("primary"), hover: v("primary-hover"), fg: v("primary-fg") },
        accent: { DEFAULT: v("accent"), fg: v("accent-fg") },
        danger: v("danger"),
        ring: v("ring"),
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
        slab: ["var(--font-slab)", "ui-serif", "Georgia", "serif"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgb(var(--shadow) / 0.04), 0 8px 24px -12px rgb(var(--shadow) / 0.12)",
        lifted: "0 2px 4px rgb(var(--shadow) / 0.05), 0 24px 48px -24px rgb(var(--shadow) / 0.25)",
      },
      letterSpacing: {
        eyebrow: "0.22em",
      },
      transitionTimingFunction: {
        // Slow-in, long settle — deliberate rather than bouncy.
        luxe: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
